import React from "react";
import useAuth from "../hooks/useAuth";

export default function Profile() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  return (
    <div>
      <h2 className="text-xl font-semibold">Profile</h2>
      <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded">
        <div className="font-semibold">{user.name}</div>
        <div className="text-sm">{user.email}</div>
      </div>
    </div>
  );
}
