const sessionController = require('../../src/controllers/sessionController');
const prisma = require('../../src/prismaClient');

// Mock Prisma
jest.mock('../../src/prismaClient', () => ({
    session: {
        findMany: jest.fn(),
        createMany: jest.fn(),
    },
    movie: {
        findUnique: jest.fn(),
    },
    hall: {
        findMany: jest.fn(),
    },
}));

describe('Session Controller', () => {
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

    describe('getSessions', () => {
        it('should return a list of sessions', async () => {
            const sessions = [{ id: 1, movieId: 1 }];
            prisma.session.findMany.mockResolvedValue(sessions);

            await sessionController.getSessions(req, res);

            expect(prisma.session.findMany).toHaveBeenCalledWith({ include: { movie: true, hall: true } });
            expect(res.json).toHaveBeenCalledWith(sessions);
        });

        it('should return 500 on error', async () => {
            prisma.session.findMany.mockRejectedValue(new Error('DB Error'));

            await sessionController.getSessions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching sessions' });
        });
    });

    describe('createAutoSessions', () => {
        it('should create sessions for a movie', async () => {
            req.body.movieId = 1;
            prisma.movie.findUnique.mockResolvedValue({ id: 1 });
            prisma.hall.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
            prisma.session.findMany.mockResolvedValue([]); // No existing sessions
            prisma.session.createMany.mockResolvedValue({ count: 14 });

            await sessionController.createAutoSessions(req, res);

            expect(prisma.session.createMany).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });

        it('should return 400 if movieId is missing', async () => {
            await sessionController.createAutoSessions(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'movieId is required' });
        });

        it('should return 404 if movie not found', async () => {
            req.body.movieId = 999;
            prisma.movie.findUnique.mockResolvedValue(null);

            await sessionController.createAutoSessions(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Movie not found' });
        });

        it('should return 500 if no halls available', async () => {
            req.body.movieId = 1;
            prisma.movie.findUnique.mockResolvedValue({ id: 1 });
            prisma.hall.findMany.mockResolvedValue([]);

            await sessionController.createAutoSessions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'No halls available to create sessions' });
        });

        it('should return 500 on error', async () => {
            req.body.movieId = 1;
            prisma.movie.findUnique.mockRejectedValue(new Error('DB Error'));

            await sessionController.createAutoSessions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error creating sessions' });
        });
    });
});
