import { logger } from "../utils/logger.js";
import Registration from "../models/Registration.js";
import Transaction from "../models/Transaction.js";
import OtpVerification from "../models/OtpVerification.js";
import { generateOTP, sendSMS, sendEmail } from "../utils/communication.js";
import { formatDate } from "../utils/helpers.js";
import { Parser } from "json2csv";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendWhatsAppOtp } from "../utils/whatsapp.js";

/**
 * Get all registrations with filtering, searching, and pagination
 */
export const getAllRegistrations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      registrationType,
      registrationStatus,
      isAttending,
      paymentStatus,
      search,
      sortBy = "registrationDate",
      sortOrder = "desc",
      fromDate,
      toDate,
    } = req.query;

    // Build query filters
    const query = {};

    // Add filters
    if (registrationType) query.registrationType = registrationType;
    if (registrationStatus) query.registrationStatus = registrationStatus;
    if (isAttending !== undefined) query.isAttending = isAttending === "true";
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // Add date range filter
    if (fromDate || toDate) {
      query.registrationDate = {};
      if (fromDate) query.registrationDate.$gte = new Date(fromDate);
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.registrationDate.$lte = endDate;
      }
    }

    // Add search filter (search by name, email, or contact number)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { contactNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const registrations = await Registration.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalRegistrations = await Registration.countDocuments(query);
    const totalPages = Math.ceil(totalRegistrations / limit);

    const response = {
      status: "success",
      results: registrations.length,
      totalRegistrations,
      totalPages,
      currentPage: parseInt(page),
      data: registrations,
    };

    // Return results
    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error getting registrations: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get registrations by type
 */
export const getRegistrationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "registrationDate",
      sortOrder = "desc",
    } = req.query;

    // Validate registration type
    if (!["Alumni", "Staff", "Other"].includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration type",
      });
    }

    // Build query for specific type
    const query = { registrationType: type };

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const registrations = await Registration.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalRegistrations = await Registration.countDocuments(query);
    const totalPages = Math.ceil(totalRegistrations / limit);

    // Return results
    res.status(200).json({
      status: "success",
      results: registrations.length,
      totalRegistrations,
      totalPages,
      currentPage: parseInt(page),
      data: registrations,
    });
  } catch (error) {
    logger.error(
      `Error getting ${req.params.type} registrations: ${error.message}`
    );
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get registration by ID
 */
export const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration ID",
      });
    }

    // Find registration
    const registration = await Registration.findById(id);

    // Check if registration exists
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Get related transactions if any
    const transactions = await Transaction.find({ registrationId: id });

    // Return registration with transactions
    res.status(200).json({
      status: "success",
      data: {
        registration,
        transactions,
      },
    });
  } catch (error) {
    logger.error(`Error getting registration: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Create new registration
 */
export const createRegistration = async (req, res) => {
  try {
    // Extract registration data from request body
    const registrationData = req.body;

    // Add metadata
    registrationData.registrationDate = new Date();
    registrationData.userAgent = req.headers["user-agent"];

    // Create registration
    const registration = await Registration.create(registrationData);

    // Return created registration
    res.status(201).json({
      status: "success",
      message: "Registration created successfully",
      data: registration,
    });
  } catch (error) {
    logger.error(`Error creating registration: ${error.message}`);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message:
          "A registration with this email or contact number already exists",
        error: error.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Update registration
 */
export const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration ID",
      });
    }

    // Update registration
    const updateData = req.body;

    // Add metadata
    updateData.lastUpdated = new Date();
    updateData.lastUpdatedBy = req.user ? req.user.email : "system";

    // Update registration
    const registration = await Registration.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    // Check if registration exists
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Return updated registration
    res.status(200).json({
      status: "success",
      message: "Registration updated successfully",
      data: registration,
    });
  } catch (error) {
    logger.error(`Error updating registration: ${error.message}`);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Delete registration
 */
export const deleteRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration ID",
      });
    }

    // Find and delete registration
    const registration = await Registration.findByIdAndDelete(id);

    // Check if registration exists
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Delete related transactions
    await Transaction.deleteMany({ registrationId: id });

    // Return success message
    res.status(200).json({
      status: "success",
      message: "Registration and related transactions deleted successfully",
    });
  } catch (error) {
    logger.error(`Error deleting registration: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Send OTP for verification
 */
export const sendOtp = async (req, res) => {
  try {
    const { email, contactNumber } = req.body;

    // Validate required fields
    if (!email || !contactNumber) {
      return res.status(400).json({
        status: "error",
        message: "Email and contact number are required",
      });
    }

    //check if email or contact number is already registered
    // const existingRegistration = await Registration.findOne({
    //   $or: [{ email }, { contactNumber }],
    // });

    // if (
    //   existingRegistration &&
    //   existingRegistration.paymentStatus === "Completed"
    // ) {
    //   return res.status(400).json({
    //     status: "error",
    //     message:
    //       "Your registration was successful, should you need to modify your registration data, kindly wait for the release for update form.",
    //   });
    // }

    // Generate OTP
    const otp = generateOTP();

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Check if an OTP verification exists for this email/phone
    let otpVerification = await OtpVerification.findOne({
      $or: [{ email }, { contactNumber }],
    });

    if (otpVerification) {
      // Update existing OTP verification
      otpVerification.otp = otp;
      otpVerification.createdAt = new Date();
      otpVerification.verified = false;
      otpVerification.attempts = 0;
      otpVerification.ipAddress = ipAddress;
      otpVerification.userAgent = userAgent;
      await otpVerification.save();
    } else {
      // Create new OTP verification entry
      otpVerification = await OtpVerification.create({
        email,
        contactNumber,
        otp,
        ipAddress,
        userAgent,
      });
    }

    await Promise.all([
      console.log("sending email", email, contactNumber),
      console.log("sending whatsapp", contactNumber, otp),
      sendEmail(
        email,
        "OTP Verification for UNMA 2025 Registration",
        `Your OTP for UNMA 2025 registration is ${otp}. It will expire in 5 minutes.f`
      ),
      sendWhatsAppOtp(contactNumber, otp),
    ]);

    logger.info(`OTP sent to ${email} and ${contactNumber}`);

    // Return success message (include OTP in non-production environments)
    res.status(200).json({
      status: "success",
      message: "OTP sent successfully",
      otpId: otpVerification._id,
      ...(process.env.NODE_ENV !== "production" && { otp }),
    });
  } catch (error) {
    logger.error(`Error sending OTP: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, contactNumber, otp } = req.body;
    // Validate required fields
    if (!email || !contactNumber || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Email, contact number and OTP are required",
      });
    }

    // Find OTP verification by email or phone
    const otpVerification = await OtpVerification.findOne({
      $or: [{ email }, { contactNumber }],
    });

    // Check if OTP verification exists
    if (!otpVerification) {
      return res.status(404).json({
        status: "error",
        message: "No OTP verification found with this email or contact number",
      });
    }

    // Check if OTP is expired
    const now = new Date();
    if (otpVerification.createdAt.getTime() + 60 * 60 * 1000 < now.getTime()) {
      return res.status(400).json({
        status: "error",
        message: "OTP has expired",
      });
    }

    // Increment attempt counter
    otpVerification.attempts += 1;

    // Check if max attempts reached
    if (otpVerification.attempts > 5) {
      await otpVerification.deleteOne(); // Remove the OTP entry
      return res.status(400).json({
        status: "error",
        message: "Maximum attempts exceeded. Please request a new OTP.",
      });
    }

    // Check if OTP matches
    if (otpVerification.otp !== otp) {
      await otpVerification.save(); // Save the updated attempts
      return res.status(401).json({
        status: "error",
        message: `Invalid OTP. ${
          5 - otpVerification.attempts
        } attempts remaining.`,
      });
    }

    // Mark as verified
    otpVerification.verified = true;
    otpVerification.verifiedAt = now;
    await otpVerification.save();

    logger.info(`OTP verified successfully for ${email}`);

    // Check if a registration already exists for this user
    let registration = await Registration.findOne({
      $or: [{ email }, { contactNumber }],
    });

    // Generate a verification token for the frontend
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Return success message with appropriate data
    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      verified: true,
      verificationToken,
      existingRegistration: registration ? true : false,
      registrationId: registration ? registration._id : null,
    });
  } catch (error) {
    logger.error(`Error verifying OTP: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Process payment for registration
 */
export const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      paymentMethod,
      paymentGatewayResponse,
      isAnonymous = false,
      purpose = "registration",
      notes,
    } = req.body;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration ID",
      });
    }

    // Find registration
    const registration = await Registration.findById(id);

    // Check if registration exists
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;

    // Create transaction record
    const transaction = await Transaction.create({
      transactionId,
      registrationId: id,
      name: registration.name,
      email: registration.email,
      contactNumber: registration.contactNumber,
      amount,
      paymentMethod,
      paymentGatewayResponse,
      status: "completed",
      purpose,
      isAnonymous,
      notes,
      completedAt: new Date(),
    });

    // Update registration payment status
    registration.paymentStatus = "Completed";
    registration.paymentId = transactionId;
    registration.paymentDetails = JSON.stringify(paymentGatewayResponse);
    registration.willContribute = true;
    registration.contributionAmount = amount;
    registration.lastUpdated = new Date();

    await registration.save();

    logger.info(
      `Payment processed successfully: ${transactionId} for registration ${id}`
    );

    // Send payment confirmation email (not registration confirmation)
    if (registration && !isAnonymous) {
      try {
        await sendPaymentConfirmationEmail(registration, transactionId, amount);
        logger.info(
          `Payment confirmation email sent to ${registration.email} after transaction registration`
        );
      } catch (emailError) {
        logger.error(
          `Failed to send payment confirmation email: ${emailError.message}`
        );
        // Don't fail the transaction registration if email fails
      }
    }

    // Return success response
    res.status(200).json({
      status: "success",
      message: "Payment processed successfully",
      data: {
        transactionId,
        registrationId: id,
        amount,
        status: "completed",
        completedAt: transaction.completedAt,
        paymentEmailSent: !isAnonymous && !!registration,
      },
    });
  } catch (error) {
    logger.error(`Error processing payment: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get registration statistics
 */
export const getRegistrationStats = async (req, res) => {
  try {
    // Get counts by registration type
    const [totalRegistrations, typeStats, attendanceStats, paymentStats] =
      await Promise.all([
        // Total count
        Registration.countDocuments(),

        // Count by type
        Registration.aggregate([
          { $group: { _id: "$registrationType", count: { $sum: 1 } } },
        ]),

        // Count by attendance
        Registration.aggregate([
          { $group: { _id: "$isAttending", count: { $sum: 1 } } },
        ]),

        // Payment statistics
        Registration.aggregate([
          {
            $group: {
              _id: "$paymentStatus",
              count: { $sum: 1 },
              totalAmount: {
                $sum: {
                  $cond: [
                    { $eq: ["$paymentStatus", "Completed"] },
                    "$contributionAmount",
                    0,
                  ],
                },
              },
            },
          },
        ]),
      ]);

    // Transform stats for easier consumption
    const formattedTypeStats = typeStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const formattedAttendanceStats = attendanceStats.reduce(
      (acc, curr) => {
        acc[curr._id ? "attending" : "notAttending"] = curr.count;
        return acc;
      },
      { attending: 0, notAttending: 0 }
    );

    const formattedPaymentStats = paymentStats.reduce(
      (acc, curr) => {
        acc.counts[curr._id || "Pending"] = curr.count;
        if (curr._id === "Completed") {
          acc.totalAmountCollected = curr.totalAmount;
        }
        return acc;
      },
      { counts: {}, totalAmountCollected: 0 }
    );

    // Return statistics
    res.status(200).json({
      status: "success",
      data: {
        totalRegistrations,
        byType: formattedTypeStats,
        byAttendance: formattedAttendanceStats,
        payments: formattedPaymentStats,
      },
    });
  } catch (error) {
    logger.error(`Error getting registration statistics: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Export registrations to CSV
 */
export const exportRegistrations = async (req, res) => {
  try {
    const { registrationType } = req.query;

    // Build query
    const query = {};
    if (registrationType) query.registrationType = registrationType;

    // Get registrations
    const registrations = await Registration.find(query);

    // Transform data for CSV export
    const transformedData = registrations.map((reg) => ({
      ID: reg._id,
      Type: reg.registrationType,
      Name: reg.name,
      Email: reg.email,
      ContactNumber: reg.contactNumber,
      WhatsApp: reg.whatsappNumber || "Not provided",
      Country: reg.country,
      State: reg.stateUT || "Not provided",
      IsAttending: reg.isAttending ? "Yes" : "No",
      PaymentStatus: reg.paymentStatus || "Pending",
      ContributionAmount: reg.contributionAmount || 0,
      RegisteredOn: formatDate(reg.registrationDate),
      LastUpdated: formatDate(reg.lastUpdated),
    }));

    // Generate CSV
    const parser = new Parser();
    const csv = parser.parse(transformedData);

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=registrations-${Date.now()}.csv`
    );

    // Send CSV
    res.status(200).send(csv);
  } catch (error) {
    logger.error(`Error exporting registrations: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Import registrations from CSV/JSON
 */
export const importRegistrations = async (req, res) => {
  try {
    const { registrations } = req.body;

    // Validate input
    if (
      !registrations ||
      !Array.isArray(registrations) ||
      registrations.length === 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or empty registrations data",
      });
    }

    // Process registrations in batches
    const results = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    // Use insertMany with ordered: false to continue on error
    try {
      await Registration.insertMany(registrations, { ordered: false });
      results.successful = registrations.length;
    } catch (err) {
      if (err.writeErrors) {
        results.failed = err.writeErrors.length;
        results.successful = registrations.length - results.failed;
        results.errors = err.writeErrors.map((e) => ({
          index: e.index,
          error: e.err.message,
        }));
      } else {
        throw err;
      }
    }

    // Return results
    res.status(200).json({
      status: "success",
      message: `Imported ${results.successful} registrations with ${results.failed} failures`,
      data: results,
    });
  } catch (error) {
    logger.error(`Error importing registrations: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Bulk update registrations
 */
export const bulkUpdateRegistrations = async (req, res) => {
  try {
    const { ids, updates } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !updates) {
      return res.status(400).json({
        status: "error",
        message: "Invalid input: ids array and updates object are required",
      });
    }

    // Add metadata to updates
    updates.lastUpdated = new Date();
    updates.lastUpdatedBy = req.user ? req.user.email : "system";

    // Update registrations
    const result = await Registration.updateMany(
      { _id: { $in: ids } },
      { $set: updates }
    );

    // Return results
    res.status(200).json({
      status: "success",
      message: `Updated ${result.modifiedCount} out of ${result.matchedCount} registrations`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    logger.error(`Error bulk updating registrations: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Save registration steps
 * Handle multi-step form saving with partial validation
 */
export const saveRegistrationStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { step, stepData, verificationToken } = req.body;

    if (step === 1) {
      if (stepData.formDataStructured.personalInfo.country !== "IN") {
        stepData.formDataStructured.personalInfo.stateUT = "";
        stepData.formDataStructured.personalInfo.district = "";
      }
      if (stepData.formDataStructured.personalInfo.stateUT !== "Kerala") {
        stepData.formDataStructured.personalInfo.district = "";
      }
    }
    // Validate step number
    if (!step || isNaN(step) || step < 1 || step > 8) {
      return res.status(400).json({
        status: "error",
        message: "Invalid step number",
      });
    }

    // Validate step data
    if (!stepData) {
      return res.status(400).json({
        status: "error",
        message: "No data provided for this step",
      });
    }

    // Extract structured data
    const { formDataStructured, ...rootLevelData } = stepData;

    // Create a cleaned data object with only necessary root fields
    const cleanedData = {
      lastUpdated: new Date(),
      [`step${step}Complete`]: true,
    };

    const emailExists = await Registration.findOne({
      email: formDataStructured.personalInfo.email,
    });

    // Add metadata and essential fields that need to be at root level for queries and indexing
    if (step === 1 && !emailExists) {
      if (formDataStructured?.personalInfo) {
        cleanedData.name = formDataStructured.personalInfo.name;
        cleanedData.email = formDataStructured.personalInfo.email;
        cleanedData.contactNumber =
          formDataStructured.personalInfo.contactNumber;
        cleanedData.country = formDataStructured.personalInfo.country;

        cleanedData.school = formDataStructured.personalInfo.school;
        cleanedData.yearOfPassing =
          formDataStructured.personalInfo.yearOfPassing;
      }

      if (formDataStructured?.verification) {
        cleanedData.emailVerified =
          formDataStructured.verification.emailVerified;
        cleanedData.captchaVerified =
          formDataStructured.verification.captchaVerified;
        cleanedData.verificationQuizPassed =
          formDataStructured.verification.quizPassed;
      }
    } else if (step === 3 && formDataStructured?.eventAttendance) {
      cleanedData.isAttending = formDataStructured.eventAttendance.isAttending;
      cleanedData.attendees = formDataStructured.eventAttendance.attendees;
    } else if (step === 8 && formDataStructured?.financial) {
      cleanedData.willContribute = formDataStructured.financial.willContribute;
      cleanedData.contributionAmount =
        formDataStructured.financial.contributionAmount;
      cleanedData.formSubmissionComplete = true;
    }

    // If ID is provided, update existing registration
    if (emailExists) {
      // Validate object ID
      // if (!mongoose.Types.ObjectId.isValid(id)) {
      //     return res.status(400).json({
      //         status: 'error',
      //         message: 'Invalid registration ID'
      //     });
      // }

      // Get existing registration
      const existingRegistration = await Registration.findOne({
        email: formDataStructured.personalInfo.email,
      });

      // Check if registration exists
      if (!existingRegistration) {
        return res.status(404).json({
          status: "error",
          message: "Registration not found",
        });
      }

      // Handle formDataStructured merge correctly
      if (formDataStructured) {
        if (!existingRegistration.formDataStructured) {
          cleanedData.formDataStructured = formDataStructured;
        } else {
          const existingStructured =
            existingRegistration.formDataStructured.toObject();

          // Deep merge the formDataStructured objects by section
          cleanedData.formDataStructured = {
            verification: {
              ...existingStructured.verification,
              ...formDataStructured.verification,
            },
            personalInfo: {
              ...existingStructured.personalInfo,
              ...formDataStructured.personalInfo,
            },
            professional: {
              ...existingStructured.professional,
              ...formDataStructured.professional,
            },
            eventAttendance: {
              ...existingStructured.eventAttendance,
              ...formDataStructured.eventAttendance,
            },
            sponsorship: {
              ...existingStructured.sponsorship,
              ...formDataStructured.sponsorship,
            },
            transportation: {
              ...existingStructured.transportation,
              ...formDataStructured.transportation,
            },
            accommodation: {
              ...existingStructured.accommodation,
              ...formDataStructured.accommodation,
            },
            optional: {
              ...existingStructured.optional,
              ...formDataStructured.optional,
            },
            financial: {
              ...existingStructured.financial,
              ...formDataStructured.financial,
            },
          };
        }
      }

      // Set current step
      cleanedData.currentStep = step;

      // Update registration with cleaned data
      const updatedRegistration = await Registration.findByIdAndUpdate(
        existingRegistration._id,
        { $set: cleanedData },
        { new: true, runValidators: true }
      );

      // Send registration confirmation email when registration is completed (step 8)
      if (step === 8 && updatedRegistration.formSubmissionComplete) {
        try {
          await sendConfirmationEmailHelper(updatedRegistration);
          logger.info(
            `Registration confirmation email sent to ${updatedRegistration.email} for completed registration ${updatedRegistration._id}`
          );
        } catch (emailError) {
          logger.error(
            `Failed to send registration confirmation email: ${emailError.message}`
          );
          // Don't fail the registration completion if email fails
        }
      }

      // Return updated registration
      return res.status(200).json({
        status: "success",
        message: `Step ${step} saved successfully`,
        data: {
          registrationId: updatedRegistration._id,
          currentStep: step,
          isComplete: updatedRegistration.formSubmissionComplete || false,
          confirmationEmailSent:
            step === 8 && updatedRegistration.formSubmissionComplete,
        },
      });
    }
    // Create new registration (first step)
    else {
      // Verify that the first step has required fields
      if (step === 1) {
        if (
          !formDataStructured?.personalInfo?.email ||
          !formDataStructured?.personalInfo?.contactNumber
        ) {
          return res.status(400).json({
            status: "error",
            message: "Email and contact number are required for the first step",
          });
        }

        // Verify OTP verification exists
        const otpVerification = await OtpVerification.findOne({
          email: formDataStructured.personalInfo.email,
          contactNumber: formDataStructured.personalInfo.contactNumber,
          verified: true,
        });

        if (!otpVerification) {
          return res.status(401).json({
            status: "error",
            message: "OTP verification required before creating registration",
          });
        }

        // Add required fields with default values to satisfy schema requirements
        const registrationData = {
          ...cleanedData,
          registrationType:
            formDataStructured.personalInfo.registrationType || "Alumni",
          name: formDataStructured.personalInfo.name,
          email: formDataStructured.personalInfo.email,
          contactNumber: formDataStructured.personalInfo.contactNumber,
          country: formDataStructured.personalInfo.country,
          school: formDataStructured.personalInfo.school,
          yearOfPassing: formDataStructured.personalInfo.yearOfPassing,
          emailVerified: true, // Already verified through OTP
          isAttending: false, // Default
          willContribute: false, // Default
          registrationDate: new Date(),
          currentStep: 1,
          formDataStructured,
        };

        // Create new registration
        const newRegistration = await Registration.create(registrationData);

        // Return new registration
        return res.status(201).json({
          status: "success",
          message: "Registration created and first step saved successfully",
          data: {
            registrationId: newRegistration._id,
            currentStep: step,
            isComplete: false,
          },
        });
      } else {
        return res.status(400).json({
          status: "error",
          message: "Cannot create registration starting from step other than 1",
        });
      }
    }
  } catch (error) {
    logger.error(`Error saving registration step: ${error.message}`);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message:
          "A registration with this email or contact number already exists",
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    const response = await sendEmail(email, subject, message);
    res.status(200).json({
      status: "success",
      message: "Message sent successfully",
    });
  } catch (error) {
    logger.error(`Error sending message: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const transactionRegister = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      name,
      email,
      contact,
      paymentMethod,
      paymentGatewayResponse,
      isAnonymous = false,
      purpose = "registration",
      notes,
    } = req.body;

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;
    const transaction = await Transaction.create({
      amount,
      transactionId: transactionId,
      registrationId: id,
      name,
      email,
      contact,
      paymentMethod,
      paymentGatewayResponse,
      isAnonymous,
      status: "completed",
      purpose,
      notes,
    });

    if (purpose === "registration") {
      const registration = await Registration.findByIdAndUpdate(
        id,
        {
          $set: {
            paymentStatus: "Completed",
            paymentId: transactionId,
            contributionAmount: amount,
            willContribute: true,
            lastUpdated: new Date(),
          },
        },
        { new: true }
      );

      // Send payment confirmation email (not registration confirmation)
      if (registration && !isAnonymous) {
        try {
          await sendPaymentConfirmationEmail(
            registration,
            transactionId,
            amount
          );
          logger.info(
            `Payment confirmation email sent to ${registration.email} after transaction registration`
          );
        } catch (emailError) {
          logger.error(
            `Failed to send payment confirmation email: ${emailError.message}`
          );
          // Don't fail the transaction registration if email fails
        }
      }
    }
    res.status(200).json({
      status: "success",
      message: "Transaction registered successfully",
      data: {
        transactionId,
        registrationId: id,
        amount,
        status: "completed",
      },
    });
  } catch (error) {
    logger.error(`Error registering transaction: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Helper function to send payment confirmation email
 */
const sendPaymentConfirmationEmail = async (
  registration,
  transactionId,
  amount
) => {
  const emailTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UNMA Summit 2025 - Payment Confirmation</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
          }
          .container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
              text-align: center;
              border-bottom: 3px solid #28a745;
              padding-bottom: 20px;
              margin-bottom: 30px;
          }
          .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2c5aa0;
              margin-bottom: 10px;
          }
          .title {
              font-size: 24px;
              color: #28a745;
              margin-bottom: 10px;
          }
          .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
          }
          .success-box {
              background-color: #d4edda;
              border: 1px solid #c3e6cb;
              color: #155724;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin: 20px 0;
          }
          .section {
              margin-bottom: 25px;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #28a745;
          }
          .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #28a745;
              margin-bottom: 15px;
              text-transform: uppercase;
          }
          .info-grid {
              display: grid;
              grid-template-columns: 1fr 2fr;
              gap: 10px;
              margin-bottom: 10px;
          }
          .info-label {
              font-weight: bold;
              color: #555;
          }
          .info-value {
              color: #333;
          }
          .amount {
              font-size: 24px;
              font-weight: bold;
              color: #28a745;
              text-align: center;
              margin: 20px 0;
          }
          .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e9ecef;
              color: #666;
          }
          .note {
              background-color: #e7f3ff;
              border: 1px solid #bee5eb;
              color: #0c5460;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
          }
          @media (max-width: 600px) {
              .info-grid {
                  grid-template-columns: 1fr;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div class="logo">UNMA</div>
              <div class="title">Payment Confirmation</div>
          </div>
          
          <div class="greeting">
              Dear ${registration.name},
          </div>
          
          <div class="success-box">
              ✅ Payment Successful!
          </div>
          
          <p>Thank you for your contribution to UNMA Summit 2025. Your payment has been processed successfully.</p>
          
          <div class="amount">
              Amount Paid: ₹${amount}
          </div>
          
          <div class="section">
              <div class="section-title">Payment Details</div>
              <div class="info-grid">
                  <div class="info-label">Transaction ID:</div>
                  <div class="info-value">${transactionId}</div>
                  <div class="info-label">Payment Date:</div>
                  <div class="info-value">${new Date().toLocaleDateString(
                    "en-IN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}</div>
                  <div class="info-label">Amount:</div>
                  <div class="info-value">₹${amount}</div>
                  <div class="info-label">Status:</div>
                  <div class="info-value" style="color: #28a745; font-weight: bold;">Completed</div>
              </div>
          </div>
          
          <div class="section">
              <div class="section-title">Your Information</div>
              <div class="info-grid">
                  <div class="info-label">Name:</div>
                  <div class="info-value">${registration.name}</div>
                  <div class="info-label">Email:</div>
                  <div class="info-value">${registration.email}</div>
                  <div class="info-label">Contact:</div>
                  <div class="info-value">${registration.contactNumber}</div>
              </div>
          </div>
          
          <div class="note">
              <strong>Note:</strong> Please keep this email for your records. This serves as your payment receipt for UNMA Summit 2025.
          </div>
          
          <p>If you have any questions regarding your payment, please contact us at Summit2025@unma.in</p>
          
          <div class="footer">
              <p><strong>TEAM UNMA</strong></p>
              <p>Summit2025@unma.in</p>
              <p style="font-size: 12px; color: #999;">This is an automated payment confirmation email.</p>
          </div>
      </div>
  </body>
  </html>
  `;

  await sendEmail(
    registration.email,
    "UNMA Summit 2025 - Payment Confirmation",
    emailTemplate
  );
};

/**
 * Helper function to send registration confirmation email
 */
const sendConfirmationEmailHelper = async (registration) => {
  // Get attendee counts from formDataStructured
  const attendanceData = registration.formDataStructured?.eventAttendance || {};
  const attendees = attendanceData.attendees || {};

  console.log(attendees);

  // Handle both array format (legacy) and object format (current)
  let counts = {
    adults: { veg: 0, nonVeg: 0 },
    teen: { veg: 0, nonVeg: 0 },
    child: { veg: 0, nonVeg: 0 },
    toddler: { veg: 0, nonVeg: 0 },
  };

  // Check if attendees is already in counts format (object with veg/nonVeg counts)
  if (attendees && typeof attendees === "object" && !Array.isArray(attendees)) {
    // Map the frontend format to our email template format
    counts = {
      adults: attendees.adults || { veg: 0, nonVeg: 0 },
      teen: attendees.teens || { veg: 0, nonVeg: 0 },
      child: attendees.children || { veg: 0, nonVeg: 0 },
      toddler: attendees.toddlers || { veg: 0, nonVeg: 0 },
    };
  } else if (Array.isArray(attendees)) {
    // Legacy format - calculate counts from array
    attendees.forEach((attendee) => {
      const ageGroup = attendee.ageGroup || "adults";
      const foodPreference = attendee.foodPreference || "veg";

      if (counts[ageGroup] && counts[ageGroup][foodPreference] !== undefined) {
        counts[ageGroup][foodPreference]++;
      }
    });
  }

  // Get sponsorship details
  const sponsorshipData = registration.formDataStructured?.sponsorship || {};

  // Create email template
  const emailTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UNMA Summit 2025 - Registration Confirmation</title>
      <style>
          body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
          }
          .container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
              text-align: center;
              border-bottom: 3px solid #2c5aa0;
              padding-bottom: 20px;
              margin-bottom: 30px;
          }
          .logo {
              font-size: 28px;
              font-weight: bold;
              color: #2c5aa0;
              margin-bottom: 10px;
          }
          .title {
              font-size: 24px;
              color: #2c5aa0;
              margin-bottom: 10px;
          }
          .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
          }
          .section {
              margin-bottom: 25px;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #2c5aa0;
          }
          .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c5aa0;
              margin-bottom: 15px;
              text-transform: uppercase;
          }
          .info-grid {
              display: grid;
              grid-template-columns: 1fr 2fr;
              gap: 10px;
              margin-bottom: 10px;
          }
          .info-label {
              font-weight: bold;
              color: #555;
          }
          .info-value {
              color: #333;
          }
          .schedule-item {
              margin-bottom: 8px;
              padding: 8px;
              background: white;
              border-radius: 4px;
              border-left: 3px solid #28a745;
          }
          .highlight {
              background-color: #e7f3ff;
              padding: 15px;
              border-radius: 5px;
              text-align: center;
              font-weight: bold;
              color: #2c5aa0;
              margin: 20px 0;
          }
          .attendee-counts {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
          }
          .count-card {
              background: white;
              padding: 15px;
              border-radius: 5px;
              text-align: center;
              border: 2px solid #e9ecef;
          }
          .count-title {
              font-weight: bold;
              color: #2c5aa0;
              margin-bottom: 10px;
          }
          .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #e9ecef;
              color: #666;
          }
          .note {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
          }
          @media (max-width: 600px) {
              .info-grid {
                  grid-template-columns: 1fr;
              }
              .attendee-counts {
                  grid-template-columns: 1fr;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div class="logo">UNMA</div>
              <div class="title">Summit 2025 Registration Confirmation</div>
          </div>
          
          <div class="greeting">
              Dear ${registration.name},
          </div>
          
          <p><strong>Congratulations!</strong> You have successfully registered for UNMA Summit 2025. Kindly find below the registration and event details.</p>
          
          <div class="section">
              <div class="section-title">Event Details</div>
              <div class="info-grid">
                  <div class="info-label">Venue:</div>
                  <div class="info-value">CIAL Trade Fair and Exhibition Center, Nedumbassery, Kochi, Kerala</div>  
                  <div class="info-label">Date & Time:</div>
                  <div class="info-value">30 Aug 2025, 09:00 AM to 8:00 PM</div>
              </div>
          </div>
          
          <div class="section">
              <div class="section-title">Program Schedule</div>
              <p style="font-style: italic; color: #666; margin-bottom: 15px;">*Tentative Schedule (Based on BOT Meeting)</p>
              <div class="schedule-item"><strong>9:00 AM - 10:00 AM:</strong> Registration & Networking</div>
              <div class="schedule-item"><strong>10:00 AM - 12:00 PM:</strong> Public Function</div>
              <div class="schedule-item"><strong>12:00 PM - 12:30 PM:</strong> Group Photo</div>
              <div class="schedule-item"><strong>12:30 PM - 1:00 PM:</strong> Networking, Visit Stalls</div>
              <div class="schedule-item"><strong>1:00 PM - 2:00 PM:</strong> Lunch Break</div>
              <div class="schedule-item"><strong>2:00 PM - 5:30 PM:</strong> Cultural Programs</div>
              <div class="schedule-item"><strong>5:30 PM - 6:00 PM:</strong> Tea & Networking</div>
              <div class="schedule-item"><strong>6:00 PM - 8:00 PM:</strong> Live Entertainment</div>
              <div class="schedule-item"><strong>8:00 PM:</strong> Closing</div>
          </div>
          
          <div class="section">
              <div class="section-title">Your Personal Information</div>
              <div class="info-grid">
                  <div class="info-label">Full Name:</div>
                  <div class="info-value">${registration.name}</div>
                  <div class="info-label">Email:</div>
                  <div class="info-value">${registration.email}</div>
                  <div class="info-label">Contact Number:</div>
                  <div class="info-value">${registration.contactNumber}</div>
                  <div class="info-label">WhatsApp:</div>
                  <div class="info-value">${
                    registration.formDataStructured?.personalInfo
                      ?.whatsappNumber || registration.contactNumber
                  }</div>
                  <div class="info-label">School:</div>
                  <div class="info-value">${registration.formDataStructured?.personalInfo?.school}</div>
                  <div class="info-label">Year of Passing:</div>
                  <div class="info-value">${registration.formDataStructured?.personalInfo?.yearOfPassing}</div>
              </div>
          </div>
          
          ${
            registration.formDataStructured?.eventAttendance?.isAttending
              ? `
          <div class="section">
              <div class="section-title">Event Attendance Details</div>
              <div class="attendee-counts">
                  <div class="count-card">
                      <div class="count-title">Adults</div>
                      <div>Veg: ${counts.adults.veg} | Non-Veg: ${counts.adults.nonVeg}</div>
                  </div>
                  <div class="count-card">
                      <div class="count-title">12-18 Years</div>
                      <div>Veg: ${counts.teen.veg} | Non-Veg: ${counts.teen.nonVeg}</div>
                  </div>
                  <div class="count-card">
                      <div class="count-title">6-12 Years</div>
                      <div>Veg: ${counts.child.veg} | Non-Veg: ${counts.child.nonVeg}</div>
                  </div>
                  <div class="count-card">
                      <div class="count-title">2-5 Years</div>
                      <div>Veg: ${counts.toddler.veg} | Non-Veg: ${counts.toddler.nonVeg}</div>
                  </div>
              </div>
          </div>
          `
              : '<div class="highlight">You have indicated that you will not be attending the event.</div>'
          }
          
          ${
            sponsorshipData.isInterested
              ? `
          <div class="section">
              <div class="section-title">Sponsorship Details</div>
              <div class="info-grid">
                  <div class="info-label">Sponsorship Interest:</div>
                  <div class="info-value">Yes</div>
                  <div class="info-label">Sponsorship Type:</div>
                  <div class="info-value">${
                    sponsorshipData.sponsorshipType || "Not specified"
                  }</div>
                  <div class="info-label">Company/Organization:</div>
                  <div class="info-value">${
                    sponsorshipData.companyName || "Not specified"
                  }</div>
                  ${
                    sponsorshipData.contactPerson
                      ? `
                  <div class="info-label">Contact Person:</div>
                  <div class="info-value">${sponsorshipData.contactPerson}</div>
                  `
                      : ""
                  }
              </div>
          </div>
          `
              : ""
          }
          
          <div class="section">
              <div class="section-title">Payment Details</div>
              <div class="info-grid">
                  <div class="info-label">Payment Status:</div>
                  <div class="info-value" style="color: #28a745; font-weight: bold;">${
                    registration.formDataStructured?.payment?.paymentStatus
                  }</div>
                  <div class="info-label">Transaction ID:</div>
                  <div class="info-value">${
                    registration.formDataStructured?.payment?.paymentId || "N/A"
                  }</div>
                  <div class="info-label">Contribution Amount:</div>
                  <div class="info-value">₹${
                    registration.formDataStructured?.payment?.contributionAmount || 0
                  }</div>
              </div>
          </div>
          
          <div class="note">
              <strong>Note:</strong> Should you need to update your data, please wait for the announcement of the update page that will be released soon.
          </div>
          
          <div class="highlight">
              Thank you for your registration! We look forward to seeing you at UNMA Summit 2025.
          </div>
          
          <div class="footer">
              <p><strong>TEAM UNMA</strong></p>
              <p>Summit2025@unma.in</p>
              <p style="font-size: 12px; color: #999;">This is an automated confirmation email. Please do not reply to this email.</p>
          </div>
      </div>
  </body>
  </html>
  `;

  // Send confirmation email
  await sendEmail(
    registration.email,
    "UNMA Summit 2025 - Registration Confirmation",
    emailTemplate
  );
};

/**
 * Send registration confirmation email
 */
export const sendRegistrationConfirmationEmail = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid registration ID",
      });
    }

    // Find registration
    const registration = await Registration.findById(id);

    // Check if registration exists
    if (!registration) {
      return res.status(404).json({
        status: "error",
        message: "Registration not found",
      });
    }

    // Check if registration is completed and payment is done
    if (registration.paymentStatus !== "Completed") {
      return res.status(400).json({
        status: "error",
        message: "Cannot send confirmation email for incomplete registration",
      });
    }

    // Use the helper function to send email
    await sendConfirmationEmailHelper(registration);

    logger.info(
      `Confirmation email sent to ${registration.email} for registration ${id}`
    );

    // Return success response
    res.status(200).json({
      status: "success",
      message: "Confirmation email sent successfully",
      data: {
        registrationId: id,
        email: registration.email,
        sentAt: new Date(),
      },
    });
  } catch (error) {
    logger.error(`Error sending confirmation email: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
