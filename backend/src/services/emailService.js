async function sendLoginNotificationEmail(/* loginDetails */) {
    // Intentionally no-op: email notifications are disabled in simplified auth.
    return;
}

module.exports = {
    sendLoginNotificationEmail
};
