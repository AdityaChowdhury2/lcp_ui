import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Maps legacy `amendment_license_renewal/check_for_amendment/{encrypted_serial}` to the React flow.
 */
const CheckForAmendmentLegacyRedirect: React.FC = () => {
  const { encryptedSerial } = useParams<{ encryptedSerial?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const token = encryptedSerial?.trim();
    if (token) {
      navigate(
        `/contractor-license/amendment/select-fields?formVSerialNo=${encodeURIComponent(token)}`,
        { replace: true },
      );
    } else {
      navigate("/license-renewal-amendment-list", { replace: true });
    }
  }, [encryptedSerial, navigate]);

  return <div className="p-6 text-sm text-gray-600">Redirecting…</div>;
};

export default CheckForAmendmentLegacyRedirect;
