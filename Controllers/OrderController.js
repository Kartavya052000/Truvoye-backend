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
    cost,
    distance,
    duration,
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
      order_status: 0,
      client_info: {
        senders_name,
        senders_email,
        receivers_name,
        receivers_email,
      },
      cost,
      distance,
      duration,
    });

    order.save();
    console.log(order);

    res.send("Data sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error submitting order");
    // res.send(error);
  }
};

/**
 * Retrieve Orders from the database
 *
 * @description This function handles two scenarios:
 * 1. If an Order ID is provided in the URL parameters, it returns the Order associated with that ID.
 * 2. If no Order ID is provided, it returns a paginated list of Orders based on optional query parameters.
 *
 * URL Parameters:
 * @param {string} id - The unique ID of the Order. If provided, returns the Order with this ID.
 *
 * Query Parameters:
 * @param {string} [query] - The search term to match against pickup_address, receiver_address, and driver's username.
 * @param {number} [page=1] - The page number for pagination. Defaults to 1 if not provided.
 * @param {number} [limit=10] - The maximum number of records to return per page. Defaults to 10 if not provided.
 * @param {number} [status] - The status of the Order: 0 - unassigned, 1 - assigned, 2 - progress, 3 - completed.
 *
 * Examples:
 * - GET /order/get/:id - Returns the order associated with the provided ID.
 * - GET /order/get?limit=30 - Returns the first 30 order records.
 * - GET /order/get?page=2&limit=30 - Returns the second page of order records with 30 records per page.
 * - GET /order/get?query=Main%20Street - Returns orders where pickup_address or receiver_address contains "Main Street".
 * - GET /order/get?query=David - Returns orders where the driver's username contains "David".
 * - GET /order/get?status=0 - Returns orders that are unassigned.
 */

const get = async (req, res, next) => {
  const { id } = req.params;
  const { query, page = 1, limit = 10, status } = req.query;

  try {
    let revenue = 0; // Initialize revenue variable
    let statusCounts = {
      assigned: 0,
      unassigned: 0,
      in_progress: 0,
      completed: 0,
    };

    // Query database for orders
    if (id) {
      // Handle single order retrieval
      const order = await Order.findById(id)
        .populate("client_id")
        .populate("driver_id");

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.status(200).json({ order });
    } else {
      // Handle multiple orders retrieval
      let searchCriteria = {};

      if (query) {
        const regex = new RegExp(query, "i");
        searchCriteria.$or = [
          { "pickup_address.address_name": regex },
          { "receiver_address.address_name": regex },
          { "client_info.receivers_email": regex },
          { "client_info.receivers_name": regex },
          { "client_info.senders_email": regex },
          { "client_info.senders_name": regex },
          { "driver_info.username": regex },
        ];
      }

      if (status) {
        searchCriteria.order_status = status;
      }

      if (!query && !status) {
        searchCriteria.$or = [
          { "pickup_address.address_name": { $exists: true } },
          { "receiver_address.address_name": { $exists: true } },
          { "client_info.receivers_email": { $exists: true } },
          { "client_info.receivers_name": { $exists: true } },
          { "client_info.senders_email": { $exists: true } },
          { "client_info.senders_name": { $exists: true } },
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const total = await Order.countDocuments(searchCriteria);

      const orders = await Order.find(searchCriteria)
        .sort({ created_at: -1, _id: 1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("driver_id", "username")
        .exec();

      // Calculate total revenue and status counts from fetched orders
      // orders.forEach(order => {
      //   revenue += order.cost;
      //   switch (order.order_status) {
      //     case 0:
      //       statusCounts.unassigned++;
      //       break;
      //     case 1:
      //       statusCounts.assigned++;
      //       break;
      //     case 2:
      //       statusCounts.in_progress++;
      //       break;
      //     case 3:
      //       statusCounts.completed++;
      //       break;
      //     default:
      //       break;
      //   }
      // });

      res.status(200).json({
        total,
        page: Number(page),
        limit: Number(limit),
        orders,
        revenue,
        statusCounts,
      });
    }
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }

  next();
};

const getStatusReport = async (req, res, next) => {
  try {
    const statusCounts = {
      assigned: 0,
      unassigned: 0,
      in_progress: 0,
      completed: 0,
    };

    const counts = await Order.aggregate([
      {
        $group: {
          _id: "$order_status",
          count: { $sum: 1 },
          totalCost: { $sum: "$cost" }


        }
      }
    ]);
    let totalCount = 0;
    let totalRevenue = 0;
    counts.forEach(({ _id, count, totalCost }) => {
      totalCount += count;
      totalRevenue += totalCost || 0; // If `totalCost` is undefined, default to 0
      if (_id === 0) {
        statusCounts.unassigned = count;
      } else if (_id === 1) {
        statusCounts.assigned = count;
      } else if (_id === 2) {
        statusCounts.in_progress = count;
      } else if (_id === 3) {
        statusCounts.completed = count;
      }
    });

    res.status(200).json({
      statusCounts,
      totalCount,
      totalRevenue


    });
  } catch (error) {
    next(error);
  }
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
  const { orderId, driverId, username } = req.body;

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
    order.driver_info = { username };
    order.order_status = 1; // to change order status to assigned
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
  assignOrderToDriver,
  getStatusReport
};
