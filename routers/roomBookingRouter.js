const express = require("express");
const roomBookingModule = require("../modules/roomBookingModule")

const router = express.Router();

router.get('/rooms',roomBookingModule.getRooms);
router.post('/create-room',roomBookingModule.createRoom);
router.post('/book-room',roomBookingModule.bookRoom);
router.get('/get-customer-booking-details',roomBookingModule.getCustomerBookingDetails)

module.exports = router