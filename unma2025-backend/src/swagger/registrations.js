/**
 * @swagger
 * components:
 *   schemas:
 *     Registration:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique registration ID
 *         eventId:
 *           type: string
 *           description: ID of the associated event
 *         firstName:
 *           type: string
 *           description: First name of the attendee
 *         lastName:
 *           type: string
 *           description: Last name of the attendee
 *         email:
 *           type: string
 *           description: Email address of the attendee
 *         phone:
 *           type: string
 *           description: Phone number of the attendee
 *         organization:
 *           type: string
 *           description: Organization of the attendee
 *         status:
 *           type: string
 *           enum: [PENDING, VERIFIED, PAID, CANCELLED]
 *           description: Current status of the registration
 *         paymentId:
 *           type: string
 *           description: ID of the associated payment
 *         paymentAmount:
 *           type: number
 *           description: Amount paid for the registration
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time of registration creation
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time of last registration update
 *         additionalNotes:
 *           type: string
 *           description: Additional notes provided by the attendee
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         eventId: 60d21b4667d0d8992e610c86
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         phone: +1-555-123-4567
 *         organization: Acme Inc.
 *         status: VERIFIED
 *         createdAt: 2025-05-01T10:30:00Z
 *         updatedAt: 2025-05-01T10:45:00Z
 *         additionalNotes: Vegetarian meal option requested
 *
 *     RegistrationRequest:
 *       type: object
 *       required:
 *         - eventId
 *         - firstName
 *         - lastName
 *         - email
 *         - phone
 *       properties:
 *         eventId:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *         organization:
 *           type: string
 *         additionalNotes:
 *           type: string
 *       example:
 *         eventId: 60d21b4667d0d8992e610c86
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         phone: +1-555-123-4567
 *         organization: Acme Inc.
 *         additionalNotes: Vegetarian meal option requested
 *
 *     RegistrationResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           $ref: '#/components/schemas/Registration'
 *
 *     OtpRequest:
 *       type: object
 *       properties:
 *         otp:
 *           type: string
 *           description: One-time password code
 *       example:
 *         otp: 123456
 *
 *     PaymentRequest:
 *       type: object
 *       properties:
 *         paymentMethod:
 *           type: string
 *           enum: [CREDIT_CARD, PAYPAL, BANK_TRANSFER]
 *         cardNumber:
 *           type: string
 *         expiryDate:
 *           type: string
 *         cvv:
 *           type: string
 *       example:
 *         paymentMethod: CREDIT_CARD
 *         cardNumber: 4111111111111111
 *         expiryDate: 12/25
 *         cvv: 123
 */

/**
 * @swagger
 * tags:
 *   name: Registrations
 *   description: Registration management endpoints
 */

/**
 * @swagger
 * /api/registrations:
 *   post:
 *     summary: Create a new registration
 *     tags: [Registrations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationRequest'
 *     responses:
 *       201:
 *         description: Registration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationResponse'
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Event not found
 *       409:
 *         description: Event is full or already registered
 */

/**
 * @swagger
 * /api/registrations/{id}/send-otp:
 *   post:
 *     summary: Send OTP for registration verification
 *     tags: [Registrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *       404:
 *         description: Registration not found
 */

/**
 * @swagger
 * /api/registrations/{id}/verify-otp:
 *   post:
 *     summary: Verify OTP for registration
 *     tags: [Registrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: Registration not found
 */

/**
 * @swagger
 * /api/registrations/{id}/payment:
 *   post:
 *     summary: Process payment for registration
 *     tags: [Registrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRequest'
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     registration:
 *                       $ref: '#/components/schemas/Registration'
 *                     paymentId:
 *                       type: string
 *       400:
 *         description: Payment already processed
 *       404:
 *         description: Registration not found
 *       422:
 *         description: Payment processing failed
 */ 