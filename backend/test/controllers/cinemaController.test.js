const cinemaController = require('../../src/controllers/cinemaController');
const prisma = require('../../src/prismaClient');

// Mock Prisma
jest.mock('../../src/prismaClient', () => ({
    cinema: {
        findMany: jest.fn(),
        create: jest.fn(),
    },
}));

describe('Cinema Controller', () => {
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

    describe('getCinemas', () => {
        it('should return a list of cinemas', async () => {
            const cinemas = [{ id: 1, name: 'Cinema 1' }];
            prisma.cinema.findMany.mockResolvedValue(cinemas);

            await cinemaController.getCinemas(req, res);

            expect(prisma.cinema.findMany).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(cinemas);
        });

        it('should return 500 on error', async () => {
            prisma.cinema.findMany.mockRejectedValue(new Error('DB Error'));

            await cinemaController.getCinemas(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching cinemas' });
        });
    });

    describe('createCinema', () => {
        it('should create a cinema', async () => {
            req.body = { name: 'Cinema 1' };
            const cinema = { id: 1, ...req.body };
            prisma.cinema.create.mockResolvedValue(cinema);

            await cinemaController.createCinema(req, res);

            expect(prisma.cinema.create).toHaveBeenCalledWith({ data: req.body });
            expect(res.json).toHaveBeenCalledWith(cinema);
        });

        it('should return 500 on error', async () => {
            prisma.cinema.create.mockRejectedValue(new Error('DB Error'));

            await cinemaController.createCinema(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error creating cinema' });
        });
    });
});
