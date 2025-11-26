const tmdbService = require('../tmdbService');

exports.getPopular = async (req, res) => {
    try {
        const data = await tmdbService.getPopularMovies(req.query.page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching popular movies' });
    }
};

exports.getNowPlaying = async (req, res) => {
    try {
        const data = await tmdbService.getNowPlayingMovies(req.query.page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching now playing movies' });
    }
};

exports.getUpcoming = async (req, res) => {
    try {
        const data = await tmdbService.getUpcomingMovies(req.query.page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching upcoming movies' });
    }
};

exports.getTopRated = async (req, res) => {
    try {
        const data = await tmdbService.getTopRatedMovies(req.query.page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching top rated movies' });
    }
};

exports.getTrending = async (req, res) => {
    try {
        const data = await tmdbService.getTrendingMovies(req.query.time_window, req.query.page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching trending movies' });
    }
};

exports.search = async (req, res) => {
    try {
        const data = await tmdbService.searchMovies(req.query.query, req.query.page);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error searching movies' });
    }
};

exports.getGenres = async (req, res) => {
    try {
        const data = await tmdbService.getGenres();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching genres' });
    }
};

exports.getMovieDetails = async (req, res) => {
    try {
        const data = await tmdbService.getMovieDetails(req.params.id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching movie details' });
    }
};
