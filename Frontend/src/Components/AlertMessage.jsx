// AlertMessage.jsx
import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from "../icons/icon";

const AlertMessage = ({
  isOpen = false,
  title = "",
  message = "",
  type = "success",
  onClose = () => {},
}) => {
  return (
    <Transition
      show={isOpen}
      as={Fragment}
      enter="transition ease-out duration-300"
      enterFrom="opacity-0 translate-y-2 scale-95"
      enterTo="opacity-100 translate-y-0 scale-100"
      leave="transition ease-in duration-200"
      leaveFrom="opacity-100 translate-y-0 scale-100"
      leaveTo="opacity-0 translate-y-2 scale-95"
    >
      <div className="fixed top-6 right-6 z-50 w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl p-4 flex items-start gap-4">
        {type === "success" ? (
          <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400 mt-1" />
        ) : (
          <XCircleIcon className="h-6 w-6 text-red-500 dark:text-red-400 mt-1" />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </Transition>
  );
};

export default AlertMessage;
