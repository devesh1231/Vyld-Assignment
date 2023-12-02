const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    bio: {
        type: String,
    },
    age: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
}, {
    timestamps: false,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);