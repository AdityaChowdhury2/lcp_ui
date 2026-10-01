import LoginModal from "../../Components/LoginComponents/LoginModal";
import React, { FC } from "react";
import { useSearchParams } from "react-router-dom";

const ApplicantLogin: FC = () => {
  const [searchParams] = useSearchParams();
  const loginType = searchParams.get("usertype") === "staff" ? "staff" : "user";
  
  return <LoginModal loginType={loginType} />;
};

export default ApplicantLogin;
