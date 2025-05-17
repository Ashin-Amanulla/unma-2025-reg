import { logger } from '../utils/logger.js';
import Registration from '../models/Registration.js';
import Transaction from '../models/Transaction.js';
import OtpVerification from '../models/OtpVerification.js';
import { generateOTP, sendSMS, sendEmail } from '../utils/communication.js';
import { formatDate } from '../utils/helpers.js';
import { Parser } from 'json2csv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendWhatsAppOtp } from '../utils/whatsapp.js';


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
            sortBy = 'registrationDate',
            sortOrder = 'desc',
            fromDate,
            toDate
        } = req.query;

        // Build query filters
        const query = {};

        // Add filters
        if (registrationType) query.registrationType = registrationType;
        if (registrationStatus) query.registrationStatus = registrationStatus;
        if (isAttending !== undefined) query.isAttending = isAttending === 'true';
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
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { contactNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const registrations = await Registration.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalRegistrations = await Registration.countDocuments(query);
        const totalPages = Math.ceil(totalRegistrations / limit);

        const response = {
            status: 'success',
            results: registrations.length,
            totalRegistrations,
            totalPages,
            currentPage: parseInt(page),
            data: registrations
        }

        console.log("response", response);
        // Return results
        res.status(200).json(response);
    } catch (error) {
        logger.error(`Error getting registrations: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
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
            sortBy = 'registrationDate',
            sortOrder = 'desc'
        } = req.query;

        // Validate registration type
        if (!['Alumni', 'Staff', 'Other'].includes(type)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid registration type'
            });
        }

        // Build query for specific type
        const query = { registrationType: type };

        // Build sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

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
            status: 'success',
            results: registrations.length,
            totalRegistrations,
            totalPages,
            currentPage: parseInt(page),
            data: registrations
        });
    } catch (error) {
        logger.error(`Error getting ${req.params.type} registrations: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
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
                status: 'error',
                message: 'Invalid registration ID'
            });
        }

        // Find registration
        const registration = await Registration.findById(id);

        // Check if registration exists
        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Get related transactions if any
        const transactions = await Transaction.find({ registrationId: id });

        // Return registration with transactions
        res.status(200).json({
            status: 'success',
            data: {
                registration,
                transactions
            }
        });
    } catch (error) {
        logger.error(`Error getting registration: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
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
        registrationData.userAgent = req.headers['user-agent'];

        // Create registration
        const registration = await Registration.create(registrationData);

        // Return created registration
        res.status(201).json({
            status: 'success',
            message: 'Registration created successfully',
            data: registration
        });
    } catch (error) {
        logger.error(`Error creating registration: ${error.message}`);

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'A registration with this email or contact number already exists',
                error: error.message
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
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
                status: 'error',
                message: 'Invalid registration ID'
            });
        }

        // Update registration
        const updateData = req.body;

        // Add metadata
        updateData.lastUpdated = new Date();
        updateData.lastUpdatedBy = req.user ? req.user.email : 'system';

        // Update registration
        const registration = await Registration.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        // Check if registration exists
        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Return updated registration
        res.status(200).json({
            status: 'success',
            message: 'Registration updated successfully',
            data: registration
        });
    } catch (error) {
        logger.error(`Error updating registration: ${error.message}`);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: validationErrors
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
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
                status: 'error',
                message: 'Invalid registration ID'
            });
        }

        // Find and delete registration
        const registration = await Registration.findByIdAndDelete(id);

        // Check if registration exists
        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Delete related transactions
        await Transaction.deleteMany({ registrationId: id });

        // Return success message
        res.status(200).json({
            status: 'success',
            message: 'Registration and related transactions deleted successfully'
        });
    } catch (error) {
        logger.error(`Error deleting registration: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
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
                status: 'error',
                message: 'Email and contact number are required'
            });
        }

        //check if email or contact number is already registered
        const existingRegistration = await Registration.findOne({
            $or: [{ email }, { contactNumber }]
        });

        if (existingRegistration.paymentStatus === 'Completed') {
            return res.status(400).json({
                status: 'error',
                message: 'Your registration was successful, should you need to modify your registration data, kindly wait for the release for update form.'
            });
        }

        // Generate OTP
        const otp = generateOTP();

        // Get IP address and user agent
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Check if an OTP verification exists for this email/phone
        let otpVerification = await OtpVerification.findOne({
            $or: [{ email }, { contactNumber }]
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
                userAgent
            });
        }


        await Promise.all([
            console.log('sending email', email, contactNumber),
            console.log('sending whatsapp', contactNumber, otp),
            sendEmail(email, 'OTP Verification for UNMA 2025 Registration',
                `Your OTP for UNMA 2025 registration is ${otp}. It will expire in 5 minutes.`),
            sendWhatsAppOtp(contactNumber, otp)
        ]);


        logger.info(`OTP sent to ${email} and ${contactNumber}`);

        // Return success message (include OTP in non-production environments)
        res.status(200).json({
            status: 'success',
            message: 'OTP sent successfully',
            otpId: otpVerification._id,
            ...(process.env.NODE_ENV !== 'production' && { otp })
        });
    } catch (error) {
        logger.error(`Error sending OTP: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req, res) => {
    try {
        const { email, contactNumber, otp } = req.body;
        console.log(email, contactNumber, otp);
        // Validate required fields
        if (!email || !contactNumber || !otp) {
            return res.status(400).json({
                status: 'error',
                message: 'Email, contact number and OTP are required'
            });
        }

        // Find OTP verification by email or phone
        const otpVerification = await OtpVerification.findOne({
            $or: [{ email }, { contactNumber }]
        });

        // Check if OTP verification exists
        if (!otpVerification) {
            return res.status(404).json({
                status: 'error',
                message: 'No OTP verification found with this email or contact number'
            });
        }

        // Check if OTP is expired
        const now = new Date();
        if (otpVerification.createdAt.getTime() + (60 * 60 * 1000) < now.getTime()) {
            return res.status(400).json({
                status: 'error',
                message: 'OTP has expired'
            });
        }

        // Increment attempt counter
        otpVerification.attempts += 1;

        // Check if max attempts reached
        if (otpVerification.attempts > 5) {
            await otpVerification.deleteOne(); // Remove the OTP entry
            return res.status(400).json({
                status: 'error',
                message: 'Maximum attempts exceeded. Please request a new OTP.'
            });
        }

        // Check if OTP matches
        if (otpVerification.otp !== otp) {
            await otpVerification.save(); // Save the updated attempts
            return res.status(401).json({
                status: 'error',
                message: `Invalid OTP. ${5 - otpVerification.attempts} attempts remaining.`
            });
        }

        // Mark as verified
        otpVerification.verified = true;
        otpVerification.verifiedAt = now;
        await otpVerification.save();

        logger.info(`OTP verified successfully for ${email}`);

        // Check if a registration already exists for this user
        let registration = await Registration.findOne({
            $or: [{ email }, { contactNumber }]
        });

        // Generate a verification token for the frontend
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Return success message with appropriate data
        res.status(200).json({
            status: 'success',
            message: 'OTP verified successfully',
            verified: true,
            verificationToken,
            existingRegistration: registration ? true : false,
            registrationId: registration ? registration._id : null
        });
    } catch (error) {
        logger.error(`Error verifying OTP: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
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
            purpose = 'registration',
            notes
        } = req.body;

        // Validate object ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid registration ID'
            });
        }

        // Find registration
        const registration = await Registration.findById(id);

        // Check if registration exists
        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Generate unique transaction ID
        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

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
            status: 'completed',
            purpose,
            isAnonymous,
            notes,
            completedAt: new Date()
        });

        // Update registration payment status
        registration.paymentStatus = 'Completed';
        registration.paymentId = transactionId;
        registration.paymentDetails = JSON.stringify(paymentGatewayResponse);
        registration.willContribute = true;
        registration.contributionAmount = amount;
        registration.lastUpdated = new Date();

        await registration.save();

        logger.info(`Payment processed successfully: ${transactionId} for registration ${id}`);

        // Return success response
        res.status(200).json({
            status: 'success',
            message: 'Payment processed successfully',
            data: {
                transactionId,
                registrationId: id,
                amount,
                status: 'completed',
                completedAt: transaction.completedAt
            }
        });
    } catch (error) {
        logger.error(`Error processing payment: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};

/**
 * Get registration statistics
 */
export const getRegistrationStats = async (req, res) => {
    try {
        // Get counts by registration type
        const [
            totalRegistrations,
            typeStats,
            attendanceStats,
            paymentStats
        ] = await Promise.all([
            // Total count
            Registration.countDocuments(),

            // Count by type
            Registration.aggregate([
                { $group: { _id: '$registrationType', count: { $sum: 1 } } }
            ]),

            // Count by attendance
            Registration.aggregate([
                { $group: { _id: '$isAttending', count: { $sum: 1 } } }
            ]),

            // Payment statistics
            Registration.aggregate([
                {
                    $group: {
                        _id: '$paymentStatus',
                        count: { $sum: 1 },
                        totalAmount: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$paymentStatus', 'Completed'] },
                                    '$contributionAmount',
                                    0
                                ]
                            }
                        }
                    }
                }
            ])
        ]);

        // Transform stats for easier consumption
        const formattedTypeStats = typeStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        const formattedAttendanceStats = attendanceStats.reduce((acc, curr) => {
            acc[curr._id ? 'attending' : 'notAttending'] = curr.count;
            return acc;
        }, { attending: 0, notAttending: 0 });

        const formattedPaymentStats = paymentStats.reduce((acc, curr) => {
            acc.counts[curr._id || 'Pending'] = curr.count;
            if (curr._id === 'Completed') {
                acc.totalAmountCollected = curr.totalAmount;
            }
            return acc;
        }, { counts: {}, totalAmountCollected: 0 });

        // Return statistics
        res.status(200).json({
            status: 'success',
            data: {
                totalRegistrations,
                byType: formattedTypeStats,
                byAttendance: formattedAttendanceStats,
                payments: formattedPaymentStats
            }
        });
    } catch (error) {
        logger.error(`Error getting registration statistics: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
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
        const transformedData = registrations.map(reg => ({
            ID: reg._id,
            Type: reg.registrationType,
            Name: reg.name,
            Email: reg.email,
            ContactNumber: reg.contactNumber,
            WhatsApp: reg.whatsappNumber || 'Not provided',
            Country: reg.country,
            State: reg.stateUT || 'Not provided',
            IsAttending: reg.isAttending ? 'Yes' : 'No',
            PaymentStatus: reg.paymentStatus || 'Pending',
            ContributionAmount: reg.contributionAmount || 0,
            RegisteredOn: formatDate(reg.registrationDate),
            LastUpdated: formatDate(reg.lastUpdated)
        }));

        // Generate CSV
        const parser = new Parser();
        const csv = parser.parse(transformedData);

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=registrations-${Date.now()}.csv`);

        // Send CSV
        res.status(200).send(csv);
    } catch (error) {
        logger.error(`Error exporting registrations: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
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
        if (!registrations || !Array.isArray(registrations) || registrations.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or empty registrations data'
            });
        }

        // Process registrations in batches
        const results = {
            successful: 0,
            failed: 0,
            errors: []
        };

        // Use insertMany with ordered: false to continue on error
        try {
            await Registration.insertMany(registrations, { ordered: false });
            results.successful = registrations.length;
        } catch (err) {
            if (err.writeErrors) {
                results.failed = err.writeErrors.length;
                results.successful = registrations.length - results.failed;
                results.errors = err.writeErrors.map(e => ({
                    index: e.index,
                    error: e.err.message
                }));
            } else {
                throw err;
            }
        }

        // Return results
        res.status(200).json({
            status: 'success',
            message: `Imported ${results.successful} registrations with ${results.failed} failures`,
            data: results
        });
    } catch (error) {
        logger.error(`Error importing registrations: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
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
                status: 'error',
                message: 'Invalid input: ids array and updates object are required'
            });
        }

        // Add metadata to updates
        updates.lastUpdated = new Date();
        updates.lastUpdatedBy = req.user ? req.user.email : 'system';

        // Update registrations
        const result = await Registration.updateMany(
            { _id: { $in: ids } },
            { $set: updates }
        );

        // Return results
        res.status(200).json({
            status: 'success',
            message: `Updated ${result.modifiedCount} out of ${result.matchedCount} registrations`,
            data: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        logger.error(`Error bulk updating registrations: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
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
        console.log('sdsad',id);
        const { step, stepData, verificationToken } = req.body;
        // Validate step number
        if (!step || isNaN(step) || step < 1 || step > 8) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid step number'
            });
        }

        // Validate step data
        if (!stepData) {
            return res.status(400).json({
                status: 'error',
                message: 'No data provided for this step'
            });
        }

        // Extract structured data
        const { formDataStructured, ...rootLevelData } = stepData;

        // Create a cleaned data object with only necessary root fields
        const cleanedData = {
            lastUpdated: new Date(),
            [`step${step}Complete`]: true
        };

        const emailExists = await Registration.findOne({ email: formDataStructured.personalInfo.email });

        // Add metadata and essential fields that need to be at root level for queries and indexing
        if (step === 1 && !emailExists) {
            if (formDataStructured?.personalInfo) {
                cleanedData.name = formDataStructured.personalInfo.name;
                cleanedData.email = formDataStructured.personalInfo.email;
                cleanedData.contactNumber = formDataStructured.personalInfo.contactNumber;
                cleanedData.country = formDataStructured.personalInfo.country;
                cleanedData.school = formDataStructured.personalInfo.school;
                cleanedData.yearOfPassing = formDataStructured.personalInfo.yearOfPassing;
            }

            if (formDataStructured?.verification) {
                cleanedData.emailVerified = formDataStructured.verification.emailVerified;
                cleanedData.captchaVerified = formDataStructured.verification.captchaVerified;
                cleanedData.verificationQuizPassed = formDataStructured.verification.quizPassed;
            }
        } else if (step === 3 && formDataStructured?.eventAttendance) {
            cleanedData.isAttending = formDataStructured.eventAttendance.isAttending;
            cleanedData.attendees = formDataStructured.eventAttendance.attendees;
        } else if (step === 8 && formDataStructured?.financial) {
            cleanedData.willContribute = formDataStructured.financial.willContribute;
            cleanedData.contributionAmount = formDataStructured.financial.contributionAmount;
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
            const existingRegistration = await Registration.findOne({ email: formDataStructured.personalInfo.email });

            // Check if registration exists
            if (!existingRegistration) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Registration not found'
                });
            }

            // Handle formDataStructured merge correctly
            if (formDataStructured) {
                if (!existingRegistration.formDataStructured) {
                    cleanedData.formDataStructured = formDataStructured;
                } else {
                    const existingStructured = existingRegistration.formDataStructured.toObject();

                    // Deep merge the formDataStructured objects by section
                    cleanedData.formDataStructured = {
                        verification: {
                            ...existingStructured.verification,
                            ...formDataStructured.verification
                        },
                        personalInfo: {
                            ...existingStructured.personalInfo,
                            ...formDataStructured.personalInfo
                        },
                        professional: {
                            ...existingStructured.professional,
                            ...formDataStructured.professional
                        },
                        eventAttendance: {
                            ...existingStructured.eventAttendance,
                            ...formDataStructured.eventAttendance
                        },
                        sponsorship: {
                            ...existingStructured.sponsorship,
                            ...formDataStructured.sponsorship
                        },
                        transportation: {
                            ...existingStructured.transportation,
                            ...formDataStructured.transportation
                        },
                        accommodation: {
                            ...existingStructured.accommodation,
                            ...formDataStructured.accommodation
                        },
                        optional: {
                            ...existingStructured.optional,
                            ...formDataStructured.optional
                        },
                        financial: {
                            ...existingStructured.financial,
                            ...formDataStructured.financial
                        }
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

            // Return updated registration
            return res.status(200).json({
                status: 'success',
                message: `Step ${step} saved successfully`,
                data: {
                    registrationId: updatedRegistration._id,
                    currentStep: step,
                    isComplete: updatedRegistration.formSubmissionComplete || false
                }
            });
        }
        // Create new registration (first step)
        else {
            // Verify that the first step has required fields
            if (step === 1) {
                if (!formDataStructured?.personalInfo?.email || !formDataStructured?.personalInfo?.contactNumber) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Email and contact number are required for the first step'
                    });
                }

                // Verify OTP verification exists
                const otpVerification = await OtpVerification.findOne({
                    email: formDataStructured.personalInfo.email,
                    contactNumber: formDataStructured.personalInfo.contactNumber,
                    verified: true
                });

                if (!otpVerification) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'OTP verification required before creating registration'
                    });
                }

                // Add required fields with default values to satisfy schema requirements
                const registrationData = {
                    ...cleanedData,
                    registrationType: formDataStructured.personalInfo.registrationType || "Alumni",
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
                    formDataStructured
                };

                // Create new registration
                const newRegistration = await Registration.create(registrationData);

                // Return new registration
                return res.status(201).json({
                    status: 'success',
                    message: 'Registration created and first step saved successfully',
                    data: {
                        registrationId: newRegistration._id,
                        currentStep: step,
                        isComplete: false
                    }
                });
            } else {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cannot create registration starting from step other than 1'
                });
            }
        }
    } catch (error) {
        logger.error(`Error saving registration step: ${error.message}`);

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'A registration with this email or contact number already exists',
                error: error.message
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation error',
                errors: validationErrors
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
}; 

export const sendMessage = async (req, res) => {
    try {
        const { email, subject, message  } = req.body;
        const response = await sendEmail(email, subject, message);
        res.status(200).json({
            status: 'success',
            message: 'Message sent successfully'
        });
    } catch (error) {
        logger.error(`Error sending message: ${error.message}`);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
};