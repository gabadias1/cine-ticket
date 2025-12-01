const ticketmasterController = require('../../src/controllers/ticketmasterController');
const ticketmasterService = require('../../src/ticketmasterService');

// Mock Service
jest.mock('../../src/ticketmasterService', () => ({
    searchEvents: jest.fn(),
    getEventDetails: jest.fn(),
}));

describe('Ticketmaster Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getEvents', () => {
        it('should return events from service', async () => {
            const events = [{ id: 1 }];
            ticketmasterService.searchEvents.mockResolvedValue(events);

            await ticketmasterController.getEvents(req, res);

            expect(ticketmasterService.searchEvents).toHaveBeenCalledWith(req.query);
            expect(res.json).toHaveBeenCalledWith(events);
        });

        it('should return 500 on error', async () => {
            ticketmasterService.searchEvents.mockRejectedValue(new Error('Service Error'));

            await ticketmasterController.getEvents(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch events' });
        });
    });

    describe('getEventDetails', () => {
        it('should return event details from service', async () => {
            req.params.id = '1';
            const event = { id: 1 };
            ticketmasterService.getEventDetails.mockResolvedValue(event);

            await ticketmasterController.getEventDetails(req, res);

            expect(ticketmasterService.getEventDetails).toHaveBeenCalledWith('1');
            expect(res.json).toHaveBeenCalledWith(event);
        });

        it('should return 500 on error', async () => {
            req.params.id = '1';
            ticketmasterService.getEventDetails.mockRejectedValue(new Error('Service Error'));

            await ticketmasterController.getEventDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch event details' });
        });
    });
});
