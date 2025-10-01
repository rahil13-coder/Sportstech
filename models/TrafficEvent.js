const mongoose = require('mongoose');

const TrafficEventSchema = new mongoose.Schema({
    elementId: {
        type: String,
        required: true
    },
    elementType: {
        type: String,
        required: true,
        enum: ['button', 'navbar-link', 'page-load', 'other']
    },
    page: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TrafficEvent', TrafficEventSchema);