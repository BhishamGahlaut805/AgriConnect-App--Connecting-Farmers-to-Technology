import React from 'react'
import { FiAlertCircle } from 'react-icons/fi'
const issuesTab = (setActiveTab,setMessage) => {
  return (
    <div className="text-center p-8 bg-white dark:bg-gray-700/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Disease Alerts & Warnings
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  This section will provide critical alerts and warnings about
                  potential disease outbreaks or high-risk detections.
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Stay informed about the health of your crops and nearby farm
                  conditions to take timely action. This feature is being actively
                  developed to provide real-time insights!
                </p>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium shadow-md transition-colors transform hover:scale-[1.01]"
                  data-tooltip-id="general-tooltip"
                  data-tooltip-content="Go back to the dashboard"
                >
                  Back to Dashboard
                </button>
              </div>
  )
}

export default issuesTab