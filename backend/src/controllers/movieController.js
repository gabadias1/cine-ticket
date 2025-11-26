const prisma = require('../prismaClient');
const tmdbService = require('../tmdbService');

exports.getMovies = async (req, res) => {
    try {
        const movies = await prisma.movie.findMany();
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching movies' });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        const movie = await prisma.movie.findUnique({ where: { id: parseInt(id) } });
        if (!movie) return res.status(404).json({ error: 'Movie not found' });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching movie' });
    }
};

exports.syncTmdb = async (req, res) => {
    try {
        const { tmdbId } = req.body;
        const movie = await tmdbService.getMovieDetails(tmdbId);
        // Save to DB logic here if needed, or just return
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: 'Error syncing TMDB' });
    }
};
