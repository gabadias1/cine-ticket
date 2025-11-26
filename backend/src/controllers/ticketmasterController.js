const ticketmasterService = require('../ticketmasterService');

exports.getEvents = async (req, res) => {
    try {
        const events = await ticketmasterService.searchEvents(req.query);
        res.json(events);
    } catch (error) {
        console.error('Ticketmaster events error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

exports.getEventDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await ticketmasterService.getEventDetails(id);
        res.json(event);
    } catch (error) {
        console.error('Ticketmaster event details error:', error);
        res.status(500).json({ error: 'Failed to fetch event details' });
    }
};
