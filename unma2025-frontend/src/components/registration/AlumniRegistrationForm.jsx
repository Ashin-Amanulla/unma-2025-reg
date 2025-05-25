import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import axios from "axios";
import { RegistrationSchemas } from "../../zod-form-validators/registrationform";
import { useRegistration } from "../../hooks";
import VerificationQuiz from "../VerificationQuiz";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "../../styles/phone-input.css";
import "../../styles/date-time-pickers.css";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
  FormSection,
  FormField,
  OtpInput,
  CaptchaVerification,
  NavigationButtons,
  MobileProgressIndicator,
} from "./FormComponents";
import { getPincodeDetails } from "../../api/pincodeApi";
import StepIndicator from "./StepIndicator";
import { jnvSchools, indianStatesOptions } from "../../assets/data";
import SponsorshipCards from "./SponsorshipCards";
import AttendeeCounter from "./AttendeeCounter";
import AccommodationGenderCounter from "./AccommodationGenderCounter";
import { motion } from "framer-motion";
import AlertDialog from "../ui/AlertDialog";
import { Checkbox } from "../ui/Checkbox";
import { usePayment } from "../../hooks/usePayment";
import FinancialDifficultyDialog from "./FinancialDifficultyDialog";
import {
  MENTORSHIP_OPTIONS,
  TRAINING_OPTIONS,
  SEMINAR_OPTIONS,
  TSHIRT_SIZES,
  DEFAULT_TSHIRT_SIZES,
  PROFESSION_OPTIONS,
  KERALA_DISTRICTS,
  EVENT_PARTICIPATION_OPTIONS,
} from "../../assets/data";
import registrationsApi from "../../api/registrationsApi";
// Initialize countries data
countries.registerLocale(enLocale);

// Get all countries and sort them alphabetically
const countryOptions = Object.entries(countries.getNames("en"))
  .map(([code, label]) => ({
    value: code,
    label: label,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

// Add these validation functions at the top of the file, after the imports
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phone) => {
  if (!phone) return false;
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  // For Indian numbers (starting with +91 or 91)
  if (phone.startsWith("+91") || phone.startsWith("91")) {
    return digits.length === 12; // 91 + 10 digits
  }
  // For other countries, ensure at least 10 digits
  return digits.length >= 10;
};

const AlumniRegistrationForm = ({ onBack, storageKey }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [formHasLocalData, setFormHasLocalData] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showMissionMessage, setShowMissionMessage] = useState(false);
  const [showFinancialDifficultyDialog, setShowFinancialDifficultyDialog] =
    useState(false);
  const [alertDialogConfig, setAlertDialogConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [hasPreviousContribution, setHasPreviousContribution] = useState(false);
  const [previousContributionAmount, setPreviousContributionAmount] =
    useState(0);
  const [verificationToken, setVerificationToken] = useState("");
  const [registrationId, setRegistrationId] = useState(null);
  const [totalContributionAmount, setTotalContributionAmount] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const { submitRegistration, calculateContribution } = useRegistration();
  const { isPaymentProcessing, initiatePayment } = usePayment();

  // Steps in the registration form
  const steps = [
    "Verification",
    "Personal Info",
    "Professional",
    "Event Attendance",
    "Sponsorship",
    "Transportation",
    "Accommodation",
    "Optional",
    "Financial",
  ];

  // Set up form with Zod validation
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(RegistrationSchemas.Alumni),
    mode: "onBlur", // Changed from onChange to ensure validation runs when fields lose focus
    reValidateMode: "onChange", // Added to ensure validation runs when values change
    criteriaMode: "all", // Ensures all validation errors are collected
    defaultValues: {
      registrationType: "Alumni",
      name: "",
      contactNumber: "",
      email: "",
      emailVerified: false,
      captchaVerified: false,
      whatsappNumber: "",
      school: "",
      yearOfPassing: "",
      country: "IN",
      stateUT: "Kerala",
      district: null,
      verificationQuizPassed: false,

      // Professional
      profession: "",
      businessDetails: "",
      areaOfExpertise: "",
      keySkills: "",

      // Event attendance
      isAttending: true,
      attendees: {
        adults: { veg: 0, nonVeg: 0 },
        teens: { veg: 0, nonVeg: 0 },
        children: { veg: 0, nonVeg: 0 },
        toddlers: { veg: 0, nonVeg: 0 },
      },
      eventParticipation: [],
      participationDetails: "",
      eventContribution: [],
      contributionDetails: "",
      interestedInSponsorship: false,
      canReferSponsorship: false,

      // Transportation
      planTravel: false,
      travelConsistsTwoSegments: "",
      startingLocation: "",
      startPincode: "",
      pinDistrict: "",
      pinState: "",
      pinTaluk: "",
      nearestLandmark: "",
      travelDate: "",
      travelTime: "",
      modeOfTransport: "",
      connectWithNavodayans: "",
      vehicleCapacity: 1,
      needParking: "",
      readyForRideShare: "",
      groupSize: 1,
      travelSpecialRequirements: "",

      // Accommodation
      planAccommodation: false,
      accommodation: "",
      accommodationGender: "",
      accommodationNeeded: { male: 0, female: 0 },
      accommodationPincode: "",
      accommodationDistrict: "",
      accommodationState: "",
      accommodationTaluk: "",
      accommodationSubPostOffice: "",
      accommodationLandmark: "",
      accommodationArea: "",
      accommodationCapacity: 0,
      accommodationLocation: "",
      accommodationRemarks: "",

      // Financial
      willContribute: false,
      contributionAmount: 0,
      proposedAmount: 0,
      registrationStatus: "complete",

      // Optional fields
      spouseNavodayan: "",
      unmaFamilyGroups: false,
      mentorshipOptions: [],
      trainingOptions: [],
      seminarOptions: [],
      tshirtInterest: true,
      tshirtSizes: DEFAULT_TSHIRT_SIZES,
    },
  });

  // Watch specific fields for conditional rendering
  const email = watch("email");
  const profession = watch("profession");
  const isAttending = watch("isAttending");
  const accommodation = watch("accommodation");
  const carPooling = watch("carPooling");
  const willContribute = watch("willContribute");

  // Load saved data from local storage
  useEffect(() => {
    const savedRegistrationData = localStorage.getItem(storageKey);
    const savedStep = localStorage.getItem(`${storageKey}-step`);
    const savedCompletedSteps = localStorage.getItem(`${storageKey}-completed`);

    if (savedRegistrationData) {
      try {
        const parsedData = JSON.parse(savedRegistrationData);

        // Only load if it's an Alumni registration
        if (parsedData.registrationType === "Alumni") {
          reset(parsedData);
          setFormHasLocalData(true);

          // Restore verification states
          setEmailVerified(parsedData.emailVerified);
          setCaptchaVerified(parsedData.captchaVerified);
          setQuizCompleted(parsedData.verificationQuizPassed);

          // Restore step
          if (savedStep) {
            const stepNumber = parseInt(savedStep, 10);
            setCurrentStep(stepNumber);
          }

          // Restore completed steps
          if (savedCompletedSteps) {
            try {
              const completed = JSON.parse(savedCompletedSteps);
              setCompletedSteps(completed);
            } catch (error) {
              // If parsing fails, mark all previous steps as completed
              const stepNumber = savedStep ? parseInt(savedStep, 10) : 0;
              const completed = Array.from({ length: stepNumber }, (_, i) => i);
              setCompletedSteps(completed);
            }
          } else if (savedStep) {
            // If no completed steps saved, mark all previous steps as completed
            const stepNumber = parseInt(savedStep, 10);
            const completed = Array.from({ length: stepNumber }, (_, i) => i);
            setCompletedSteps(completed);
          }

          // toast.info("Previous form data restored");

          // If there's existing contribution data, restore the total amount
          if (
            parsedData.contributionAmount > 0 &&
            parsedData.paymentStatus === "Completed"
          ) {
            setTotalContributionAmount(parsedData.contributionAmount);
            setHasPreviousContribution(true);
            setPreviousContributionAmount(parsedData.contributionAmount);
          }
        }
      } catch (error) {
        console.error("Error parsing saved form data:", error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [reset, storageKey]);

  // Save data to local storage when form changes
  useEffect(() => {
    if (isDirty) {
      const formData = getValues();
      localStorage.setItem(storageKey, JSON.stringify(formData));
      localStorage.setItem(`${storageKey}-step`, currentStep.toString());
      localStorage.setItem(
        `${storageKey}-completed`,
        JSON.stringify(completedSteps)
      );
    }
  }, [watch(), currentStep, completedSteps, isDirty, getValues, storageKey]);

  // Update verification states in form data
  useEffect(() => {
    setValue("emailVerified", emailVerified);
    setValue("captchaVerified", captchaVerified);
    setValue("verificationQuizPassed", quizCompleted);
  }, [emailVerified, captchaVerified, quizCompleted, setValue]);

  // Email verification handler
  const handleEmailVerified = (status, token, id) => {
    setEmailVerified(status);
    setValue("emailVerified", status);

    // Store verification token and registration ID if provided
    if (token) {
      console.log("Setting verification token:", token);
      setVerificationToken(token);
      localStorage.setItem(`${storageKey}-token`, token);
    }

    if (id) {
      console.log("Setting registration ID from OTP verification:", id);
      setRegistrationId(id);
      localStorage.setItem(`${storageKey}-id`, id);
    }
  };

  // CAPTCHA verification handler
  const handleCaptchaVerified = (status) => {
    setCaptchaVerified(status);
    setValue("captchaVerified", status);
  };

  // Quiz completion handler
  const handleQuizComplete = (status) => {
    setQuizCompleted(status);
    setValue("verificationQuizPassed", status);
  };

  // Add effect to load verification token and registration ID from storage
  useEffect(() => {
    const savedToken = localStorage.getItem(`${storageKey}-token`);
    const savedId = localStorage.getItem(`${storageKey}-id`);

    console.log("Loading from localStorage:", {
      storageKey,
      tokenKey: `${storageKey}-token`,
      idKey: `${storageKey}-id`,
      savedToken,
      savedId,
    });

    if (savedToken) {
      console.log(
        "Restoring verification token from localStorage:",
        savedToken
      );
      setVerificationToken(savedToken);
    }

    if (savedId) {
      console.log("Restoring registration ID from localStorage:", savedId);
      setRegistrationId(savedId);
    }
  }, [storageKey]);

  // Validate current step before moving to next
  const validateCurrentStep = async () => {
    let fieldsToValidate = [];

    // Collect fields to validate based on current step
    if (currentStep === 0) {
      // Verification step
      if (!emailVerified) {
        toast.error("Please verify your email to continue");
        return false;
      }
      if (!captchaVerified) {
        toast.error("Please complete the CAPTCHA verification");
        return false;
      }
      if (!quizCompleted) {
        toast.error("Please complete the Navodayan Quiz to continue");
        return false;
      }
      return true;
    } else if (currentStep === 1) {
      // Personal info
      fieldsToValidate = [
        "name",
        "contactNumber",
        "school",
        "bloodGroup",
        "yearOfPassing",
        "country",
      ];

      // Always validate stateUT for Indian residents
      const currentCountry = watch("country");
      console.log("Validating step 1 - Country:", currentCountry);

      if (currentCountry === "IN") {
        fieldsToValidate.push("stateUT");

        // Check if stateUT is actually selected
        const currentState = watch("stateUT");
        console.log("Current state:", currentState);

        if (!currentState || currentState === "") {
          toast.error("Please select your current State/UT of residence");
          return false;
        }

        // If state is Kerala, district is required
        if (currentState === "Kerala") {
          fieldsToValidate.push("district");

          // Check if district is actually selected
          const currentDistrict = watch("district");
          console.log("Current district:", currentDistrict);

          if (!currentDistrict || currentDistrict === "") {
            toast.error("Please select your current district of residence");
            return false;
          }
        }
      }

      console.log("Fields to validate for step 1:", fieldsToValidate);
    } else if (currentStep === 2) {
      // Professional info
      fieldsToValidate = ["profession"];

      // If profession is selected, related fields become required
      const profession = watch("profession");
      if (profession) {
        if (profession === "Business Owner/Entrepreneur") {
          fieldsToValidate.push("businessDetails");
        }
        fieldsToValidate.push("areaOfExpertise");
      }
    } else if (currentStep === 3) {
      // Event attendance
      fieldsToValidate = ["isAttending"];

      if (isAttending) {
        // Check attendees count
        const attendees = watch("attendees");
        const totalAttendees = Object.values(attendees || {}).reduce(
          (sum, group) => sum + (group.veg || 0) + (group.nonVeg || 0),
          0
        );

        if (totalAttendees === 0) {
          toast.error("Please add at least one attendee");
          return false;
        }

        // Event participation
        fieldsToValidate.push("eventParticipation");

        // If participation details are required based on selection
        const eventParticipation = watch("eventParticipation") || [];
        if (
          eventParticipation.length > 0 &&
          !eventParticipation.includes("none") &&
          eventParticipation.some((option) => option !== "none")
        ) {
          fieldsToValidate.push("participationDetails");
        }
      }
    } else if (currentStep === 4) {
      // Sponsorship
      fieldsToValidate = ["interestedInSponsorship", "canReferSponsorship"];

      // If interested in sponsorship, require tier selection
      if (watch("interestedInSponsorship")) {
        fieldsToValidate.push("sponsorshipTier");
      }
    } else if (currentStep === 5) {
      // Transportation
      if (isAttending) {
        // Only validate if user opted to plan travel
        const planTravel = watch("planTravel");
        if (!planTravel) {
          return true; // Skip validation if travel planning is not selected
        }

        fieldsToValidate = [
          "startPincode",
          "pinDistrict",
          "pinState",
          "pinTaluk",
          "subPostOffice",
          "travelDate",
          "travelTime",
          "modeOfTransport",
        ];

        // If location details couldn't be fetched, require originArea
        if (!watch("pinDistrict") && watch("startPincode")?.length === 6) {
          fieldsToValidate.push("originArea");
        }

        // Mode of transport specific validations
        if (watch("modeOfTransport") === "car") {
          fieldsToValidate.push("readyForRideShare", "needParking");

          if (watch("readyForRideShare") === "yes") {
            fieldsToValidate.push("rideShareCapacity");
          }
        } else if (watch("modeOfTransport")) {
          fieldsToValidate.push("wantRideShare");

          if (watch("wantRideShare") === "yes") {
            fieldsToValidate.push("rideShareGroupSize");
          }
        }
      } else {
        return true;
      }
    } else if (currentStep === 6) {
      // Accommodation
      // Only validate if user opted to plan accommodation
      const planAccommodation = watch("planAccommodation");
      if (!planAccommodation) {
        return true; // Skip validation if accommodation planning is not selected
      }

      fieldsToValidate = ["accommodation"];

      if (accommodation === "provide") {
        fieldsToValidate.push(
          "accommodationPincode",
          "accommodationCapacity",
          "accommodationLocation"
        );

        // If location details couldn't be fetched, require accommodationArea
        if (
          !watch("accommodationDistrict") &&
          watch("accommodationPincode")?.length === 6
        ) {
          fieldsToValidate.push("accommodationArea");
        }
      }
    } else if (currentStep === 7) {
      // Optional fields - no required validation
      return true;
    } else if (currentStep === 8) {
      // Financial contribution
      fieldsToValidate = ["willContribute"];

      if (watch("willContribute") && !hasPreviousContribution) {
        fieldsToValidate.push("contributionAmount");
      }
    }

    // Force validation on all fields regardless of touched state
    const validationResult = await trigger(fieldsToValidate, {
      shouldFocus: true,
    });

    if (!validationResult) {
      // Get all validation errors
      const errorFields = Object.keys(control._formState.errors);

      // Show specific error message for the first field that failed
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0];
        const errorMessage =
          control._formState.errors[firstErrorField]?.message;

        if (errorMessage) {
          toast.error(errorMessage);
        } else {
          toast.error(`Please check the field: ${firstErrorField}`);
        }

        // Focus on the first error field
        const errorElement = document.getElementsByName(firstErrorField)[0];
        if (errorElement) {
          errorElement.focus();
        }
      } else {
        // Generic error message
        toast.error("Please fill in all required fields correctly");
      }
    }

    return validationResult;
  };

  // Modify the handleNextStep function to create a new registration on first step
  const handleNextStep = async () => {
    const isStepValid = await validateCurrentStep();

    if (isStepValid) {
      // Save current step to backend before moving to next
      if (currentStep > 0) {
        // Skip saving verification step
        const formData = getValues();
        const stepData = getStepData(currentStep, formData);

        console.log(`Saving step ${currentStep} (${stepData._stepName}):`);
        console.log("- Current registration ID:", registrationId);
        console.log("- Form data:", formData);
        console.log(
          "- Structured section:",
          stepData.formDataStructured[stepData._stepName]
        );

        // For first step after verification, always create a new registration
        if (currentStep === 1) {
          // Clear any existing registration ID to force creation of a new one
          console.log(
            "First step - creating a new registration instead of updating"
          );
          setRegistrationId(null);
          localStorage.removeItem(`${storageKey}-id`);
        }

        const saveSuccess = await saveStepToBackend(currentStep, formData);

        if (!saveSuccess) {
          // Don't proceed if save failed
          return;
        }
      }

      // Mark current step as completed and proceed to next step
      setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
      setCurrentStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Update the save function to always use 'new' for first step
  const saveStepToBackend = async (stepNumber, formData) => {
    try {
      // Get step-specific data to send to backend
      const stepData = getStepData(stepNumber, formData);

      // For first step after verification, always create a new registration
      const idToUse = stepNumber === 1 ? "new" : registrationId || "new";
      console.log(`Saving step ${stepNumber} with ID:`, idToUse);

      const payload = {
        step: stepNumber,
        stepData,
        verificationToken,
      };

      // Send data to backend API
      const response = await registrationsApi.create(idToUse, payload);

      console.log("API response:", response);

      // Update registration ID if this is a new registration
      if (response.data?.registrationId) {
        const newId = response.data.registrationId;
        console.log("Setting registration ID:", newId);
        setRegistrationId(newId);
        localStorage.setItem(`${storageKey}-id`, newId);
      }

      // Show success toast
      toast.success(`Step ${stepNumber} saved successfully`);

      return true;
    } catch (error) {
      console.error("Error saving step:", error);

      // If registration not found, try creating a new one
      if (error.message === "Registration not found") {
        console.log("Attempting to create new registration instead of update");
        try {
          const response = await registrationsApi.create("new", {
            step: stepNumber,
            stepData: getStepData(stepNumber, formData),
            verificationToken,
          });

          if (response.data?.registrationId) {
            const newId = response.data.registrationId;
            console.log("Created new registration with ID:", newId);
            setRegistrationId(newId);
            localStorage.setItem(`${storageKey}-id`, newId);
            toast.success(`Step ${stepNumber} saved successfully`);
            return true;
          }
        } catch (retryError) {
          console.error("Error creating new registration:", retryError);
        }
      }

      // Handle different error types
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save this step. Please try again.");
      }

      return false;
    }
  };

  // Helper function to get step-specific data
  const getStepData = (stepNumber, formData) => {
    // Prepare basic structured data for all steps
    const structuredData = {
      registrationType: "Alumni",
      formDataStructured: {
        verification: {
          emailVerified: formData.emailVerified,
          captchaVerified: formData.captchaVerified,
          quizPassed: formData.verificationQuizPassed,
          email: formData.email,
          contactNumber: formData.contactNumber,
          paymentStatus: formData.paymentStatus,
        },
        personalInfo: {
          name: formData.name,
          email: formData.email,
          contactNumber: formData.contactNumber,
          whatsappNumber: formData.whatsappNumber,
          school: formData.school,
          yearOfPassing: formData.yearOfPassing,
          country: formData.country,
          stateUT: formData.stateUT,
          district: formData.district,
          bloodGroup: formData.bloodGroup,
        },
        professional: {
          profession: formData.profession,
          professionalDetails: formData.professionalDetails,
          areaOfExpertise: formData.areaOfExpertise,
          keySkills: formData.keySkills,
        },
        eventAttendance: {
          isAttending: formData.isAttending,
          attendees: formData.attendees,
          eventContribution: formData.eventContribution,
          contributionDetails: formData.contributionDetails,
          eventParticipation: formData.eventParticipation,
          participationDetails: formData.participationDetails,
        },
        sponsorship: {
          interestedInSponsorship: formData.interestedInSponsorship,
          canReferSponsorship: formData.canReferSponsorship,
          sponsorshipTier: formData.sponsorshipTier,
          sponsorshipDetails: formData.sponsorshipDetails,
        },
        transportation: {
          planTravel: formData.planTravel,
          travelConsistsTwoSegments: formData.travelConsistsTwoSegments,
          startingLocation: formData.startingLocation,
          startPincode: formData.startPincode,
          pinDistrict: formData.pinDistrict,
          pinState: formData.pinState,
          pinTaluk: formData.pinTaluk,
          subPostOffice: formData.subPostOffice,
          originArea: formData.originArea,
          nearestLandmark: formData.nearestLandmark,
          travelDate: formData.travelDate,
          travelTime: formData.travelTime,
          modeOfTransport: formData.modeOfTransport,
          readyForRideShare: formData.readyForRideShare,
          rideShareCapacity: formData.rideShareCapacity,
          needParking: formData.needParking,
          wantRideShare: formData.wantRideShare,
          rideShareGroupSize: formData.rideShareGroupSize,
          travelSpecialRequirements: formData.travelSpecialRequirements,
        },
        accommodation: {
          planAccommodation: formData.planAccommodation,
          accommodation: formData.accommodation,
          accommodationGender: formData.accommodationGender,
          accommodationNeeded: formData.accommodationNeeded,
          accommodationCapacity: formData.accommodationCapacity,
          accommodationLocation: formData.accommodationLocation,
          accommodationRemarks: formData.accommodationRemarks,
          accommodationPincode: formData.accommodationPincode,
          accommodationDistrict: formData.accommodationDistrict,
          accommodationState: formData.accommodationState,
          accommodationTaluk: formData.accommodationTaluk,
          accommodationLandmark: formData.accommodationLandmark,
          accommodationSubPostOffice: formData.accommodationSubPostOffice,
          accommodationArea: formData.accommodationArea,
        },
        optional: {
          spouseNavodayan: formData.spouseNavodayan,
          unmaFamilyGroups: formData.unmaFamilyGroups,
          mentorshipOptions: formData.mentorshipOptions,
          trainingOptions: formData.trainingOptions,
          seminarOptions: formData.seminarOptions,
          tshirtInterest: formData.tshirtInterest,
          tshirtSizes: formData.tshirtSizes,
        },
        financial: {
          willContribute: formData.willContribute,
          contributionAmount:
            totalContributionAmount || formData.contributionAmount,
          proposedAmount: formData.proposedAmount,
          registrationStatus: formData.registrationStatus,
          paymentStatus: formData.paymentStatus,
          paymentId: formData.paymentId,
          paymentDetails: formData.paymentDetails,
          paymentRemarks: formData.paymentRemarks,
        },
      },
    };

    // For financial step, ensure the contribution amount is correctly set
    if (stepNumber === 8) {
      structuredData.formDataStructured.financial.contributionAmount =
        totalContributionAmount || formData.contributionAmount;
    }

    // For logging purposes only
    const stepNames = {
      1: "personalInfo",
      2: "professional",
      3: "eventAttendance",
      4: "sponsorship",
      5: "transportation",
      6: "accommodation",
      7: "optional",
      8: "financial",
    };

    // Return data with metadata for logging
    return {
      ...structuredData,
      _stepName: stepNames[stepNumber] || "verification", // For console logging only
    };
  };

  // Handle back button click
  const handleBackStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  // Handle step navigation from step indicator
  const handleStepNavigation = async (targetStep) => {
    // Don't allow navigation to future steps that haven't been completed
    if (targetStep > currentStep && !completedSteps.includes(targetStep)) {
      return;
    }

    // If going to a previous step, just navigate
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      window.scrollTo(0, 0);
      return;
    }

    // If going to the next step, validate current step first
    if (targetStep === currentStep + 1) {
      const isStepValid = await validateCurrentStep();
      if (isStepValid) {
        // Save current step to backend before moving
        if (currentStep > 0) {
          const formData = getValues();
          const saveSuccess = await saveStepToBackend(currentStep, formData);
          if (!saveSuccess) {
            return;
          }
        }

        // Mark current step as completed and move to target step
        setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
        setCurrentStep(targetStep);
        window.scrollTo(0, 0);
      }
    } else {
      // Direct navigation to completed step
      setCurrentStep(targetStep);
      window.scrollTo(0, 0);
    }
  };

  // Modify the onSubmit function to use the registration ID
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting registration data:", data);

      // Save final step
      const saveSuccess = await saveStepToBackend(currentStep, data);

      if (!saveSuccess) {
        setIsSubmitting(false);
        return;
      }

      // Clear saved data
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}-step`);
      localStorage.removeItem(`${storageKey}-completed`);
      localStorage.removeItem(`${storageKey}-token`);
      localStorage.removeItem(`${storageKey}-id`);

      // Show success message
      toast.success("🎉 Registration completed successfully!");

      // Use direct window location change for reliable redirect
      setTimeout(() => {
        window.location.href = "/registration-success";
      }, 1000); // Small delay to ensure toast is visible
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Fix the handleSubmitForm function
  const handleSubmitForm = async () => {
    if (!hasPreviousContribution) {
      toast.error(
        "Please complete your contribution payment before submitting"
      );
      return;
    }

    try {
      // Get form data
      const formData = getValues();
      console.log("Submitting form with data:", formData);

      // Directly call onSubmit with form data
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please try again.");
    }
  };

  // Fix the payment processing and form submission
  const proceedWithPayment = async (contributionAmount) => {
    // Make sure we have a registration ID
    if (!registrationId) {
      toast.error(
        "Please complete at least the first step of the form before making a payment"
      );
      return;
    }

    await initiatePayment({
      amount: contributionAmount,
      name: watch("name"),
      email: watch("email"),
      contact: watch("contactNumber"),
      notes: {
        registrationType: "Alumni",
        isAttending: isAttending ? "Yes" : "No",
        registrationId: registrationId,
      },
      onSuccess: async (response) => {
        // Process payment confirmation with backend
        let payload = {
          amount: contributionAmount,
          paymentMethod: "razorpay",
          paymentGatewayResponse: response,
          purpose: "registration",
        };
        try {
          await registrationsApi.transactionRegister(registrationId, payload);

          // Calculate cumulative contribution
          const newTotalAmount =
            Number(totalContributionAmount) + Number(contributionAmount);
          setTotalContributionAmount(newTotalAmount);

          // Update local form state
          setValue("paymentStatus", "Completed");
          setValue("paymentId", response.razorpay_payment_id);
          setValue("paymentDetails", JSON.stringify(response));
          setHasPreviousContribution(true);
          setPreviousContributionAmount(newTotalAmount);
          setValue("contributionAmount", 0);
          setValue("totalContributionAmount", newTotalAmount);

          // Show success toast with total contribution
          toast.success(
            `Payment of ₹${contributionAmount} successful! Your total contribution is now ₹${newTotalAmount}`
          );

          // Save the payment info to backend
          await saveStepToBackend(8, {
            ...getValues(),
            contributionAmount: newTotalAmount,
          });
        } catch (error) {
          console.error("Error confirming payment:", error);
          toast.error(
            "Payment was processed but confirmation failed. Please contact support."
          );
        }
      },
      onFailure: (error) => {
        console.error("Payment failed:", error);
        toast.error("Payment failed. Please try again.");
      },
    });
  };

  // Add useEffect to show mission message when entering financial step
  useEffect(() => {
    if (currentStep === 8) {
      setShowMissionMessage(true);
    }
  }, [currentStep]);

  // Handle skipping optional step
  const handleSkipOptional = () => {
    // Clear all optional fields
    setValue("spouseNavodayan", "");
    setValue("unmaFamilyGroups", "No");
    setValue("mentorshipOptions", []);
    setValue("trainingOptions", []);
    setValue("seminarOptions", []);
    setValue("tshirtInterest", "no");
    setValue("tshirtSizes", DEFAULT_TSHIRT_SIZES);

    // Move to next step
    setCurrentStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
  };

  // Add the handlePayment function
  const handlePayment = async () => {
    try {
      const contributionAmount = watch("contributionAmount") || 0;

      // Check if amount is valid
      if (contributionAmount <= 0) {
        toast.error("Please enter a valid contribution amount");
        return;
      }

      // Skip expense comparison for additional contributions
      if (!hasPreviousContribution) {
        const attendees = watch("attendees");
        const adultCount =
          (attendees?.adults?.veg || 0) + (attendees?.adults?.nonVeg || 0);
        const teenCount =
          (attendees?.teens?.veg || 0) + (attendees?.teens?.nonVeg || 0);
        const childCount =
          (attendees?.children?.veg || 0) + (attendees?.children?.nonVeg || 0);

        const totalExpense =
          adultCount * 500 + teenCount * 350 + childCount * 150;
        setValue("proposedAmount", totalExpense);

        if (
          isAttending &&
          contributionAmount > 0 &&
          contributionAmount < totalExpense
        ) {
          setShowFinancialDifficultyDialog(true);
          return;
        }
      }

      await proceedWithPayment(contributionAmount);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <>
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-blue-600 hover:underline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to Registration Type
      </button>

      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepNavigation}
        completedSteps={completedSteps}
      />

      <form className="space-y-4 sm:space-y-6">
        {/* Verification Step */}
        {currentStep === 0 && (
          <>
            {/* Special schools information box */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    <strong>
                      A Note for Alumni from JNV Alappuzha, JNV Malappuram, and
                      JNV Thrissur
                    </strong>
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      The registration process of JNV Alappuzha, JNV Malappuram,
                      and JNV Thrissur are routed through the respective alumni
                      association as per the decision of these associations.
                      Alumni from these schools are requested to contact your
                      alumni leadership.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <FormSection title="Contact Verification">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                control={control}
                errors={errors}
                required={true}
                disabled={emailVerified}
              />
              <label
                htmlFor="contactNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Whatsapp Number
              </label>
              <PhoneInput
                country={"in"}
                value={watch("contactNumber")}
                onChange={(value) => setValue("contactNumber", value)}
                inputProps={{
                  name: "contactNumber",
                  required: true,
                  className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contactNumber ? "border-red-500" : "border-gray-300"
                  }`,
                }}
                containerClass="phone-input"
                buttonClass="border-gray-300"
                dropdownClass="country-dropdown"
                searchClass="country-search"
                searchPlaceholder="Search country..."
                enableSearch={true}
                disableSearchIcon={false}
                searchNotFound="No country found"
                specialLabel=""
                enableLongNumbers={true}
                countryCodeEditable={false}
                disabled={emailVerified}
                preferredCountries={["in", "us", "gb", "ae"]}
              />
              {errors.contactNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contactNumber.message}
                </p>
              )}

              {!emailVerified &&
                email &&
                email.includes("@") &&
                watch("contactNumber") && (
                  <OtpInput
                    onVerify={(status, token, id) =>
                      handleEmailVerified(status, token, id)
                    }
                    email={email}
                    phone={watch("contactNumber")}
                    isEnabled={
                      isValidEmail(email) &&
                      isValidPhoneNumber(watch("contactNumber"))
                    }
                  />
                )}

              {emailVerified && (
                <div className="flex items-center gap-2 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-800 font-medium">
                    Email & Phone Verified
                  </span>
                </div>
              )}

              {!captchaVerified && (
                <CaptchaVerification onVerify={handleCaptchaVerified} />
              )}

              {captchaVerified && (
                <div className="flex items-center gap-2 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-800 font-medium">
                    CAPTCHA Verified
                  </span>
                </div>
              )}
            </FormSection>

            <FormSection title="Navodayan Quiz">
              {!quizCompleted && (
                <VerificationQuiz onQuizComplete={handleQuizComplete} />
              )}

              {quizCompleted && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-green-800 font-medium">
                    Background Verification Completed
                  </span>
                </div>
              )}
            </FormSection>
          </>
        )}

        {/* Personal Information Step */}
        {currentStep === 1 && (
          <FormSection title="Personal Information">
            <FormField
              label="Full Name"
              name="name"
              type="text"
              control={control}
              errors={errors}
              required={true}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Whatsapp Number
              </label>
              <PhoneInput
                country={"in"}
                value={watch("contactNumber")}
                onChange={(value) => setValue("contactNumber", value)}
                inputProps={{
                  name: "contactNumber",
                  required: true,
                  className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contactNumber ? "border-red-500" : "border-gray-300"
                  }`,
                }}
                containerClass="phone-input"
                buttonClass="border-gray-300"
                dropdownClass="country-dropdown"
                searchClass="country-search"
                searchPlaceholder="Search country..."
                enableSearch={true}
                disableSearchIcon={false}
                searchNotFound="No country found"
                specialLabel=""
                disabled={emailVerified}
                enableLongNumbers={true}
                countryCodeEditable={false}
                preferredCountries={["in", "us", "gb", "ae"]}
              />
              {errors.contactNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.contactNumber.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number (if different from whatsapp number)
              </label>
              <PhoneInput
                country={"in"}
                value={watch("whatsappNumber")}
                onChange={(value) => setValue("whatsappNumber", value)}
                inputProps={{
                  name: "whatsappNumber",
                  className: `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.whatsappNumber ? "border-red-500" : "border-gray-300"
                  }`,
                }}
                containerClass="phone-input"
                buttonClass="border-gray-300"
                dropdownClass="country-dropdown"
                searchClass="country-search"
                searchPlaceholder="Search country..."
                enableSearch={true}
                disableSearchIcon={false}
                searchNotFound="No country found"
                specialLabel=""
                enableLongNumbers={true}
                countryCodeEditable={false}
                preferredCountries={["in", "us", "gb", "ae"]}
              />
              {errors.whatsappNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.whatsappNumber.message}
                </p>
              )}
            </div>

            <FormField
              label="Blood Group (for emergencies)"
              name="bloodGroup"
              type="select"
              required={true}
              control={control}
              errors={errors}
              options={[
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
                { value: "Others", label: "Others" },
              ]}
            />

            <FormField
              label=" JNV"
              name="school"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={jnvSchools}
            />

            <FormField
              label="Year of Passing 12th grade (this is to find out your batch)"
              name="yearOfPassing"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={Array.from({ length: 2026 - 1993 }, (_, i) => {
                const year = 1993 + i;
                return { value: year.toString(), label: year.toString() };
              })}
            />

            <FormField
              label="Current country of residence"
              name="country"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={countryOptions}
              onChange={(value) => {
                setValue("country", value);
                if (value !== "IN") {
                  setValue("stateUT", null);
                  setValue("district", null);
                  // Also trigger validation for the cleared fields
                  trigger(["stateUT", "district"]);
                }
                trigger("country");
              }}
              placeholder="Select your country"
              isSearchable={true}
              isClearable={false}
              className="react-select-container"
              classNamePrefix="react-select"
            />

            {watch("country") === "IN" && (
              <FormField
                label="Current State/UT of residence"
                name="stateUT"
                type="select"
                control={control}
                errors={errors}
                required={true}
                options={indianStatesOptions}
                placeholder="Select your state/UT"
                onChange={(value) => {
                  setValue("stateUT", value);
                  // Clear district when state changes
                  if (value !== "Kerala") {
                    setValue("district", null);
                    trigger("district");
                  }
                  // Trigger validation
                  trigger("stateUT");
                }}
              />
            )}

            {watch("stateUT") === "Kerala" && watch("country") === "IN" && (
              <FormField
                label="Current District of residence"
                name="district"
                type="select"
                control={control}
                errors={errors}
                required={true}
                options={KERALA_DISTRICTS}
                placeholder="Select your district"
                onChange={(value) => {
                  setValue("district", value);
                  // Trigger validation
                  trigger("district");
                }}
              />
            )}
          </FormSection>
        )}

        {/* Professional Information Step */}
        {currentStep === 2 && (
          <FormSection title="Professional Information">
            <FormField
              label="Current Profession"
              name="profession"
              type="select"
              control={control}
              errors={errors}
              options={PROFESSION_OPTIONS}
              placeholder="Select your profession"
            />

            {profession && profession !== "Student" && (
              <FormField
                label="Professional Details"
                name="professionalDetails"
                type="textarea"
                control={control}
                errors={errors}
                placeholder="Please provide details about your profession, role, and experience"
              />
            )}

            <FormField
              label="Area of Expertise"
              name="areaOfExpertise"
              type="text"
              control={control}
              errors={errors}
              placeholder="e.g., Engineering, Medicine, Finance, etc."
            />

            <FormField
              label="Key Skills"
              name="keySkills"
              type="textarea"
              control={control}
              errors={errors}
              placeholder="Please list your key professional skills"
            />
          </FormSection>
        )}

        {/* Event Attendance Step */}
        {currentStep === 3 && (
          <FormSection title="Event Attendance">
            <div className="space-y-6">
              <FormField
                label="Will you attend the event?"
                name="isAttending"
                type="checkbox"
                control={control}
                errors={errors}
              />

              {isAttending && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-600">
                        Please indicate the number of attendees in each age
                        group and their food preferences. This will help us plan
                        the seating and catering arrangements accordingly.
                      </p>
                    </div>
                    {/* TODO: add a note here add toddler count as well as veg non veg based on age */}
                    <AttendeeCounter
                      values={
                        watch("attendees") || {
                          adults: { veg: 0, nonVeg: 0 },
                          teens: { veg: 0, nonVeg: 0 },
                          children: { veg: 0, nonVeg: 0 },
                          toddlers: { veg: 0, nonVeg: 0 },
                        }
                      }
                      onChange={(newValues) => {
                        setValue("attendees", newValues, {
                          shouldValidate: true,
                        });
                      }}
                    />

                    <hr />

                    <div className="space-y-4 mt-8">
                      <h3 className="text-lg font-medium text-gray-900">
                        <strong>
                          Your interest in additional offerings during the meet
                        </strong>
                      </h3>
                      <hr />
                      <FormField
                        label="What would you like to do additionally during the meet?"
                        name="eventParticipation"
                        type="multiselect"
                        control={control}
                        errors={errors}
                        options={EVENT_PARTICIPATION_OPTIONS}
                      />

                      <FormField
                        label="Please explain your proposal in detail"
                        name="participationDetails"
                        type="textarea"
                        control={control}
                        errors={errors}
                        placeholder="Provide detailed information about your proposed offering, including any specific requirements, duration, space needed, etc."
                        rows={4}
                      />
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800 text-sm">
                          <strong>
                            Note: Kindly note that this is purely for the
                            purpose of planning. Your interest for additional
                            offering will be considered based on the
                            requirements and other logistics factors(time, space
                            etc.) for inclusion.
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </FormSection>
        )}

        {/* Sponsorship Step */}
        {currentStep === 4 && (
          <FormSection title="Sponsorship">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Would you be interested in sponsoring the event? We offer
                various sponsorship tiers with different benefits and visibility
                levels.
              </p>
              <div className="space-y-4">
                <FormField
                  label="Interested in Sponsorship"
                  name="interestedInSponsorship"
                  type="checkbox"
                  control={control}
                  errors={errors}
                />

                <FormField
                  label="I can refer Sponsorship/Advertisement (refer and earn attractive incentives)"
                  name="canReferSponsorship"
                  type="checkbox"
                  control={control}
                  errors={errors}
                />
              </div>
            </div>

            {(watch("interestedInSponsorship") ||
              watch("canReferSponsorship")) && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 text-sm">
                    The organizing team will contact you directly to discuss the
                    details and process.
                  </p>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600">
                    Please select your preferred sponsorship tier. Our team will
                    contact you directly to discuss the details and process.
                  </p>
                </div>

                <SponsorshipCards
                  selectedTier={watch("sponsorshipTier")}
                  onSelectTier={(tier) => setValue("sponsorshipTier", tier)}
                />

                <div className="mt-6">
                  <FormField
                    label="Additional Sponsorship Details"
                    name="sponsorshipDetails"
                    type="textarea"
                    control={control}
                    errors={errors}
                    placeholder="Any specific requirements or questions about sponsorship"
                  />
                </div>
              </>
            )}
          </FormSection>
        )}

        {/* Transportation Step */}
        {currentStep === 5 && isAttending && (
          <FormSection title="Transportation Details">
            <div className="space-y-6">
              <div className="flex items-start mb-4">
                <div className="flex items-center h-5">
                  <input
                    id="planTravel"
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={watch("planTravel")}
                    onChange={(e) => setValue("planTravel", e.target.checked)}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="planTravel"
                    className="font-medium text-gray-900"
                  >
                    Plan your travel for UNMA Meet 2025
                  </label>
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-blue-800 text-sm">
                      This information will help us organize group
                      transportation and ride sharing from your area. Both those
                      who can offer ride sharing, and those in need of it are
                      encouraged to fill these details. Later, you will have
                      opportunity to update the changes, if any, in your plan.
                      Also, we will coordinate special bookings based on the
                      number of alumni from each area.
                    </p>
                  </div>
                </div>
              </div>

              {watch("planTravel") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Question 1: Does your travel consist of 2 segments? */}
                  <FormField
                    label="Does your travel consist of 2 segments? (one from the city you are travelling to Kerala, second from a town in Kerala to the venue)"
                    name="travelConsistsTwoSegments"
                    type="select"
                    control={control}
                    errors={errors}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />

                  {/* Question 2: Starting Location */}
                  <FormField
                    label="Starting Location"
                    name="startingLocation"
                    type="text"
                    control={control}
                    errors={errors}
                    placeholder="Enter city/town name (use official names)"
                    helperText="Please use official names of the location for better coordination"
                  />

                  {/* Question 3: Expected Travel Date */}
                  <FormField
                    label="Expected Travel Date"
                    name="travelDate"
                    type="date"
                    control={control}
                    errors={errors}
                    min={new Date().toISOString().split("T")[0]}
                    className="date-picker"
                  />

                  {/* Question 4: Would you like to connect with other Navodayans */}
                  <FormField
                    label="Would you like to connect with other Navodayans from your starting point for better planning?"
                    name="connectWithNavodayans"
                    type="select"
                    control={control}
                    errors={errors}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />

                  {/* Transportation to Venue Section */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Transportation to Venue
                    </h3>

                    {/* Question 5: Would you like to connect with other Navodayans for car pooling */}
                    <div className="space-y-4">
                      <FormField
                        label="Would you like to connect with other Navodayans from your starting point for better planning or for car pooling/sharing?"
                        name="readyForRideShare"
                        type="select"
                        control={control}
                        errors={errors}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" },
                        ]}
                      />

                      {/* Question 6: Starting location pincode */}
                      <FormField
                        label="Starting Location Pincode"
                        name="startPincode"
                        type="text"
                        control={control}
                        errors={errors}
                        placeholder="Enter your starting location pincode"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        onChange={async (e) => {
                          const pincodeValue = e.target.value;
                          if (pincodeValue.length === 6) {
                            try {
                              // Show loading state
                              toast.info("Fetching location details...", {
                                autoClose: false,
                                closeButton: false,
                                isLoading: true,
                              });

                              const data = await getPincodeDetails(
                                pincodeValue
                              );

                              if (
                                data &&
                                data[0] &&
                                data[0].Status === "Success" &&
                                data[0].PostOffice &&
                                data[0].PostOffice.length > 0
                              ) {
                                const postOffice = data[0].PostOffice[0];

                                setValue("pinDistrict", postOffice.District);
                                setValue("pinState", postOffice.State);
                                setValue(
                                  "pinTaluk",
                                  postOffice.Block || postOffice.District
                                );

                                // Show success message with location details
                                toast.dismiss();
                                toast.success(
                                  `Location found: ${postOffice.District}, ${postOffice.State}`
                                );
                              } else {
                                // Clear the values if pincode is invalid
                                setValue("pinDistrict", "");
                                setValue("pinState", "");
                                setValue("pinTaluk", "");
                                toast.dismiss();
                                toast.error(
                                  "Invalid pincode or location not found"
                                );
                              }
                            } catch (error) {
                              // Clear the values if there's an error
                              setValue("pinDistrict", "");
                              setValue("pinState", "");
                              setValue("pinTaluk", "");
                              toast.dismiss();
                              toast.error(
                                "Error fetching location details. Please try again."
                              );
                            }
                          } else {
                            // Clear the values if pincode is not 6 digits
                            setValue("pinDistrict", "");
                            setValue("pinState", "");
                            setValue("pinTaluk", "");
                          }
                        }}
                      />

                      {/* Question 7: Mode of Transport */}
                      <FormField
                        label="Mode of Transport"
                        name="modeOfTransport"
                        type="select"
                        control={control}
                        errors={errors}
                        options={[
                          { value: "bus", label: "Bus" },
                          { value: "boat", label: "Boat/Ship" },
                          { value: "car", label: "Car" },
                          { value: "flight", label: "Flight" },
                          { value: "train", label: "Train" },
                          { value: "two-wheeler", label: "Two Wheeler" },
                          {
                            value: "sharing",
                            label: "Looking for Shared Transportation/Lift",
                          },
                          { value: "other", label: "Other" },
                        ]}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Nearest Landmark"
                          name="nearestLandmark"
                          type="text"
                          control={control}
                          errors={errors}
                          placeholder="e.g., Railway Station, Bus Stand, etc."
                        />

                        <FormField
                          label="Start Time"
                          name="travelTime"
                          type="time"
                          control={control}
                          errors={errors}
                          className="time-picker"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Display location details if pincode is valid */}
                  {watch("startPincode")?.length === 6 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Location Details
                      </h4>
                      {watch("pinDistrict") && watch("pinState") ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">District</p>
                            <p className="text-sm font-medium">
                              {watch("pinDistrict")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Taluk/Block</p>
                            <p className="text-sm font-medium">
                              {watch("pinTaluk")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">State</p>
                            <p className="text-sm font-medium">
                              {watch("pinState")}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-red-600">
                            Invalid pincode or location not found
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional questions based on transport mode and ride sharing preference */}
                  <div className="space-y-4">
                    {/* Question 8: For those who have their own vehicle */}
                    {(watch("modeOfTransport") === "car" ||
                      watch("modeOfTransport") === "two-wheeler") && (
                      <div className="space-y-4">
                        <FormField
                          label="Will you need parking at venue?"
                          name="needParking"
                          type="select"
                          control={control}
                          errors={errors}
                          options={[
                            { value: "yes", label: "Yes" },
                            { value: "no", label: "No" },
                          ]}
                        />

                        {watch("readyForRideShare") === "yes" && (
                          <FormField
                            label="How many people can you accommodate in your vehicle (Car/Two wheeler)?"
                            name="vehicleCapacity"
                            type="number"
                            control={control}
                            errors={errors}
                            min={1}
                            max={6}
                            helperText="Including yourself, how many total people can travel in your vehicle?"
                          />
                        )}
                      </div>
                    )}

                    {/* Question 9: For those looking for shared transportation */}
                    {watch("modeOfTransport") === "sharing" && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">
                          Looking for Shared Transportation
                        </h4>
                        <p className="text-blue-700 text-sm mb-4">
                          You've indicated you're looking for shared
                          transportation. We'll connect you with other alumni
                          who can provide rides from your area.
                        </p>
                        <FormField
                          label="How many people along with you (including you) who needs transportation to venue?"
                          name="groupSize"
                          type="number"
                          control={control}
                          errors={errors}
                          min={1}
                          max={10}
                          helperText="Total number of people in your group who need transportation"
                        />
                      </div>
                    )}

                    {/* Question 16: For other transport modes */}
                    {watch("modeOfTransport") &&
                      !["car", "two-wheeler", "sharing"].includes(
                        watch("modeOfTransport")
                      ) && (
                        <FormField
                          label="How many people along with you (including you) who needs transportation to venue?"
                          name="groupSize"
                          type="number"
                          control={control}
                          errors={errors}
                          min={1}
                          max={10}
                          helperText="Total number of people in your group"
                        />
                      )}
                  </div>

                  <FormField
                    label="Special Requirements for Travel"
                    name="travelSpecialRequirements"
                    type="textarea"
                    control={control}
                    errors={errors}
                    placeholder="Any specific requirements for travel (e.g., wheelchair access, medical conditions, etc.)"
                  />

                  {/* Show potential group information */}
                  {watch("connectWithNavodayans") === "yes" && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Group Travel Information
                      </h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          Based on your location and preferences, we'll:
                        </p>
                        <ul className="list-disc list-inside text-blue-800 text-sm mt-2 space-y-1">
                          <li>Group you with other alumni from your area</li>
                          <li>Coordinate group transportation arrangements</li>
                          <li>Share travel details once the group is formed</li>
                          <li>
                            Provide pickup points based on the group's location
                          </li>
                          {(watch("modeOfTransport") === "car" ||
                            watch("modeOfTransport") === "two-wheeler") &&
                            watch("readyForRideShare") === "yes" && (
                              <li>
                                Coordinate ride sharing with other alumni in
                                your area
                              </li>
                            )}
                          {watch("modeOfTransport") === "sharing" && (
                            <li>
                              Connect you with alumni who can provide rides from
                              your starting point
                            </li>
                          )}
                          {watch("modeOfTransport") &&
                            !["car", "two-wheeler", "sharing"].includes(
                              watch("modeOfTransport")
                            ) && (
                              <li>
                                Arrange shared transportation from your starting
                                point
                              </li>
                            )}
                        </ul>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </FormSection>
        )}

        {/* Accommodation Step */}
        {currentStep === 6 && isAttending && (
          <FormSection title="Accommodation Arrangements">
            <div className="space-y-6">
              <div className="flex items-start mb-4">
                <div className="flex items-center h-5">
                  <input
                    id="planAccommodation"
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={watch("planAccommodation")}
                    onChange={(e) =>
                      setValue("planAccommodation", e.target.checked)
                    }
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="planAccommodation"
                    className="font-medium text-gray-900"
                  >
                    Accommodation planning for UNMA Meet 2025
                  </label>
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-blue-800 text-sm">
                      This information will assist us in coordinating
                      accommodation arrangements for participants attending the
                      meet. We kindly request both those in need of
                      accommodation and those willing to provide accommodation
                      to submit their details accordingly. Later, you will have
                      an opportunity to update the changes, if any, in your plan
                    </p>
                  </div>
                </div>
              </div>

              {watch("planAccommodation") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <FormField
                    label="Accommodation Preference"
                    name="accommodation"
                    type="select"
                    control={control}
                    errors={errors}
                    // required={true}
                    options={[
                      {
                        value: "not-required",
                        label: "I don't need accommodation",
                      },
                      {
                        value: "provide",
                        label:
                          "I can provide accommodation to others at my place",
                      },
                      {
                        value: "need",
                        label:
                          "Connect me with alumni who can provide accommodation ",
                      },
                      {
                        value: "discount-hotel",
                        label: "I need discounted hotel booking",
                      },
                    ]}
                  />

                  {accommodation === "provide" && (
                    <>
                      <FormField
                        label="Gender Preference for Accommodation"
                        name="accommodationGender"
                        type="select"
                        control={control}
                        errors={errors}
                        options={[
                          { value: "male-only", label: "Male only" },
                          { value: "female-only", label: "Female only" },
                          { value: "anyone", label: "Anyone" },
                        ]}
                        placeholder="Select gender preference"
                      />

                      {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800 text-sm">
                          Note: The accommodation must be within 25 km radius of
                          CIAL Convention Center (our venue) to be considered
                          for group arrangements.
                        </p>
                      </div> */}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Accommodation Location Pincode"
                          name="accommodationPincode"
                          type="text"
                          control={control}
                          errors={errors}
                          // required={true}
                          placeholder="Enter your accommodation location pincode"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          onChange={async (e) => {
                            const pincodeValue = e.target.value;
                            if (pincodeValue.length === 6) {
                              try {
                                // Show loading state
                                toast.info("Fetching location details...", {
                                  autoClose: false,
                                  closeButton: false,
                                  isLoading: true,
                                });

                                const data = await getPincodeDetails(
                                  pincodeValue
                                );

                                if (
                                  data &&
                                  data[0] &&
                                  data[0].Status === "Success" &&
                                  data[0].PostOffice &&
                                  data[0].PostOffice.length > 0
                                ) {
                                  const postOffice = data[0].PostOffice[0];

                                  setValue(
                                    "accommodationDistrict",
                                    postOffice.District
                                  );
                                  setValue(
                                    "accommodationState",
                                    postOffice.State
                                  );
                                  setValue(
                                    "accommodationTaluk",
                                    postOffice.Block || postOffice.District
                                  );
                                  //array of sub post offices
                                  const subPostOffices =
                                    data[0].PostOffice.filter(
                                      (office) =>
                                        office.BranchType === "Sub Post Office"
                                    );

                                  // If you want only names of sub post offices:
                                  const subPostOfficeNames = subPostOffices.map(
                                    (office) => office.Name
                                  );

                                  // Example: set subPostOffice as an array of names
                                  setValue(
                                    "accommodationSubPostOffice",
                                    subPostOfficeNames[0]
                                  );

                                  // Show success message with location details
                                  toast.dismiss();
                                  toast.success(
                                    `Location found: ${postOffice.District}, ${postOffice.State}`
                                  );
                                } else {
                                  // Clear the values if pincode is invalid
                                  setValue("accommodationDistrict", "");
                                  setValue("accommodationState", "");
                                  setValue("accommodationTaluk", "");
                                  setValue("accommodationSubPostOffice", "");
                                  toast.dismiss();
                                  toast.error(
                                    "Invalid pincode or location not found"
                                  );
                                }
                              } catch (error) {
                                // Clear the values if there's an error
                                setValue("accommodationDistrict", "");
                                setValue("accommodationState", "");
                                setValue("accommodationTaluk", "");
                                setValue("accommodationSubPostOffice", "");
                                toast.dismiss();
                                toast.error(
                                  "Error fetching location details. Please try again."
                                );
                              }
                            } else {
                              // Clear the values if pincode is not 6 digits
                              setValue("accommodationDistrict", "");
                              setValue("accommodationState", "");
                              setValue("accommodationTaluk", "");
                              setValue("accommodationSubPostOffice", "");
                              // Don't show any message for incomplete pincode
                            }
                          }}
                        />

                        <FormField
                          label="Nearest Landmark"
                          name="accommodationLandmark"
                          type="text"
                          control={control}
                          errors={errors}
                          placeholder="e.g., Railway Station, Bus Stand, etc."
                        />
                      </div>

                      {/* Display location details if pincode is valid */}
                      {watch("accommodationPincode")?.length === 6 && (
                        <div className="bg-gray-50 p-4 rounded-lg mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Location Details
                          </h4>
                          {watch("accommodationDistrict") &&
                          watch("accommodationState") ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  District
                                </p>
                                <p className="text-sm font-medium">
                                  {watch("accommodationDistrict")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Taluk/Block
                                </p>
                                <p className="text-sm font-medium">
                                  {watch("accommodationTaluk")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">State</p>
                                <p className="text-sm font-medium">
                                  {watch("accommodationState")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  Sub Post Office
                                </p>
                                <p className="text-sm font-medium">
                                  {watch("accommodationSubPostOffice")}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <p className="text-sm text-red-600">
                                Invalid pincode or location not found
                              </p>
                              <FormField
                                label="Please enter your accommodation area details"
                                name="accommodationArea"
                                type="text"
                                control={control}
                                errors={errors}
                                // required={true}
                                placeholder="Enter your city/town name"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <FormField
                        label="How many people can you accommodate?"
                        name="accommodationCapacity"
                        type="number"
                        control={control}
                        errors={errors}
                        // required={true}
                        min={1}
                        valueAsNumber={true}
                      />

                      <FormField
                        label="Your Accommodation Location"
                        name="accommodationLocation"
                        type="text"
                        control={control}
                        errors={errors}
                        // required={true}
                        placeholder="Enter the exact location/address of your accommodation"
                      />
                    </>
                  )}

                  {accommodation === "need" && (
                    <>
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">
                            Please specify how many people need accommodation by
                            gender. This helps us match you with appropriate
                            accommodation providers.
                          </p>
                        </div>

                        <AccommodationGenderCounter
                          values={
                            watch("accommodationNeeded") || {
                              male: 0,
                              female: 0,
                            }
                          }
                          onChange={(newValues) => {
                            setValue("accommodationNeeded", newValues, {
                              shouldValidate: true,
                            });
                          }}
                        />
                      </div>
                    </>
                  )}

                  {accommodation != "not-required" && (
                    <FormField
                      label="Additional Accommodation Remarks"
                      name="accommodationRemarks"
                      type="textarea"
                      control={control}
                      errors={errors}
                      placeholder="Any specific accommodation requirements or information"
                    />
                  )}
                </motion.div>
              )}
            </div>
          </FormSection>
        )}

        {/* Optional Details Step */}
        {currentStep === 7 && (
          <FormSection title="Optional Information">
            <div className="space-y-6">
              {/* Spouse Navodayan */}

              {/* UNMA Family Groups */}
              <FormField
                label="Are you part of UNMA family whatsapp groups?"
                name="unmaFamilyGroups"
                type="select"
                control={control}
                errors={errors}
                // required={true}
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
              />

              {/* Mentorship Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Groups you can mentor
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {MENTORSHIP_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`mentorship-${option.value}`}
                        checked={watch("mentorshipOptions")?.includes(
                          option.value
                        )}
                        onChange={(checked) => {
                          const current = watch("mentorshipOptions") || [];
                          setValue(
                            "mentorshipOptions",
                            checked
                              ? [...current, option.value]
                              : current.filter((v) => v !== option.value)
                          );
                        }}
                      />
                      <label
                        htmlFor={`mentorship-${option.value}`}
                        className="text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Groups you can train
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {TRAINING_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`training-${option.value}`}
                        checked={watch("trainingOptions")?.includes(
                          option.value
                        )}
                        onChange={(checked) => {
                          const current = watch("trainingOptions") || [];
                          setValue(
                            "trainingOptions",
                            checked
                              ? [...current, option.value]
                              : current.filter((v) => v !== option.value)
                          );
                        }}
                      />
                      <label
                        htmlFor={`training-${option.value}`}
                        className="text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seminar Options */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Groups you can provide seminars to
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SEMINAR_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`seminar-${option.value}`}
                        checked={watch("seminarOptions")?.includes(
                          option.value
                        )}
                        onChange={(checked) => {
                          const current = watch("seminarOptions") || [];
                          setValue(
                            "seminarOptions",
                            checked
                              ? [...current, option.value]
                              : current.filter((v) => v !== option.value)
                          );
                        }}
                      />
                      <label
                        htmlFor={`seminar-${option.value}`}
                        className="text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <hr />

              <FormField
                label="Is your spouse a Navodayan?"
                name="spouseNavodayan"
                type="select"
                control={control}
                errors={errors}
                options={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
              />

              {/* T-Shirt Interest */}
              <div className="space-y-4">
                <FormField
                  label="Are you interested in buying UNMA Custom T-Shirt?"
                  name="tshirtInterest"
                  type="select"
                  control={control}
                  errors={errors}
                  // required={true}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />

                {/* T-Shirt Sizes */}
                {watch("tshirtInterest") === "yes" && (
                  <div className="mt-4 space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Select sizes and quantities:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {TSHIRT_SIZES.map((size) => (
                        <div key={size.value} className="space-y-2">
                          <label className="block text-sm text-gray-700">
                            {size.label}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={watch(`tshirtSizes.${size.value}`) || 0}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              setValue(`tshirtSizes.${size.value}`, value, {
                                shouldValidate: true,
                              });
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FormSection>
        )}

        {/* Financial Contribution Step */}
        {currentStep === 8 && (
          <FormSection title="Financial Contribution">
            <div className="space-y-6">
              {/* Show incomplete registration warning if applicable */}
              {watch("registrationStatus") === "incomplete" && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Registration Status: INCOMPLETE
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Your registration is currently incomplete due to
                          insufficient contribution. Please contact your JNV
                          Alumni Association leadership, BOT, or batch
                          representative if you need assistance with the minimum
                          contribution requirement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {hasPreviousContribution && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-green-400 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-green-800">
                      Total contribution of ₹
                      {totalContributionAmount || previousContributionAmount}{" "}
                      received
                    </p>
                  </div>
                </div>
              )}

              <FormField
                label={`${
                  hasPreviousContribution ? "Additional " : ""
                }Contribution Amount (in ₹)`}
                name="contributionAmount"
                type="number"
                control={control}
                errors={errors}
                required={!hasPreviousContribution}
                min={1}
                valueAsNumber={true}
              />

              {hasPreviousContribution && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 flex items-center">
                    <svg
                      className="h-5 w-5 text-blue-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    You can make additional contributions if you wish. Your
                    total contribution will be the sum of all payments.
                  </p>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {watch("contributionAmount") > 0 && (
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={isPaymentProcessing}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPaymentProcessing ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg
                          className="-ml-1 mr-3 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {hasPreviousContribution
                          ? "Add Contribution"
                          : "Proceed to Pay"}{" "}
                        ₹{watch("contributionAmount")}
                      </>
                    )}
                  </button>
                )}
              </motion.div>

              {/* International Payment Information */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  International Payments
                </h4>

                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    For international payments, use the NRE account details
                    below and submit payment receipt via email:
                  </p>

                  <div className="bg-white border border-gray-200 rounded p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium text-gray-700">
                          Account Holder:
                        </span>{" "}
                        Ciju Kurian
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Bank:</span>{" "}
                        IDBI Bank
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Branch:
                        </span>{" "}
                        Tiruvalla, Kerala - 689101
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Account Type:
                        </span>{" "}
                        NRE Savings
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          IFSC Code:
                        </span>{" "}
                        IBKL0000029
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Swift Code:
                        </span>{" "}
                        IBKLINBB737
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">
                          Account Number:
                        </span>{" "}
                        0029104000114851
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-xs text-blue-800 font-medium mb-1">
                      After making the payment:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>
                        • Email payment receipt to:{" "}
                        <span className="font-medium">
                          payments@unma2025.org
                        </span>
                      </li>
                      <li>
                        • Include your name and registration details in the
                        email
                      </li>
                      <li>
                        • Our team will verify and update your registration
                        status
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Registration Button */}
              {hasPreviousContribution && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSubmitForm}
                    disabled={isSubmitting || !hasPreviousContribution}
                    className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting Registration...
                      </>
                    ) : (
                      <>🎉 Submit Registration 🎊</>
                    )}
                  </button>
                </div>
              )}

              {!hasPreviousContribution && (
                <div className="mt-4 text-center text-sm text-red-600">
                  Please complete your contribution payment before submitting
                  registration
                </div>
              )}
            </div>

            {/* Financial Difficulty Dialog */}
            <FinancialDifficultyDialog
              isOpen={showFinancialDifficultyDialog}
              onClose={() => setShowFinancialDifficultyDialog(false)}
              totalExpense={(() => {
                const attendees = watch("attendees");
                const adultCount =
                  (attendees?.adults?.veg || 0) +
                  (attendees?.adults?.nonVeg || 0);
                const teenCount =
                  (attendees?.teens?.veg || 0) +
                  (attendees?.teens?.nonVeg || 0);
                const childCount =
                  (attendees?.children?.veg || 0) +
                  (attendees?.children?.nonVeg || 0);
                return adultCount * 500 + teenCount * 350 + childCount * 150;
              })()}
              contributionAmount={watch("contributionAmount") || 0}
              userSchool={watch("school")}
              onProceedWithPayment={() => {
                // Mark registration as incomplete and proceed with lower amount
                setValue("registrationStatus", "incomplete");
                setValue("paymentStatus", "financial-difficulty");
                proceedWithPayment(watch("contributionAmount"));
              }}
              onAddMoreAmount={() => {
                // Focus back on contribution amount field for user to add more
                const contributionField =
                  document.getElementsByName("contributionAmount")[0];
                if (contributionField) {
                  contributionField.focus();
                }
              }}
            />

            {/* Mission Message Popup */}
            <AlertDialog
              isOpen={showMissionMessage}
              onClose={() => setShowMissionMessage(false)}
              onConfirm={() => setShowMissionMessage(false)}
              title="Support UNMA's Mission"
              message={
                <div className="space-y-3">
                  <p className="text-sm">
                    This event is a fundraiser for UNMA's future activities and
                    emergency support initiatives.
                  </p>
                  <p className="text-sm font-medium">
                    UNMA alumni stand together 24/7, supporting each other
                    through thick and thin. Your generosity strengthens this
                    support system.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-blue-800 text-xs font-medium">
                      Payment Required: You will be redirected to the payment
                      gateway. For international payments, check the details
                      below the payment button.
                    </p>
                  </div>
                </div>
              }
              confirmText="I Understand"
              singleButton={true}
              type="info"
            />

            {/* Contribution Warning Dialog */}
            <AlertDialog
              isOpen={showAlertDialog}
              onClose={() => setShowAlertDialog(false)}
              onConfirm={() => {
                alertDialogConfig.onConfirm();
                setShowAlertDialog(false);
              }}
              onCancel={() => {
                if (alertDialogConfig.onCancel) {
                  alertDialogConfig.onCancel();
                } else {
                  setShowAlertDialog(false);
                }
              }}
              title={alertDialogConfig.title}
              message={alertDialogConfig.message}
              confirmText={
                alertDialogConfig.confirmText || "Proceed with current amount"
              }
              cancelText={alertDialogConfig.cancelText || "Add more amount"}
              type="warning"
            />
          </FormSection>
        )}

        <MobileProgressIndicator
          currentStep={currentStep}
          stepsCount={steps.length}
        />

        {/* Hide navigation buttons on final step */}
        {currentStep < 9 && (
          <NavigationButtons
            currentStep={currentStep}
            stepsCount={steps.length}
            onBack={handleBackStep}
            onNext={handleNextStep}
            onSkip={handleSkipOptional}
            isSubmitting={isSubmitting}
            isNextDisabled={
              (currentStep === 0 &&
                (!emailVerified || !captchaVerified || !quizCompleted)) ||
              currentStep === 8
            }
            nextButtonText={currentStep === 8 ? "Finish" : "Next"}
            showSkipButton={currentStep === 7}
          />
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Form data is automatically saved in your browser
          </p>
        </div>
      </form>
    </>
  );
};

export default AlumniRegistrationForm;
