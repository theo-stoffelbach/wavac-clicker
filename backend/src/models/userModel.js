const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        clicks: {
            type: Number,
            default: 0,
        },
        guild: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Guild',
        },
        completedQuests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quest',
            },
        ],
        activeUpgrades: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Upgrade',
            },
        ],
        lastClickTime: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Méthode pour comparer les mots de passe lors de la connexion
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware pour hacher le mot de passe avant de l'enregistrer
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User; 