const express = require('express');
const router = express.Router();
const ticketmasterController = require('../controllers/ticketmasterController');

router.get('/events', ticketmasterController.getEvents);
router.get('/event/:id', ticketmasterController.getEventDetails);

module.exports = router;
