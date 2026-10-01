import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
import {
  fetchAlcClraApplication,
  fetchAlcClraRemarks,
  selectAlcClraApplicationState,
} from "@/store/alcClraApplicationSlice";
import { generateCLRARegCertPdfTemplate } from "./ClraPePdfTemplates";
import { generateQRCodeBase64 } from "@/utils/helper-functions/generateQRCodeBase64";


// Unused Component currently
const ClraRegCertificate = () => {
  const { applicationId, applicantUserId } = useParams<{
    applicationId: string;
    applicantUserId: string;
  }>();

  const dispatch = useDispatch<AppDispatch>();
  const {
    application,
    remarks,
    loading,
    error
  } = useSelector(selectAlcClraApplicationState);

  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId || !applicantUserId) return;
    const args = {
      applicationId: String(applicationId),
      applicantUserId: String(applicantUserId),
    };
    dispatch(fetchAlcClraApplication(args));
    dispatch(fetchAlcClraRemarks(args));
  }, [dispatch, applicationId, applicantUserId]);

  useEffect(() => {
    const buildHtml = async () => {
      if (!application) return;

      const registrationNo =
        application.applicationStatus?.registrationNumber ?? "";

      const dynamicData = {
        registrationNumber: registrationNo,
        natureOfWorkEstablishment: application?.natureOfWorks?.value,
        contractorName: "",
        contractorAddress: "",
        maxNoOfContractLabour: "",
        maxNoOfWorkmenEmployed:
          application?.workmanDetails?.anydaymaxworkmen?.value,
        noOfWorkmenPermanent:
          application?.workmanDetails?.workmenreg?.value,
        noOfWorkmenTemporary:
          application?.workmanDetails?.tempOrRegularCount?.value,
        similarKindOfWork:
          application?.workmanDetails?.sameOrSimilarWork?.value,
        jobDescription: application?.workmanDetails?.jobDescription?.value,
        wageRatesOtherBenefits:
          application?.workmanDetails?.wageAndBenefits?.value,
        categoryDesignation:
          application?.workmanDetails?.categoryDesignation?.value,
        date: new Date().toLocaleDateString(),
      };

      const firstRemark = remarks && remarks.length > 0 ? remarks[0] : null;
      const issuedBy = firstRemark?.remarkBy ?? "";
      const issuedOnRaw = firstRemark?.dateTime;
      const issuedOn = issuedOnRaw
        ? new Date(issuedOnRaw).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";

      const qrData = {
        slNo: application.applicationStatus?.qrCode ?? "",
        regNo: application.applicationStatus?.registrationNumber ?? "",
        estName: application.establishment?.name?.value ?? "",
        affiliationName: application.contractors?.count ?? "",
        issuedBy,
        issuedOn,
      };

      const lines: string[] = [
        `SL.NO. : ${qrData.slNo}`,
        `REG. NO. : ${qrData.regNo}`,
        `EST. NAME : ${qrData.estName}`,
        `CONTRACTOR LABOUR : ${qrData.affiliationName}`,
      ];

      if (qrData.issuedBy || qrData.issuedOn) {
        lines.push(
          `ISSUED BY : ${qrData.issuedBy}${
            qrData.issuedOn ? ` on ${qrData.issuedOn}` : ""
          }`
        );
      }

      const qrValue = lines.join("\n");

      const qrBase64 = await generateQRCodeBase64(qrValue);
      const htmlString = generateCLRARegCertPdfTemplate(
        dynamicData,
        qrBase64
      );
      setHtml(htmlString);
    };

    buildHtml();
  }, [application, remarks]);

  if (loading && !application) {
    return (
      <div className="p-4">
        <p>Loading certificate...</p>
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="p-4">
        <p className="text-red-600">Unable to load certificate: {error}</p>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="p-4">
        <p>Preparing certificate...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen">
      <iframe
        title="CLRA Registration Certificate"
        srcDoc={html}
        className="w-full h-full border-0"
      />
    </div>
  );
};

export default ClraRegCertificate;