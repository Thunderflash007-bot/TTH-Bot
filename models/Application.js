const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    age: { type: String, required: true },
    position: { type: String, required: true },
    experience: { type: String, required: true },
    motivation: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    reviewedBy: String,
    reviewedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);
