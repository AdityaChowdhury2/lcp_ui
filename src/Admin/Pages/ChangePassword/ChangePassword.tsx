import React from "react";
import ChangePasswordForm from "@/Components/ChangePassword/ChangePasswordForm";
import { useSearchParams } from "react-router-dom";

const ChangePassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const encUserId = searchParams.get("encUserId");

  return (
    <div className="min-h-screen font-['Source_Sans_Pro'] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#333] mb-4">Change Password</h1>
        <ChangePasswordForm mode="authenticated" title="" encUserId={ encUserId ?  encUserId : undefined } />
      </div>
    </div>
  );
};

export default ChangePassword;
