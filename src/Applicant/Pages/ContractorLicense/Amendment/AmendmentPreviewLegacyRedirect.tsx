import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Legacy `amendment-perview/...` URLs → application list (query-param apply flow). */
const AmendmentPreviewLegacyRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/license-renewal-amendment-list", { replace: true });
  }, [navigate]);

  return <div className="p-6 text-sm text-gray-600">Redirecting…</div>;
};

export default AmendmentPreviewLegacyRedirect;
