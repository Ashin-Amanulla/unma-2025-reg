import mongoose from 'mongoose';

const AttendeesSchema = new mongoose.Schema({
  adults: {
    veg: { type: Number, default: 0, min: 0 },
    nonVeg: { type: Number, default: 0, min: 0 }
  },
  teens: {
    veg: { type: Number, default: 0, min: 0 },
    nonVeg: { type: Number, default: 0, min: 0 }
  },
  children: {
    veg: { type: Number, default: 0, min: 0 },
    nonVeg: { type: Number, default: 0, min: 0 }
  },
  toddlers: {
    veg: { type: Number, default: 0, min: 0 },
    nonVeg: { type: Number, default: 0, min: 0 }
  }
}, { _id: false });

// Define schemas for the structured form data
const VerificationSchema = new mongoose.Schema({
  emailVerified: { type: Boolean, default: false },
  captchaVerified: { type: Boolean, default: false },
  quizPassed: { type: Boolean, default: false },
  email: { type: String },
  contactNumber: { type: String }
}, { _id: false });

const PersonalInfoSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  contactNumber: { type: String },
  whatsappNumber: { type: String },
  school: { type: String },
  yearOfPassing: { type: String },
  country: { type: String },
  stateUT: { type: String },
  district: { type: String },
  bloodGroup: { type: String }
}, { _id: false });

const ProfessionalSchema = new mongoose.Schema({
  profession: { type: String },
  professionalDetails: { type: String },
  areaOfExpertise: { type: String },
  keySkills: { type: String }
}, { _id: false });

const EventAttendanceSchema = new mongoose.Schema({
  isAttending: { type: Boolean, default: false },
  attendees: { type: AttendeesSchema, default: () => ({}) },
  eventContribution: [{ type: String }],
  contributionDetails: { type: String },
  eventParticipation: [{ type: String }],
  participationDetails: { type: String }
}, { _id: false });

const SponsorshipSchema = new mongoose.Schema({
  interestedInSponsorship: { type: Boolean, default: false },
  sponsorshipTier: { type: String },
  sponsorshipDetails: { type: String }
}, { _id: false });

const TransportationSchema = new mongoose.Schema({
  startPincode: { type: String },
  pinDistrict: { type: String },
  pinState: { type: String },
  pinTaluk: { type: String },
  subPostOffice: { type: String },
  originArea: { type: String },
  nearestLandmark: { type: String },
  travelDate: { type: String },
  travelTime: { type: String },
  modeOfTransport: { type: String },
  readyForRideShare: { type: String },
  rideShareCapacity: { type: Number, min: 0 },
  needParking: { type: String },
  wantRideShare: { type: String },
  rideShareGroupSize: { type: Number, min: 0 },
  travelSpecialRequirements: { type: String }
}, { _id: false });

const AccommodationSchema = new mongoose.Schema({
  accommodation: { type: String },
  accommodationCapacity: { type: Number, min: 0 },
  accommodationLocation: { type: String },
  accommodationRemarks: { type: String },
  accommodationPincode: { type: String },
  accommodationDistrict: { type: String },
  accommodationState: { type: String },
  accommodationTaluk: { type: String },
  accommodationLandmark: { type: String },
  accommodationSubPostOffice: { type: String },
  accommodationArea: { type: String }
}, { _id: false });

const OptionalSchema = new mongoose.Schema({
  spouseNavodayan: { type: String },
  unmaFamilyGroups: { type: String },
  mentorshipOptions: [{ type: String }],
  trainingOptions: [{ type: String }],
  seminarOptions: [{ type: String }],
  tshirtInterest: { type: String },
  tshirtSizes: { type: Map, of: Number }
}, { _id: false });

const FinancialSchema = new mongoose.Schema({
  willContribute: { type: Boolean, default: false },
  contributionAmount: { type: Number, min: 0, default: 0 },
  proposedAmount: { type: Number, min: 0, default: 0 },
  paymentStatus: { type: String },
  paymentId: { type: String },
  paymentDetails: { type: String },
  paymentRemarks: { type: String }
}, { _id: false });

// Combined schema for the formDataStructured field
const FormDataStructuredSchema = new mongoose.Schema({
  verification: { type: VerificationSchema, default: () => ({}) },
  personalInfo: { type: PersonalInfoSchema, default: () => ({}) },
  professional: { type: ProfessionalSchema, default: () => ({}) },
  eventAttendance: { type: EventAttendanceSchema, default: () => ({}) },
  sponsorship: { type: SponsorshipSchema, default: () => ({}) },
  transportation: { type: TransportationSchema, default: () => ({}) },
  accommodation: { type: AccommodationSchema, default: () => ({}) },
  optional: { type: OptionalSchema, default: () => ({}) },
  financial: { type: FinancialSchema, default: () => ({}) }
}, { _id: false });

const RegistrationSchema = new mongoose.Schema({
  registrationType: { type: String, enum: ['Alumni', 'Staff', 'Other'], required: true },

  // Contact Information
  name: { type: String, maxlength: 100, required: true },
  contactNumber: { type: String, required: true },
  whatsappNumber: { type: String },
  email: { type: String, required: true },
  emailVerified: { type: Boolean, default: false, required: true },

 

  // Staff Specific Fields
  schoolsWorked: { type: String },
  yearsOfWorking: { type: String },
  currentPosition: { type: String },

  // Other Specific Fields
  purpose: { type: String },



  // Structured form data
  formDataStructured: { type: FormDataStructuredSchema, default: () => ({}) },

  // Metadata
  registrationDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  userAgent: { type: String },
  lastUpdatedBy: { type: String },
  formSubmissionComplete: { type: Boolean, default: false },

  // Step completion tracking
  step1Complete: { type: Boolean, default: false },
  step2Complete: { type: Boolean, default: false },
  step3Complete: { type: Boolean, default: false },
  step4Complete: { type: Boolean, default: false },
  step5Complete: { type: Boolean, default: false },
  step6Complete: { type: Boolean, default: false },
  step7Complete: { type: Boolean, default: false },
  step8Complete: { type: Boolean, default: false },
  currentStep: { type: Number, default: 1, min: 1, max: 8 }
});

// Create a compound index to allow uniqueness checks on email or contactNumber
// but prevent duplicates when the same user registers again
RegistrationSchema.index(
  { email: 1, registrationType: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true, $ne: '' } } }
);

RegistrationSchema.index(
  { contactNumber: 1, registrationType: 1 },
  { unique: true, partialFilterExpression: { contactNumber: { $exists: true, $ne: '' } } }
);

// Add a text index for search functionality
RegistrationSchema.index({
  name: 'text',
  email: 'text',
  contactNumber: 'text',
  school: 'text',
  profession: 'text'
});

const Registration = mongoose.model('Registration', RegistrationSchema);

export default Registration;
