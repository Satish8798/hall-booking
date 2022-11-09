const { ObjectId } = require("bson");
const mongo = require("../connect");

//Module for creating a room
module.exports.createRoom = async (req, res, next) => {
  try {
    mongo.selectedDb.collection("rooms").insertOne({ ...req.body.room });
    res.send({
      msg: "room created",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
};

//Module for Booking a room
module.exports.bookRoom = async (req, res, next) => {
  const roomId = req.body.book.roomId;

  async function bookRoom(priceForOneHour, bookingDetails) {
    const booking = {
      roomId: req.body.book.roomId,
      customerId: req.body.book.customerId,
      customerName: req.body.book.customerName,
      Date: req.body.book.Date,
      startTime: req.body.book.startTime,
      endTime: req.body.book.endTime,
      pricePaid:
        priceForOneHour * (req.body.book.endTime - req.body.book.startTime),
    };

    try {
      const response = await mongo.selectedDb
        .collection("rooms")
        .findOneAndUpdate(
          { _id: ObjectId(roomId) },
          {
            $set: {
              bookingDetails: [...bookingDetails, booking],
            },
          }
        );
    } catch (error) {
      res.send(error);
    }
  }

  const room = await mongo.selectedDb
    .collection("rooms")
    .findOne({ _id: ObjectId(roomId) });
  const requestedStartTime = req.body.book.startTime;
  const requestedEndTime = req.body.book.endTime;
  const requestedDate = new Date(req.body.book.Date).toISOString();
  const today = new Date().toISOString();
  const now = new Date().getHours();

  if (room) {
    if (
      requestedDate < today ||
      (requestedDate===today && requestedStartTime <= now) ||
      requestedEndTime <= requestedStartTime
    ) {
      return res.status(400).send({
        msg: "please provide with correct date or time",
      });
    }
    if (room.bookingDetails.length > 0) {
      for (let i = 0; i < room.bookingDetails.length; i++) {
        if (
          (requestedStartTime >= room.bookingDetails[i].startTime &&
            requestedEndTime <= room.bookingDetails[i].endTime) ||
          (requestedStartTime < room.bookingDetails[i].startTime &&
            requestedEndTime > room.bookingDetails[i].endTime) ||
          (requestedStartTime > room.bookingDetails[i].startTime &&
            requestedStartTime < room.bookingDetails[i].endTime) ||
          (requestedEndTime > room.bookingDetails[i].startTime &&
            requestedEndTime < room.bookingDetails[i].endTime)
        ) {
          let prevDate = new Date(room.bookingDetails[i].Date).toISOString();
          if (requestedDate === prevDate) {
              return res.status(400).send({
                msg: "slot is not available",
              });
            } 
          } else if (i === room.bookingDetails.length - 1) {
            bookRoom(room.price, room.bookingDetails);
            return res.send({ msg: "Room Booked Successfully" });
          }
        }} else {
          bookRoom(room.price, room.bookingDetails);
          return res.send({ msg: "Room Booked Successfully" });
        }
      } else {
    return res.status(400).send("Invalid Room ID");
  }
  //res.send({ msg: "Room Booked Successfully" });
};

module.exports.getRooms = async (req, res, next) => {
  try {
    const response = await mongo.selectedDb
      .collection("rooms")
      .find()
      .toArray();
    res.send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
};

module.exports.getCustomerBookingDetails = async (req, res, next) => {
  try {
    const response = await mongo.selectedDb
      .collection("rooms")
      .find({ bookingDetails: { $ne: [] } })
      .project({ bookingDetails: 1 })
      .toArray();
    res.send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("server error");
  }
};
