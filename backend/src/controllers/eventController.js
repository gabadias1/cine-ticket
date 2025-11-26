const prisma = require('../prismaClient');

exports.getEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching events' });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });
        if (!event) return res.status(404).json({ error: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching event' });
    }
};

exports.syncTicketmaster = async (req, res) => {
    res.json({ message: 'Sync not implemented' });
};
