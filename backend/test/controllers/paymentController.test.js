const paymentController = require('../../src/controllers/paymentController');
const prisma = require('../../src/prismaClient');

// Mock Prisma
jest.mock('../../src/prismaClient', () => ({
    payment: {
        create: jest.fn(),
    },
    ticket: {
        create: jest.fn(),
    },
    eventTicket: {
        create: jest.fn(),
    },
}));

describe('Payment Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('processPayment', () => {
        it('should process payment and create movie tickets', async () => {
            req.body = {
                userId: 1,
                method: 'CREDIT_CARD',
                totalAmount: 100,
                paymentData: {},
                ticketDetails: [{ sessionId: 1, price: 50 }, { sessionId: 1, price: 50 }]
            };

            prisma.payment.create.mockResolvedValue({ id: 1, ...req.body });
            prisma.ticket.create.mockResolvedValue({ id: 1 });

            await paymentController.processPayment(req, res);

            expect(prisma.payment.create).toHaveBeenCalled();
            expect(prisma.ticket.create).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should process payment and create event tickets', async () => {
            req.body = {
                userId: 1,
                method: 'PIX',
                totalAmount: 100,
                paymentData: {},
                ticketDetails: [{ eventId: 1, price: 100, areaNome: 'A', tipo: 'Inteira' }]
            };

            prisma.payment.create.mockResolvedValue({ id: 1, ...req.body });
            prisma.eventTicket.create.mockResolvedValue({ id: 1 });

            await paymentController.processPayment(req, res);

            expect(prisma.payment.create).toHaveBeenCalled();
            expect(prisma.eventTicket.create).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });

        it('should return 500 on error', async () => {
            prisma.payment.create.mockRejectedValue(new Error('DB Error'));

            await paymentController.processPayment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Payment failed' });
        });
        it('should handle missing ticketDetails', async () => {
            req.body = {
                userId: 1,
                method: 'CREDIT_CARD',
                totalAmount: 100,
                paymentData: {},
                ticketDetails: null
            };

            prisma.payment.create.mockResolvedValue({ id: 1, ...req.body });

            await paymentController.processPayment(req, res);

            expect(prisma.payment.create).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, tickets: [] }));
        });

        it('should handle mixed ticket types', async () => {
            req.body = {
                userId: 1,
                method: 'CREDIT_CARD',
                totalAmount: 150,
                paymentData: {},
                ticketDetails: [
                    { sessionId: 1, price: 50 },
                    { eventId: 1, price: 100, areaNome: 'A', tipo: 'Inteira' }
                ]
            };

            prisma.payment.create.mockResolvedValue({ id: 1, ...req.body });
            prisma.ticket.create.mockResolvedValue({ id: 1 });
            prisma.eventTicket.create.mockResolvedValue({ id: 2 });

            await paymentController.processPayment(req, res);

            expect(prisma.ticket.create).toHaveBeenCalled();
            expect(prisma.eventTicket.create).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });
});
