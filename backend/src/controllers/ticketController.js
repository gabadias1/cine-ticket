const prisma = require('../prismaClient');

exports.purchaseTicket = async (req, res) => {
    try {
        const { userId, sessionId, seatId } = req.body;
        // Basic implementation
        const ticket = await prisma.ticket.create({
            data: {
                userId,
                sessionId,
                seatId: typeof seatId === 'number' ? seatId : undefined, // Handle string/number mismatch
                price: 0, // Should fetch from session
                status: 'ACTIVE'
            }
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Purchase failed' });
    }
};

exports.purchaseEventTicket = async (req, res) => {
    try {
        const { userId, eventId, price, ticketType, seatNumber } = req.body;
        const ticket = await prisma.eventTicket.create({
            data: {
                userId,
                eventId,
                price,
                ticketType,
                seatNumber
            }
        });
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: 'Event ticket purchase failed' });
    }
};

exports.getUserTickets = async (req, res) => {
    try {
        const { userId } = req.params;
        const tickets = await prisma.ticket.findMany({
            where: { userId: parseInt(userId) },
            include: { session: { include: { movie: true } } }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tickets' });
    }
};

exports.getUserEventTickets = async (req, res) => {
    try {
        const { userId } = req.params;
        const tickets = await prisma.eventTicket.findMany({
            where: { userId: parseInt(userId) },
            include: { event: true }
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching event tickets' });
    }
};
