const tmdbController = require('../../src/controllers/tmdbController');
const tmdbService = require('../../src/tmdbService');

// Mock Service
jest.mock('../../src/tmdbService', () => ({
    getPopularMovies: jest.fn(),
    getNowPlayingMovies: jest.fn(),
    getUpcomingMovies: jest.fn(),
    getTopRatedMovies: jest.fn(),
    getTrendingMovies: jest.fn(),
    searchMovies: jest.fn(),
    getGenres: jest.fn(),
    getMovieDetails: jest.fn(),
}));

describe('TMDB Controller', () => {
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

    describe('getPopular', () => {
        it('should return popular movies', async () => {
            const data = { results: [] };
            tmdbService.getPopularMovies.mockResolvedValue(data);

            await tmdbController.getPopular(req, res);

            expect(tmdbService.getPopularMovies).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(data);
        });

        it('should return 500 on error', async () => {
            tmdbService.getPopularMovies.mockRejectedValue(new Error('API Error'));

            await tmdbController.getPopular(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching popular movies' });
        });
    });

    describe('getNowPlaying', () => {
        it('should return now playing movies', async () => {
            const data = { results: [] };
            tmdbService.getNowPlayingMovies.mockResolvedValue(data);

            await tmdbController.getNowPlaying(req, res);

            expect(tmdbService.getNowPlayingMovies).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(data);
        });

        it('should return 500 on error', async () => {
            tmdbService.getNowPlayingMovies.mockRejectedValue(new Error('API Error'));

            await tmdbController.getNowPlaying(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching now playing movies' });
        });
    });

    describe('getUpcoming', () => {
        it('should return upcoming movies', async () => {
            const data = { results: [] };
            tmdbService.getUpcomingMovies.mockResolvedValue(data);

            await tmdbController.getUpcoming(req, res);

            expect(tmdbService.getUpcomingMovies).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(data);
        });

        it('should return 500 on error', async () => {
            tmdbService.getUpcomingMovies.mockRejectedValue(new Error('API Error'));

            await tmdbController.getUpcoming(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching upcoming movies' });
        });
    });

    describe('getTopRated', () => {
        it('should return top rated movies', async () => {
            const data = { results: [] };
            tmdbService.getTopRatedMovies.mockResolvedValue(data);

            await tmdbController.getTopRated(req, res);

            expect(tmdbService.getTopRatedMovies).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(data);
        });

        it('should return 500 on error', async () => {
            tmdbService.getTopRatedMovies.mockRejectedValue(new Error('API Error'));

            await tmdbController.getTopRated(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching top rated movies' });
        });
    });

    describe('getTrending', () => {
        it('should return trending movies', async () => {
            const data = { results: [] };
            tmdbService.getTrendingMovies.mockResolvedValue(data);

            await tmdbController.getTrending(req, res);

            expect(tmdbService.getTrendingMovies).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(data);
        });

        it('should return 500 on error', async () => {
            tmdbService.getTrendingMovies.mockRejectedValue(new Error('API Error'));

            await tmdbController.getTrending(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching trending movies' });
        });
    });

    describe('search', () => {
        it('should search movies', async () => {
            const data = { results: [] };
            tmdbService.searchMovies.mockResolvedValue(data);

            await tmdbController.search(req, res);

            expect(tmdbService.searchMovies).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(data);
        });

        it('should return 500 on error', async () => {
            tmdbService.searchMovies.mockRejectedValue(new Error('API Error'));

            await tmdbController.search(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error searching movies' });
        });
    });

    describe('getGenres', () => {
        it('should return genres', async () => {
            const data = { genres: [] };
            tmdbService.getGenres.mockResolvedValue(data);

            await tmdbController.getGenres(req, res);

            expect(tmdbService.getGenres).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(data);
        });

        it('should return 500 on error', async () => {
            tmdbService.getGenres.mockRejectedValue(new Error('API Error'));

            await tmdbController.getGenres(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching genres' });
        });
    });

    describe('getMovieDetails', () => {
        it('should return movie details', async () => {
            const data = { id: 1 };
            tmdbService.getMovieDetails.mockResolvedValue(data);

            await tmdbController.getMovieDetails(req, res);

            expect(tmdbService.getMovieDetails).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(data);
        });

        it('should return 500 on error', async () => {
            tmdbService.getMovieDetails.mockRejectedValue(new Error('API Error'));

            await tmdbController.getMovieDetails(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching movie details' });
        });
    });
});
