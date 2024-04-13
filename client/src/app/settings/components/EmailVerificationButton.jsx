"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function EmailVerificationButton({ icon, header, context }) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [verificationStep, setVerificationStep] = useState("email");
  const [verificationCode, setVerificationCode] = useState("");

  const openPopup = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setVerificationStep("email");
    setVerificationCode("");
  };

  const handleSendVerificationEmail = async () => {
    try {

      const email = user?.email;
    if (!email) {
      alert("No email address found for the user.");
      return;
    }
      alert(email);

      let url = `/api/vertification/verify/`;
      url = url + email;
      
  
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setVerificationCode(data.verificationCode);
        alert("Verification email sent to: " + user?.email);
        setVerificationStep("code");
      } else {
        throw new Error(data.message || "Failed to fetch verification code");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  }; 
  

  const handleVerifyCode = () => {
    console.log("Verifying code:", verificationCode);
    closeDialog();
  };

  return (
    <div className="mb-4">
      <div
        className="block border p-2 rounded-lg shadow hover:bg-gray-600 transition duration-150 ease-in-out cursor-pointer"
        onClick={openPopup}
      >
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon icon={icon} style={{ width: "50px", height: "50px" }} />
          <div>
            <h2 className="text-xl font-medium mb-1">{header}</h2>
            <h1 className="text-l font-medium">{context}</h1>
          </div>
        </div>
      </div>

      {isOpen && (
        <dialog open className="modal" style={{ overflow: "auto" }}> {/* Added overflow:auto for content scroll */}
          <div className="modal-box" style={{ width: "80vw", maxWidth: "550px", height: "auto", maxHeight: "80vh" }}> {/* Adjusted size */}
            <button
              type="button"
              onClick={closeDialog}
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </button>
            {verificationStep === "email" ? (
              <>
                <h3 className="text-lg font-medium mb-4">Verify Your Email Address</h3>
                <p>Your email: {user?.email}</p>
                <div className="mt-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSendVerificationEmail}
                  >
                    Send Verification Email
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4">Enter Verification Code</h3>
                <input
                  type="text"
                  placeholder="6-digit code"
                  maxLength="6"
                  className="input input-bordered w-full max-w-xs"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <div className="mt-4">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleVerifyCode}
                  >
                    Verify Code
                  </button>
                </div>
                <p className="text-red-500 mt-4">Please do not exit out of this tab until the process is complete.</p>
              </>
            )}
          </div>
        </dialog>
      )}
    </div>
  );
}
