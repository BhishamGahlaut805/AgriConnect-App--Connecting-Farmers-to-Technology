import React from 'react'
import { FiHelpCircle } from 'react-icons/fi'
import { Tooltip } from 'react-tooltip'
const GuideTab = (setActiveTab ) => {
  return (
    <div className="text-center p-8 bg-white dark:bg-gray-700/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                <FiHelpCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  How It Works: Disease Prediction Guide
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  Welcome to the AgriConnect Disease Prediction tool! Follow these
                  simple steps to get started:
                </p>
                <div className="space-y-6 text-left max-w-2xl mx-auto">
                  <div className="flex items-start bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <span className="text-2xl font-bold text-green-600 mr-4">
                      1.
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-xl">
                        Select Your Crop Model
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        Choose the AI model that best matches your crop (e.g.,
                        Potato, Cotton, or General). This helps in getting highly
                        accurate predictions.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <span className="text-2xl font-bold text-green-600 mr-4">
                      2.
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-xl">
                        Upload Crop Images
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        Click the "Select Images" button and choose clear photos of
                        your affected crop leaves or plants. For best results,
                        upload 3-10 images from different angles. Supported formats
                        are JPG, JPEG, and PNG (max 5MB per image).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <span className="text-2xl font-bold text-green-600 mr-4">
                      3.
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-xl">
                        Analyze for Diseases
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        Once your images are selected, click "Analyze for Diseases".
                        Our AI will process the images and identify potential
                        diseases.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <span className="text-2xl font-bold text-green-600 mr-4">
                      4.
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-xl">
                        View Results & Recommendations
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        The "Analysis Results" tab will show you the detected
                        diseases, their confidence levels, and severity. You'll also
                        receive general recommendations to manage the identified
                        issues.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <span className="text-2xl font-bold text-green-600 mr-4">
                      5.
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-xl">
                        Access Detailed Reports & History
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        You can get detailed reports for specific diseases and
                        review all your past analyses under the "Past Analyses" tab.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-8 text-lg text-gray-700 dark:text-gray-300">
                  For any questions or support, please contact our team. Happy
                  farming!
                </p>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium shadow-md transition-colors transform hover:scale-[1.01]"
                  data-tooltip-id="general-tooltip"
                  data-tooltip-content="Start your first disease analysis now!"
                >
                  Start Your First Analysis
                </button>
              </div>
  )
}

export default GuideTab