const ticketController = require('../../src/controllers/ticketController');
const prisma = require('../../src/prismaClient');

// Mock Prisma
jest.mock('../../src/prismaClient', () => ({
    ticket: {
        create: jest.fn(),
        findMany: jest.fn(),
    },
    eventTicket: {
        create: jest.fn(),
        findMany: jest.fn(),
    },
}));

describe('Ticket Controller', () => {
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

    describe('purchaseTicket', () => {
        it('should create a ticket', async () => {
            req.body = { userId: 1, sessionId: 1, seatId: 1 };
            const ticket = { id: 1, ...req.body };
            prisma.ticket.create.mockResolvedValue(ticket);

            await ticketController.purchaseTicket(req, res);

            expect(prisma.ticket.create).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(ticket);
        });

        it('should return 500 on error', async () => {
            prisma.ticket.create.mockRejectedValue(new Error('DB Error'));
            await ticketController.purchaseTicket(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Purchase failed' });
        });
    });

    describe('purchaseEventTicket', () => {
        it('should create an event ticket', async () => {
            req.body = { userId: 1, eventId: 1, price: 100, ticketType: 'VIP', seatNumber: 'A1' };
            const ticket = { id: 1, ...req.body };
            prisma.eventTicket.create.mockResolvedValue(ticket);

            await ticketController.purchaseEventTicket(req, res);

            expect(prisma.eventTicket.create).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(ticket);
        });

        it('should return 500 on error', async () => {
            prisma.eventTicket.create.mockRejectedValue(new Error('DB Error'));
            await ticketController.purchaseEventTicket(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Event ticket purchase failed' });
        });
    });

    describe('getUserTickets', () => {
        it('should return user tickets', async () => {
            req.params.userId = '1';
            const tickets = [{ id: 1 }];
            prisma.ticket.findMany.mockResolvedValue(tickets);

            await ticketController.getUserTickets(req, res);

            expect(prisma.ticket.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 1 } }));
            expect(res.json).toHaveBeenCalledWith(tickets);
        });

        it('should return 500 on error', async () => {
            req.params.userId = '1';
            prisma.ticket.findMany.mockRejectedValue(new Error('DB Error'));
            await ticketController.getUserTickets(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching tickets' });
        });
    });

    describe('getUserEventTickets', () => {
        it('should return user event tickets', async () => {
            req.params.userId = '1';
            const tickets = [{ id: 1 }];
            prisma.eventTicket.findMany.mockResolvedValue(tickets);

            await ticketController.getUserEventTickets(req, res);

            expect(prisma.eventTicket.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 1 } }));
            expect(res.json).toHaveBeenCalledWith(tickets);
        });

        it('should return 500 on error', async () => {
            req.params.userId = '1';
            prisma.eventTicket.findMany.mockRejectedValue(new Error('DB Error'));
            await ticketController.getUserEventTickets(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching event tickets' });
        });
    });
});
