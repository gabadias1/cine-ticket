process.env.TICKETMASTER_API_KEY = 'test_key';
const ticketmasterService = require('../../src/ticketmasterService');
const axios = require('axios');

jest.mock('axios');

describe('Ticketmaster Service', () => {
    let mockClient;

    beforeEach(() => {
        mockClient = {
            get: jest.fn(),
        };
        ticketmasterService.client = mockClient;
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('searchEvents', () => {
        it('should search events', async () => {
            const data = { _embedded: { events: [] } };
            mockClient.get.mockResolvedValue({ data });

            const result = await ticketmasterService.searchEvents({ keyword: 'test' });

            expect(mockClient.get).toHaveBeenCalledWith('/events.json', expect.any(Object));
            expect(result).toEqual(data);
        });

        it('should throw error on failure', async () => {
            mockClient.get.mockRejectedValue(new Error('API Error'));

            await expect(ticketmasterService.searchEvents()).rejects.toThrow();
            expect(console.error).toHaveBeenCalled();
        });

        it('should log verbose messages', async () => {
            const data = { _embedded: { events: [] } };
            mockClient.get.mockResolvedValue({ data });

            await ticketmasterService.searchEvents({ keyword: 'test' }, true);

            expect(console.log).toHaveBeenCalled();
        });
    });

    describe('getEventDetails', () => {
        it('should return event details', async () => {
            const data = { id: '1', name: 'Event' };
            mockClient.get.mockResolvedValue({ data });

            const result = await ticketmasterService.getEventDetails('1');

            expect(mockClient.get).toHaveBeenCalledWith('/events/1.json', expect.any(Object));
            expect(result).toEqual(data);
        });

        it('should throw error if id missing', async () => {
            await expect(ticketmasterService.getEventDetails()).rejects.toThrow('ticketmasterId é obrigatório');
        });

        it('should log verbose messages', async () => {
            const data = { id: '1' };
            mockClient.get.mockResolvedValue({ data });

            await ticketmasterService.getEventDetails('1', true);

            expect(console.log).toHaveBeenCalled();
        });
    });

    describe('convertTicketmasterEventToLocal', () => {
        it('should convert event correctly', () => {
            const tmEvent = {
                id: '1',
                name: 'Event',
                dates: { start: { localDate: '2023-01-01' } },
                _embedded: { venues: [{ name: 'Venue', city: { name: 'City' }, state: { stateCode: 'ST' } }] },
                priceRanges: [{ min: 10, max: 20 }],
                classifications: [{ segment: { name: 'Music' } }],
                images: [{ url: 'http://image.com', ratio: '16_9', width: 1024 }]
            };

            const localEvent = ticketmasterService.convertTicketmasterEventToLocal(tmEvent);

            expect(localEvent.ticketmasterId).toBe('1');
            expect(localEvent.title).toBe('Event');
            expect(localEvent.location).toBe('Venue');
            expect(localEvent.city).toBe('City');
            expect(localEvent.state).toBe('ST');
            expect(localEvent.price).toBe(10);
            expect(localEvent.category).toBe('Music');
            expect(localEvent.imageUrl).toBe('http://image.com');
        });

        it('should handle missing fields in conversion', () => {
            const tmEvent = {};
            const localEvent = ticketmasterService.convertTicketmasterEventToLocal(tmEvent);
            expect(localEvent.title).toBe('Evento sem título');
            expect(localEvent.price).toBe(0);
        });
    });

    describe('logError', () => {
        it('should log error with response', () => {
            const error = { response: { status: 400, data: { msg: 'error' }, headers: {} } };
            ticketmasterService.logError('test', error, true);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Status:'), 400);
        });

        it('should log error with request', () => {
            const error = { request: {} };
            ticketmasterService.logError('test', error);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Request feito, mas sem resposta'));
        });

        it('should log generic error', () => {
            const error = { message: 'Generic' };
            ticketmasterService.logError('test', error);
            expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Erro:'), 'Generic');
        });
    });

    describe('cleanText', () => {
        it('should clean text', () => {
            expect(ticketmasterService.cleanText('<p>  Hello  </p>')).toBe('Hello');
        });

        it('should return empty string if null', () => {
            expect(ticketmasterService.cleanText(null)).toBe('');
        });
    });
});
