import React, { useState, useEffect } from "react";
import AdminService from "../../API/AdminService";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";

const UserManagement = () => {
  const [pendingKYC, setPendingKYC] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingKYC();
  }, []);

  const loadPendingKYC = async () => {
    try {
      const response = await AdminService.getPendingKYC();
      setPendingKYC(response.data || []);
    } catch (error) {
      console.error("Failed to load pending KYC:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyKYC = async (userId) => {
    try {
      await AdminService.verifyKYC(userId);
      setPendingKYC((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Failed to verify KYC:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-2xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Pending KYC Verification</h2>
        <div className="space-y-4">
          {pendingKYC.map((user) => (
            <div
              key={user._id}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <button
                onClick={() => handleVerifyKYC(user._id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Verify KYC
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
