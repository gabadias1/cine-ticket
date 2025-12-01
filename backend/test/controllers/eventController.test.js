const eventController = require('../../src/controllers/eventController');
const prisma = require('../../src/prismaClient');

// Mock Prisma
jest.mock('../../src/prismaClient', () => ({
    event: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
}));

describe('Event Controller', () => {
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

    describe('getEvents', () => {
        it('should return a list of events', async () => {
            const events = [{ id: 1, name: 'Event 1' }];
            prisma.event.findMany.mockResolvedValue(events);

            await eventController.getEvents(req, res);

            expect(prisma.event.findMany).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(events);
        });

        it('should return 500 on error', async () => {
            prisma.event.findMany.mockRejectedValue(new Error('DB Error'));

            await eventController.getEvents(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching events' });
        });
    });

    describe('getEventById', () => {
        it('should return an event by id', async () => {
            req.params.id = '1';
            const event = { id: 1, name: 'Event 1' };
            prisma.event.findUnique.mockResolvedValue(event);

            await eventController.getEventById(req, res);

            expect(prisma.event.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(res.json).toHaveBeenCalledWith(event);
        });

        it('should return 404 if event not found', async () => {
            req.params.id = '1';
            prisma.event.findUnique.mockResolvedValue(null);

            await eventController.getEventById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Event not found' });
        });

        it('should return 500 on error', async () => {
            req.params.id = '1';
            prisma.event.findUnique.mockRejectedValue(new Error('DB Error'));

            await eventController.getEventById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching event' });
        });
    });

    describe('syncTicketmaster', () => {
        it('should return not implemented message', async () => {
            await eventController.syncTicketmaster(req, res);
            expect(res.json).toHaveBeenCalledWith({ message: 'Sync not implemented' });
        });
    });
});
