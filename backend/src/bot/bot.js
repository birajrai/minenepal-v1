"use strict";

const { Client, Collection, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ActivityType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const Waitlist = require('../models/waitlist');
const UserInfo = require('../models/userInfo');
const WaitlistSettings = require('../models/waitlistSettings');
const Server = require('../models/server');
const VerificationSettings = require('../models/verificationSettings');
const ServerStatusSettings = require('../models/serverStatusSettings');

// Added GuildMembers intent to improve accuracy of member counts for presence.
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] });

bot.Waitlist = Waitlist;
bot.UserInfo = UserInfo;
bot.WaitlistSettings = WaitlistSettings;
bot.Server = Server;
bot.VerificationSettings = VerificationSettings;

bot.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        bot.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Store interval reference for cleanup
let waitlistUpdateInterval = null;
let serverStatusUpdateInterval = null;
let presenceUpdateInterval = null;

bot.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Error executing command:', error);
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', flags: 64 });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', flags: 64 });
                }
            } catch (replyError) {
                console.error('Failed to send error message:', replyError);
            }
        }
    } else if (interaction.isButton()) {
        if (interaction.customId.startsWith("joinWaitlist")) {
            try {
                // Check if interaction is already acknowledged
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.deferReply({ flags: 64 });
                }

                const gamemode = interaction.customId.split('-')[1];
                const waitlist = await bot.Waitlist.findOne({ gamemode: gamemode });

                if (!waitlist || waitlist.disabled) {
                    if (interaction.deferred) {
                        await interaction.editReply({ content: 'This waitlist is no longer active.' });
                    } else if (!interaction.replied) {
                        await interaction.reply({ content: 'This waitlist is no longer active.', flags: 64 });
                    }
                    return;
                }

                if (waitlist.usersInWaitlist.includes(interaction.user.id)) {
                    if (interaction.deferred) {
                        await interaction.editReply({ content: "You are already in this waitlist." });
                    } else if (!interaction.replied) {
                        await interaction.reply({ content: "You are already in this waitlist.", flags: 64 });
                    }
                } else {
                    waitlist.usersInWaitlist.push(interaction.user.id);
                    await waitlist.save();

                    if (interaction.deferred) {
                        await interaction.editReply({ content: `You have successfully joined the ${gamemode} waitlist.` });
                    } else if (!interaction.replied) {
                        await interaction.reply({ content: `You have successfully joined the ${gamemode} waitlist.`, flags: 64 });
                    }

                    // Log to waitlistLogChannelId
                    const logChannelId = bot.config.waitlistLogChannelId;
                    if (logChannelId) {
                        const logChannel = await bot.channels.fetch(logChannelId).catch(() => null);
                        if (logChannel) {
                            const embed = new EmbedBuilder()
                                .setTitle('Waitlist Join')
                                .setDescription(`<@${interaction.user.id}> joined the **${gamemode}** waitlist.`)
                                .setColor('#00FF00')
                                .setTimestamp();
                            await logChannel.send({ embeds: [embed] });
                        }
                    }
                }
            } catch (error) {
                console.error('Error handling button interaction:', error);
                try {
                    if (interaction.deferred && !interaction.replied) {
                        await interaction.editReply({ content: 'An error occurred while processing your request.' });
                    } else if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'An error occurred while processing your request.', flags: 64 });
                    }
                } catch (replyError) {
                    console.error('Failed to send error message to user:', replyError);
                }
            }
        } else if (interaction.customId === 'verify_minecraft') {
            const userInfo = await bot.UserInfo.findOne({ discordId: interaction.user.id });
            if (userInfo && userInfo.minecraftName && userInfo.minecraftName !== 'N/A') {
                return interaction.reply({ content: 'You are already verified.', flags: 64 });
            }


            const { ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
            const modal = new ModalBuilder()
                .setCustomId('verify_minecraft_modal')
                .setTitle('Verify Minecraft Account');

            const nameInput = new TextInputBuilder()
                .setCustomId('minecraftName')
                .setLabel("Minecraft Username")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const provinceInput = new TextInputBuilder()
                .setCustomId('province')
                .setLabel("Province")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const cityInput = new TextInputBuilder()
                .setCustomId('city')
                .setLabel("City")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(provinceInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(cityInput);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

            await interaction.showModal(modal);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'verify_minecraft_modal') {
            const minecraftName = interaction.fields.getTextInputValue('minecraftName');
            const province = interaction.fields.getTextInputValue('province');
            const city = interaction.fields.getTextInputValue('city');

            try {
                await interaction.client.UserInfo.findOneAndUpdate(
                    { discordId: interaction.user.id },
                    {
                        minecraftName: minecraftName,
                        province: province,
                        city: city
                    },
                    { upsert: true, new: true }
                );

                try {
                    await interaction.member.setNickname(minecraftName);
                } catch (err) {
                    if (err.code !== 50013) { // Ignore Missing Permissions error
                        console.error('Failed to change nickname:', err);
                    }
                    // Continue even if nickname change fails (e.g. admin permissions)
                }

                await interaction.reply({ content: `Verification successful! Your Minecraft username has been set to **${minecraftName}**.`, flags: 64 });

                // Log to generalLogChannelId
                const logChannelId = interaction.client.config.generalLogChannelId;
                if (logChannelId) {
                    const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setTitle('User Verified')
                            .setDescription(`<@${interaction.user.id}> verified as **${minecraftName}** (${province}, ${city}).`)
                            .setColor('#00FF00')
                            .setTimestamp();
                        await logChannel.send({ embeds: [embed] });
                    }
                }

            } catch (error) {
                console.error('Error verifying user:', error);
                await interaction.reply({ content: 'An error occurred during verification.', flags: 64 });
            }
        }
    } else if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        if (!command.autocomplete) {
            console.error(`Command ${interaction.commandName} does not have autocomplete handler.`);
            return;
        }

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error('Error in autocomplete handler:', error);
            try {
                await interaction.respond([]);
            } catch (respondError) {
                console.error('Failed to send empty autocomplete response:', respondError);
            }
        }
    }
});

// Waitlist update function with error handling and optimized queries
const updateWaitlistMessage = async () => {
    try {
        const settings = await bot.WaitlistSettings.findOne().lean();
        if (!settings || !settings.channelId || !settings.messageId) {
            return; // No settings configured yet
        }

        const allWaitlists = await bot.Waitlist.find({ disabled: false }).lean();
        const embed = new EmbedBuilder()
            .setTitle('Tiertest Waitlists')
            .setDescription('Welcome to the MineNepal Tiertest Waitlists! Join a gamemode waitlist by clicking its button below. Testers will claim you when they are ready. Good luck!')
            .setColor('#00FF00')
            .setThumbnail(bot.user.displayAvatarURL())
            .setFooter({ text: `Last updated: ${new Date().toLocaleString()}` });

        allWaitlists.forEach(waitlist => {
            const userList = waitlist.usersInWaitlist.map((user, index) => `${index + 1}. <@${user}>`).join("\n") || "No users currently in waitlist.";
            const testerList = waitlist.testerID ? waitlist.testerID.split(', ').map(id => `<@${id}>`).join(', ') : 'No active testers.';
            embed.addFields(
                { name: `__${waitlist.gamemode}__`, value: `Users:\n${userList}\n\nTesters: ${testerList}`, inline: false }
            );
        });

        try {
            const channel = await bot.channels.fetch(settings.channelId);
            if (!channel) {
                console.error(`Channel with ID ${settings.channelId} not found.`);
                return;
            }

            const message = await channel.messages.fetch(settings.messageId);
            if (!message) {
                console.error(`Message with ID ${settings.messageId} not found in channel ${settings.channelId}.`);
                return;
            }

            await message.edit({ embeds: [embed] });
        } catch (error) {
            console.error(`Error updating waitlist message:`, error);
        }
    } catch (error) {
        console.error('Error in waitlist update function:', error);
    }
};

// Start waitlist update interval (30 seconds)
waitlistUpdateInterval = setInterval(updateWaitlistMessage, 30 * 1000);

// Server status leaderboard updater (uses DB status)
const updateServerStatusLeaderboardMessage = async () => {
    try {
        const settings = await ServerStatusSettings.findOne({});
        if (!settings || !settings.channelId || !settings.messageId) return;

        const servers = await Server.find({ disabled: { $ne: true } }).lean();
        if (!servers || servers.length === 0) return;

        // Use database status (synced every 5 minutes)
        const enriched = servers.map(s => ({
            name: s.name || s.slug || s.ip,
            slug: s.slug,
            online: s.online || false,
            players: {
                online: s.players || 0,
                max: s.maxPlayers || 0
            }
        }));

        // Sort by players.online desc
        enriched.sort((a, b) => (b.players?.online || 0) - (a.players?.online || 0));

        const embed = new EmbedBuilder()
            .setTitle('Server Status Leaderboard')
            .setColor('#00AAFF')
            .setFooter({ text: 'Last update' })
            .setTimestamp();

        // Build description with each server line
        const lines = enriched.map(s => {
            const statusEmoji = s.online ? '🟢' : '🔴';
            const players = `${s.players?.online || 0}/${s.players?.max || 0}`;
            return `**${s.name}** — ${statusEmoji} — ${players}`;
        });

        embed.setDescription(lines.join('\n'));

        try {
            const channel = await bot.channels.fetch(settings.channelId).catch(() => null);
            if (!channel) return;
            const message = await channel.messages.fetch(settings.messageId).catch(() => null);
            if (!message) return;
            await message.edit({ embeds: [embed] });
        } catch (err) {
            console.error('Error updating server status leaderboard message:', err);
        }

    } catch (err) {
        console.error('Error in updateServerStatusLeaderboardMessage:', err);
    }
};

// Start server status updater (default every 60s)
serverStatusUpdateInterval = setInterval(updateServerStatusLeaderboardMessage, Number(process.env.SERVER_STATUS_UPDATE_MS) || 60 * 1000);

// Cleanup interval on bot disconnect
bot.on('disconnect', () => {
    if (waitlistUpdateInterval) {
        clearInterval(waitlistUpdateInterval);
        waitlistUpdateInterval = null;
    }
});

bot.on('error', (error) => {
    console.error('Bot error:', error);
    if (waitlistUpdateInterval) {
        clearInterval(waitlistUpdateInterval);
        waitlistUpdateInterval = null;
    }
    if (serverStatusUpdateInterval) {
        clearInterval(serverStatusUpdateInterval);
        serverStatusUpdateInterval = null;
    }
    if (presenceUpdateInterval) {
        clearInterval(presenceUpdateInterval);
        presenceUpdateInterval = null;
    }
});


// Cleanup function to be called on shutdown
bot.cleanup = () => {
    if (waitlistUpdateInterval) {
        clearInterval(waitlistUpdateInterval);
        waitlistUpdateInterval = null;
    }
    if (serverStatusUpdateInterval) {
        clearInterval(serverStatusUpdateInterval);
        serverStatusUpdateInterval = null;
    }
    if (presenceUpdateInterval) {
        clearInterval(presenceUpdateInterval);
        presenceUpdateInterval = null;
    }
};

// Dynamic presence updater (uses DB status)
const updateDynamicPresence = async () => {
    try {
        // Fetch servers list with status from DB
        const servers = await bot.Server.find({ disabled: { $ne: true } }).lean();
        const serverCount = servers.length;

        // Aggregate online players from DB (synced every 5 minutes)
        let totalPlayers = 0;
        for (const s of servers) {
            if (s.online && s.players) {
                totalPlayers += s.players;
            }
        }

        // Total members across authorized guilds (memberCount available without full fetch)
        const totalMembers = bot.guilds.cache.reduce((acc, g) => acc + (g.memberCount || 0), 0);

        const rotations = [
            { type: ActivityType.Playing, text: `with ${totalPlayers} players` },
            { type: ActivityType.Watching, text: `${serverCount} servers` },
            { type: ActivityType.Listening, text: `${totalMembers} members` }
        ];

        const idx = (bot.__presenceIndex || 0) % rotations.length;
        const chosen = rotations[idx];
        bot.__presenceIndex = idx + 1;

        bot.user.setPresence({
            activities: [{ name: chosen.text, type: chosen.type }],
            status: 'online'
        });
    } catch (err) {
        console.error('Presence update failed:', err);
    }
};

// Use clientReady to avoid deprecation and align with v15+
bot.once('clientReady', () => {
    // Immediate presence update followed by interval.
    updateDynamicPresence();
    presenceUpdateInterval = setInterval(updateDynamicPresence, Number(process.env.PRESENCE_UPDATE_MS) || 60 * 1000);
});

module.exports = bot;
