import { API_BASE } from "@/constants/constants";
import { getUserId, getUserRole } from "@/utils/auth";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import NormalInspectionForm from "./NormalInspectionForm";
import CaseTimeline, {
  StatusBadge,
  type CaseStatus,
  type TimelineEvent,
} from "./CaseTimeline";

const UploadNotePage: React.FC = () => {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const [searchParams] = useSearchParams();
  const randId = params.get("inspectionId");
  const source = params.get("source") || "";
  const isCentral = params.get("is-central") === "true" || params.get("isCentral") === "true";
  // Public "View & Download" preview — hide ALC case timeline tab
  const isPublicView = params.get("public") === "true";
  const [activeTab, setActiveTab] = useState(1);
  const [inspectionNoteId, setInspectionNoteId] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [realIsSubmitted, setIsSubmitted] = useState(false);
  const [draftOwnerId, setDraftOwnerId] = useState<string | number | null>(null);
  const [draftOwnerRoleId, setDraftOwnerRoleId] = useState<number | null>(null);

  const currentUserId = getUserId();
  const currentUserRole = Number(getUserRole());
  const isInspector = currentUserRole === 7;
  const hasEditPermission = isInspector && (!isLocked || !draftOwnerId || draftOwnerRoleId !== 7 || String(draftOwnerId) === String(currentUserId));
  const isSubmitted = realIsSubmitted || !hasEditPermission;

  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [moduleType, setModuleType] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [infringementRemarks, setInfringementRemarks] = useState<
    Record<number, string>
  >({});
  const [selectedInfringements, setSelectedInfringements] = useState<number[]>(
    [],
  );
  const [laws, setLaws] = useState<any[]>([]);
  const [filteredLaws, setFilteredLaws] = useState<any[]>([]);
  const [lawSearch, setLawSearch] = useState("");
  const [lawLoading, setLawLoading] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [infringmentData, setInfringmentData] = useState<any>(null);
  const [establishmentData, setEstablishmentData] = useState<any>(null);

  // Case timeline / normalized status
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
  const [caseTimeline, setCaseTimeline] = useState<TimelineEvent[]>([]);
  const [hasAlcAction, setHasAlcAction] = useState(false);

  // States for normal inspection inputs
  const [estName, setEstName] = useState("");
  const [typeOfEst, setTypeOfEst] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSubdivision, setSelectedSubdivision] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedGPWard, setSelectedGPWard] = useState("");
  const [selectedPoliceStation, setSelectedPoliceStation] = useState("");
  const [pinCode, setPinCode] = useState("");

  // Dropdown lists
  const [districts, setDistricts] = useState<any[]>([]);
  const [subdivisions, setSubdivisions] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [gpWards, setGpWards] = useState<any[]>([]);
  const [policeStations, setPoliceStations] = useState<any[]>([]);

  // Fetch districts on mount (if normal inspection)
  useEffect(() => {
    if (!isCentral) {
      const fetchDistricts = async () => {
        try {
          const res = await axios.get(`${API_BASE}district`);
          setDistricts(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      };
      fetchDistricts();
    }
  }, [isCentral]);

  // Fetch subdivisions and police stations when selectedDistrict changes
  useEffect(() => {
    if (!isCentral && selectedDistrict) {
      const fetchSubdivisions = async () => {
        try {
          const res = await axios.get(`${API_BASE}subdivision/${selectedDistrict}`);
          setSubdivisions(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error("Error fetching subdivisions:", error);
        }
      };
      const fetchPoliceStations = async () => {
        try {
          const res = await axios.get(`${API_BASE}policestation/${selectedDistrict}`);
          setPoliceStations(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error("Error fetching police stations:", error);
        }
      };
      fetchSubdivisions();
      fetchPoliceStations();
      if (!isLocked) {
        setSelectedSubdivision("");
        setBlocks([]);
        setSelectedBlock("");
        setGpWards([]);
        setSelectedGPWard("");
        setSelectedPoliceStation("");
      }
    }
  }, [selectedDistrict, isCentral, isLocked]);

  // Fetch blocks when selectedSubdivision changes
  useEffect(() => {
    if (!isCentral && selectedDistrict && selectedSubdivision) {
      const fetchBlocks = async () => {
        try {
          const res = await axios.get(`${API_BASE}block/${selectedDistrict}/${selectedSubdivision}`);
          setBlocks(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error("Error fetching blocks:", error);
        }
      };
      fetchBlocks();
      if (!isLocked) {
        setSelectedBlock("");
        setGpWards([]);
        setSelectedGPWard("");
      }
    }
  }, [selectedDistrict, selectedSubdivision, isCentral, isLocked]);

  // Fetch GP/Wards when selectedBlock changes
  useEffect(() => {
    console.log(selectedBlock);
    if (!isCentral && selectedBlock) {
      const fetchGPWards = async () => {
        try {
          const res = await axios.get(`${API_BASE}villageward/${selectedBlock}`);
          console.log(res.data);
          setGpWards(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
          console.error("Error fetching GP/Wards:", error);
        }
      };
      fetchGPWards();
      if (!isLocked) {
        setSelectedGPWard("");
      }
    }
  }, [selectedBlock, isCentral, isLocked]);

  const handleFetchLaws = async () => {
    try {
      setLawLoading(true);

      const res = await axios.get(`${API_BASE}inspections/law/get-laws`);

      if (res.data?.status) {
        setLaws(res.data.data || []);
        setFilteredLaws(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching laws:", error);
      toast.error("Failed to fetch laws");
    } finally {
      setLawLoading(false);
    }
  };

  const handleFetchAlreadyLock = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}inspections/check-already-locked`,
        {
          randId: Number(randId),
        },
      );

      const existingNoteData = res.data.data.existingNote;
      const existingInfData = res.data.data.existingInfring || [];

      setInfringmentData(existingInfData);

      // Check if ins_status is 'FS' on any of the infringement items
      const isSubmittedCheck = existingInfData.some((item: any) => item.ins_status === "FS");
      setIsSubmitted(isSubmittedCheck);

      const filePath = existingInfData.find((item: any) => item.uploaded_file_path)?.uploaded_file_path || null;
      setUploadedFilePath(filePath);

      if (existingInfData.length > 0) {
        setSelectedInfringements(
          existingInfData.map((item: any) => item.infra_id),
        );

        const remarksMap = existingInfData.reduce(
          (acc: Record<number, string>, item: any) => {
            acc[item.infra_id] = item.ins_remark || "";
            return acc;
          },
          {},
        );

        setInfringementRemarks(remarksMap);
      }

      if (existingNoteData) {
        setDraftOwnerId(existingNoteData.inspector_id);
        setDraftOwnerRoleId(res.data.data.insUserRoleId || null);
        setIsLocked(true);
        setInspectionNoteId(existingNoteData.id);
        setModuleType(existingNoteData.act || "");
        setRegistrationNumber(existingNoteData.est_reg_no || "");
        setEstablishmentData({
          name: existingNoteData.est_name,
          registration_no: existingNoteData.est_reg_no,
          act_id: existingNoteData.act,
          postal_address: existingNoteData.est_post,
          address: existingNoteData.est_address,
          type_of_establishment: existingNoteData.est_type,
          district: existingNoteData.district,
          subdivision: existingNoteData.sub_div,
          block: existingNoteData.block,
          gp_ward: existingNoteData.ward,
          pincode: existingNoteData.pin,
        });
        if (existingNoteData?.isCentral) {
          searchParams.set("isCentral", String(existingNoteData?.isCentral));
          navigate(`?${searchParams.toString()}`, {
            replace: true,
          });
        }
        if (isSubmittedCheck) {
          setActiveTab(3);
          toast.info("Inspection already submitted. Loading details in preview mode.");
        } else {
          toast.info("Inspection already locked. Establishment details loaded.");
        }
      }

      setInfringmentData(existingInfData);
    } catch (error) {
      console.error("Error fetching already locked status:", error);
    }
  };

  const handleInfringementChange = (id: number) => {
    if (isSubmitted) return;
    setSelectedInfringements((prev) => {
      const exists = prev.includes(id);

      if (exists) {
        const updatedRemarks = { ...infringementRemarks };
        delete updatedRemarks[id];
        setInfringementRemarks(updatedRemarks);

        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  const handleSaveInfringements = async () => {
    if (isSubmitted) return;
    try {
      const payload = selectedInfringements.map((id) => {
        const law = laws.find((item) => item.ispection_id === id);

        return {
          inspectorId: getUserId(),
          infringId: id,
          infringText: law?.inspection_txt || "",
          remark: infringementRemarks[id] || "",
          fileNo: inspectionNoteId,
          infringType: law?.inspection_txt_type || "",
          isCentral: isCentral,
        };
      });

      const res = await axios.post(
        `${API_BASE}inspections/infringments`,
        payload,
      );

      if (res.data?.success || res.data?.status) {
        toast.success("Infringements saved successfully");
        setActiveTab(3);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save infringements");
    }
  };

  const handleVerify = async () => {
    try {
      if (!moduleType) {
        toast.error("Please select a module");
        return;
      }

      if (!registrationNumber.trim()) {
        toast.error("Please enter registration number");
        return;
      }

      const actIdMap: Record<string, string> = {
        "CLRA(PE)": "CLRA",
        BOCWA: "BOCWA",
        MTW: "MTW",
      };

      setVerifyLoading(true);

      const response = await axios.post(
        `${API_BASE}inspections/get-establishment-data`,
        {
          registration_no: registrationNumber,
          actId: actIdMap[moduleType],
        },
      );

      if (response.data?.status) {
        setEstablishmentData(response.data.data);

        toast.success("Establishment verified successfully");
      }
    } catch (error: any) {
      console.error(error);

      setEstablishmentData(null);

      toast.error(
        error?.response?.data?.message ||
        "Failed to fetch establishment details",
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleLockInspectionWithId = async () => {
    try {
      // if (!moduleType) {
      //   toast.error("Please select a module");
      //   return;
      // }

      if (!isCentral) {
        if (!estName.trim()) {
          toast.error("Please enter establishment name");
          return;
        }
        if (!typeOfEst) {
          toast.error("Please select type of establishment");
          return;
        }
        if (!addressLine1.trim()) {
          toast.error("Please enter address line 1");
          return;
        }
        if (!selectedDistrict) {
          toast.error("Please select district");
          return;
        }
        if (!selectedSubdivision) {
          toast.error("Please select subdivision");
          return;
        }
        if (!selectedBlock) {
          toast.error("Please select block/municipality");
          return;
        }
        if (!selectedGPWard) {
          toast.error("Please select GP/Ward");
          return;
        }
        if (!selectedPoliceStation) {
          toast.error("Please select police station");
          return;
        }
        if (!pinCode.trim()) {
          toast.error("Please enter pin code");
          return;
        }
        if (!/^[1-9]\d{5}$/.test(pinCode.trim())) {
          toast.error("Pin code must be a valid 6-digit number");
          return;
        }
      } else {
        if (!establishmentData) {
          toast.error("Please verify establishment details first");
          return;
        }
      }

      const districtObj = districts.find(d => String(d.id) === String(selectedDistrict));
      const districtName = districtObj ? (districtObj.district_name || districtObj.name || "") : "";

      const subdivisionObj = subdivisions.find(s => String(s.sub_div_code) === String(selectedSubdivision));
      const subdivisionName = subdivisionObj ? (subdivisionObj.sub_div_name || "") : "";

      const blockObj = blocks.find(b => String(b.block_code) === String(selectedBlock));
      const blockName = blockObj ? (blockObj.block_mun_name || "") : "";

      const gpWardObj = gpWards.find(g => String(g.village_code) === String(selectedGPWard));
      const gpWardName = gpWardObj ? (gpWardObj.village_name || "") : "";

      const policeStationObj = policeStations.find(p => String(p.police_station_code) === String(selectedPoliceStation));
      const policeStationName = policeStationObj ? (policeStationObj.name_of_police_station || "") : "";

      const payload = {
        randomization_details_id: randId,
        registration_no: isCentral ? (establishmentData ? establishmentData.registration_no : "") : "N/A",
        actId: moduleType,
        establishment_name: isCentral ? (establishmentData ? establishmentData.name : "") : estName,
        est_address: isCentral ? (establishmentData ? establishmentData.address : "") : addressLine1,
        est_post: isCentral ? (establishmentData ? establishmentData.postal_address : "") : policeStationName,
        inspector_id: getUserId(),
        isCentral,
        est_type: isCentral ? "" : typeOfEst,
        district: isCentral ? "" : districtName,
        sub_div: isCentral ? "" : subdivisionName,
        block: isCentral ? "" : blockName,
        ward: isCentral ? "" : gpWardName,
        pin: isCentral ? null : (pinCode ? Number(pinCode) : null),
      };

      const res = await axios.post(
        `${API_BASE}inspections/lock-inspection-with-id`,
        payload,
      );

      if (res.data?.status) {
        setInspectionNoteId(res.data.data.id);
        setDraftOwnerId(currentUserId);
        setDraftOwnerRoleId(currentUserRole);
        setIsLocked(true);

        toast.success(res.data.message);

        if (!isCentral) {
          setEstablishmentData({
            name: estName,
            registration_no: "N/A",
            act_id: moduleType,
            postal_address: policeStationName,
            address: addressLine1,
            type_of_establishment: typeOfEst,
            district: districtName,
            subdivision: subdivisionName,
            block: blockName,
            gp_ward: gpWardName,
            pincode: pinCode ? Number(pinCode) : null,
          });
        }

        setActiveTab(2);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      if (!uploadFile) {
        toast.error("Please upload inspection note");
        return;
      }

      const formData = new FormData();

      formData.append("file", uploadFile);
      formData.append("fileNo", String(inspectionNoteId));

      const res = await axios.post(
        `${API_BASE}inspections/final-submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data?.success || res.data?.status) {
        toast.success("Inspection submitted successfully");
      }
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit inspection");
    }
  };

  useEffect(() => {
    if (!lawSearch.trim()) {
      setFilteredLaws(laws);
      return;
    }

    const search = lawSearch.toLowerCase();

    const filtered = laws.filter(
      (item) =>
        item.inspection_txt?.toLowerCase().includes(search) ||
        item.inspection_name?.toLowerCase().includes(search) ||
        item.inspection_txt_type?.toLowerCase().includes(search),
    );

    setFilteredLaws(filtered);
  }, [lawSearch, laws]);

  useEffect(() => {
    if ((activeTab === 2 || 3) && laws.length === 0) {
      handleFetchLaws();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!infringmentData?.length) return;

    setSelectedInfringements(infringmentData.map((item: any) => item.infra_id));

    const remarksMap = infringmentData.reduce(
      (acc: Record<number, string>, item: any) => {
        acc[item.infra_id] = item.ins_remark || "";
        return acc;
      },
      {},
    );

    setInfringementRemarks(remarksMap);
  }, [infringmentData]);

  useEffect(() => {
    if (isCentral) {
      handleFetchAlreadyLock();
    }
  }, [isCentral]);

  // ─── CASE TIMELINE + NORMALIZED STATUS ───
  useEffect(() => {
    const fileNo = inspectionNoteId || randId;
    if (!fileNo || isPublicView) return;
    axios
      .get(`${API_BASE}inspections/case-timeline?fileNo=${encodeURIComponent(String(fileNo))}`)
      .then((res) => {
        const data = res.data?.data;
        if (!data) return;
        setCaseStatus(data.currentStatus || null);
        setCaseTimeline(Array.isArray(data.timeline) ? data.timeline : []);
        setHasAlcAction(!!data.hasAlcAction);
      })
      .catch(console.error);
  }, [inspectionNoteId, randId, isPublicView]);

  // ── Normal (non-CIS) inspection: delegate to dedicated 4-tab component ──
  if (!isCentral) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <NormalInspectionForm randId={randId} source={source} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 rounded-xl border border-[#d7e0ea] bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#203040]">
            Inspection Note Submission
          </h1>

          <p className="mt-1 text-sm text-[#607080]">
            Complete the process in three steps.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex overflow-hidden rounded-lg border border-[#d7e0ea] bg-white">
          <button
            onClick={() => setActiveTab(1)}
            className={`flex-1 p-4 font-medium cursor-pointer ${activeTab === 1
              ? "bg-[#3b8dbc] text-white"
              : "bg-white text-[#203040]"
              }`}
          >
            1. Establishment
          </button>

          <button
            onClick={() => (isLocked || isSubmitted) && setActiveTab(2)}
            className={`flex-1 p-4 font-medium ${(isLocked || isSubmitted) ? "cursor-pointer" : "cursor-not-allowed opacity-60"
              } ${activeTab === 2
                ? "bg-[#3b8dbc] text-white"
                : "bg-white text-[#203040]"
              }`}
          >
            2. Infringement
          </button>

          <button
            onClick={() => (isLocked || isSubmitted) && setActiveTab(3)}
            className={`flex-1 p-4 font-medium ${(isLocked || isSubmitted) ? "cursor-pointer" : "cursor-not-allowed opacity-60"
              } ${activeTab === 3
                ? "bg-[#3b8dbc] text-white"
                : "bg-white text-[#203040]"
              }`}
          >
            3. Preview
          </button>

          {hasAlcAction && (
            <button
              onClick={() => setActiveTab(4)}
              className={`flex-1 p-4 font-medium cursor-pointer ${activeTab === 4
                ? "bg-[#3b8dbc] text-white"
                : "bg-white text-[#203040]"
                }`}
            >
              4. Case Timeline
            </button>
          )}
        </div>

        {caseStatus && (
          <div className="mb-4 flex items-center justify-end gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              Current Status
            </span>
            <StatusBadge status={caseStatus} />
          </div>
        )}

        {/* TAB 1 */}
        {activeTab === 1 && (
          <div className="rounded-xl border border-[#d7e0ea] bg-white p-6 shadow-sm">
            {isCentral ? (
              // Central Inspection UI
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Module</label>
                    <select
                      disabled={isLocked}
                      value={moduleType}
                      onChange={(e) => setModuleType(e.target.value)}
                      className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3"
                    >
                      <option value="">Select Module</option>
                      <option value="CLRA(PE)">CLRA(PE)</option>
                      <option value="BOCWA">BOCWA</option>
                      <option value="MTW">MTW</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      disabled={isLocked}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="Enter Registration Number"
                      className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {!isLocked && (
                  <div className="mt-5">
                    <button
                      onClick={handleVerify}
                      disabled={verifyLoading}
                      className="rounded-lg bg-[#3b8dbc] px-6 py-3 text-white hover:bg-[#327aa5] disabled:opacity-50 cursor-pointer"
                    >
                      {verifyLoading ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                )}

                {/* Establishment Details */}
                {establishmentData && (
                  <div className="mt-8 rounded-lg border border-[#d7e0ea] bg-[#f8fafc] p-5">
                    <h3 className="mb-4 text-lg font-semibold">
                      Establishment Details
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <span className="font-medium">Establishment Name:</span>
                        <p>{establishmentData.name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Registration No:</span>
                        <p>{establishmentData.registration_no}</p>
                      </div>
                      <div>
                        <span className="font-medium">Act:</span>
                        <p>{establishmentData.act_id}</p>
                      </div>
                      <div>
                        <span className="font-medium">Postal Address:</span>
                        <p>{establishmentData.postal_address}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium">Address:</span>
                        <p>{establishmentData.address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Normal Inspection UI
              <>
                {!isLocked ? (
                  <div className="">
                    <h3 className="mb-4 text-lg font-semibold text-[#203040]">
                      Establishment Details
                    </h3>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#203040]">
                          Name of the Establishment/Industry/Shop <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={estName}
                          onChange={(e) => setEstName(e.target.value)}
                          placeholder="Enter Establishment Name"
                          className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3 focus:border-[#3b8dbc] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#203040]">
                          Type of The Establishment <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={typeOfEst}
                          onChange={(e) => setTypeOfEst(e.target.value)}
                          className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3 focus:border-[#3b8dbc] focus:outline-none"
                        >
                          <option value="">- Select -</option>
                          <option value="micro">Micro</option>
                          <option value="small">Small</option>
                          <option value="midium">Midium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-[#203040]">
                          Address Line1 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          placeholder="Enter Address"
                          className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3 focus:border-[#3b8dbc] focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    <div className="mt-5 grid gap-5 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#203040]">
                          District <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3 focus:border-[#3b8dbc] focus:outline-none"
                        >
                          <option value="">- Select District -</option>
                          {districts.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.district_name || d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#203040]">
                          Sub-division <span className="text-red-500">*</span>
                        </label>
                        <select
                          disabled={!selectedDistrict}
                          value={selectedSubdivision}
                          onChange={(e) => setSelectedSubdivision(e.target.value)}
                          className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3 focus:border-[#3b8dbc] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">- Select Sub-division -</option>
                          {subdivisions.map((sd) => (
                            <option key={sd.sub_div_code} value={sd.sub_div_code}>
                              {sd.sub_div_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#203040]">
                          Block/Municipality/Corporation/SEZ/NA <span className="text-red-500">*</span>
                        </label>
                        <select
                          disabled={!selectedSubdivision}
                          value={selectedBlock}
                          onChange={(e) => setSelectedBlock(e.target.value)}
                          className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3 focus:border-[#3b8dbc] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">- Select Block -</option>
                          {blocks.map((b) => (
                            <option key={b.block_code} value={b.block_code}>
                              {b.block_mun_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#203040]">
                          GP / Ward <span className="text-red-500">*</span>
                        </label>
                        <select
                          disabled={!selectedBlock}
                          value={selectedGPWard}
                          onChange={(e) => setSelectedGPWard(e.target.value)}
                          className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3 focus:border-[#3b8dbc] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">- Select GP/Ward -</option>
                          {gpWards.map((v) => (
                            <option key={v.village_code} value={v.village_code}>
                              {v.village_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#203040]">
                          Police Station <span className="text-red-500">*</span>
                        </label>
                        <select
                          disabled={!selectedDistrict}
                          value={selectedPoliceStation}
                          onChange={(e) => setSelectedPoliceStation(e.target.value)}
                          className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3 focus:border-[#3b8dbc] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">- Select Police Station -</option>
                          {policeStations.map((ps) => (
                            <option key={ps.police_station_code} value={ps.police_station_code}>
                              {ps.name_of_police_station}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-[#203040]">
                          Pin Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={pinCode}
                          inputMode="numeric"
                          maxLength={6}
                          onChange={(e) =>
                            setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          placeholder="6-digit pin code"
                          className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3 focus:border-[#3b8dbc] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  establishmentData && (
                    <div className="mt-8 rounded-lg border border-[#d7e0ea] bg-[#f8fafc] p-5">
                      <h3 className="mb-4 text-lg font-semibold">
                        Establishment Details
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <span className="font-medium">Establishment Name:</span>
                          <p>{establishmentData.name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Type of Establishment:</span>
                          <p>{establishmentData.type_of_establishment}</p>
                        </div>
                        <div>
                          <span className="font-medium">Act:</span>
                          <p>{establishmentData.act_id}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium">Address Line 1:</span>
                          <p>{establishmentData.address}</p>
                        </div>
                        <div>
                          <span className="font-medium">District:</span>
                          <p>{establishmentData.district}</p>
                        </div>
                        <div>
                          <span className="font-medium">Sub-division:</span>
                          <p>{establishmentData.subdivision}</p>
                        </div>
                        <div>
                          <span className="font-medium">Block:</span>
                          <p>{establishmentData.block}</p>
                        </div>
                        <div>
                          <span className="font-medium">GP / Ward:</span>
                          <p>{establishmentData.gp_ward}</p>
                        </div>
                        <div>
                          <span className="font-medium">Police Station (Postal Address):</span>
                          <p>{establishmentData.postal_address}</p>
                        </div>
                        <div>
                          <span className="font-medium">Pin Code:</span>
                          <p>{establishmentData.pincode}</p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() =>
                  isLocked ? setActiveTab(2) : handleLockInspectionWithId()
                }
                className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* TAB 2 */}
        {activeTab === 2 && (
          <div className="rounded-xl border border-[#d7e0ea] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Select Infringements</h3>

            <div className="mb-4">
              <input
                type="text"
                value={lawSearch}
                onChange={(e) => setLawSearch(e.target.value)}
                placeholder="Search by law text, category, act name..."
                className="w-full rounded-lg border border-[#d7e0ea] px-4 py-3"
              />
            </div>

            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Total Records: {filteredLaws.length}
              </span>
            </div>

            <div className="max-h-[500px] overflow-y-auto rounded-lg border border-[#d7e0ea] p-4">
              {lawLoading ? (
                <div className="py-10 text-center">Loading laws...</div>
              ) : filteredLaws.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  No records found
                </div>
              ) : (
                filteredLaws.map((item) => (
                  <label
                    key={item.ispection_id}
                    className={`mb-3 block rounded-lg border p-3 ${isSubmitted ? "opacity-80 text-gray-650" : "hover:bg-gray-50 cursor-pointer"
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        disabled={isSubmitted}
                        checked={selectedInfringements.includes(
                          item.ispection_id,
                        )}
                        onChange={() =>
                          handleInfringementChange(item.ispection_id)
                        }
                        className="mt-1 disabled:cursor-not-allowed"
                      />

                      <div className="flex-1">
                        <div className="mt-1 text-[16px] text-black font-bold">
                          {item.inspection_name}
                        </div>

                        <div className="font-medium text-[#203040]">
                          {item.inspection_txt}
                        </div>

                        {selectedInfringements.includes(item.ispection_id) && (
                          <div className="mt-3">
                            <label className="mb-1 block text-sm font-medium">
                              Remark
                            </label>

                            <textarea
                              rows={3}
                              disabled={isSubmitted}
                              value={
                                infringementRemarks[item.ispection_id] || ""
                              }
                              onChange={(e) =>
                                setInfringementRemarks((prev) => ({
                                  ...prev,
                                  [item.ispection_id]: e.target.value,
                                }))
                              }
                              placeholder={
                                isSubmitted
                                  ? "No remarks (submitted)"
                                  : "Enter remark for this infringement..."
                              }
                              className="w-full rounded-lg border border-[#d7e0ea] p-3 disabled:bg-gray-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setActiveTab(1)}
                className="rounded-lg bg-gray-500 px-6 py-3 text-white cursor-pointer"
              >
                Previous
              </button>

              <button
                onClick={() => isSubmitted ? setActiveTab(3) : handleSaveInfringements()}
                className="rounded-lg bg-green-600 px-6 py-3 text-white cursor-pointer"
              >
                {isSubmitted ? "Next" : "Save & Next"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3 */}
        {activeTab === 3 && (
          <div className="rounded-xl border border-[#d7e0ea] bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold">Preview</h3>

            <div className="rounded-lg border bg-[#f8fafc] p-5">
              <h4 className="mb-3 font-semibold">Establishment Information</h4>

              {isCentral ? (
                <>
                  <p>Name: {establishmentData?.name}</p>
                  <p>Registration No: {establishmentData?.registration_no}</p>
                  <p>Postal Address: {establishmentData?.postal_address}</p>
                  <p>Address: {establishmentData?.address}</p>
                </>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <p className="md:col-span-2"><span className="font-semibold text-slate-700">Name:</span> {establishmentData?.name || estName}</p>
                  <p><span className="font-semibold text-slate-700">Type:</span> {establishmentData?.type_of_establishment || typeOfEst}</p>
                  <p><span className="font-semibold text-slate-700">Address Line1:</span> {establishmentData?.address || addressLine1}</p>
                  <p>
                    <span className="font-semibold text-slate-700">District:</span>{" "}
                    {establishmentData?.district ||
                      districts.find(d => String(d.id) === String(selectedDistrict))?.district_name ||
                      districts.find(d => String(d.id) === String(selectedDistrict))?.name ||
                      ""}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Sub-division:</span>{" "}
                    {establishmentData?.subdivision ||
                      subdivisions.find(s => String(s.sub_div_code) === String(selectedSubdivision))?.sub_div_name ||
                      ""}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Block/Municipality/Corporation/SEZ/NA:</span>{" "}
                    {establishmentData?.block ||
                      blocks.find(b => String(b.block_code) === String(selectedBlock))?.block_mun_name ||
                      ""}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">GP / Ward:</span>{" "}
                    {establishmentData?.gp_ward ||
                      gpWards.find(g => String(g.village_code) === String(selectedGPWard))?.village_name ||
                      ""}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Police Station:</span>{" "}
                    {policeStations.find(p => String(p.police_station_code) === String(establishmentData?.postal_address || selectedPoliceStation))?.name_of_police_station ||
                      establishmentData?.postal_address ||
                      ""}
                  </p>
                  <p><span className="font-semibold text-slate-700">Pin Code:</span> {establishmentData?.pincode || pinCode}</p>
                </div>
              )}
            </div>
            {selectedInfringements.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-lg text-gray-800">Selected Infringements Under Acts</h4>

                {(() => {
                  const grouped: Record<string, number[]> = {};
                  selectedInfringements.forEach((id) => {
                    const law = laws.find((item) => item.ispection_id === id);
                    const act = (law?.inspection_name || "General Labour Law").trim();
                    if (!grouped[act]) grouped[act] = [];
                    grouped[act].push(id);
                  });

                  return Object.entries(grouped).map(([actName, ids]) => (
                    <div key={actName} className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-sm">{actName}</span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                          {ids.length} {ids.length === 1 ? "Infringement" : "Infringements"}
                        </span>
                      </div>
                      <div className="divide-y divide-gray-100 p-4 space-y-3">
                        {ids.map((id, idx) => {
                          const law = laws.find((item) => item.ispection_id === id);
                          return (
                            <div key={id} className="pt-2 first:pt-0">
                              <p className="text-xs font-medium text-gray-800 leading-relaxed">
                                <span className="font-semibold text-gray-500 mr-1.5">#{idx + 1}</span>
                                {law?.inspection_txt}
                              </p>
                              {infringementRemarks[id] && (
                                <p className="mt-1 text-[11px] text-blue-800 bg-blue-50 border border-blue-100 rounded px-2 py-1">
                                  <span className="font-semibold text-blue-900">Remark: </span>
                                  {infringementRemarks[id]}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}

            {isSubmitted ? (
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <span className="block font-medium text-slate-700 mb-2">Uploaded Inspection Note:</span>
                {uploadedFilePath ? (
                  <a
                    href={`${API_BASE.replace(/\/$/, "")}${uploadedFilePath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 cursor-pointer"
                  >
                    View Uploaded Document
                  </a>
                ) : (
                  <span className="text-xs text-gray-500 italic">Document path not found.</span>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <label className="mb-2 block font-medium">
                  Upload Inspection Note *
                </label>

                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && file.size > 200 * 1024) {
                      toast.error("PDF size must not exceed 200 KB.");
                      e.target.value = "";
                      setUploadFile(null);
                      return;
                    }
                    setUploadFile(file);
                  }}
                  className="w-full rounded-lg border border-[#d7e0ea] p-3"
                />
                <p className="mt-1 text-xs text-gray-500">PDF only, maximum 200 KB</p>

                {uploadFile && (
                  <p className="mt-2 text-green-600">
                    Selected: {uploadFile.name}
                  </p>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-between items-center">
              <button
                onClick={() => setActiveTab(2)}
                className="rounded-lg bg-gray-500 px-6 py-3 text-white cursor-pointer"
              >
                Previous
              </button>

              <div className="flex items-center gap-3">
                {/* Show cause is issued and verified by the inspector */}
                {isInspector && realIsSubmitted && (
                  <button
                    onClick={() =>
                      navigate(
                        `/inspection-list/show-cause/${inspectionNoteId || randId}`
                      )
                    }
                    className="rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700 cursor-pointer"
                  >
                    Show Cause
                  </button>
                )}
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitted}
                  className="rounded-lg bg-[#3b8dbc] px-6 py-3 text-white hover:bg-[#327aa5] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {realIsSubmitted
                    ? "Inspection Submitted"
                    : !hasEditPermission
                      ? "Read-Only Mode"
                      : "Submit Inspection"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4 — CASE TIMELINE (visible after any ALC action) */}
        {activeTab === 4 && hasAlcAction && (
          <div className="rounded-xl border border-[#d7e0ea] bg-white p-6 shadow-sm">
            <CaseTimeline currentStatus={caseStatus} timeline={caseTimeline} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadNotePage;
