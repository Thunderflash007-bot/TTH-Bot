const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    channelId: { type: String, required: true },
    type: { type: String, enum: ['support', 'report', 'other'], default: 'support' },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    closedBy: String,
    closedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);
