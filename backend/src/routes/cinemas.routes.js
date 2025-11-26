const express = require('express');
const router = express.Router();
const cinemaController = require('../controllers/cinemaController');

router.get('/', cinemaController.getCinemas);
router.post('/', cinemaController.createCinema);

module.exports = router;
