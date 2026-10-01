import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "@/constants/constants";
import { openClraFormIPdf, writeFormIPdfTabPlaceholder } from "@/utils/clraFormIPdf";
import { getAuthToken, getUserId } from "@/utils/auth";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { encryptionDecryptionFun } from "@/utils/encryption";
import { generateBocwaFormIPdfTemplate } from "@/Admin/Pages/BOCWAApplication/BocwaPdfTemplates";
import { generateMtwFormIPdfTemplate } from "@/Admin/Pages/MTWApplication/MtwPdfTemplates";

/**
 * Renders a generated Form-I into a new tab and raises the print dialog.
 * The templates pull in watermark images, so printing waits for load — which can
 * already have fired by the time the document is closed on cached assets.
 */
const openPrintWindow = (htmlContent: string) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Please allow pop-ups to download Form-I");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  const openPrintDialog = () => {
    printWindow.focus();
    printWindow.print();
  };

  if (printWindow.document.readyState === "complete") {
    openPrintDialog();
  } else {
    printWindow.onload = openPrintDialog;
  }
};

const MAX_UPLOAD_BYTES = 200 * 1024; // 200KB

const FormIUpload: React.FC = () => {
  const { enApplicationId, enActId, identificationNo } = useParams<{ enApplicationId: string, enActId: string, identificationNo: string }>();
  const userId = getUserId();
  const enUserId = encryptionDecryptionFun("encrypt", String(userId)) ?? '';
  const applicationId = encryptionDecryptionFun("decrypt", String(enApplicationId)) ?? '';
  const actId = encryptionDecryptionFun("decrypt", String(enActId)) ?? '';

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFile = e.target.files[0];

    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      e.target.value = "";
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_UPLOAD_BYTES) {
      toast.error("File size exceeds 200KB.");
      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };
  //   if (!file) {
  //     alert("Please select a file first.");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("file", file);

  //   try {
  //     setLoading(true);

  //     await axios.post(`${API_BASE}/upload-form1`, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     alert("File uploaded successfully");
  //   } catch (error) {
  //     console.error(error);
  //     alert("Upload failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("File size exceeds 200KB.");
      return;
    }
    try {
      setLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64String = reader.result as string;
        // remove data prefix
        const base64File = base64String.split(",")[1];

        const headers = {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        };

        // API 1
        const uploadFormApi = axios.post(
          `${API_BASE}applicant-module/upload-form1`,
          {
            enact_id: enActId,
            enuser_id: enUserId,
            enapplication_id: enApplicationId,
            identification_number: identificationNo,
            file_name: file.name,
            filecontent: base64File,
          },
          { headers }
        );

        const ACT_ID_TO_NAME_MAP: Record<number, string> = {
          1: 'CLRA',
          2: 'BOCWA',
          3: 'MTW',
        };

        const actName = String(ACT_ID_TO_NAME_MAP[Number(actId)]);

        const documentsUploadApiEndpoint = actName === "MTW" ? "documents/mtw-renewal-doc-upload" : "documents";

        const encryptedUserId = encryptionDecryptionFun("encrypt", String(userId)) ?? '';

        const documentsUploadPayloadMTW = {
          act: actName,
          applicationType: "RENEWAL",
          applicationId: enApplicationId,
          newIdentificationNumber: identificationNo,
          userID: encryptedUserId,
          documentCode: "FI",
          filename: file.name,
          filecontent: base64File,
        };

        // API 2
        const documentUploadApi = axios.post(
          `${API_BASE}${documentsUploadApiEndpoint}`,
          Number(actId) === 3 ? documentsUploadPayloadMTW : {
            act: actName,
            applicationType: "AMEND",
            applicationId: applicationId,
            documentCode: "FI",
            filename: file.name,
            filecontent: base64File,
          },
          { headers }
        );
        // Run both APIs in parallel
        await Promise.all([uploadFormApi, documentUploadApi]);
        toast.success("File Submitted successfully");

        // Redirect to dashboard or another page after successful submission
        navigate("/applicant-dashboard");
      };

      reader.onerror = () => {
        toast.error("File reading failed");
      };
    } catch (error) {
      console.error(error);
      toast.error(`Submission failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };


  const fetchClraApplicationDetails = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}clra/applications/${applicationId}/${userId}/general-details`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res?.data;
    } catch (error) {
      toast.error("Form-I PDF Error!")
      return [];
    }
  }

  const fetchBocwaApplicationDetails = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}applicant-module/bocwa-amendment/form-data?appId=${encodeURIComponent(String(enApplicationId))}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res?.data;
    } catch (error) {
      toast.error("Form-I PDF Error!")
      return [];
    }
  }

  const fetchMtwApplicationDetails = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}mtw/applications/${applicationId}/${userId}/general-details-applicant`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return res?.data;
    } catch (error) {
      toast.error("Form-I PDF Error!");
      return null;
    }
  };

  const handleGenerateFormIClraPdf = async () => {
    // Open the tab synchronously (within the click gesture) so it is not blocked;
    // it is redirected to the generated PDF once the server responds.
    const pdfTab = window.open("", "_blank");
    writeFormIPdfTabPlaceholder(pdfTab);

    try {
      const applicationData: any = await fetchClraApplicationDetails();

      await openClraFormIPdf(applicationData, pdfTab);
    } catch (error) {
      if (pdfTab && !pdfTab.closed) pdfTab.close();
      console.error(error);
      toast.error(`Form-I PDF Download failed: ${error}`);
    }
  };

  const handleGenerateFormIBocwaPdf = async () => {
    const applicationData: any = await fetchBocwaApplicationDetails();
    const establishmentData: any = applicationData?.establishment;

    const dynamicData = {
      establishmentName: establishmentData?.e_name,
      establishmentAddress: `${establishmentData?.addresses?.establishment}`, // <br/> ${villageWardName}, ${blockName}, ${subDivName}, <br/> Dist - ${distName}, PIN - ${pinCode}`,
      postalAddress: `${establishmentData?.addresses?.postal}`, // <br/> ${villageWardNamePostal}, ${blockNamePostal}, ${subDivNamePostal}, <br/> Dist - ${distNamePostal}, PIN - ${pinCodePostal}`,
      permanentAddress: `${establishmentData?.addresses?.permanent}`, // <br/> ${villageWardNamePermanent}, ${blockNamePermanent}, ${subDivNamePermanent}, <br/> Dist - ${distNamePermanent}, PIN - ${pinCodePermanent}`,
      managerName: establishmentData?.full_name_manager,
      managerAddress: `${establishmentData?.addresses?.manager}`, // <br/> ${villageWardNameManager}, ${blockNameManager}, ${subDivNameManager}, <br/> Dist - ${distNameManager}, PIN - ${pinCodeManager}`,

      natureOfWork: establishmentData?.nature_of_build_const,
      maxDirectWorkers: establishmentData?.max_no_of_building_workers_employed,
      estDateComm: `${(new Date(establishmentData?.est_date_of_commencement_building ?? ""))?.toLocaleDateString() ?? ""}`,
      estDateComp: `${(new Date(establishmentData?.est_date_of_completion_building ?? ""))?.toLocaleDateString() ?? ""}`,
      amount: applicationData?.fees?.total,

      registrationNo: establishmentData?.registration_number ?? "",
      // registrationDate: registrationDate,
      registrationDate: `${(new Date(establishmentData?.registration_date ?? ""))?.toLocaleDateString() ?? ""}`,
      applicationDate: `${new Date().toLocaleDateString()}`,

      // date: new Date().toLocaleDateString(),
    };

    const htmlContent = generateBocwaFormIPdfTemplate(dynamicData);

    openPrintWindow(htmlContent);
  };

  const handleGenerateFormIMtwPdf = async () => {
    try {
      const applicationData: any = await fetchMtwApplicationDetails();

      if (!applicationData) {
        toast.error("No data found");
        return;
      }

      const establishment = applicationData?.establishment;
      const owners = applicationData?.ownershipResult || [];

      const address = establishment?.mtwLocationAddress?.value;

      let distName = "";
      let subDivName = "";
      let blockName = "";
      let villageWardName = "";
      let policeStationName = "";

      try {
        if (address?.district) {
          const districtRes = await axios.get(`${API_BASE}district/${address.district}`);
          distName = districtRes?.data?.district_name;
        }

        if (address?.district && address?.subdivision) {
          const subDivRes = await axios.get(
            `${API_BASE}subdivision/${address.district}/${address.subdivision}`
          );
          subDivName = subDivRes?.data?.sub_div_name;
        }

        if (address?.district && address?.subdivision && address?.areaType && address?.areaTypeCode) {
          const blockRes = await axios.get(
            `${API_BASE}block/${address.district}/${address.subdivision}/${address.areaType.toLowerCase()}/${address.areaTypeCode}`
          );
          blockName = blockRes?.data?.block_mun_name;
        }

        if (address?.areaTypeCode && address?.villageOrWard) {
          const villageRes = await axios.get(
            `${API_BASE}villageward/${address.areaTypeCode}/${address.villageOrWard}`
          );
          villageWardName = villageRes?.data?.village_name;
        }

        if (address?.district && address?.policeStation) {
          const psRes = await axios.get(
            `${API_BASE}policestation/${address.district}/${address.policeStation}`
          );
          policeStationName = psRes?.data?.name_of_police_station;
        }

      } catch (err) {
        console.error("Address fetch error", err);
      }

      // ✅ FILTER OWNERS
      const proprietorsPartners = owners.filter(
        (o: any) =>
          ["proprietor", "partner"].includes(o.designation?.toLowerCase())
      );

      const directors = owners.filter(
        (o: any) => o.designation?.toLowerCase() === "director"
      );

      const generalManagers = owners.filter(
        (o: any) => o.designation?.toLowerCase() === "general_manager"
      );

      // ✅ FORMAT FUNCTION
      const formatPeople = (list: any[]) =>
        list.length > 0
          ? list
            .map(
              (o) => `
              <div style="margin-bottom:6px;">
                <b>${o.name}</b><br/>
                ${o.address}
              </div>
            `
            )
            .join("")
          : "-";

      const dynamicData = {
        // ✅ Establishment
        establishmentName: establishment?.mtwName?.value || "",

        establishmentAddress: `
        ${villageWardName || ""}, ${blockName || ""}, ${subDivName || ""} <br/>
        Dist - ${distName || ""}, PIN - ${address?.pinCode || ""}
        `,
        postalAddress: `
        ${villageWardName || ""}, ${blockName || ""} <br/>
        ${subDivName || ""}, PS - ${policeStationName || ""} <br/>
        ${distName || ""}, PIN - ${address?.pinCode || ""}
        `,

        // ✅ Service Details
        natureOfWork: applicationData?.natureOfService?.value || "",

        totalRoutes: applicationData?.totalNoOfRoutes?.value || "",
        totalMileage: applicationData?.totalRouteMilage?.value || "",
        totalVehicles: applicationData?.totalNoOfVehicles?.value || "",
        maxWorkers: applicationData?.maxWorkers?.value || "",

        // ✅ Ownership
        proprietorsPartners: formatPeople(proprietorsPartners),
        directors: formatPeople(directors),
        generalManagers: formatPeople(generalManagers),

        allOwners: formatPeople(owners),

        // ✅ Fees
        amount: applicationData?.fees?.value || 0,

        // ✅ Registration
        registrationNo:
          applicationData?.applicationStatus?.registrationNumber || "",

        registrationDate: applicationData?.applicationStatus?.registrationDate
          ? new Date(
            applicationData.applicationStatus.registrationDate
          ).toLocaleDateString()
          : "",

        applicationDate: new Date().toLocaleDateString(),
      };

      const htmlContent = generateMtwFormIPdfTemplate(dynamicData);

      openPrintWindow(htmlContent);
    } catch (error) {
      console.error(error);
      toast.error("MTW Form-I generation failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start py-5 pb-10">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md border">
        {/* Header */}
        <div className="bg-[#1e73be] text-white px-6 py-3 rounded-t-lg font-semibold">
          Upload Documents
        </div>

        <div className="p-6 space-y-6">

          {/* Download Button */}
          <div>
            <button
              // onClick={handleGenerateFormIClraPdf}
              onClick={
                actId === "1"
                  ? handleGenerateFormIClraPdf
                  : actId === "2"
                    ? handleGenerateFormIBocwaPdf
                    : actId === "3"
                      ? handleGenerateFormIMtwPdf   // ✅ ADD THIS
                      : () => { }
              }
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm font-medium rounded border"
            >
              Download FORM - I
            </button>
          </div>

          {/* Upload Section */}
          <div className="space-y-3">
            <label className="block font-medium text-gray-700">
              Upload Signed FORM I <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0 file:text-sm file:font-semibold
                file:bg-blue-50 file:text-[#1e73be] hover:file:bg-blue-100"
              />
            </div>
            <p className="text-xs text-gray-500">PDF only, up to 200KB.</p>
          </div>

          {/* Note */}
          <p className="text-red-600 text-sm">
            NOTE: FORM-I should be duly signed and uploaded in order to obtain
            Registration Certificate (FORM-II).
          </p>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-[#1e73be] hover:bg-[#175a93] text-white rounded"
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default FormIUpload;

