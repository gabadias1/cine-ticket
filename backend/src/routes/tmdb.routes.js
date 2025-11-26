const express = require('express');
const router = express.Router();
const tmdbController = require('../controllers/tmdbController');

router.get('/popular', tmdbController.getPopular);
router.get('/now-playing', tmdbController.getNowPlaying);
router.get('/upcoming', tmdbController.getUpcoming);
router.get('/top-rated', tmdbController.getTopRated);
router.get('/trending', tmdbController.getTrending);
router.get('/search', tmdbController.search);
router.get('/genres', tmdbController.getGenres);
router.get('/movie/:id', tmdbController.getMovieDetails);

module.exports = router;
