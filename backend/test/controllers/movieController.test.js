const movieController = require('../../src/controllers/movieController');
const prisma = require('../../src/prismaClient');
const tmdbService = require('../../src/tmdbService');

// Mock Prisma and TMDB Service
jest.mock('../../src/prismaClient', () => ({
    movie: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
    },
}));

jest.mock('../../src/tmdbService', () => ({
    getMovieDetails: jest.fn(),
}));

describe('Movie Controller', () => {
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

    describe('getMovies', () => {
        it('should return a list of movies', async () => {
            const movies = [{ id: 1, title: 'Movie 1' }];
            prisma.movie.findMany.mockResolvedValue(movies);

            await movieController.getMovies(req, res);

            expect(prisma.movie.findMany).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(movies);
        });

        it('should return 500 on error', async () => {
            prisma.movie.findMany.mockRejectedValue(new Error('DB Error'));

            await movieController.getMovies(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching movies' });
        });
    });

    describe('getMovieById', () => {
        it('should return a movie by id', async () => {
            req.params.id = '1';
            const movie = { id: 1, title: 'Movie 1' };
            prisma.movie.findUnique.mockResolvedValue(movie);

            await movieController.getMovieById(req, res);

            expect(prisma.movie.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(res.json).toHaveBeenCalledWith(movie);
        });

        it('should return 404 if movie not found', async () => {
            req.params.id = '1';
            prisma.movie.findUnique.mockResolvedValue(null);

            await movieController.getMovieById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Movie not found' });
        });

        it('should return 500 on error', async () => {
            req.params.id = '1';
            prisma.movie.findUnique.mockRejectedValue(new Error('DB Error'));

            await movieController.getMovieById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching movie' });
        });
    });

    describe('syncTmdb', () => {
        it('should sync movie from TMDB', async () => {
            req.body.tmdbId = 123;
            const movieDetails = { id: 123, title: 'TMDB Movie' };
            tmdbService.getMovieDetails.mockResolvedValue(movieDetails);

            await movieController.syncTmdb(req, res);

            expect(tmdbService.getMovieDetails).toHaveBeenCalledWith(123);
            expect(res.json).toHaveBeenCalledWith(movieDetails);
        });

        it('should return 500 on error', async () => {
            req.body.tmdbId = 123;
            tmdbService.getMovieDetails.mockRejectedValue(new Error('TMDB Error'));

            await movieController.syncTmdb(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error syncing TMDB' });
        });
    });
});
