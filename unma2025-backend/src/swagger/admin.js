/**
 * @swagger
 * components:
 *   schemas:
 *     EventCreateRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - date
 *         - location
 *         - price
 *         - capacity
 *       properties:
 *         title:
 *           type: string
 *           description: Event title
 *         description:
 *           type: string
 *           description: Detailed description of the event
 *         date:
 *           type: string
 *           format: date-time
 *           description: Event date and time
 *         location:
 *           type: string
 *           description: Event location
 *         price:
 *           type: number
 *           description: Event price
 *         capacity:
 *           type: integer
 *           description: Total capacity of the event
 *         image:
 *           type: string
 *           description: URL to event image
 *         isActive:
 *           type: boolean
 *           description: Indicates if the event is active
 *         agenda:
 *           type: array
 *           description: Event agenda
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *               title:
 *                 type: string
 *         speakers:
 *           type: array
 *           description: Event speakers
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               image:
 *                 type: string
 *       example:
 *         title: UNMA Annual Conference 2025
 *         description: Join us for the annual UNMA conference featuring keynote speakers and networking opportunities.
 *         date: 2025-06-15T09:00:00Z
 *         location: Grand Hotel, New York
 *         price: 299.99
 *         capacity: 500
 *         image: https://example.com/event1.jpg
 *         isActive: true
 *         agenda: 
 *           - time: 09:00 AM
 *             title: Registration & Breakfast
 *           - time: 10:00 AM
 *             title: Keynote Speech
 *         speakers:
 *           - name: Dr. Jane Smith
 *             bio: Leading expert in the field
 *             image: https://example.com/speaker1.jpg
 *             
 *     EventUpdateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         price:
 *           type: number
 *         capacity:
 *           type: integer
 *         image:
 *           type: string
 *         isActive:
 *           type: boolean
 *         agenda:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *               title:
 *                 type: string
 *         speakers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               image:
 *                 type: string
 *       example:
 *         title: Updated UNMA Conference 2025
 *         isActive: false
 *         capacity: 600
 *
 *     RegistrationsListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             registrations:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Registration'
 *             total:
 *               type: integer
 *               description: Total number of registrations matching the query
 *
 *     DashboardStats:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             totalRegistrations:
 *               type: integer
 *             totalEvents:
 *               type: integer
 *             activeEvents:
 *               type: integer
 *             upcomingEvents:
 *               type: integer
 *             totalRevenue:
 *               type: number
 *             recentRegistrations:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Registration'
 *             registrationsByStatus:
 *               type: object
 *               properties:
 *                 PENDING:
 *                   type: integer
 *                 VERIFIED:
 *                   type: integer
 *                 PAID:
 *                   type: integer
 *                 CANCELLED:
 *                   type: integer
 *             registrationsOverTime:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                   count:
 *                     type: integer
 */

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/registrations:
 *   get:
 *     summary: Get all registrations (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, VERIFIED, PAID, CANCELLED]
 *         description: Filter by registration status
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filter by event ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: List of registrations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationsListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/admin/registrations/{id}:
 *   get:
 *     summary: Get registration by ID (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Registration details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegistrationResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Registration not found
 */

/**
 * @swagger
 * /api/admin/events:
 *   post:
 *     summary: Create a new event (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventCreateRequest'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /api/admin/events/{id}:
 *   put:
 *     summary: Update an event (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventUpdateRequest'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */ 