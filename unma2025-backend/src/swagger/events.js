/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique event ID
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
 *         registeredCount:
 *           type: integer
 *           description: Number of registered attendees
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
 *         _id: 60d21b4667d0d8992e610c85
 *         title: UNMA Annual Conference 2025
 *         description: Join us for the annual UNMA conference featuring keynote speakers and networking opportunities.
 *         date: 2025-06-15T09:00:00Z
 *         location: Grand Hotel, New York
 *         price: 299.99
 *         capacity: 500
 *         registeredCount: 230
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
 *     EventsResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Event'
 *
 *     EventResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           $ref: '#/components/schemas/Event'
 *
 *     AvailabilityResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             eventId:
 *               type: string
 *             capacity:
 *               type: integer
 *             registered:
 *               type: integer
 *             available:
 *               type: integer
 */

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management endpoints
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active events
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit the number of results
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [date, price]
 *         description: Sort results by field
 *     responses:
 *       200:
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventsResponse'
 */

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/events/{id}/availability:
 *   get:
 *     summary: Get event seat availability
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event availability details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvailabilityResponse'
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */ 