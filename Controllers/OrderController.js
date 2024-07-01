//OrderController.js: Contains the logic for the /OrderProposal route, including calling the Google Distance Matrix API.
const Order = require("../Models/OrderModel");
const Driver = require("../Models/DriverModel");
const Client = require("../Models/ClientModel");
const axios = require("axios");
require("dotenv").config();
const { GOOGLE_API_KEY } = process.env;

//calculating the distance using Google API and returning the distance nad duration

const calculateDistance = async (
  originLat,
  originLng,
  destinationLat,
  destinationLng
) => {
  const origin = `${originLat},${originLng}`;
  const destination = `${destinationLat},${destinationLng}`;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&key=${GOOGLE_API_KEY}`;
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
    console.log(distance, duration);
    res.json({
      message: "Order Proposal working",
      distance: distance,
      duration: duration,
      weight: weight,
    });
    console.log("Distance:", distance, "Duration:", duration);
    // console.log(distance,duration);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error calculating distance and duration");
  }
};

//Final submission to the database:-

const submitOrder = async (req, res) => {
  const {
    pickup_date,
    pickup_address,
    receiver_address,
    weight,
    senders_name,
    senders_email,
    receivers_name,
    receivers_email,
  } = req.body;
  try {
    const newClient = new Client({
      senders_name,
      senders_email,
      receivers_name,
      receivers_email,
    });
    const client = await newClient.save();

    const order = await Order.create({
      client_id: client._id,
      pickup_date,
      pickup_address,
      receiver_address,
      weight,
      order_status : 0
    });
    order.save();
    res.send("Data sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error submitting order");
    // res.send(error);
  }
};

/**
 * Retrieve Orders  from database
 *
 * @description This function handles two scenarios:
 * 1. If a Orders ID is provided in the URL parameters, it returns the Order associated with that ID.
 * 2. If no Orders ID is provided, it returns a paginated list of Orders.
 *
 * URL Parameters:
 * @param {string} id - The unique ID of the Order. If provided, returns the Order with this ID.
 *
 * Query Parameters:
 * @param {string} [limit=10] - The maximum number of records to return. Defaults to 10 if not provided.
 * @param {string} lastId - The ID of the last Order from the previous response. If provided, returns records starting after this ID.
 * @param {string} [status=1] - The status of the Order 0 - unassigned, 1- assigned, 2 - completed. Defaults to 0 if not provided
 *
 * Examples:
 * - GET /Order/get/:id - Returns the order associated with the provided ID.
 * - GET /Order/get?limit=30 - Returns the first 30 order records.
 * - GET /Order/get?limit=30&lastId=LAST_ORDER_ID - Returns the next 30 order records starting after the provided lastId.
 * - GET /Order/get?limit=30&lastId=LAST_ORDER_ID&status=0 - Returns the next 30 unassigned order records starting after the provided lastId
 */
const get = async (req, res, next) => {
console.log("Are toy there ")

  const { id } = req.params;
  const lastId = req.query.lastId;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status || 0;
  try {
    if (id) {
      const order = await Order.findById(id).populate("client_id");

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.status(201).json({ order });
    } else {
      let query = {};

      // query.order_status = status;

      if (lastId) {
        query._id = { $gt: ObjectId(lastId) };
      }
console.log(query)
      const orders = await Order.find(query).limit(limit).exec();

      res.status(200).json(orders);
    }
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }

  next();
};

/**
 * Search Orders in the database
 *
 * @description This endpoint allows you to search for orders based on the `pickup_address` and `receiver_address` fields.
 * The search is case-insensitive and supports partial matches using regular expressions.
 *
 * Query Parameters:
 * @param {string} query - The search term to match against the `pickup_address` and `receiver_address` fields.
 * @param {number} [page=1] - The page number for pagination. Defaults to 1 if not provided.
 * @param {number} [limit=10] - The maximum number of records to return per page. Defaults to 10 if not provided.
 *
 * Examples:
 * - GET /api/orders/search?query=Main Street - Returns orders where `pickup_address` or `receiver_address` contains "Main Street".
 * - GET /api/orders/search?query=Main Street&page=2&limit=5 - Returns the second page of orders with 5 orders per page, where the address contains "Main Street".
 */
const search = async (req, res, next) => {
  const { query, page = 1, limit = 10 } = req.query;

  // Validate input
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  // Create a regular expression for partial text search
  const regex = new RegExp(query, "i");

  // Create a search criteria object for the specified fields
  const searchCriteria = {
    $or: [{ pickup_address: regex }, { receiver_address: regex }],
  };

  try {
    const total = await Order.countDocuments(searchCriteria);
    const orders = await Order.find(searchCriteria)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      orders,
    });
  } catch (err) {
    res.status(500).json({ error: "Error searching orders" });
  }

  next();
};


const assignOrderToDriver = async (req, res, next) => {
  const { orderId, driverId } = req.body;

  try {
    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Find the driver by driverId
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Assign driver_id to the order
    order.driver_id = driverId;
    // order.order_status =1   // to change order status to assigned
    await order.save();

    res.json({ message: "Order assigned to driver successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error assigning order to driver" });
  }
};

module.exports = {
  orderProposal,
  submitOrder,
  get,
  search,
  assignOrderToDriver
};
