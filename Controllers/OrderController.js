//OrderController.js: Contains the logic for the /OrderProposal route, including calling the Google Distance Matrix API.
const Order = require('../Models/OrderModel');
const Client = require('../Models/ClientModel');
const axios = require('axios');
require('dotenv').config();
const { GOOGLE_API_KEY } = process.env;

//calculating the distance using Google API and returning the distance nad duration

const calculateDistance = async (originLat, originLng, destinationLat, destinationLng) => {
  const origin = `${originLat},${originLng}`;
  const destination = `${destinationLat},${destinationLng}`;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${GOOGLE_API_KEY}`;
  const response = await axios.get(url);
  const data = response.data;

  if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
    const distance = data.rows[0].elements[0].distance.text;
    const duration = data.rows[0].elements[0].duration.text;
    return { distance, duration };
  } else {
    throw new Error("Error fetching distance and duration from Google API");
  }
};


//api for handling the calculation request

const orderProposal = async (req, res) => {
  const { pickup_address, receivers_address, weight } = req.body;

  try {
    const { distance, duration } = await calculateDistance(
      pickup_address.latitude,
      pickup_address.longitude,
      receivers_address.latitude,
      receivers_address.longitude
    );
    console.log(distance,duration);
    res.json({
      message: "Order Proposal working",
      distance: distance,
      duration: duration,
      weight: weight,
    });
    console.log('Distance:', distance, 'Duration:', duration);
    // console.log(distance,duration);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error calculating distance and duration");
  }
};


//Final submission to the database:-

const submitOrder = async (req, res) => {
  const { pickup_date, pickup_address, receiver_address, weight, senders_name, senders_email, receivers_name, receivers_email } = req.body;
    try {
      const newClient = new Client({ senders_name, senders_email, receivers_name, receivers_email });
      const client = await newClient.save();

      const order = await Order.create({ client_id: client._id, pickup_date, pickup_address, receiver_address, weight });
      order.save();
      res.send("Data sent successfully!");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error submitting order");
      // res.send(error);
    }

};


module.exports = {
  orderProposal,submitOrder
};


