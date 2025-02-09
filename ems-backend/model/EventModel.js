const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true
    },
    eventDescription: {
        type: String,
    },
    eventDate: {
        type: Date,
        required: true
    },
    eventTime: {
        type: String,
        required: true
    },
    eventLocation: {
        type: String,
        required: true
    },
    eventImages: [
        {
            url: {
                type: String
            },
            public_id: {
                type: String
            },
        },
    ],
    eventCategory: {
        type: String,
        required: true
    },
    eventOrganizer: {
        type: String,
        required: true
    },
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Event', eventSchema);