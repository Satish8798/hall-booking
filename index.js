const express = require( "express" );
const mongo = require( "./connect" )
const roomBookingRouter = require("./routers/roomBookingRouter");
const dotenv = require("dotenv");

dotenv.config();
mongo.connect();
const app= express();

app.use(express.json());

app.use('/', roomBookingRouter);


app.listen(process.env.PORT);