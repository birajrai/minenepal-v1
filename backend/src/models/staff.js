const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Staff Schema
 * Manages dashboard staff members with role-based permissions
 * 
 * Roles:
 * - Owner: Full control over everything
 * - Servers Manager: Can manage servers only
 * - Rankings Manager: Can manage rankings/users only
 * - None: Can only view dashboard home and own profile
 */
const staffSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true
    },
    password1: { 
        type: String, 
        required: true 
    },
    password2: { 
        type: String, 
        required: true 
    },
    role: {
        type: String,
        required: true,
        enum: ['Owner', 'Servers Manager', 'Rankings Manager', 'None'],
        default: 'None'
    },
    discordId: {
        type: String,
        required: false,
        sparse: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: false
    },
    notes: {
        type: String,
        default: ''
    }
}, { 
    timestamps: true 
});

// Index for faster queries
staffSchema.index({ username: 1, isActive: 1 });

// Hash passwords before saving
staffSchema.pre('save', async function(next) {
    // Only hash if password fields are modified
    if (this.isModified('password1')) {
        this.password1 = await bcrypt.hash(this.password1, 10);
    }
    if (this.isModified('password2')) {
        this.password2 = await bcrypt.hash(this.password2, 10);
    }
    next();
});

// Method to compare passwords
staffSchema.methods.comparePassword1 = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password1);
};

staffSchema.methods.comparePassword2 = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password2);
};

// Method to check if staff has permission for a specific action
staffSchema.methods.hasPermission = function(resource) {
    // Owner has full access
    if (this.role === 'Owner') return true;
    // Servers Manager only servers
    if (this.role === 'Servers Manager' && resource === 'servers') return true;
    // Rankings Manager rankings + users
    if (this.role === 'Rankings Manager' && (resource === 'rankings' || resource === 'users')) return true;
    // None role: no special resource permissions
    return false;
};

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
