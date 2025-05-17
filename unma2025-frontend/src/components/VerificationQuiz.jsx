import React, { useState } from "react";
import { toast } from "react-toastify";

const question = {
  id: 1,
  question:
    "Please select the 3 most relevant options related to your  JNV life:",
  options: [
    "Mess Hall",
    "Drill",
    "PT",
    "SUPW",
    "Head Master",
    "House Master",
    "Principal",
    "Upuma",
    "Sambar",
    "Head Boy",
    "School Captain",
    "Wave the Flag",
    "We shall Overcome",
    "Assembly",
    "Roll Number",
    "Cluster Meet",
    "Residence",
    "Dormitory",
    "Vindya",
  ],
  correctAnswers: [
    "Mess Hall",
    "Cluster Meet",
    "Dormitory",
    "Roll Number",
    "We shall Overcome",
    "PT",
    "SUPW",
    "Upuma",
    "Sambar",
    "House Master",
    "Principal",
    "Assembly",
    "School Captain",
  ], // These are the correct options
  requiredCorrect: 3, // Number of correct answers needed to pass
};

const VerificationQuiz = ({ onQuizComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);

  const handleAnswerSelect = (option) => {
    if (!showResults) {
      setSelectedAnswers((prev) => {
        if (prev.includes(option)) {
          return prev.filter((item) => item !== option);
        }
        if (prev.length < 3) {
          return [...prev, option];
        }
        return prev;
      });
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Check if exactly 3 options are selected
    if (selectedAnswers.length !== 3) {
      toast.error("Please select exactly 3 options");
      setIsSubmitting(false);
      return;
    }

    // Calculate score
    const correctCount = selectedAnswers.filter((answer) =>
      question.correctAnswers.includes(answer)
    ).length;

    const passed = correctCount >= question.requiredCorrect;

    setScore(correctCount);
    setIsPassed(passed);
    setShowResults(true);

    if (passed) {
      toast.success(
        `Quiz passed! You got ${correctCount}/${question.requiredCorrect} correct.`
      );
      setTimeout(() => {
        onQuizComplete(true);
      }, 2000);
    } else {
      toast.error(
        `You got ${correctCount}/${question.requiredCorrect} correct. Need at least ${question.requiredCorrect} correct answers.`
      );
    }

    setIsSubmitting(false);
  };

  const handleRetry = () => {
    setSelectedAnswers([]);
    setShowResults(false);
    setScore(0);
    setIsPassed(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Please select exactly 3 options that best represent your JNV experience.
        You need at least {question.requiredCorrect} correct answers to proceed.
      </p>

      <div className="mb-6">
        <p className="font-medium text-gray-700 mb-3">{question.question}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-3 space-x-3 cursor-pointer border rounded-md 
                ${
                  showResults &&
                  selectedAnswers.includes(option) &&
                  question.correctAnswers.includes(option)
                    ? "border-green-500 bg-green-50"
                    : ""
                }
                ${
                  showResults &&
                  selectedAnswers.includes(option) &&
                  !question.correctAnswers.includes(option)
                    ? "border-red-500 bg-red-50"
                    : ""
                }
                ${
                  !showResults && selectedAnswers.includes(option)
                    ? "border-blue-500 bg-blue-50"
                    : ""
                }
                ${
                  !showResults && !selectedAnswers.includes(option)
                    ? "border-gray-200"
                    : showResults && !selectedAnswers.includes(option)
                    ? "border-gray-200"
                    : ""
                }
                ${showResults ? "cursor-default" : "hover:bg-gray-50"}
                ${
                  selectedAnswers.length >= 3 &&
                  !selectedAnswers.includes(option)
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
            >
              <input
                type="checkbox"
                checked={selectedAnswers.includes(option)}
                onChange={() => handleAnswerSelect(option)}
                disabled={
                  showResults ||
                  (selectedAnswers.length >= 3 &&
                    !selectedAnswers.includes(option))
                }
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">{option}</span>
              {showResults &&
                selectedAnswers.includes(option) &&
                question.correctAnswers.includes(option) && (
                  <span className="ml-auto text-green-600">✓ Correct</span>
                )}
              {showResults &&
                selectedAnswers.includes(option) &&
                !question.correctAnswers.includes(option) && (
                  <span className="ml-auto text-red-600">✗ Incorrect</span>
                )}
            </label>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Selected: {selectedAnswers.length}/3
        </p>
      </div>

      {!showResults ? (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedAnswers.length !== 3}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSubmitting ? "Checking..." : "Submit Answers"}
        </button>
      ) : (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg text-center ${
              isPassed ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}
          >
            <p className="font-medium">
              {isPassed
                ? `Congratulations! You got ${score}/${question.requiredCorrect} correct and passed.`
                : `You got ${score}/${question.requiredCorrect} correct. At least ${question.requiredCorrect} correct answers required.`}
            </p>
            {isPassed && (
              <p className="text-sm mt-1">Proceeding to the next step...</p>
            )}
          </div>

          {!isPassed && (
            <button
              onClick={handleRetry}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationQuiz;
