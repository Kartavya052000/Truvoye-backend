const Driver = require("../Models/DriverModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../nodemailerConfig");

module.exports.Add = async (req, res, next) => {
  try {
    const {
      email,
      username,
      address,
      phone,
      truckLicensePlateNumber,
      driverLicense,
    } = req.body;

    console.log(req.body);

    const existingUser = await Driver.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Driver already exists" });
    }

    const driver = await Driver.create({
      email,
      username,
      address,
      phone,
      truckLicensePlateNumber,
      driverLicense,
      isAssigned: false,
    });

    const token = createSecretToken(driver._id);
    driver.token = token;

    await driver.save();

    // TODO : update the link when hosting
    const verifyLink = `http://localhost:3000/api/driver/reset-password/${token}`;
    const mailOptions = {
      from: "kartavyabhayana1@gmail.com",
      to: email,
      subject: "Password Reset Request",
      html: `Click <a href="${verifyLink}">here</a> Create new password and login.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: `Notification email sent to ${username} successfully`,
      success: true,
    });
  } catch (error) {
    console.error(error.stack);
  }

  next();
};

module.exports.ResetPassword = async (req, res, next) => {
  const { newPassword } = req.body;
  const { token } = req.params;

  try {
    const driver = await Driver.findOne({ token: token });

    console.log("Driver:", driver); // Check if driver is retrieved

    if (!driver) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Update driver's password and clear/reset the token fields
    driver.password = newPassword;
    driver.resetPasswordToken = undefined;
    driver.resetPasswordExpires = undefined;

    console.log("Updated Driver:", driver); // Check the driver object before saving

    if (driver.verified) {
      // Save the updated driver with the new password and cleared token fields
      await driver.save();
      res.status(200).json({ message: "Password reset successful" });
    } else {
      // This means that driver is redirect from the email that admin sent so it should be verified and go to the the driver dashboard
      driver.verified = true;
      const driverToken = createSecretToken(driver._id);
      driver.token = driverToken;
      await driver.save();

      res.status(201).json({
        message: "Password rest & logged in successfully",
        success: true,
        token: driverToken,
        role: "Driver",
        driver: driver,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
  next();
};

/**
 * Retrieve Drivers from database
 *
 * @description This function handles two scenarios:
 * 1. If a driver ID is provided in the URL parameters, it returns the driver associated with that ID.
 * 2. If no driver ID is provided, it returns a paginated list of drivers.
 *
 * URL Parameters:
 * @param {string} id - The unique ID of the driver. If provided, returns the driver with this ID.
 *
 * Query Parameters:
 * @param {string} [limit=10] - The maximum number of records to return. Defaults to 10 if not provided.
 * @param {string} lastId - The ID of the last driver from the previous response. If provided, returns records starting after this ID.
 * @param {string} [isAssigned=false] - The status of the driver is if it is assigned order or not, default false
 *
 * Examples:
 * - GET /drivers/get/:id - Returns the driver associated with the provided ID.
 * - GET /drivers/get?limit=30 - Returns the first 30 driver records.
 * - GET /drivers/get?limit=30&lastId=LAST_DRIVER_ID - Returns the next 30 driver records starting after the provided lastId.
 * - GET /drivers/get?limit=30&lastId=LAST_DRIVER_ID&isAssigned=false - Returns the next 30 unassigned driver records starting after the provided lastId
 */
module.exports.Get = async (req, res, next) => {
  const { id } = req.params;
  const lastId = req.query.lastId;
  const limit = parseInt(req.query.limit) || 10;
  const isAssigned = req.query.active === "false" ? false : true;

  try {
    if (id) {
      const driver = await Driver.findOne({ _id: id });

      if (!driver) {
        return res.status(404).json({ error: "Driver not found" });
      }

      res.status(201).json({ driver });
    } else {
      let query = {};

      query.isAssigned = isAssigned;

      if (lastId) {
        query = { _id: { $gt: ObjectId(lastId) } };
      }

      const drivers = await Driver.find(query).limit(limit).exec();

      res.status(200).json(drivers);
    }
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }

  next();
};

/**
 * Search Drivers in the database
 *
 * @description This endpoint allows you to search for Drivers based on the  fields.
 * The search is case-insensitive and supports partial matches using regular expressions.
 *
 * Query Parameters:
 * @param {string} query - The search term to match against the `pickup_address` and `receiver_address` fields.
 * @param {number} [page=1] - The page number for pagination. Defaults to 1 if not provided.
 * @param {number} [limit=10] - The maximum number of records to return per page. Defaults to 10 if not provided.
 *
 * Examples:
 * - GET /api/driver/search?query=john - Returns drivers where contains john
 * - GET /api/driver/search?query=john&page=2&limit=5 - Returns the second page of drivers with 5 driver per page, where the data contains "john".
 */
module.exports.Search = async (req, res, next) => {
  const { query, page = 1, limit = 10 } = req.query;

  // Validate input
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  // Create a regular expression for partial text search
  const regex = new RegExp(query, "i");

  // Create a search criteria object for the specified fields
  const searchCriteria = {
    $or: [{ username: regex }, { email: regex }, {address : regex}, {phone : regex}, {truckLicensePlateNumber : regex}, {driverLicense : regex}],
  };

  try {
    const total = await Driver.countDocuments(searchCriteria);
    const drivers = await Driver.find(searchCriteria)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      drivers,
    });
  } catch (err) {
    res.status(500).json({ error: "Error searching drivers" });
  }

  next();
};

/**
 * Just an helper method for filter and allow specific fields for updating a Driver document.
 *
 * @description Filters the request body to include only allowed fields for updating.
 * Only fields listed in `allowedFields` will be included in `req.filteredUpdateData`.
 * If no valid fields are present, responds with a 400 error.
 *
 * @param {Array} allowedFields - Array of strings representing allowed fields for updating.
 *
 */
const filterUpdateFields = (updateData, allowedFields) => {
  return Object.keys(updateData).reduce((filtered, key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = updateData[key];
    }
    return filtered;
  }, {});
};

const allowedFieldsToUpdate = [
  "email",
  "username",
  "address",
  "phone",
  "truckLicensePlateNumber",
  "driverLicense",
];

/**
 * Update a Driver document by ID.
 *
 * @description Handles PUT requests to update a Driver document by ID.
 * Uses `req.filteredUpdateData` set by `filterUpdateFields` method to update only allowed fields.
 * Responds with the updated Driver document or appropriate error messages.
 */
module.exports.Edit = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const filteredUpdateData = filterUpdateFields(
    updateData,
    allowedFieldsToUpdate
  );

  if (Object.keys(filteredUpdateData).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      filteredUpdateData,
      { new: true, runValidators: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    res.status(200).json({ driver: updatedDriver });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }

  next();
};

/**
 * Login for Driver
 *
 * @description Uses email and password to log in the driver and returns a token to verify the driver in future
 */
module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: "All fields are required" });
    }
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(404).json({ message: "Incorrect password or email" });
    }
    // Check if the driver is verified
    if (!driver.verified) {
      return res.status(401).json({ message: "Driver not verified" });
    }
    const auth = await bcrypt.compare(password, driver.password);
    console.log(auth);
    if (!auth) {
      return res.status(401).json({ message: "Incorrect password or email" });
    }

    const token = createSecretToken(driver._id);
    // res.cookie("token", token, {
    //   withCredentials: true,
    //   httpOnly: false,
    // });

    // Save the token to the driver in the database
    driver.token = token;
    res.status(201).json({
      message: "Driver logged in successfully",
      success: true,
      token: token,
      driver,
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }

  next();
};

/**
 * Forgot password for Driver
 *
 * @description Uses email and password to log in the driver and returns a token to verify the driver in future
 */
module.exports.ForgetPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Generate a unique token for password reset
    const token = createSecretToken(driver._id);

    // Save the token to the driver in the database
    driver.token = token;
    driver.resetPasswordExpires = Date.now() + 3600000; // Token expiration time (e.g., 1 hour)
    await driver.save();

    // Send email with the password reset link containing the token
    const resetLink = `https://localhost:3000/api/driver/reset-password/${token}`;
    const mailOptions = {
      from: "kartavyabhayana1@gmail.com",
      to: email,
      subject: "Password Reset Request",
      html: `Click <a href="${resetLink}">here</a> to reset your password.`,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ message: "Check your email for password reset instructions" });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
  next();
};
