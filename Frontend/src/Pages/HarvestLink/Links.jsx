import React from 'react'
import { Link } from 'react-router-dom'

const Links = () => {
  return (
    <div>
      <div className="min-h-[40vh] bg-gray-50 dark:bg-gray-900 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">
            Explore HarvestLink
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/harvestlink/cart"
              className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-2xl p-6 transition transform hover:-translate-y-1 flex flex-col items-center text-center"
            >
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.293 2.707a1 1 0 001.293 1.293H17m0 0a1 1 0 11-2 0m2 0a1 1 0 102 0"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Cart
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                View and manage your items
              </p>
            </Link>

            <Link
              to="/harvestlink/v1/agriConnect"
              className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-2xl p-6 transition transform hover:-translate-y-1 flex flex-col items-center text-center"
            >
              <div className="bg-lime-100 dark:bg-lime-900 p-4 rounded-full mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-lime-600 dark:text-lime-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6M3 6h18M3 6a2 2 0 012-2h14a2 2 0 012 2M3 6v10a2 2 0 002 2h12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                AgriConnect
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Connect with farmers and suppliers
              </p>
            </Link>

            <Link
              to="/"
              className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-2xl p-6 transition transform hover:-translate-y-1 flex flex-col items-center text-center"
            >
              <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4 0v-8m0 8H7a2 2 0 01-2-2V10a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-3"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Home
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Return to main dashboard
              </p>
            </Link>

            <Link
              to="/harvestlink/browse"
              className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-2xl p-6 transition transform hover:-translate-y-1 flex flex-col items-center text-center"
            >
              <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-full mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-orange-600 dark:text-orange-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Browse
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Explore products and listings
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Links;
