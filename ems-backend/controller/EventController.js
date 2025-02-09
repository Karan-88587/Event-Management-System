const router = require('express').Router();
const Event = require('../model/EventModel');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// API to create new event :
router.post('/create', async (req, res) => {

    const {
        eventName,
        eventDescription,
        eventDate,
        eventTime,
        eventLocation,
        eventImages,
        eventCategory,
        eventOrganizer
    } = req.body;

    // console.log("Data from frontend :", req.body);

    try {
        // Upload each image to Cloudinary and store the result
        let imagesLinks = [];
        // Check if eventImages is a non-empty array
        if (Array.isArray(eventImages) && eventImages.length > 0) {
            // console.log("Starting image uploads...");

            for (let i = 0; i < eventImages.length; i++) {
                try {
                    const result = await cloudinary.uploader.upload(eventImages[i], {
                        folder: "events",
                        resource_type: "auto" // Add this for better format handling
                    });

                    imagesLinks.push({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                    // console.log(`Uploaded image ${i + 1}/${eventImages.length}`);
                } catch (uploadError) {
                    console.log(`Error uploading image ${i + 1}:`, uploadError);
                }
            }
        } else {
            console.log("No images to upload");
        }

        // Create the new event using the uploaded image links
        const newEvent = new Event({
            eventName,
            eventDescription,
            eventDate,
            eventTime,
            eventLocation,
            eventImages: imagesLinks,
            eventCategory,
            eventOrganizer
        });

        const savedEvent = await newEvent.save();

        return res.status(200).json({ result: true, message: 'Event created successfully', data: savedEvent });

    } catch (error) {
        return res.status(500).json({ result: false, message: 'Error creating event', error: error });
    }
});

// API to fetch all events :
router.get('/events', async (req, res) => {
    try {
        const { category, eventDate, searchQuery } = req.query;

        const filter = {};

        // Filter by category if provided
        if (category && category.trim() !== "") {
            filter.eventCategory = category;
        }

        // Filter by event date if provided
        if (eventDate && eventDate.trim() !== "") {
            // Create a date range for the day provided
            const start = new Date(eventDate);
            const end = new Date(eventDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            filter.eventDate = { $gte: start, $lte: end };
        }

        // Filter by search query on event name (using a case-insensitive regex)
        if (searchQuery && searchQuery.trim() !== "") {
            filter.eventName = { $regex: searchQuery, $options: 'i' };
        }

        // Fetch events using the filter, sorted by eventDate descending
        const events = await Event.find(filter).sort({ eventDate: -1 });
        return res.status(200).json({ result: true, message: 'Events fetched successfully', data: events });

    } catch (error) {
        return res.status(500).json({ result: false, message: 'Error fetching events', error: error.message });
    }
});

// API to fetch an event by ID :
router.get('/event/:eventId', async (req, res) => {

    const { eventId } = req.params;

    try {
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ result: false, message: 'Event not found' });
        }

        return res.status(200).json({ result: true, message: 'Event fetched successfully', data: event });

    } catch (error) {
        return res.status(500).json({ result: false, message: 'Error fetching event', error: error });
    }
});

// API to update an event by ID :
router.put('/update-event/:eventId', async (req, res) => {
    
    const { eventId } = req.params;

    try {
        let { eventImages, ...rest } = req.body;
        let imagesLinks = [];

        // If eventImages is provided and is a non-empty array, process the images.
        if (Array.isArray(eventImages) && eventImages.length > 0) {
            for (let i = 0; i < eventImages.length; i++) {
                try {
                    const result = await cloudinary.uploader.upload(eventImages[i], {
                        folder: "events",
                        resource_type: "auto",
                    });
                    imagesLinks.push({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                } catch (uploadError) {
                    console.log(`Error uploading image ${i + 1}:`, uploadError);
                }
            }
            rest.eventImages = imagesLinks;
        }

        // Update the event document with the rest of the fields (and new images if provided)
        const updatedEvent = await Event.findByIdAndUpdate(eventId, rest, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({ result: false, message: 'Event not found' });
        }

        return res.status(200).json({ result: true, message: 'Event updated successfully', data: updatedEvent });

    } catch (error) {
        return res.status(500).json({ result: false, message: 'Error updating event', error: error.message });
    }
});

// API to delete an event by ID :
router.delete('/delete-event/:eventId', async (req, res) => {

    const { eventId } = req.params;

    try {
        const deletedEvent = await Event.findByIdAndDelete(eventId);

        if (!deletedEvent) {
            return res.status(404).json({ result: false, message: 'Event not found' });
        }

        return res.status(200).json({ result: true, message: 'Event deleted successfully', data: deletedEvent });

    } catch (error) {
        return res.status(500).json({ result: false, message: 'Error deleting event', error: error });
    }
});

module.exports = router;