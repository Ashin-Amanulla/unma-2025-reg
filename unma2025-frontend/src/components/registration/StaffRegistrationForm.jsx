import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { RegistrationSchemas } from "../../zod-form-validators/registrationform";
import { useRegistration } from "../../hooks";
import { getPincodeDetails } from "../../api/pincodeApi";
import { usePayment } from "../../hooks/usePayment";
import SponsorshipCards from "./SponsorshipCards";
import registrationsApi from "../../api/registrationsApi";

import { KERALA_DISTRICTS } from "../../assets/data";
import {
  FormSection,
  FormField,
  OtpInput,
  CaptchaVerification,
  NavigationButtons,
  MobileProgressIndicator,
} from "./FormComponents";
import StepIndicator from "./StepIndicator";
import PhoneInput from "react-phone-input-2";
import { motion } from "framer-motion";
import AttendeeCounter from "./AttendeeCounter";

import { indianStatesOptions } from "../../assets/data";

import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

import AlertDialog from "../ui/AlertDialog";

countries.registerLocale(enLocale);

// Get all countries and sort them alphabetically
const countryOptions = Object.entries(countries.getNames("en"))
  .map(([code, label]) => ({
    value: code,
    label: label,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const StaffRegistrationForm = ({ onBack, storageKey }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [formHasLocalData, setFormHasLocalData] = useState(false);
  const [hasPreviousContribution, setHasPreviousContribution] = useState(false);
  const [previousContributionAmount, setPreviousContributionAmount] =
    useState(0);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [showMissionMessage, setShowMissionMessage] = useState(false);
  const [alertDialogConfig, setAlertDialogConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => {},
  });

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
    resolver: zodResolver(RegistrationSchemas.Staff),
    mode: "onChange",
    defaultValues: {
      registrationType: "Staff",
      name: "",
      contactNumber: "",
      email: "",
      emailVerified: false,
      captchaVerified: false,
      whatsappNumber: "",
      country: "India",
      stateUT: "",
      district: "",
      bloodGroup: "",

      // Professional
      schoolsWorked: "",
      yearsOfWorking: "",
      currentPosition: "",
      subject: "",
      otherPosition: "",
      areaOfExpertise: "",
      additionalDetails: "",

      // Event attendance
      isAttending: true,
      attendees: {
        adults: { veg: 0, nonVeg: 1 },
        teens: { veg: 0, nonVeg: 0 },
        children: { veg: 0, nonVeg: 0 },
        toddlers: { veg: 0, nonVeg: 0 },
      },
      eventParticipation: [],
      participationDetails: "",

      // Sponsorship
      interestedInSponsorship: true,
      sponsorshipType: [],
      sponsorshipDetails: "",

      // Transportation
      startPincode: "",
      pinDistrict: "",
      pinState: "",
      pinTaluk: "",
      originArea: "",
      nearestLandmark: "",
      travelDate: "",
      travelTime: "",
      modeOfTransport: "",
      readyForRideShare: "",
      rideShareCapacity: 1,
      needParking: "",
      wantRideShare: "",
      rideShareGroupSize: 1,
      travelSpecialRequirements: "",

      // Accommodation
      accommodation: "",
      accommodationCapacity: 0,
      accommodationLocation: "",
      accommodationRemarks: "",

      // Optional
      mentorshipInterest: false,
      mentorshipAreas: [],

      // Financial
      willContribute: false,
      contributionAmount: 0,
      proposedAmount: 0,
    },
  });

  // Watch specific fields for conditional rendering
  const email = watch("email");
  const isAttending = watch("isAttending");
  const accommodation = watch("accommodation");
  const willContribute = watch("willContribute");
  const modeOfTransport = watch("modeOfTransport");

  // Add new state for registration ID and token
  const [registrationId, setRegistrationId] = useState(null);
  const [registrationToken, setRegistrationToken] = useState(null);
  const [verificationToken, setVerificationToken] = useState(null);

  // Load saved data from local storage including registration ID and token
  useEffect(() => {
    const savedRegistrationData = localStorage.getItem(storageKey);
    const savedStep = localStorage.getItem(`${storageKey}-step`);
    const savedToken = localStorage.getItem(`${storageKey}-token`);
    const savedId = localStorage.getItem(`${storageKey}-id`);

    console.log("Loading from localStorage:", {
      storageKey,
      tokenKey: `${storageKey}-token`,
      idKey: `${storageKey}-id`,
      savedToken,
      savedId,
    });

    if (savedRegistrationData) {
      try {
        const parsedData = JSON.parse(savedRegistrationData);

        // Only load if it's a Staff registration
        if (parsedData.registrationType === "Staff") {
          reset(parsedData);
          setFormHasLocalData(true);

          // Restore verification states
          setEmailVerified(parsedData.emailVerified);
          setCaptchaVerified(parsedData.captchaVerified);

          // Restore registration ID and token
          if (savedToken) {
            console.log(
              "Restoring verification token from localStorage:",
              savedToken
            );
            setVerificationToken(savedToken);
          }

          if (savedId) {
            console.log(
              "Restoring registration ID from localStorage:",
              savedId
            );
            setRegistrationId(savedId);
          }

          // Restore step
          if (savedStep) {
            setCurrentStep(parseInt(savedStep, 10));
          }

          // If there's existing contribution data, restore the total amount
          if (
            parsedData.contributionAmount > 0 &&
            parsedData.paymentStatus === "Completed"
          ) {
            setHasPreviousContribution(true);
            setPreviousContributionAmount(parsedData.contributionAmount);
          }

          toast.info("Previous form data restored");
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

      // Save registration ID and token if available
      if (registrationId) {
        localStorage.setItem(`${storageKey}-id`, registrationId);
      }
      if (verificationToken) {
        localStorage.setItem(`${storageKey}-token`, verificationToken);
      }
    }
  }, [
    watch(),
    currentStep,
    isDirty,
    getValues,
    storageKey,
    registrationId,
    verificationToken,
  ]);

  // Update verification states in form data
  useEffect(() => {
    setValue("emailVerified", emailVerified);
    setValue("captchaVerified", captchaVerified);
  }, [emailVerified, captchaVerified, setValue]);

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

  // Validate current step before moving to next
  const validateCurrentStep = async () => {
    let fieldsToValidate = [];

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
      return true;
    }

    if (currentStep === 1) {
      // Personal info
      fieldsToValidate = ["name", "contactNumber", "country"];

      if (watch("country") === "India") {
        fieldsToValidate.push("stateUT");
      }
    } else if (currentStep === 2) {
      // Professional info
      fieldsToValidate = ["schoolsWorked", "yearsOfWorking"];
    } else if (currentStep === 3) {
      // Event attendance
      fieldsToValidate = ["isAttending"];

      if (isAttending) {
        const attendees = watch("attendees");
        const totalAttendees = Object.values(attendees).reduce(
          (sum, group) => sum + (group.veg || 0) + (group.nonVeg || 0),
          0
        );

        if (totalAttendees === 0) {
          toast.error("Please add at least one attendee");
          return false;
        }

        fieldsToValidate.push("eventParticipation");

        // If participation details are required based on selection
        const eventParticipation = watch("eventParticipation") || [];
        if (
          eventParticipation.length > 0 &&
          !eventParticipation.includes("none")
        ) {
          fieldsToValidate.push("participationDetails");
        }
      }
      return true;
    } else if (currentStep === 4) {
      // Sponsorship
      fieldsToValidate = ["interestedInSponsorship"];
    } else if (currentStep === 5) {
      // Transportation
      if (isAttending) {
        fieldsToValidate = [
          "startPincode",
          "travelDate",
          "travelTime",
          "modeOfTransport",
        ];

        if (watch("modeOfTransport") === "car") {
          fieldsToValidate.push("readyForRideShare");
          if (watch("readyForRideShare") === "yes") {
            fieldsToValidate.push("rideShareCapacity");
          }
          fieldsToValidate.push("needParking");
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
      fieldsToValidate = ["accommodation"];

      if (accommodation === "provide") {
        fieldsToValidate.push("accommodationCapacity");
      }
    } else if (currentStep === 7) {
      // Optional fields - no required validation
      return true;
    } else if (currentStep === 8) {
      // Financial contribution
      fieldsToValidate = ["willContribute"];

      if (willContribute) {
        fieldsToValidate.push("contributionAmount");
      }
    }

    // Trigger validation for the current step's fields
    return await trigger(fieldsToValidate);
  };

  // Helper function to get step-specific data
  const getStepData = (stepNumber, formData) => {
    // Prepare basic structured data for all steps
    const structuredData = {
      registrationType: "Staff",
      formDataStructured: {
        verification: {
          emailVerified: formData.emailVerified,
          captchaVerified: formData.captchaVerified,
          email: formData.email,
          contactNumber: formData.contactNumber,
        },
        personalInfo: {
          name: formData.name,
          email: formData.email,
          contactNumber: formData.contactNumber,
          whatsappNumber: formData.whatsappNumber || formData.contactNumber,
          country: formData.country,
          stateUT: formData.stateUT,
          district: formData.district,
          bloodGroup: formData.bloodGroup,
        },
        professional: {
          schoolsWorked: formData.schoolsWorked,
          yearsOfWorking: formData.yearsOfWorking,
          currentPosition: formData.currentPosition,
          subject: formData.subject,
          otherPosition: formData.otherPosition,
          areaOfExpertise: formData.areaOfExpertise,
          additionalDetails: formData.additionalDetails,
        },
        eventAttendance: {
          isAttending: formData.isAttending,
          attendees: formData.attendees,
          eventParticipation: formData.eventParticipation,
          participationDetails: formData.participationDetails,
        },
        sponsorship: {
          interestedInSponsorship: formData.interestedInSponsorship,
          sponsorshipTier: formData.sponsorshipType
            ? formData.sponsorshipType.join(", ")
            : "",
          sponsorshipDetails: formData.sponsorshipDetails,
        },
        transportation: {
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
          accommodation: formData.accommodation,
          accommodationPincode: formData.accommodationPincode,
          accommodationDistrict: formData.accommodationDistrict,
          accommodationState: formData.accommodationState,
          accommodationTaluk: formData.accommodationTaluk,
          accommodationSubPostOffice: formData.accommodationSubPostOffice,
          accommodationLandmark: formData.accommodationLandmark,
          accommodationArea: formData.accommodationArea,
          accommodationCapacity: formData.accommodationCapacity,
          accommodationLocation: formData.accommodationLocation,
          accommodationRemarks: formData.accommodationRemarks,
        },
        financial: {
          willContribute: formData.willContribute || hasPreviousContribution,
          contributionAmount:
            previousContributionAmount || formData.contributionAmount,
          proposedAmount: formData.proposedAmount,
          paymentStatus: hasPreviousContribution ? "Completed" : "Pending",
          paymentId: formData.paymentId,
          paymentDetails: hasPreviousContribution
            ? `Payment of ₹${previousContributionAmount} received`
            : "",
          paymentRemarks: formData.paymentRemarks,
        },
      },
    };

    // For financial step, ensure the contribution amount is correctly set
    if (stepNumber === 7) {
      structuredData.formDataStructured.financial.contributionAmount =
        previousContributionAmount || formData.contributionAmount;
    }

    // For logging purposes only
    const stepNames = {
      1: "personalInfo",
      2: "professional",
      3: "eventAttendance",
      4: "sponsorship",
      5: "transportation",
      6: "accommodation",
      7: "financial",
    };

    // Return data with metadata for logging
    return {
      ...structuredData,
      _stepName: stepNames[stepNumber] || "verification", // For console logging only
    };
  };

  // Function to save step data to backend
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
          const response = await submitRegistration({
            step: stepNumber,
            stepData: getStepData(stepNumber, formData),
            verificationToken,
            registrationId: "new",
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

  // Modify handleNextStep to include better error handling
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

      // Proceed to next step
      setCurrentStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0);
      toast.success("Progress saved successfully!");
    }
  };

  // Handle back button click
  const handleBackStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  // Handle skipping the optional step
  const handleSkipOptional = () => {
    // Clear optional fields
    setValue("bloodGroup", "");
    setValue("mentorshipInterest", false);
    setValue("mentorshipAreas", []);

    // Move to next step
    setCurrentStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
  };

  // Add useEffect to show mission message when entering financial step
  useEffect(() => {
    if (currentStep === 7) {
      setShowMissionMessage(true);
    }
  }, [currentStep]);

  // Modify onSubmit to use registration ID
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

  // Handle final submit button click
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

      // Call onSubmit with the form data
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Form submission failed. Please try again.");
    }
  };
  // Handle payment processing
  const handlePayment = async () => {
    try {
      const contributionAmount = watch("contributionAmount") || 0;

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
          adultCount * 500 + teenCount * 250 + childCount * 150;

        if (
          isAttending &&
          contributionAmount > 0 &&
          contributionAmount < totalExpense
        ) {
          setAlertDialogConfig({
            title: "Contribution Amount Warning",
            message: `Your contribution (₹${contributionAmount}) is less than the estimated expenses (₹${totalExpense}) for your group. Would you like to add more to the current amount?`,
            onConfirm: () => proceedWithPayment(contributionAmount),
          });
          setShowAlertDialog(true);
          return;
        }
      }

      await proceedWithPayment(contributionAmount);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    }
  };

  const proceedWithPayment = async (contributionAmount) => {
    await initiatePayment({
      amount: contributionAmount,
      name: watch("name"),
      email: watch("email"),
      contact: watch("contactNumber"),
      notes: {
        registrationType: "Staff",
        isAttending: isAttending ? "Yes" : "No",
      },
      onSuccess: (response) => {
        setValue("paymentStatus", "Completed");
        setValue("paymentId", response.razorpay_payment_id);
        setHasPreviousContribution(true);
        setPreviousContributionAmount(contributionAmount);

        // Show simple success toast instead of alert dialog
        toast.success(
          "Payment successful! You can now submit your registration."
        );
      },
      onFailure: (error) => {
        console.error("Payment failed:", error);
        toast.error("Payment failed. Please try again.");
      },
    });
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

      <StepIndicator steps={steps} currentStep={currentStep} />

      <form className="space-y-4 sm:space-y-6">
        {/* Verification Step */}
        {currentStep === 0 && (
          <>
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
                    onVerify={handleEmailVerified}
                    email={email}
                    phone={watch("contactNumber")}
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
              control={control}
              errors={errors}
              options={[
                { value: "", label: "Select blood group" },
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
              ]}
            />

            <FormField
              label="Current country of residence"
              name="country"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={countryOptions}
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
              />
            )}

            {watch("stateUT") === "Kerala" && (
              <FormField
                label="Current District of residence"
                name="district"
                type="select"
                control={control}
                errors={errors}
                required={true}
                options={KERALA_DISTRICTS}
                placeholder="Select your district"
              />
            )}
          </FormSection>
        )}

        {/* Professional Information Step */}
        {currentStep === 2 && (
          <FormSection title="Professional Information">
            <FormField
              label="JNV Schools Worked At"
              name="schoolsWorked"
              type="textarea"
              control={control}
              errors={errors}
              required={true}
              placeholder="List the JNV schools where you have worked in Kerala, Lakshadweep and Mahe (e.g., JNV Ernakulam, JNV Wayanad, JNV Mahe)"
            />

            <FormField
              label="Years of Working Experience in JNV"
              name="yearsOfWorking"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={[
                { value: "Less than 5", label: "Less than 5 years" },
                { value: "5-10", label: "5-10 years" },
                { value: "11-15", label: "11-15 years" },
                { value: "16-20", label: "16-20 years" },
                { value: "21-25", label: "21-25 years" },
                { value: "More than 25", label: "More than 25 years" },
              ]}
            />

            <FormField
              label="Current Position/Designation"
              name="currentPosition"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={[
                { value: "Principal", label: "Principal" },
                { value: "Vice Principal", label: "Vice Principal" },
                { value: "PGT", label: "PGT" },
                { value: "TGT", label: "TGT" },
                {
                  value: "Administrative Staff",
                  label: "Administrative Staff",
                },
                { value: "Medical Staff", label: "Medical Staff" },
                { value: "Miscellaneous Staff", label: "Miscellaneous Staff" },
                { value: "Retired", label: "Retired" },
                { value: "Other", label: "Other" },
              ]}
            />

            {watch("currentPosition") === "PGT" && (
              <FormField
                label="Subject/Department"
                name="subject"
                type="select"
                control={control}
                errors={errors}
                options={[
                  { value: "Physics", label: "Physics" },
                  { value: "Chemistry", label: "Chemistry" },
                  { value: "Mathematics", label: "Mathematics" },
                  { value: "Biology", label: "Biology" },
                  { value: "Computer Science", label: "Computer Science" },
                  { value: "English", label: "English" },
                  { value: "Hindi", label: "Hindi" },
                  { value: "History", label: "History" },
                  { value: "Geography", label: "Geography" },
                  { value: "Economics", label: "Economics" },
                  { value: "Commerce", label: "Commerce" },
                  { value: "Physical Education", label: "Physical Education" },
                  { value: "Other", label: "Other" },
                ]}
              />
            )}

            {watch("currentPosition") === "TGT" && (
              <FormField
                label="Subject/Department"
                name="subject"
                type="select"
                control={control}
                errors={errors}
                options={[
                  { value: "Science", label: "Science" },
                  { value: "Mathematics", label: "Mathematics" },
                  { value: "Social Studies", label: "Social Studies" },
                  { value: "English", label: "English" },
                  { value: "Hindi", label: "Hindi" },
                  { value: "Regional Language", label: "Regional Language" },
                  { value: "Art", label: "Art" },
                  { value: "Music", label: "Music" },
                  { value: "Physical Education", label: "Physical Education" },
                  { value: "Work Experience", label: "Work Experience" },
                  { value: "Other", label: "Other" },
                ]}
              />
            )}

            {watch("currentPosition") === "Other" && (
              <FormField
                label="Please specify your position"
                name="otherPosition"
                type="text"
                control={control}
                errors={errors}
                placeholder="Enter your position/designation"
              />
            )}

            <FormField
              label="Area of Expertise/Specialization"
              name="areaOfExpertise"
              type="text"
              control={control}
              errors={errors}
              placeholder="Your specialized skills or expertise (e.g., Science Education, Administration, Counseling)"
            />

            <FormField
              label="Any Additional Professional Details"
              name="additionalDetails"
              type="textarea"
              control={control}
              errors={errors}
              placeholder="Additional information about your professional experience or achievements"
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

                    <div className="space-y-4 mt-8">
                      <h3 className="text-lg font-medium text-gray-900">
                        Your interest in additional offerings during the meet
                      </h3>

                      <FormField
                        label="What would you like to do additionally during the meet?"
                        name="eventParticipation"
                        type="multiselect"
                        control={control}
                        errors={errors}
                        options={[
                          { value: "none", label: "None" },
                          { value: "volunteering", label: "Volunteering" },
                          { value: "speaker", label: "Guest Speaker" },
                          {
                            value: "panelist",
                            label: "Panel Discussion Participant",
                          },
                          { value: "workshop", label: "Workshop Facilitator" },
                          {
                            value: "academicSession",
                            label: "Academic Session Lead",
                          },
                          {
                            value: "culturalTrainer",
                            label: "Cultural Program (as Trainer)",
                          },
                          {
                            value: "culturalParticipant",
                            label: "Cultural Program (as Participant)",
                          },
                          { value: "photography", label: "Photography" },
                          { value: "videography", label: "Videography" },
                          { value: "mentor", label: "Student Mentoring" },
                          { value: "counseling", label: "Career Counseling" },
                          { value: "other", label: "Other" },
                        ]}
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
                          Note: Thank you. Your interest for additional offering
                          will be considered based on the requirements and other
                          logistics factors (time, space etc.) for inclusion.
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
              <FormField
                label="Interested in Sponsorship"
                name="interestedInSponsorship"
                type="checkbox"
                control={control}
                errors={errors}
              />
            </div>

            {watch("interestedInSponsorship") && (
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
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-blue-800 text-sm">
                  This information will help us organize group transportation
                  from your area. We'll coordinate special bookings based on the
                  number of staff from each area.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Starting Location Pincode"
                  name="startPincode"
                  type="text"
                  control={control}
                  errors={errors}
                  required={true}
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

                        const data = await getPincodeDetails(pincodeValue);

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
                          setValue("subPostOffice", postOffice.Name);

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
                          setValue("subPostOffice", "");
                          toast.dismiss();
                          toast.error("Invalid pincode or location not found");
                        }
                      } catch (error) {
                        // Clear the values if there's an error
                        setValue("pinDistrict", "");
                        setValue("pinState", "");
                        setValue("pinTaluk", "");
                        setValue("subPostOffice", "");
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
                      setValue("subPostOffice", "");
                      // Don't show any message for incomplete pincode
                    }
                  }}
                />

                <FormField
                  label="Nearest Landmark"
                  name="nearestLandmark"
                  type="text"
                  control={control}
                  errors={errors}
                  placeholder="e.g., Railway Station, Bus Stand, etc."
                />
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
                      <div>
                        <p className="text-sm text-gray-500">Sub Post Office</p>
                        <p className="text-sm font-medium">
                          {watch("subPostOffice")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-red-600">
                        Invalid pincode or location not found
                      </p>
                      <FormField
                        label="Please enter your origin area details"
                        name="originArea"
                        type="text"
                        control={control}
                        errors={errors}
                        required={true}
                        placeholder="Enter your city/town name"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormField
                    label="Expected Travel Date"
                    name="travelDate"
                    type="date"
                    control={control}
                    errors={errors}
                    required={true}
                    min={new Date().toISOString().split("T")[0]}
                    className="date-picker"
                  />
                </div>
                <div>
                  <FormField
                    label="Expected Travel Time"
                    name="travelTime"
                    type="time"
                    control={control}
                    errors={errors}
                    required={true}
                    className="time-picker"
                  />
                </div>
              </div>

              <FormField
                label="Mode of Transport"
                name="modeOfTransport"
                type="select"
                control={control}
                errors={errors}
                required={true}
                options={[
                  { value: "car", label: "Car" },
                  { value: "train", label: "Train" },
                  { value: "flight", label: "Flight" },
                  { value: "bus", label: "Bus" },
                  { value: "other", label: "Other" },
                ]}
              />

              {watch("modeOfTransport") === "car" && (
                <div className="space-y-4">
                  <FormField
                    label="Will you be ready for ride sharing from your starting point?"
                    name="readyForRideShare"
                    type="select"
                    control={control}
                    errors={errors}
                    required={true}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />

                  {watch("readyForRideShare") === "yes" && (
                    <FormField
                      label="How many people can you accommodate in your car?"
                      name="rideShareCapacity"
                      type="number"
                      control={control}
                      errors={errors}
                      required={true}
                      min={1}
                      max={6}
                    />
                  )}

                  <FormField
                    label="Will you need car parking at the venue?"
                    name="needParking"
                    type="select"
                    control={control}
                    errors={errors}
                    required={true}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />
                </div>
              )}

              {watch("modeOfTransport") !== "car" &&
                watch("modeOfTransport") && (
                  <div className="space-y-4">
                    <FormField
                      label="Would you like to connect with other staff from your starting point?"
                      name="wantRideShare"
                      type="select"
                      control={control}
                      errors={errors}
                      required={true}
                      options={[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                      ]}
                    />

                    {watch("wantRideShare") === "yes" && (
                      <FormField
                        label="Number of people in your group"
                        name="rideShareGroupSize"
                        type="number"
                        control={control}
                        errors={errors}
                        required={true}
                        min={1}
                        max={6}
                      />
                    )}
                  </div>
                )}

              <FormField
                label="Special Requirements for Travel"
                name="travelSpecialRequirements"
                type="textarea"
                control={control}
                errors={errors}
                placeholder="Any specific requirements for travel (e.g., wheelchair access, medical conditions, etc.)"
              />

              {/* Show potential group information */}
              {watch("startPincode") &&
                watch("pinDistrict") &&
                ((watch("modeOfTransport") === "car" &&
                  watch("readyForRideShare") === "yes") ||
                  (watch("modeOfTransport") !== "car" &&
                    watch("wantRideShare") === "yes")) && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Group Travel Information
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm">
                        Based on your location ({watch("pinDistrict")},{" "}
                        {watch("pinState")}), we'll:
                      </p>
                      <ul className="list-disc list-inside text-gray-600 text-sm mt-2 space-y-1">
                        <li>
                          Group you with other staff from {watch("pinDistrict")}{" "}
                          district
                        </li>
                        <li>Coordinate group transportation arrangements</li>
                        <li>Share travel details once the group is formed</li>
                        <li>
                          Provide pickup points based on the group's location
                        </li>
                        {watch("modeOfTransport") === "car" &&
                          watch("readyForRideShare") === "yes" && (
                            <li>
                              Coordinate ride sharing with other staff in your
                              area
                            </li>
                          )}
                        {watch("modeOfTransport") !== "car" &&
                          watch("wantRideShare") === "yes" && (
                            <li>
                              Arrange shared transportation from your starting
                              point
                            </li>
                          )}
                      </ul>
                    </div>
                  </div>
                )}
            </div>
          </FormSection>
        )}

        {/* Accommodation Step */}
        {currentStep === 6 && isAttending && (
          <FormSection title="Accommodation Arrangements">
            <FormField
              label="Accommodation Preference"
              name="accommodation"
              type="select"
              control={control}
              errors={errors}
              required={true}
              options={[
                { value: "not-required", label: "I don't need accommodation" },
                {
                  value: "provide",
                  label: "I can provide accommodation to others at my place",
                },
                {
                  value: "need",
                  label:
                    "Please connect me with staff who is providing accommodation at their place",
                },
                {
                  value: "discount-hotel",
                  label: "I need discounted hotel booking",
                },
              ]}
            />

            {accommodation === "provide" && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-800 text-sm">
                    Note: The accommodation must be within 25 km radius of CIAL
                    Convention Center (our venue) to be considered for group
                    arrangements.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Accommodation Location Pincode"
                    name="accommodationPincode"
                    type="text"
                    control={control}
                    errors={errors}
                    required={true}
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

                          const data = await getPincodeDetails(pincodeValue);

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
                            setValue("accommodationState", postOffice.State);
                            setValue(
                              "accommodationTaluk",
                              postOffice.Block || postOffice.District
                            );
                            //array of sub post offices
                            const subPostOffices = data[0].PostOffice.filter(
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
                              subPostOfficeNames[0] || postOffice.Name
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
                          <p className="text-sm text-gray-500">District</p>
                          <p className="text-sm font-medium">
                            {watch("accommodationDistrict")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Taluk/Block</p>
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
                          required={true}
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
                  required={true}
                  min={1}
                  valueAsNumber={true}
                />

                <FormField
                  label="Your Accommodation Location"
                  name="accommodationLocation"
                  type="text"
                  control={control}
                  errors={errors}
                  required={true}
                  placeholder="Enter the exact location/address of your accommodation"
                />
              </>
            )}

            <FormField
              label="Additional Accommodation Remarks"
              name="accommodationRemarks"
              type="textarea"
              control={control}
              errors={errors}
              placeholder="Any specific accommodation requirements or information"
            />
          </FormSection>
        )}

        {/* Financial Contribution Step */}
        {currentStep === 7 && (
          <FormSection title="Financial Contribution">
            <div className="space-y-6">
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
                      Total contribution of ₹{previousContributionAmount}{" "}
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

              {/* Submit Registration Button */}
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

              {!hasPreviousContribution && (
                <div className="mt-4 text-center text-sm text-red-600">
                  Please complete your contribution payment before submitting
                  registration
                </div>
              )}
            </div>

            {/* Mission Message Popup */}
            <AlertDialog
              isOpen={showMissionMessage}
              onClose={() => setShowMissionMessage(false)}
              onConfirm={() => setShowMissionMessage(false)}
              title="Support UNMA's Mission"
              message={
                <div className="space-y-4">
                  <p className="text-lg">
                    This event is more than just a gathering - it's a fundraiser
                    for UNMA's future activities and emergency support
                    initiatives.
                  </p>
                  {/* <p>
                    Your contribution will directly impact our community. We
                    would like to support staff/students from JNV Wayanad and
                    JNV Kozhikode who lost everything in the 2024 landslides.
                  </p> */}
                  <p className="font-medium text-lg">
                    UNMA staff stand together 24/7, supporting each other
                    through thick and thin. Your generosity strengthens this
                    support system.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 text-sm">
                      Note: To complete your registration, you need to pay the
                      contribution amount. Now you will be redirected to the
                      payment gateway. For international payments, kindly
                      contact the organizing team to share the NRI account
                      details.
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
              title={alertDialogConfig.title}
              message={alertDialogConfig.message}
              confirmText="Proceed with current amount"
              cancelText="Add more amount"
              type="warning"
            />
          </FormSection>
        )}

        <MobileProgressIndicator
          currentStep={currentStep}
          stepsCount={steps.length}
        />

        <NavigationButtons
          currentStep={currentStep}
          stepsCount={steps.length}
          onBack={handleBackStep}
          onNext={
            currentStep === steps.length - 1 ? handleSubmitForm : handleNextStep
          }
          onSkip={handleSkipOptional}
          isSubmitting={isSubmitting}
          isNextDisabled={
            (currentStep === 0 && (!emailVerified || !captchaVerified)) ||
            currentStep === 7 // Disable next button on financial step
          }
          nextButtonText={currentStep === 7 ? "Finish" : "Next"}
        />

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Form data is automatically saved in your browser
          </p>
        </div>
      </form>
    </>
  );
};

export default StaffRegistrationForm;
