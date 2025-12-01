const tmdbService = require('../../src/tmdbService');
const axios = require('axios');

jest.mock('axios');

describe('TMDB Service', () => {
    let mockClient;

    beforeEach(() => {
        mockClient = {
            get: jest.fn(),
        };
        axios.create.mockReturnValue(mockClient);
        // Re-instantiate service to use mocked client if needed, 
        // but since it's a singleton exported, we might need to spy on the client property or mock axios.create before require.
        // However, since we require it at the top, axios.create runs then.
        // Better to mock the client instance on the service if accessible, or mock axios before requiring.
        // Since we already required it, we might need to rely on how jest mocks modules.
        // Actually, jest.mock('axios') is hoisted, so it should work if we mock the return of create.
        tmdbService.client = mockClient; // Force replace client for testing
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getPopularMovies', () => {
        it('should return popular movies', async () => {
            const data = { results: [] };
            mockClient.get.mockResolvedValue({ data });

            const result = await tmdbService.getPopularMovies();

            expect(mockClient.get).toHaveBeenCalledWith('/movie/popular', expect.any(Object));
            expect(result).toEqual(data);
        });

        it('should throw error on failure', async () => {
            mockClient.get.mockRejectedValue(new Error('API Error'));

            await expect(tmdbService.getPopularMovies()).rejects.toThrow('Falha ao buscar filmes populares');
        });
    });

    describe('getNowPlayingMovies', () => {
        it('should return now playing movies', async () => {
            const data = { results: [] };
            mockClient.get.mockResolvedValue({ data });

            const result = await tmdbService.getNowPlayingMovies();

            expect(mockClient.get).toHaveBeenCalledWith('/movie/now_playing', expect.any(Object));
            expect(result).toEqual(data);
        });
    });

    describe('getUpcomingMovies', () => {
        it('should return upcoming movies', async () => {
            const data = { results: [] };
            mockClient.get.mockResolvedValue({ data });

            const result = await tmdbService.getUpcomingMovies();

            expect(mockClient.get).toHaveBeenCalledWith('/movie/upcoming', expect.any(Object));
            expect(result).toEqual(data);
        });
    });

    describe('getTopRatedMovies', () => {
        it('should return top rated movies', async () => {
            const data = { results: [] };
            mockClient.get.mockResolvedValue({ data });

            const result = await tmdbService.getTopRatedMovies();

            expect(mockClient.get).toHaveBeenCalledWith('/movie/top_rated', expect.any(Object));
            expect(result).toEqual(data);
        });
    });

    describe('getTrendingMovies', () => {
        it('should return trending movies', async () => {
            const data = { results: [] };
            mockClient.get.mockResolvedValue({ data });

            const result = await tmdbService.getTrendingMovies();

            expect(mockClient.get).toHaveBeenCalledWith('/trending/movie/week', expect.any(Object));
            expect(result).toEqual(data);
        });
    });

    describe('getMovieDetails', () => {
        it('should return movie details', async () => {
            const data = { id: 1, title: 'Movie', overview: 'Overview' };
            mockClient.get.mockResolvedValue({ data });

            const result = await tmdbService.getMovieDetails(1);

            expect(mockClient.get).toHaveBeenCalledWith('/movie/1', expect.any(Object));
            expect(result).toEqual(data);
        });

        it('should fallback to English if title/overview missing', async () => {
            const ptData = { id: 1, title: '', overview: '' };
            const enData = { id: 1, title: 'Movie EN', overview: 'Overview EN' };

            mockClient.get
                .mockResolvedValueOnce({ data: ptData })
                .mockResolvedValueOnce({ data: enData });

            const result = await tmdbService.getMovieDetails(1);

            expect(mockClient.get).toHaveBeenCalledTimes(2);
            expect(result.title).toBe('Movie EN');
        });
    });

    describe('searchMovies', () => {
        it('should search movies', async () => {
            const data = { results: [] };
            mockClient.get.mockResolvedValue({ data });

            const result = await tmdbService.searchMovies('query');

            expect(mockClient.get).toHaveBeenCalledWith('/search/movie', expect.any(Object));
            expect(result).toEqual(data);
        });
    });

    describe('getGenres', () => {
        it('should return genres', async () => {
            const data = { genres: [] };
            mockClient.get.mockResolvedValue({ data });

            const result = await tmdbService.getGenres();

            expect(mockClient.get).toHaveBeenCalledWith('/genre/movie/list', expect.any(Object));
            expect(result).toEqual(data);
        });
    });

    describe('getMoviesByGenre', () => {
        it('should return movies by genre', async () => {
            const data = { results: [] };
            mockClient.get.mockResolvedValue({ data });

            const result = await tmdbService.getMoviesByGenre(1);

            expect(mockClient.get).toHaveBeenCalledWith('/discover/movie', expect.any(Object));
            expect(result).toEqual(data);
        });
    });
    describe('convertTMDBMovieToLocal', () => {
        it('should convert movie correctly', () => {
            const tmMovie = {
                id: 1,
                title: 'Movie',
                overview: 'Overview',
                runtime: 120,
                adult: false,
                poster_path: '/poster.jpg',
                backdrop_path: '/backdrop.jpg',
                release_date: '2023-01-01',
                vote_average: 8.5,
                vote_count: 100,
                original_language: 'en',
                genres: [{ name: 'Action' }]
            };

            const localMovie = tmdbService.convertTMDBMovieToLocal(tmMovie);

            expect(localMovie.tmdbId).toBe(1);
            expect(localMovie.title).toBe('Movie');
            expect(localMovie.rating).toBe('12');
            expect(localMovie.genres).toBe('Action');
        });

        it('should handle adult rating', () => {
            const tmMovie = { adult: true };
            const localMovie = tmdbService.convertTMDBMovieToLocal(tmMovie);
            expect(localMovie.rating).toBe('18');
        });
    });

    describe('getImageURL', () => {
        it('should return image url', () => {
            expect(tmdbService.getImageURL('/path.jpg')).toBe('https://image.tmdb.org/t/p/w500/path.jpg');
        });

        it('should return null if no path', () => {
            expect(tmdbService.getImageURL(null)).toBeNull();
        });
    });

    describe('requestWithRetry', () => {
        it('should retry on failure', async () => {
            const mockRequest = jest.fn()
                .mockRejectedValueOnce(new Error('timeout'))
                .mockResolvedValueOnce('success');

            const result = await tmdbService.requestWithRetry(mockRequest, 3, 1);

            expect(mockRequest).toHaveBeenCalledTimes(2);
            expect(result).toBe('success');
        });

        it('should throw after max retries', async () => {
            const mockRequest = jest.fn().mockRejectedValue(new Error('timeout'));

            await expect(tmdbService.requestWithRetry(mockRequest, 2, 1)).rejects.toThrow('timeout');
            expect(mockRequest).toHaveBeenCalledTimes(3); // Initial + 2 retries
        });
    });
});

