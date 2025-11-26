const prisma = require('../prismaClient');

exports.processPayment = async (req, res) => {
    try {
        const { userId, method, totalAmount, paymentData, ticketDetails } = req.body;

        const payment = await prisma.payment.create({
            data: {
                userId,
                method,
                totalAmount,
                paymentData: JSON.stringify(paymentData),
                ticketDetails: JSON.stringify(ticketDetails),
                status: 'COMPLETED' // Mocking success
            }
        });

        // Create tickets
        const tickets = [];
        if (ticketDetails && Array.isArray(ticketDetails)) {
            for (const detail of ticketDetails) {
                if (detail.sessionId) {
                    const ticket = await prisma.ticket.create({
                        data: {
                            userId,
                            sessionId: detail.sessionId,
                            price: detail.price,
                            status: 'ACTIVE'
                        }
                    });
                    tickets.push(ticket);
                } else if (detail.eventId) {
                    const ticket = await prisma.eventTicket.create({
                        data: {
                            userId,
                            eventId: detail.eventId,
                            price: detail.price,
                            ticketType: `${detail.areaNome} - ${detail.tipo}`,
                            seatNumber: detail.areaNome
                        }
                    });
                    tickets.push(ticket);
                }
            }
        }

        res.json({ success: true, payment, tickets });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Payment failed' });
    }
};
