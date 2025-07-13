"use client";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPrint, faEye} from "@fortawesome/free-solid-svg-icons";
import {useState} from "react";

export default function PrintButton() {
  const [debugMode, setDebugMode] = useState(false);
  const isDevelopment = process.env.NODE_ENV === "development";

  const handlePrint = () => {
    window.print();
  };

  const toggleDebug = () => {
    const container = document.querySelector(".max-w-3xl");
    if (container) {
      if (debugMode) {
        // Currently in debug mode, exit it
        container.classList.remove("print-debug");
        setDebugMode(false);
      } else {
        // Currently not in debug mode, enter it
        container.classList.add("print-debug");
        setDebugMode(true);
      }
    }
  };

  return (
    <>
      {isDevelopment && (
        <button
          onClick={toggleDebug}
          className={`btn-sm text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.2)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms] no-print mr-2 ${
            debugMode ? "!bg-orange-600 !from-orange-600 !to-orange-700" : ""
          }`}
          aria-label="Toggle print debug mode"
        >
          <FontAwesomeIcon icon={faEye} className="w-4 h-4 mr-2" />
          {debugMode ? "Exit Debug" : "Debug Print"}
        </button>
      )}
      <button
        onClick={handlePrint}
        className="btn-sm text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.2)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms] no-print"
        aria-label="Print this page"
      >
        <FontAwesomeIcon icon={faPrint} className="w-4 h-4 mr-2" />
        Print
      </button>
    </>
  );
}
