const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.post('/', ticketController.purchaseTicket);
router.post('-event', ticketController.purchaseEventTicket); // /purchase-event
module.exports = router;
