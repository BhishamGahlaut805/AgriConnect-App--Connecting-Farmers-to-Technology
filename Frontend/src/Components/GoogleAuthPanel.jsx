// GoogleAuthPanel.jsx
import {
  GoogleIcon,
  ArrowRightIcon,
  InformationCircleIcon,
} from "../icons/icon";

const GoogleAuthPanel = ({ handleGoogleLogin, googleLoading, darkMode }) => {
  return (
    <div className="w-full md:w-1/2 flex flex-col justify-center">
      <div
        className={`rounded-xl shadow-lg overflow-hidden transition-colors duration-300 h-full flex flex-col ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-green-200"
        } border`}
      >
        <div className="h-2 bg-gradient-to-r from-blue-400 to-red-500"></div>

        <div className="p-8 flex flex-col items-center justify-center flex-grow">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div
                className={`p-4 rounded-full ${
                  darkMode
                    ? "bg-gray-700 shadow-lg shadow-blue-900/30"
                    : "bg-blue-50 shadow-lg shadow-blue-200"
                }`}
              >
                <GoogleIcon className="h-12 w-12" />
              </div>
            </div>
            <h2
              className={`text-2xl font-bold mb-2 ${
                darkMode ? "text-blue-400" : "text-blue-800"
              }`}
            >
              Quick Access
            </h2>
            <p className={darkMode ? "text-blue-300" : "text-blue-600"}>
              Sign in with your Google account
            </p>
          </div>

          <div className="w-full max-w-xs">
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className={`w-full py-3 px-6 rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-3 ${
                googleLoading
                  ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                  : darkMode
                  ? "bg-white hover:bg-gray-100 text-gray-800"
                  : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-700"
              }`}
            >
              {googleLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-gray-800 dark:text-gray-200"
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
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="h-5 w-5" />
                  <span className="font-medium">Continue with Google</span>
                </>
              )}
            </button>

            <div
              className={`mt-8 p-4 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-300"
                  : "bg-green-50 border-green-200 text-green-700"
              }`}
            >
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <InformationCircleIcon className="h-5 w-5" />
                Why use Google?
              </h3>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>One-click sign in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>No need to remember another password</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>✓</span>
                  <span>Faster access to your account</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          className={`px-6 py-4 border-t text-center ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-blue-50 border-blue-100"
          }`}
        >
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-blue-600"
            }`}
          >
            By continuing, you agree to AgriConnect's{" "}
            <a
              href="#"
              className={`hover:underline ${
                darkMode ? "text-blue-400" : "text-blue-700"
              }`}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className={`hover:underline ${
                darkMode ? "text-blue-400" : "text-blue-700"
              }`}
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthPanel;
