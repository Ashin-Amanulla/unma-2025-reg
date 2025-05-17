// Schema for registration form validation
import { z } from "zod";

// Base schema with common fields for all registration types
const BaseRegistrationSchema = z.object({
    // Basic Information
    registrationType: z.enum(["Alumni", "Staff", "Other"]),
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Valid email is required"),
    emailVerified: z.boolean().refine(val => val === true, {
        message: "Email must be verified"
    }),
    captchaVerified: z.boolean().refine(val => val === true, {
        message: "CAPTCHA verification is required"
    }),

    // Contact Information
    contactNumber: z
        .string()
        .min(1, "Contact number is required")
        .refine((val) => {
            // Remove all non-digit characters
            const digits = val.replace(/\D/g, '');
            // For Indian numbers (starting with +91 or 91)
            if (val.startsWith('+91') || val.startsWith('91')) {
                return digits.length === 12; // 91 + 10 digits
            }
            // For other countries, ensure at least 10 digits
            return digits.length >= 10;
        }, {
            message: "Indian numbers must be 10 digits (excluding country code)"
        }),
    whatsappNumber: z.string().optional(),

    // Location Information
    country: z.string().min(2, "Country is required"),
    stateUT: z.string().optional(),
    district: z.string().optional(),

    // Event Attendance
    isAttending: z.boolean(),
    foodPreference: z.enum(["vegetarian", "non-vegetarian", "both"]).optional(),
    totalVeg: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
    ),
    totalNonVeg: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
    ),

    // Financial Contribution
    willContribute: z.boolean(),
    contributionAmount: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
    ),
});

// Alumni-specific schema
const AlumniSchema = BaseRegistrationSchema.extend({
    // School & Year
    school: z.string().min(2, "School selection is required"),
    yearOfPassing: z.string().min(4, "Year of passing is required"),
    verificationQuizPassed: z.boolean().optional(),

    // Professional Information
    profession: z.string().optional(),
    businessDetails: z.string().optional(),
    areaOfExpertise: z.string().optional(),
    keySkills: z.string().max(500).optional(),

    // Event Contribution
    eventContribution: z.array(z.string()).optional(),
    contributionDetails: z.string().optional(),

    // Transportation
    travellingFrom: z.string().optional(),
    travelDateTime: z.string().optional(),
    modeOfTravel: z.enum(["Car", "Train", "Flight", "Other"]).optional(),
    needParking: z.string().optional(),
    carPooling: z.enum(["No", "Yes To Venue", "Yes From Venue", "Yes Both Ways"]).optional(),
    coShareSeats: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
    ),
    landmarks: z.string().optional(),
    travelRemarks: z.string().optional(),

    // Accommodation
    accommodation: z.string().optional(),
    accommodationCapacity: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
    ),
    accommodationLocation: z.string().optional(),
    accommodationRemarks: z.string().optional(),

    // Optional Fields
    spouseNavodayan: z.enum(["", "Yes", "No"]).optional(),
    unmaFamilyGroups: z.enum(["", "Yes", "No"]).optional(),
    mentorshipOptions: z.array(z.string()).optional(),
    trainingOptions: z.array(z.string()).optional(),
    seminarOptions: z.array(z.string()).optional(),
    bloodGroup: z.string().min(1, "Blood Group is required"),
}).refine(
    (data) => {
        if (data.country === "IN") {
            return data.stateUT && data.stateUT.length > 0;
        }
        return true;
    },
    {
        message: "State/UT is required for Indian residents",
        path: ["stateUT"],
    }
).refine(
    (data) => {
        if (data.country === "IN" && data.stateUT === "Kerala") {
            return data.district && data.district.length > 0;
        }
        return true;
    },
    {
        message: "District is required for Kerala residents",
        path: ["district"],
    }
).refine(
    (data) => {
        if (data.isAttending) {
            return data.foodPreference !== undefined;
        }
        return true;
    },
    {
        message: "Please select your food preference",
        path: ["foodPreference"],
    }
).refine(
    (data) => {
        if (data.willContribute) {
            return data.contributionAmount && data.contributionAmount > 0;
        }
        return true;
    },
    {
        message: "Please specify contribution amount",
        path: ["contributionAmount"],
    }
).refine(
    (data) => {
        if (data.accommodation === "provide") {
            return data.accommodationCapacity && data.accommodationCapacity > 0;
        }
        return true;
    },
    {
        message: "Please specify accommodation capacity",
        path: ["accommodationCapacity"],
    }
).refine(
    (data) => {
        if (data.carPooling !== "No") {
            return data.coShareSeats && data.coShareSeats > 0;
        }
        return true;
    },
    {
        message: "Please specify number of seats for car pooling",
        path: ["coShareSeats"],
    }
);

// Staff-specific schema
const StaffSchema = BaseRegistrationSchema.extend({
    // Staff-specific fields
    schoolsWorked: z.string().min(1, "Please enter at least one school"),
    yearsOfWorking: z.string().min(1, "Please enter years of working"),

    // Attendees structure
    attendees: z.object({
        adults: z.object({
            veg: z.number().int().min(0).default(0),
            nonVeg: z.number().int().min(0).default(0),
        }).default({ veg: 0, nonVeg: 0 }),
        teens: z.object({
            veg: z.number().int().min(0).default(0),
            nonVeg: z.number().int().min(0).default(0),
        }).default({ veg: 0, nonVeg: 0 }),
        children: z.object({
            veg: z.number().int().min(0).default(0),
            nonVeg: z.number().int().min(0).default(0),
        }).default({ veg: 0, nonVeg: 0 }),
        toddlers: z.object({
            veg: z.number().int().min(0).default(0),
            nonVeg: z.number().int().min(0).default(0),
        }).default({ veg: 0, nonVeg: 0 }),
    }).default({
        adults: { veg: 0, nonVeg: 0 },
        teens: { veg: 0, nonVeg: 0 },
        children: { veg: 0, nonVeg: 0 },
        toddlers: { veg: 0, nonVeg: 0 },
    }),

    // Event Contribution
    eventContribution: z.array(z.string()).optional(),
    contributionDetails: z.string().optional(),

    // Sponsorship
    interestedInSponsorship: z.boolean().optional().default(false),
    sponsorshipType: z.array(z.string()).optional(),
    sponsorshipDetails: z.string().optional(),

    // Transportation
    startPincode: z.string().optional(),
    taluk: z.string().optional(),
    originArea: z.string().optional(),
    nearestLandmark: z.string().optional(),
    travelDate: z.string().optional(),
    travelTime: z.string().optional(),
    modeOfTransport: z.string().optional(),
    readyForRideShare: z.string().optional(),
    rideShareCapacity: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(1).optional()
    ),
    needParking: z.string().optional(),
    wantRideShare: z.string().optional(),
    rideShareGroupSize: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(1).optional()
    ),
    travelSpecialRequirements: z.string().optional(),

    // Accommodation
    accommodation: z.string().optional(),
    accommodationCapacity: z.preprocess(
        (val) => (val === "" ? undefined : Number(val)),
        z.number().min(0).optional()
    ),
    accommodationLocation: z.string().optional(),
    accommodationRemarks: z.string().optional(),
}).refine(
    (data) => {
        if (data.country === "IN") {
            return data.stateUT && data.stateUT.length > 0;
        }
        return true;
    },
    {
        message: "State/UT is required for Indian residents",
        path: ["stateUT"],
    }
).refine(
    (data) => {
        if (data.country === "IN" && data.stateUT === "Kerala") {
            return data.district && data.district.length > 0;
        }
        return true;
    },
    {
        message: "District is required for Kerala residents",
        path: ["district"],
    }
).refine(
    (data) => {
        if (data.willContribute) {
            return data.contributionAmount && data.contributionAmount > 0;
        }
        return true;
    },
    {
        message: "Please specify contribution amount",
        path: ["contributionAmount"],
    }
).refine(
    (data) => {
        if (data.isAttending && data.modeOfTransport === "car" && data.readyForRideShare === "yes") {
            return data.rideShareCapacity && data.rideShareCapacity > 0;
        }
        return true;
    },
    {
        message: "Please specify how many people you can accommodate",
        path: ["rideShareCapacity"],
    }
).refine(
    (data) => {
        if (data.isAttending) {
            const attendees = data.attendees;
            const totalAttendees =
                (attendees.adults.veg || 0) + (attendees.adults.nonVeg || 0) +
                (attendees.teens.veg || 0) + (attendees.teens.nonVeg || 0) +
                (attendees.children.veg || 0) + (attendees.children.nonVeg || 0) +
                (attendees.toddlers.veg || 0) + (attendees.toddlers.nonVeg || 0);

            return totalAttendees > 0;
        }
        return true;
    },
    {
        message: "Please add at least one attendee",
        path: ["attendees"],
    }
);

// Other-specific schema
const OtherSchema = BaseRegistrationSchema.extend({
    // Other-specific fields
    purpose: z.string().min(10, "Please explain your purpose for attending"),
    bloodGroup: z.enum(["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),

    // Professional Information
    profession: z.string().optional(),
    professionalDetails: z.string().optional(),
    areaOfExpertise: z.string().optional(),
    keySkills: z.string().max(500).optional(),

    // Attendees structure
    attendees: z.object({
        adults: z.object({
            veg: z.number().int().min(0).default(0),
            nonVeg: z.number().int().min(0).default(0),
        }).default({ veg: 0, nonVeg: 0 }),
        teens: z.object({
            veg: z.number().int().min(0).default(0),
            nonVeg: z.number().int().min(0).default(0),
        }).default({ veg: 0, nonVeg: 0 }),
        children: z.object({
            veg: z.number().int().min(0).default(0),
            nonVeg: z.number().int().min(0).default(0),
        }).default({ veg: 0, nonVeg: 0 }),
        toddlers: z.object({
            veg: z.number().int().min(0).default(0),
            nonVeg: z.number().int().min(0).default(0),
        }).default({ veg: 0, nonVeg: 0 }),
    }).default({
        adults: { veg: 0, nonVeg: 0 },
        teens: { veg: 0, nonVeg: 0 },
        children: { veg: 0, nonVeg: 0 },
        toddlers: { veg: 0, nonVeg: 0 },
    }),

    // Event Contribution
    eventContribution: z.array(z.string()).optional(),
    contributionDetails: z.string().optional(),

    // Transportation
    travellingFrom: z.string().optional(),
    travelDateTime: z.string().optional(),
    modeOfTravel: z.enum(["Car", "Train", "Flight", "Other"]).optional(),
    needParking: z.boolean().optional(),

    // Accommodation
    accommodation: z.string().optional(),
}).refine(
    (data) => {
        if (data.country === "IN") {
            return data.stateUT && data.stateUT.length > 0;
        }
        return true;
    },
    {
        message: "State/UT is required for Indian residents",
        path: ["stateUT"],
    }
).refine(
    (data) => {
        if (data.country === "IN" && data.stateUT === "Kerala") {
            return data.district && data.district.length > 0;
        }
        return true;
    },
    {
        message: "District is required for Kerala residents",
        path: ["district"],
    }
).refine(
    (data) => {
        if (data.isAttending) {
            return data.foodPreference !== undefined;
        }
        return true;
    },
    {
        message: "Please select your food preference",
        path: ["foodPreference"],
    }
).refine(
    (data) => {
        if (data.willContribute) {
            return data.contributionAmount && data.contributionAmount > 0;
        }
        return true;
    },
    {
        message: "Please specify contribution amount",
        path: ["contributionAmount"],
    }
).refine(
    (data) => {
        if (data.isAttending) {
            const attendees = data.attendees;
            const totalAttendees =
                (attendees.adults.veg || 0) + (attendees.adults.nonVeg || 0) +
                (attendees.teens.veg || 0) + (attendees.teens.nonVeg || 0) +
                (attendees.children.veg || 0) + (attendees.children.nonVeg || 0) +
                (attendees.toddlers.veg || 0) + (attendees.toddlers.nonVeg || 0);

            return totalAttendees > 0;
        }
        return true;
    },
    {
        message: "Please add at least one attendee",
        path: ["attendees"],
    }
);

// Export the schemas
export const RegistrationSchemas = {
    Alumni: AlumniSchema,
    Staff: StaffSchema,
    Other: OtherSchema,
};

// Default export for backward compatibility
export default RegistrationSchemas.Alumni;