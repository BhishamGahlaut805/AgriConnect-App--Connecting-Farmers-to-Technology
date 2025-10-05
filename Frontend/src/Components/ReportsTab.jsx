import React from 'react'
import { FiFileText } from 'react-icons/fi'
import PropTypes from 'prop-types'
import { Tooltip } from 'react-tooltip'
const ReportsTab = (setActiveTab,setMessage) => {
  return (
    <div className="text-center p-8 bg-white dark:bg-gray-700/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                <FiFileText className="h-16 w-16 text-blue-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Crop Disease Reports
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  This section will provide a comprehensive library of crop disease
                  reports.
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  You'll be able to browse common diseases, symptoms, and
                  recommended treatments for various crops. This feature is under
                  development and will be available soon!
                </p>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow-md transition-colors transform hover:scale-[1.01]"
                  data-tooltip-id="general-tooltip"
                  data-tooltip-content="Go back to the dashboard"
                >
                  Back to Dashboard
                </button>
              </div>
  )
}

export default ReportsTab