import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import RegistrationType from "../components/registration/RegistrationType";
import AlumniRegistrationForm from "../components/registration/AlumniRegistrationForm";
import StaffRegistrationForm from "../components/registration/StaffRegistrationForm";
import OtherRegistrationForm from "../components/registration/OtherRegistrationForm";

const STORAGE_KEY = "unma2025-registration-data";

const Registration = () => {
  const [registrationType, setRegistrationType] = useState(null);
  const [formHasLocalData, setFormHasLocalData] = useState(false);

  // Check for saved data on initial load
  useEffect(() => {
    const savedType = localStorage.getItem(`${STORAGE_KEY}-type`);
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedType && savedData) {
      setRegistrationType(savedType);
      setFormHasLocalData(true);
    }
  }, []);

  // Handle registration type selection
  const handleSelectType = (type) => {
    setRegistrationType(type);
    localStorage.setItem(`${STORAGE_KEY}-type`, type);
  };

  // Clear saved form data
  const clearSavedFormData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(`${STORAGE_KEY}-type`);
    localStorage.removeItem(`${STORAGE_KEY}-step`);
    setRegistrationType(null);
    setFormHasLocalData(false);
    toast.success("Saved form data cleared");
  };

  // Handle back to type selection
  const handleBackToTypeSelection = () => {
    if (formHasLocalData) {
      if (
        window.confirm(
          "Going back will not clear your saved form data. You can continue this registration later. Do you want to go back?"
        )
      ) {
        setRegistrationType(null);
      }
    } else {
      setRegistrationType(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
          SUMMIT 2025 Registration
        </h1>

        {!registrationType ? (
          <RegistrationType onSelectType={handleSelectType} />
        ) : (
          <div className="space-y-6">
            {formHasLocalData && (
              <div className="bg-blue-50 p-4 rounded-md mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-blue-700">
                    You have a saved registration form. You can continue from
                    where you left off.
                  </p>
                  <button
                    onClick={clearSavedFormData}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear saved data
                  </button>
                </div>
              </div>
            )}

            {registrationType === "Alumni" && (
              <AlumniRegistrationForm
                onBack={handleBackToTypeSelection}
                storageKey={STORAGE_KEY}
              />
            )}

            {registrationType === "Staff" && (
              <StaffRegistrationForm
                onBack={handleBackToTypeSelection}
                storageKey={STORAGE_KEY}
              />
            )}

            {registrationType === "Other" && (
              <OtherRegistrationForm
                onBack={handleBackToTypeSelection}
                storageKey={STORAGE_KEY}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Registration;
