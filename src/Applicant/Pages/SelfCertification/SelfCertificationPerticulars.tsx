import React, { useEffect, useState } from "react";
import { Button } from "../../../Components/ui/button";
import { Table } from "../../../Components/ui/table";
import { Input } from "../../../Components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "../../../utils/auth";
import { toast } from "react-toastify";
import { Textarea } from "../../../Components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";

type Option = { value: string; label: string };

const FormField = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="w-full">
    <label className="block mb-1 font-semibold text-sm">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

interface EstablishmentResponse {
  status: string;
  profileComplete: boolean;
  redirectToList: boolean;
  redirectPath?: string;
  message: string;
  profileEditPath?: string;
  sectionA: {
    establishmentName: string;
    establishmentAddress: string;
    phoneNumber: string;
    emailAddress: string;
    employer: {
      name: string;
      addressLine: string;
      fullAddress: string;
      editLink: string;
    };
    proprietors: {
      names: string;
      editLink: string;
    };
    directorsPartners: {
      names: string;
      editLink: string;
    };
  } | null;
}

interface WorkersResponse {
  success: boolean;
  message: string;
  data: {
    regular: {
      male: number;
      female: number;
      total: number;
    };
    contract: {
      male: number;
      female: number;
      total: number;
    };
    others: {
      male: number;
      female: number;
      total: number;
    };
    grandTotal: {
      male: number;
      female: number;
      total: number;
    };
  };
}

const SelfCertificationPerticulars: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(true);

  const [establishment, setEstablishment] =
    useState<EstablishmentResponse["sectionA"]>(null);

  const [workers, setWorkers] =
    useState<any | null>(null);

  const totalMale = (workers?.regular?.male || 0) + (workers?.contract?.male || 0) + (workers?.others?.male || 0);
  const totalFemale = (workers?.regular?.female || 0) + (workers?.contract?.female || 0) + (workers?.others?.female || 0);
  const totalWorkers = totalMale + totalFemale;

  let computedFees = 2500;
  if (totalWorkers >= 100) {
    computedFees = 15000;
  } else if (totalWorkers >= 10) {
    computedFees = 10000;
  }

  // Inline edit states for Section B & C
  const [editingPersonType, setEditingPersonType] = useState<"PE" | "PRO" | "DP" | null>(null);
  const [prefillData, setPrefillData] = useState<any>(null);

  const [personForm, setPersonForm] = useState({
    name: "",
    gender: "",
    guardianName: "",
    email: "",
    contactNumber: "",
    addressLine: "",
    designation: "",
  });

  const [country, setCountry] = useState("1");
  const [stateCode, setStateCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [subdivisionCode, setSubdivisionCode] = useState("");
  const [areaType, setAreaType] = useState("");
  const [areaCode, setAreaCode] = useState("");
  const [villageCode, setVillageCode] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [pin, setPin] = useState("");

  const [stateOptions, setStateOptions] = useState<Option[]>([]);
  const [districtOptions, setDistrictOptions] = useState<Option[]>([]);
  const [subdivisionOptions, setSubdivisionOptions] = useState<Option[]>([]);
  const [areaCodeOptions, setAreaCodeOptions] = useState<Option[]>([]);
  const [villageOptions, setVillageOptions] = useState<Option[]>([]);
  const [policeStationOptions, setPoliceStationOptions] = useState<Option[]>([]);

  // Proprietor form states
  const [proprietorForm, setProprietorForm] = useState({
    name: "",
    gender: "",
    guardianName: "",
    email: "",
    contactNumber: "",
    addressLine: "",
    designation: "Proprietor",
  });
  const [proprietorCountry, setProprietorCountry] = useState("1");
  const [proprietorStateCode, setProprietorStateCode] = useState("");
  const [proprietorDistrictCode, setProprietorDistrictCode] = useState("");
  const [proprietorSubdivisionCode, setProprietorSubdivisionCode] = useState("");
  const [proprietorAreaType, setProprietorAreaType] = useState("");
  const [proprietorAreaCode, setProprietorAreaCode] = useState("");
  const [proprietorVillageCode, setProprietorVillageCode] = useState("");
  const [proprietorPoliceStation, setProprietorPoliceStation] = useState("");
  const [proprietorPin, setProprietorPin] = useState("");

  const [proprietorDistrictOptions, setProprietorDistrictOptions] = useState<Option[]>([]);
  const [proprietorSubdivisionOptions, setProprietorSubdivisionOptions] = useState<Option[]>([]);
  const [proprietorAreaCodeOptions, setProprietorAreaCodeOptions] = useState<Option[]>([]);
  const [proprietorVillageOptions, setProprietorVillageOptions] = useState<Option[]>([]);
  const [proprietorPoliceStationOptions, setProprietorPoliceStationOptions] = useState<Option[]>([]);
  const [proprietorPrefillData, setProprietorPrefillData] = useState<any>(null);

  // Director/Partner form states
  const [directorForm, setDirectorForm] = useState({
    name: "",
    gender: "",
    guardianName: "",
    email: "",
    contactNumber: "",
    addressLine: "",
    designation: "director", // director or partner
  });
  const [directorCountry, setDirectorCountry] = useState("1");
  const [directorStateCode, setDirectorStateCode] = useState("");
  const [directorDistrictCode, setDirectorDistrictCode] = useState("");
  const [directorSubdivisionCode, setDirectorSubdivisionCode] = useState("");
  const [directorAreaType, setDirectorAreaType] = useState("");
  const [directorAreaCode, setDirectorAreaCode] = useState("");
  const [directorVillageCode, setDirectorVillageCode] = useState("");
  const [directorPoliceStation, setDirectorPoliceStation] = useState("");
  const [directorPin, setDirectorPin] = useState("");

  const [directorDistrictOptions, setDirectorDistrictOptions] = useState<Option[]>([]);
  const [directorSubdivisionOptions, setDirectorSubdivisionOptions] = useState<Option[]>([]);
  const [directorAreaCodeOptions, setDirectorAreaCodeOptions] = useState<Option[]>([]);
  const [directorVillageOptions, setDirectorVillageOptions] = useState<Option[]>([]);
  const [directorPoliceStationOptions, setDirectorPoliceStationOptions] = useState<Option[]>([]);
  const [directorPrefillData, setDirectorPrefillData] = useState<any>(null);

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const res = await fetch(`${API_BASE}states`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : data;
        setStateOptions(
          list.map((item: any) => ({
            value: String(item.id ?? item.code),
            label: item.state_name ?? item.name,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    loadStates();
  }, []);

  // Load district when state changes
  useEffect(() => {
    if (stateCode !== "1") {
      setDistrictOptions([]);
      return;
    }
    const loadDistricts = async () => {
      try {
        const res = await fetch(`${API_BASE}district`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : data;
        const mapped = list.map((item: any) => ({
          value: String(item.district_code),
          label: item.district_name,
        }));
        setDistrictOptions(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    loadDistricts();
  }, [stateCode]);

  // Load subdivision + PS
  useEffect(() => {
    if (!districtCode) return;
    const loadSubAndPs = async () => {
      try {
        const token = getAuthToken();
        const [subRes, psRes] = await Promise.all([
          fetch(`${API_BASE}subdivision/${districtCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}policestation/${districtCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const subdivisionData = await subRes.json();
        const psData = await psRes.json();
        const subdivisionList = Array.isArray(subdivisionData)
          ? subdivisionData
          : subdivisionData?.data || [];
        const psList = Array.isArray(psData) ? psData : psData?.data || [];

        setSubdivisionOptions(
          subdivisionList.map((x: any) => ({
            value: String(x.sub_div_code),
            label: x.sub_div_name,
          }))
        );
        setPoliceStationOptions(
          psList.map((x: any) => ({
            value: String(x.police_station_code),
            label: x.name_of_police_station,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    loadSubAndPs();
  }, [districtCode]);

  // Load block
  useEffect(() => {
    if (!districtCode || !subdivisionCode || !areaType) return;
    const loadAreas = async () => {
      try {
        const res = await fetch(
          `${API_BASE}block/${districtCode}/${subdivisionCode}/${areaType.toLowerCase()}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        setAreaCodeOptions(
          list.map((x: any) => ({
            value: String(x.block_code),
            label: x.block_mun_name,
          }))
        );
      } catch (err) {
        console.error(err);
        setAreaCodeOptions([]);
      }
    };
    loadAreas();
  }, [districtCode, subdivisionCode, areaType]);

  // Load village
  useEffect(() => {
    if (!areaCode) return;
    const loadVillage = async () => {
      try {
        const res = await fetch(`${API_BASE}villageward/${areaCode}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        setVillageOptions(
          list.map((x: any) => ({
            value: String(x.village_code),
            label: x.village_name,
          }))
        );
      } catch (error) {
        console.error("Village load error:", error);
        setVillageOptions([]);
      }
    };
    loadVillage();
  }, [areaCode]);

  // Prefill syncing
  useEffect(() => {
    if (prefillData?.districtCode && districtOptions.length > 0) {
      setDistrictCode(String(prefillData.districtCode));
    }
  }, [districtOptions, prefillData]);

  useEffect(() => {
    if (prefillData?.subdivisionCode && subdivisionOptions.length > 0) {
      setSubdivisionCode(String(prefillData.subdivisionCode));
    }
  }, [subdivisionOptions, prefillData]);

  useEffect(() => {
    if (prefillData?.areaType) {
      setAreaType(String(prefillData.areaType));
    }
  }, [prefillData]);

  useEffect(() => {
    if (prefillData?.areaTypeCode && areaCodeOptions.length > 0) {
      setAreaCode(String(prefillData.areaTypeCode));
    }
  }, [areaCodeOptions, prefillData]);

  useEffect(() => {
    if (prefillData?.villageCode && villageOptions.length > 0) {
      setVillageCode(String(prefillData.villageCode));
    }
  }, [villageOptions, prefillData]);

  // ==================== Proprietor dropdowns & prefill ====================
  // Load district when state changes
  useEffect(() => {
    if (proprietorStateCode !== "1") {
      setProprietorDistrictOptions([]);
      return;
    }
    const loadDistricts = async () => {
      try {
        const res = await fetch(`${API_BASE}district`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : data;
        const mapped = list.map((item: any) => ({
          value: String(item.district_code),
          label: item.district_name,
        }));
        setProprietorDistrictOptions(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    loadDistricts();
  }, [proprietorStateCode]);

  // Load subdivision + PS
  useEffect(() => {
    if (!proprietorDistrictCode) return;
    const loadSubAndPs = async () => {
      try {
        const token = getAuthToken();
        const [subRes, psRes] = await Promise.all([
          fetch(`${API_BASE}subdivision/${proprietorDistrictCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}policestation/${proprietorDistrictCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const subdivisionData = await subRes.json();
        const psData = await psRes.json();
        const subdivisionList = Array.isArray(subdivisionData)
          ? subdivisionData
          : subdivisionData?.data || [];
        const psList = Array.isArray(psData) ? psData : psData?.data || [];

        setProprietorSubdivisionOptions(
          subdivisionList.map((x: any) => ({
            value: String(x.sub_div_code),
            label: x.sub_div_name,
          }))
        );
        setProprietorPoliceStationOptions(
          psList.map((x: any) => ({
            value: String(x.police_station_code),
            label: x.name_of_police_station,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    loadSubAndPs();
  }, [proprietorDistrictCode]);

  // Load block
  useEffect(() => {
    if (!proprietorDistrictCode || !proprietorSubdivisionCode || !proprietorAreaType) return;
    const loadAreas = async () => {
      try {
        const res = await fetch(
          `${API_BASE}block/${proprietorDistrictCode}/${proprietorSubdivisionCode}/${proprietorAreaType.toLowerCase()}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        setProprietorAreaCodeOptions(
          list.map((x: any) => ({
            value: String(x.block_code),
            label: x.block_mun_name,
          }))
        );
      } catch (err) {
        console.error(err);
        setProprietorAreaCodeOptions([]);
      }
    };
    loadAreas();
  }, [proprietorDistrictCode, proprietorSubdivisionCode, proprietorAreaType]);

  // Load village
  useEffect(() => {
    if (!proprietorAreaCode) return;
    const loadVillage = async () => {
      try {
        const res = await fetch(`${API_BASE}villageward/${proprietorAreaCode}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        setProprietorVillageOptions(
          list.map((x: any) => ({
            value: String(x.village_code),
            label: x.village_name,
          }))
        );
      } catch (error) {
        console.error("Village load error:", error);
        setProprietorVillageOptions([]);
      }
    };
    loadVillage();
  }, [proprietorAreaCode]);

  // Prefill syncing for Proprietor
  useEffect(() => {
    if (proprietorPrefillData?.districtCode && proprietorDistrictOptions.length > 0) {
      setProprietorDistrictCode(String(proprietorPrefillData.districtCode));
    }
  }, [proprietorDistrictOptions, proprietorPrefillData]);

  useEffect(() => {
    if (proprietorPrefillData?.subdivisionCode && proprietorSubdivisionOptions.length > 0) {
      setProprietorSubdivisionCode(String(proprietorPrefillData.subdivisionCode));
    }
  }, [proprietorSubdivisionOptions, proprietorPrefillData]);

  useEffect(() => {
    if (proprietorPrefillData?.areaType) {
      setProprietorAreaType(String(proprietorPrefillData.areaType));
    }
  }, [proprietorPrefillData]);

  useEffect(() => {
    if (proprietorPrefillData?.areaTypeCode && proprietorAreaCodeOptions.length > 0) {
      setProprietorAreaCode(String(proprietorPrefillData.areaTypeCode));
    }
  }, [proprietorAreaCodeOptions, proprietorPrefillData]);

  useEffect(() => {
    if (proprietorPrefillData?.villageCode && proprietorVillageOptions.length > 0) {
      setProprietorVillageCode(String(proprietorPrefillData.villageCode));
    }
  }, [proprietorVillageOptions, proprietorPrefillData]);

  // ==================== Director/Partner dropdowns & prefill ====================
  // Load district when state changes
  useEffect(() => {
    if (directorStateCode !== "1") {
      setDirectorDistrictOptions([]);
      return;
    }
    const loadDistricts = async () => {
      try {
        const res = await fetch(`${API_BASE}district`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : data;
        const mapped = list.map((item: any) => ({
          value: String(item.district_code),
          label: item.district_name,
        }));
        setDirectorDistrictOptions(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    loadDistricts();
  }, [directorStateCode]);

  // Load subdivision + PS
  useEffect(() => {
    if (!directorDistrictCode) return;
    const loadSubAndPs = async () => {
      try {
        const token = getAuthToken();
        const [subRes, psRes] = await Promise.all([
          fetch(`${API_BASE}subdivision/${directorDistrictCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}policestation/${directorDistrictCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const subdivisionData = await subRes.json();
        const psData = await psRes.json();
        const subdivisionList = Array.isArray(subdivisionData)
          ? subdivisionData
          : subdivisionData?.data || [];
        const psList = Array.isArray(psData) ? psData : psData?.data || [];

        setDirectorSubdivisionOptions(
          subdivisionList.map((x: any) => ({
            value: String(x.sub_div_code),
            label: x.sub_div_name,
          }))
        );
        setDirectorPoliceStationOptions(
          psList.map((x: any) => ({
            value: String(x.police_station_code),
            label: x.name_of_police_station,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    loadSubAndPs();
  }, [directorDistrictCode]);

  // Load block
  useEffect(() => {
    if (!directorDistrictCode || !directorSubdivisionCode || !directorAreaType) return;
    const loadAreas = async () => {
      try {
        const res = await fetch(
          `${API_BASE}block/${directorDistrictCode}/${directorSubdivisionCode}/${directorAreaType.toLowerCase()}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        setDirectorAreaCodeOptions(
          list.map((x: any) => ({
            value: String(x.block_code),
            label: x.block_mun_name,
          }))
        );
      } catch (err) {
        console.error(err);
        setDirectorAreaCodeOptions([]);
      }
    };
    loadAreas();
  }, [directorDistrictCode, directorSubdivisionCode, directorAreaType]);

  // Load village
  useEffect(() => {
    if (!directorAreaCode) return;
    const loadVillage = async () => {
      try {
        const res = await fetch(`${API_BASE}villageward/${directorAreaCode}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        setDirectorVillageOptions(
          list.map((x: any) => ({
            value: String(x.village_code),
            label: x.village_name,
          }))
        );
      } catch (error) {
        console.error("Village load error:", error);
        setDirectorVillageOptions([]);
      }
    };
    loadVillage();
  }, [directorAreaCode]);

  // Prefill syncing for Director/Partner
  useEffect(() => {
    if (directorPrefillData?.districtCode && directorDistrictOptions.length > 0) {
      setDirectorDistrictCode(String(directorPrefillData.districtCode));
    }
  }, [directorDistrictOptions, directorPrefillData]);

  useEffect(() => {
    if (directorPrefillData?.subdivisionCode && directorSubdivisionOptions.length > 0) {
      setDirectorSubdivisionCode(String(directorPrefillData.subdivisionCode));
    }
  }, [directorSubdivisionOptions, directorPrefillData]);

  useEffect(() => {
    if (directorPrefillData?.areaType) {
      setDirectorAreaType(String(directorPrefillData.areaType));
    }
  }, [directorPrefillData]);

  useEffect(() => {
    if (directorPrefillData?.areaTypeCode && directorAreaCodeOptions.length > 0) {
      setDirectorAreaCode(String(directorPrefillData.areaTypeCode));
    }
  }, [directorAreaCodeOptions, directorPrefillData]);

  useEffect(() => {
    if (directorPrefillData?.villageCode && directorVillageOptions.length > 0) {
      setDirectorVillageCode(String(directorPrefillData.villageCode));
    }
  }, [directorVillageOptions, directorPrefillData]);

  const handleEditPerson = async (type: "PE" | "PRO" | "DP", designationVal: string) => {
    setEditingPersonType(type);
    setPersonForm({
      name: "",
      gender: "",
      guardianName: "",
      email: "",
      contactNumber: "",
      addressLine: "",
      designation: designationVal,
    });
    setCountry("1");
    setStateCode("");
    setDistrictCode("");
    setSubdivisionCode("");
    setAreaType("");
    setAreaCode("");
    setVillageCode("");
    setPoliceStation("");
    setPin("");
    setPrefillData(null);

    if (type !== "DP") {
      try {
        const res = await fetch(
          `${API_BASE}self-cert/comm-emp-view?desg=${designationVal}`,
          {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          }
        );
        const result = await res.json();
        if (result?.data) {
          const data = result.data;
          setPersonForm({
            name: data.name || "",
            gender: data.gender || "",
            guardianName: data.guardianName || "",
            email: data.email || "",
            contactNumber: data.contactNumber || "",
            addressLine: data.addressLine || "",
            designation: designationVal,
          });
          setCountry(String(data.countryCode || "1"));
          setPin(String(data.pin || ""));
          setPoliceStation(String(data.policeStation || ""));
          setStateCode(String(data.stateCode || ""));
          setPrefillData(data);
        }
      } catch (error) {
        console.error("Error fetching person details:", error);
      }
    }
  };

  const handleSavePerson = async () => {
    if (!personForm.name) {
      toast.error("Please enter Name");
      return;
    }
    if (!personForm.gender) {
      toast.error("Please select Gender");
      return;
    }
    if (!personForm.email) {
      toast.error("Please enter Email");
      return;
    }
    if (!personForm.contactNumber) {
      toast.error("Please enter Contact Number");
      return;
    }

    try {
      const payload = {
        name: personForm.name,
        gender: personForm.gender,
        guardianName: personForm.guardianName,
        email: personForm.email,
        contactNumber: personForm.contactNumber,
        addressLine: personForm.addressLine,
        stateCode,
        districtCode,
        subdivisionCode: Number(subdivisionCode),
        areaType,
        areaTypeCode: Number(areaCode),
        villageCode: Number(villageCode),
        policeStation,
        pin: Number(pin),
        countryCode: Number(country),
        designation: personForm.designation,
        isActive: 1,
        deleted: "N",
      };

      const res = await fetch(`${API_BASE}self-cert/comm-emp-add-edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to save details");
      }

      toast.success("Details saved successfully!");
      setEditingPersonType(null);
      setPrefillData(null);
      loadInitialData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save details");
    }
  };

  const renderPersonForm = (type: "PE" | "PRO" | "DP") => {
    const title =
      type === "PE"
        ? "Principal Employer Details"
        : type === "PRO"
          ? "Proprietor Details"
          : "Director / Partner Details";

    return (
      <div className="bg-gray-50 p-6 border rounded-md my-4 space-y-6">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <FormField label="Full Name" required>
            <Input
              value={personForm.name}
              onChange={(e) =>
                setPersonForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full h-9 bg-white"
            />
          </FormField>

          {type === "DP" && (
            <FormField label="Designation" required>
              <Select
                value={personForm.designation}
                onValueChange={(val) =>
                  setPersonForm((prev) => ({ ...prev, designation: val }))
                }
              >
                <SelectTrigger className="w-full h-9 bg-white">
                  <SelectValue placeholder="Select Designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          )}

          <FormField label="Gender" required>
            <div className="flex gap-5 mt-2 h-9 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="M"
                  checked={personForm.gender === "M"}
                  onChange={(e) =>
                    setPersonForm((prev) => ({ ...prev, gender: e.target.value }))
                  }
                />
                Male
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="F"
                  checked={personForm.gender === "F"}
                  onChange={(e) =>
                    setPersonForm((prev) => ({ ...prev, gender: e.target.value }))
                  }
                />
                Female
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="O"
                  checked={personForm.gender === "O"}
                  onChange={(e) =>
                    setPersonForm((prev) => ({ ...prev, gender: e.target.value }))
                  }
                />
                Transgender
              </label>
            </div>
          </FormField>

          <FormField label="Father's / Husband's name">
            <Input
              value={personForm.guardianName}
              onChange={(e) =>
                setPersonForm((prev) => ({
                  ...prev,
                  guardianName: e.target.value,
                }))
              }
              className="w-full h-9 bg-white"
            />
          </FormField>

          <FormField label="Email" required>
            <Input
              value={personForm.email}
              onChange={(e) =>
                setPersonForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full h-9 bg-white"
            />
          </FormField>

          <FormField label="Contact Number" required>
            <Input
              value={personForm.contactNumber}
              onChange={(e) =>
                setPersonForm((prev) => ({
                  ...prev,
                  contactNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                }))
              }
              maxLength={10}
              className="w-full h-9 bg-white"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <FormField label="Country" required>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">India</SelectItem>
                <SelectItem value="2">Others</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <div className="xl:col-span-2">
            <FormField label="Address Details" required>
              <Textarea
                rows={3}
                value={personForm.addressLine}
                onChange={(e) =>
                  setPersonForm((prev) => ({
                    ...prev,
                    addressLine: e.target.value,
                  }))
                }
                className="w-full bg-white"
              />
            </FormField>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FormField label="State" required>
            <Select value={stateCode} onValueChange={setStateCode}>
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((st) => (
                  <SelectItem key={st.value} value={st.value}>
                    {st.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="District" required>
            <Select
              value={districtCode}
              onValueChange={(val) => {
                setDistrictCode(val);
                setSubdivisionCode("");
                setAreaType("");
                setAreaCode("");
                setVillageCode("");
              }}
              disabled={!stateCode}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {districtOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Subdivision" required>
            <Select
              value={subdivisionCode}
              onValueChange={(val) => {
                setSubdivisionCode(val);
                setAreaType("");
                setAreaCode("");
                setVillageCode("");
              }}
              disabled={!districtCode}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select Subdivision" />
              </SelectTrigger>
              <SelectContent>
                {subdivisionOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Area Type" required>
            <Select
              value={areaType}
              onValueChange={(val) => {
                setAreaType(val);
                setAreaCode("");
                setVillageCode("");
              }}
              disabled={!subdivisionCode}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select Area Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B">Block</SelectItem>
                <SelectItem value="M">Municipality</SelectItem>
                <SelectItem value="C">Corporation</SelectItem>
                <SelectItem value="N">Notified Area</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Area Name" required>
            <Select
              value={areaCode}
              onValueChange={(val) => {
                setAreaCode(val);
                setVillageCode("");
              }}
              disabled={!areaType}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select Area Name" />
              </SelectTrigger>
              <SelectContent>
                {areaCodeOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Village / Ward" required>
            <Select
              value={villageCode}
              onValueChange={setVillageCode}
              disabled={!areaCode}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select Village / Ward" />
              </SelectTrigger>
              <SelectContent>
                {villageOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Police Station" required>
            <Select
              value={policeStation}
              onValueChange={setPoliceStation}
              disabled={!districtCode}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select PS" />
              </SelectTrigger>
              <SelectContent>
                {policeStationOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="PIN" required>
            <Input
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              className="w-full h-9 bg-white"
            />
          </FormField>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <Button
            onClick={handleSavePerson}
            className="bg-[#1e73be] hover:bg-[#175a93] text-white px-8 h-9"
          >
            SAVE
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setEditingPersonType(null);
              setPrefillData(null);
            }}
            className="border-gray-300 hover:bg-gray-100 text-gray-700 px-8 h-9"
          >
            CANCEL
          </Button>
        </div>
      </div>
    );
  };

  const renderDetailedPersonForm = ({
    title,
    isDp,
    form,
    setForm,
    countryVal,
    setCountryVal,
    stateVal,
    setStateVal,
    districtVal,
    setDistrictVal,
    subdivisionVal,
    setSubdivisionVal,
    areaTypeVal,
    setAreaTypeVal,
    areaCodeVal,
    setAreaCodeVal,
    villageCodeVal,
    setVillageCodeVal,
    policeStationVal,
    setPoliceStationVal,
    pinVal,
    setPinVal,
    districtOpts,
    subdivisionOpts,
    areaCodeOpts,
    villageOpts,
    policeStationOpts,
  }: {
    title: string;
    isDp?: boolean;
    form: any;
    setForm: React.Dispatch<React.SetStateAction<any>>;
    countryVal: string;
    setCountryVal: (val: string) => void;
    stateVal: string;
    setStateVal: (val: string) => void;
    districtVal: string;
    setDistrictVal: (val: string) => void;
    subdivisionVal: string;
    setSubdivisionVal: (val: string) => void;
    areaTypeVal: string;
    setAreaTypeVal: (val: string) => void;
    areaCodeVal: string;
    setAreaCodeVal: (val: string) => void;
    villageCodeVal: string;
    setVillageCodeVal: (val: string) => void;
    policeStationVal: string;
    setPoliceStationVal: (val: string) => void;
    pinVal: string;
    setPinVal: (val: string) => void;
    districtOpts: Option[];
    subdivisionOpts: Option[];
    areaCodeOpts: Option[];
    villageOpts: Option[];
    policeStationOpts: Option[];
  }) => {
    return (
      <div className="bg-gray-50 p-6 border rounded-md my-4 space-y-6">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <FormField label="Full Name" required>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev: any) => ({ ...prev, name: e.target.value }))
              }
              className="w-full h-9 bg-white"
            />
          </FormField>

          {isDp && (
            <FormField label="Designation" required>
              <Select
                value={form.designation}
                onValueChange={(val) =>
                  setForm((prev: any) => ({ ...prev, designation: val }))
                }
              >
                <SelectTrigger className="w-full h-9 bg-white">
                  <SelectValue placeholder="Select Designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          )}

          <FormField label="Gender" required>
            <div className="flex gap-5 mt-2 h-9 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={title + "-gender"}
                  value="M"
                  checked={form.gender === "M"}
                  onChange={(e) =>
                    setForm((prev: any) => ({ ...prev, gender: e.target.value }))
                  }
                />
                Male
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={title + "-gender"}
                  value="F"
                  checked={form.gender === "F"}
                  onChange={(e) =>
                    setForm((prev: any) => ({ ...prev, gender: e.target.value }))
                  }
                />
                Female
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={title + "-gender"}
                  value="O"
                  checked={form.gender === "O"}
                  onChange={(e) =>
                    setForm((prev: any) => ({ ...prev, gender: e.target.value }))
                  }
                />
                Transgender
              </label>
            </div>
          </FormField>

          <FormField label="Father's / Husband's name">
            <Input
              value={form.guardianName}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  guardianName: e.target.value,
                }))
              }
              className="w-full h-9 bg-white"
            />
          </FormField>

          <FormField label="Email" required>
            <Input
              value={form.email}
              onChange={(e) =>
                setForm((prev: any) => ({ ...prev, email: e.target.value }))
              }
              className="w-full h-9 bg-white"
            />
          </FormField>

          <FormField label="Contact Number" required>
            <Input
              value={form.contactNumber}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  contactNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                }))
              }
              maxLength={10}
              className="w-full h-9 bg-white"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <FormField label="Country" required>
            <Select value={countryVal} onValueChange={setCountryVal}>
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">India</SelectItem>
                <SelectItem value="2">Others</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <div className="xl:col-span-2">
            <FormField label="Address Details" required>
              <Textarea
                rows={3}
                value={form.addressLine}
                onChange={(e) =>
                  setForm((prev: any) => ({
                    ...prev,
                    addressLine: e.target.value,
                  }))
                }
                className="w-full bg-white"
              />
            </FormField>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FormField label="State" required>
            <Select value={stateVal} onValueChange={setStateVal}>
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {stateOptions.map((st) => (
                  <SelectItem key={st.value} value={st.value}>
                    {st.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="District" required>
            <Select
              value={districtVal}
              onValueChange={(val) => {
                setDistrictVal(val);
                setSubdivisionVal("");
                setAreaTypeVal("");
                setAreaCodeVal("");
                setVillageCodeVal("");
              }}
              disabled={!stateVal}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {districtOpts.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Subdivision" required>
            <Select
              value={subdivisionVal}
              onValueChange={(val) => {
                setSubdivisionVal(val);
                setAreaTypeVal("");
                setAreaCodeVal("");
                setVillageCodeVal("");
              }}
              disabled={!districtVal}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select Subdivision" />
              </SelectTrigger>
              <SelectContent>
                {subdivisionOpts.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Area Type" required>
            <Select
              value={areaTypeVal}
              onValueChange={(val) => {
                setAreaTypeVal(val);
                setAreaCodeVal("");
                setVillageCodeVal("");
              }}
              disabled={!subdivisionVal}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select Area Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B">Block</SelectItem>
                <SelectItem value="M">Municipality</SelectItem>
                <SelectItem value="C">Corporation</SelectItem>
                <SelectItem value="N">Notified Area</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Area Name" required>
            <Select
              value={areaCodeVal}
              onValueChange={(val) => {
                setAreaCodeVal(val);
                setVillageCodeVal("");
              }}
              disabled={!areaTypeVal}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select Area Name" />
              </SelectTrigger>
              <SelectContent>
                {areaCodeOpts.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Village / Ward" required>
            <Select
              value={villageCodeVal}
              onValueChange={setVillageCodeVal}
              disabled={!areaCodeVal}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select Village / Ward" />
              </SelectTrigger>
              <SelectContent>
                {villageOpts.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Police Station" required>
            <Select
              value={policeStationVal}
              onValueChange={setPoliceStationVal}
              disabled={!districtVal}
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Select PS" />
              </SelectTrigger>
              <SelectContent>
                {policeStationOpts.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="PIN" required>
            <Input
              value={pinVal}
              onChange={(e) =>
                setPinVal(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              className="w-full h-9 bg-white"
            />
          </FormField>
        </div>
      </div>
    );
  };



  useEffect(() => {
    loadInitialData();
  }, []);

  const safeNavigate = (path?: string) => {
    if (!path) {
      console.warn("Navigation path missing");
      return;
    }

    const finalPath = path.startsWith("/") ? path : `/${path}`;
    console.log("Navigating to:", finalPath);
    navigate(finalPath);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const token = getAuthToken();

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const localDetailsStr = sessionStorage.getItem("selfCertSearchDetails");
      if (localDetailsStr) {
        const localDetails = JSON.parse(localDetailsStr);
        const mappedSectionA = {
          establishmentName: localDetails.estDetails?.establishmentName || "",
          establishmentAddress: localDetails.estDetails?.fullAddress || "",
          phoneNumber: localDetails.estDetails?.phoneNumber || "",
          emailAddress: localDetails.estDetails?.emailAddress || "",
          employer: {
            name: localDetails.peDetails?.employerName || "",
            addressLine: localDetails.peDetails?.address?.addressLine || "",
            fullAddress: localDetails.peDetails?.fullAddress || "",
            editLink: "",
          },
          proprietors: {
            names: "",
            editLink: "",
          },
          directorsPartners: {
            names: "",
            editLink: "",
          }
        };

        setEstablishment(mappedSectionA);
        setProfileExists(true);

        // Fetch workers from the profile
        const workerRes = await fetch(`${API_BASE}self-cert/workers-employed`, {
          method: "GET",
          headers,
        });
        const workerData: WorkersResponse = await workerRes.json();
        if (workerRes.ok) {
          setWorkers({
            regular: {
              male: workerData.data?.regular?.male ?? 0,
              female: workerData.data?.regular?.female ?? 0,
              adolescentMale: 0,
              adolescentFemale: 0,
            },
            contract: {
              male: workerData.data?.contract?.male ?? 0,
              female: workerData.data?.contract?.female ?? 0,
              adolescentMale: 0,
              adolescentFemale: 0,
            },
            others: {
              male: workerData.data?.others?.male ?? 0,
              female: workerData.data?.others?.female ?? 0,
              adolescentMale: 0,
              adolescentFemale: 0,
            },
          });
        }
      } else {
        const [estRes, workerRes] = await Promise.all([
          fetch(`${API_BASE}self-cert/particulars/establishment`, {
            method: "GET",
            headers,
          }),
          fetch(`${API_BASE}self-cert/workers-employed`, {
            method: "GET",
            headers,
          }),
        ]);

        const estData: EstablishmentResponse = await estRes.json();
        const workerData: WorkersResponse = await workerRes.json();

        if (!estRes.ok) {
          throw new Error(estData.message || "Failed to fetch establishment");
        }

        if (!workerRes.ok) {
          throw new Error(workerData.message || "Failed to fetch workers");
        }

        if (estData.redirectToList) {
          navigate("/self-certification-application/list");
          return;
        }

        if (!estData.profileComplete) {
          setProfileExists(false);
          return;
        }

        setEstablishment(estData.sectionA);
        setWorkers({
          regular: {
            male: workerData.data?.regular?.male ?? 0,
            female: workerData.data?.regular?.female ?? 0,
            adolescentMale: 0,
            adolescentFemale: 0,
          },
          contract: {
            male: workerData.data?.contract?.male ?? 0,
            female: workerData.data?.contract?.female ?? 0,
            adolescentMale: 0,
            adolescentFemale: 0,
          },
          others: {
            male: workerData.data?.others?.male ?? 0,
            female: workerData.data?.others?.female ?? 0,
            adolescentMale: 0,
            adolescentFemale: 0,
          },
        });
      }

      // Fetch Principal Employer details
      try {
        const empRes = await fetch(`${API_BASE}self-cert/comm-emp-view?desg=PrincipalEmployer`, { headers });
        const empResult = await empRes.json();
        if (empResult?.data) {
          const e = empResult.data;
          setPersonForm({
            name: e.name || "",
            gender: e.gender || "",
            guardianName: e.guardianName || "",
            email: e.email || "",
            contactNumber: e.contactNumber || "",
            addressLine: e.addressLine || "",
            designation: "PrincipalEmployer",
          });
          setCountry(String(e.countryCode || "1"));
          setPin(String(e.pin || ""));
          setPoliceStation(String(e.policeStation || ""));
          setStateCode(String(e.stateCode || ""));
          setPrefillData(e);
        }
      } catch (err) {
        console.error("Error loading Principal Employer details:", err);
      }

      // Fetch Proprietor details
      try {
        const propRes = await fetch(`${API_BASE}self-cert/comm-emp-view?desg=Proprietor`, { headers });
        const propResult = await propRes.json();
        if (propResult?.data) {
          const p = propResult.data;
          setProprietorForm({
            name: p.name || "",
            gender: p.gender || "",
            guardianName: p.guardianName || "",
            email: p.email || "",
            contactNumber: p.contactNumber || "",
            addressLine: p.addressLine || "",
            designation: "Proprietor",
          });
          setProprietorCountry(String(p.countryCode || "1"));
          setProprietorPin(String(p.pin || ""));
          setProprietorPoliceStation(String(p.policeStation || ""));
          setProprietorStateCode(String(p.stateCode || ""));
          setProprietorPrefillData(p);
        }
      } catch (err) {
        console.error("Error loading proprietor details:", err);
      }

      // Fetch Director/Partner details
      try {
        const dpRes = await fetch(`${API_BASE}self-cert/comm-emp-view?desg=director`, { headers });
        let dpResult = await dpRes.json();
        if (!dpResult?.data) {
          const partnerRes = await fetch(`${API_BASE}self-cert/comm-emp-view?desg=partner`, { headers });
          dpResult = await partnerRes.json();
        }
        if (dpResult?.data) {
          const d = dpResult.data;
          setDirectorForm({
            name: d.name || "",
            gender: d.gender || "",
            guardianName: d.guardianName || "",
            email: d.email || "",
            contactNumber: d.contactNumber || "",
            addressLine: d.addressLine || "",
            designation: d.designation || "director",
          });
          setDirectorCountry(String(d.countryCode || "1"));
          setDirectorPin(String(d.pin || ""));
          setDirectorPoliceStation(String(d.policeStation || ""));
          setDirectorStateCode(String(d.stateCode || ""));
          setDirectorPrefillData(d);
        }
      } catch (err) {
        console.error("Error loading director/partner details:", err);
      }

    } catch (error) {
      console.error("Error loading particulars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const propArr = [
        {
          name: personForm.name,
          gender: personForm.gender,
          guardianName: personForm.guardianName,
          email: personForm.email,
          contactNumber: personForm.contactNumber,
          addressLine: personForm.addressLine,
          stateCode: Number(stateCode) || null,
          districtCode: districtCode || null,
          subdivisionCode: Number(subdivisionCode) || null,
          areaType: areaType || null,
          areaTypeCode: Number(areaCode) || null,
          villageCode: Number(villageCode) || null,
          policeStation: policeStation || null,
          pin: Number(pin) || null,
          countryCode: Number(country) || 1,
          designation: "PrincipalEmployer",
          isActive: 1,
          deleted: "N",
        },
        {
          name: proprietorForm.name,
          gender: proprietorForm.gender,
          guardianName: proprietorForm.guardianName,
          email: proprietorForm.email,
          contactNumber: proprietorForm.contactNumber,
          addressLine: proprietorForm.addressLine,
          stateCode: Number(proprietorStateCode) || null,
          districtCode: proprietorDistrictCode || null,
          subdivisionCode: Number(proprietorSubdivisionCode) || null,
          areaType: proprietorAreaType || null,
          areaTypeCode: Number(proprietorAreaCode) || null,
          villageCode: Number(proprietorVillageCode) || null,
          policeStation: proprietorPoliceStation || null,
          pin: Number(proprietorPin) || null,
          countryCode: Number(proprietorCountry) || 1,
          designation: "Proprietor",
          isActive: 1,
          deleted: "N",
        }
      ];

      const partArr = [
        {
          name: directorForm.name,
          gender: directorForm.gender,
          guardianName: directorForm.guardianName,
          email: directorForm.email,
          contactNumber: directorForm.contactNumber,
          addressLine: directorForm.addressLine,
          stateCode: Number(directorStateCode) || null,
          districtCode: directorDistrictCode || null,
          subdivisionCode: Number(directorSubdivisionCode) || null,
          areaType: directorAreaType || null,
          areaTypeCode: Number(directorAreaCode) || null,
          villageCode: Number(directorVillageCode) || null,
          policeStation: directorPoliceStation || null,
          pin: Number(directorPin) || null,
          countryCode: Number(directorCountry) || 1,
          designation: directorForm.designation || "director",
          isActive: 1,
          deleted: "N",
        }
      ];

      const localDetailsStr = sessionStorage.getItem("selfCertSearchDetails");
      const localDetails = localDetailsStr ? JSON.parse(localDetailsStr) : null;
      const est = localDetails?.estDetails;

      const payload = {
        propArr,
        partArr,
        estName: est?.establishmentName || establishment?.establishmentName || "",
        estLocation: est?.address?.addressLine || establishment?.establishmentAddress || "",
        estDistCode: est?.address?.district ? String(est.address.district) : null,
        estSubdivCode: est?.address?.subdivision ? Number(est.address.subdivision) : null,
        estAreaType: est?.address?.areaType || null,
        estBlockCode: est?.address?.areaTypeCode ? Number(est.address.areaTypeCode) : null,
        gpWardCode: est?.address?.villageWard ? Number(est.address.villageWard) : null,
        psCode: est?.address?.policeStation || null,
        pinCode: est?.address?.pinCode ? Number(est.address.pinCode) : null,
        phoneNo: est?.phoneNumber ? Number(est.phoneNumber) : null,
        emailAddress: est?.emailAddress || establishment?.emailAddress || null,
        regularMaleWorker: workers?.regular?.male || 0,
        regularFemaleWorker: workers?.regular?.female || 0,
        regularTotalWorker: (workers?.regular?.male || 0) + (workers?.regular?.female || 0),
        contractMaleWorker: workers?.contract?.male || 0,
        contractFemaleWorker: workers?.contract?.female || 0,
        contractTotalWorker: (workers?.contract?.male || 0) + (workers?.contract?.female || 0),
        othersMaleWorker: workers?.others?.male || 0,
        othersFemaleWorker: workers?.others?.female || 0,
        othersTotalWorker: (workers?.others?.male || 0) + (workers?.others?.female || 0),
        totalMaleWorker: totalMale,
        totalFemaleWorker: totalFemale,
        totalFees: computedFees,
        applyStatus: "N",
        status: "V"
      };

      const res = await fetch(`${API_BASE}self-cert/apply-new`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to submit application");
      }

      sessionStorage.setItem("selfCertAppId", String(result.applicationId));
      toast.success("Application details submitted successfully!");
      navigate(`/self-certification-application/others`);
      // navigate(`/self-certification-application/others?applicationId=${result.applicationId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit application");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!profileExists) {
    return (
      <div className="p-6">
        Your profile information not fully updated. Click{" "}
        <Link
          to="/applicant-profile-update"
          className="text-blue-600 font-semibold"
        >
          here
        </Link>{" "}
        to update.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans bg-[#ecf0f3] pb-1">
      <div className="bg-white p-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          APPLICATION FOR SELF CERTIFICATION SCHEME, 2016
        </h1>
      </div>

      {/* Section A */}
      <div className="bg-white rounded-md shadow border mx-4 mb-6">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md">
          A. PARTICULARS OF ESTABLISHMENT
        </div>

        <div className="p-4">
          <Table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="border px-3 py-2 w-[35%] font-medium bg-gray-50">
                  Name of the establishment
                </td>
                <td className="border px-3 py-2">
                  {establishment?.establishmentName || "N/A"}
                </td>
              </tr>

              <tr>
                <td className="border px-3 py-2 font-medium bg-gray-50">
                  Address/Location of the establishment
                </td>
                <td className="border px-3 py-2 whitespace-pre-line">
                  {establishment?.establishmentAddress || "N/A"}
                </td>
              </tr>

              <tr>
                <td className="border px-3 py-2 font-medium bg-gray-50">
                  Phone Number
                </td>
                <td className="border px-3 py-2">
                  {establishment?.phoneNumber || "N/A"}
                </td>
              </tr>

              <tr>
                <td className="border px-3 py-2 font-medium bg-gray-50">
                  Email Address
                </td>
                <td className="border px-3 py-2">
                  {establishment?.emailAddress || "N/A"}
                </td>
              </tr>

            </tbody>
          </Table>
        </div>
      </div>

      {/* Section B */}
      <div className="bg-white rounded-md shadow border mx-4 mb-6">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md">
          B. EMPLOYER DETAILS
        </div>
        <div className="p-4">
          {editingPersonType === "PE" ? (
            renderDetailedPersonForm({
              title: "Principal Employer Details",
              form: personForm,
              setForm: setPersonForm,
              countryVal: country,
              setCountryVal: setCountry,
              stateVal: stateCode,
              setStateVal: setStateCode,
              districtVal: districtCode,
              setDistrictVal: setDistrictCode,
              subdivisionVal: subdivisionCode,
              setSubdivisionVal: setSubdivisionCode,
              areaTypeVal: areaType,
              setAreaTypeVal: setAreaType,
              areaCodeVal: areaCode,
              setAreaCodeVal: setAreaCode,
              villageCodeVal: villageCode,
              setVillageCodeVal: setVillageCode,
              policeStationVal: policeStation,
              setPoliceStationVal: setPoliceStation,
              pinVal: pin,
              setPinVal: setPin,
              districtOpts: districtOptions,
              subdivisionOpts: subdivisionOptions,
              areaCodeOpts: areaCodeOptions,
              villageOpts: villageOptions,
              policeStationOpts: policeStationOptions,
            })
          ) : (
            <Table className="w-full border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="border px-3 py-2 w-[35%] font-medium bg-gray-50">
                    Principal Employer
                  </td>
                  <td className="border px-3 py-2">
                    {establishment?.employer?.name ? (
                      <>
                        <div className="font-semibold">{establishment.employer.name}</div>
                        <div>{establishment.employer.addressLine}</div>
                        <div className="text-gray-500 text-xs mt-1">{establishment.employer.fullAddress}</div>
                      </>
                    ) : (
                      "No Principal Employer details added"
                    )}
                    {/* <div className="mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleEditPerson("PE", "PrincipalEmployer")}
                        className="bg-[#337ab7] hover:bg-[#286090] text-white px-4 h-7 text-xs rounded-sm"
                      >
                        {establishment?.employer?.name ? "Modify Employer Details" : "Add Employer Details"}
                      </Button>
                    </div> */}
                  </td>
                </tr>
              </tbody>
            </Table>
          )}
        </div>
      </div>

      {/* Section C */}
      <div className="bg-white rounded-md shadow border mx-4 mb-6">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md">
          C. PROPRIETOR DETAILS
        </div>
        <div className="p-4">
          {renderDetailedPersonForm({
            title: "Proprietor Details",
            form: proprietorForm,
            setForm: setProprietorForm,
            countryVal: proprietorCountry,
            setCountryVal: setProprietorCountry,
            stateVal: proprietorStateCode,
            setStateVal: setProprietorStateCode,
            districtVal: proprietorDistrictCode,
            setDistrictVal: setProprietorDistrictCode,
            subdivisionVal: proprietorSubdivisionCode,
            setSubdivisionVal: setProprietorSubdivisionCode,
            areaTypeVal: proprietorAreaType,
            setAreaTypeVal: setProprietorAreaType,
            areaCodeVal: proprietorAreaCode,
            setAreaCodeVal: setProprietorAreaCode,
            villageCodeVal: proprietorVillageCode,
            setVillageCodeVal: setProprietorVillageCode,
            policeStationVal: proprietorPoliceStation,
            setPoliceStationVal: setProprietorPoliceStation,
            pinVal: proprietorPin,
            setPinVal: setProprietorPin,
            districtOpts: proprietorDistrictOptions,
            subdivisionOpts: proprietorSubdivisionOptions,
            areaCodeOpts: proprietorAreaCodeOptions,
            villageOpts: proprietorVillageOptions,
            policeStationOpts: proprietorPoliceStationOptions,
          })}
        </div>
      </div>

      {/* Section D */}
      <div className="bg-white rounded-md shadow border mx-4 mb-6">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md">
          D. PARTNERS / DIRECTORS DETAILS
        </div>
        <div className="p-4">
          {renderDetailedPersonForm({
            title: "Director / Partner Details",
            isDp: true,
            form: directorForm,
            setForm: setDirectorForm,
            countryVal: directorCountry,
            setCountryVal: setDirectorCountry,
            stateVal: directorStateCode,
            setStateVal: setDirectorStateCode,
            districtVal: directorDistrictCode,
            setDistrictVal: setDirectorDistrictCode,
            subdivisionVal: directorSubdivisionCode,
            setSubdivisionVal: setDirectorSubdivisionCode,
            areaTypeVal: directorAreaType,
            setAreaTypeVal: setDirectorAreaType,
            areaCodeVal: directorAreaCode,
            setAreaCodeVal: setDirectorAreaCode,
            villageCodeVal: directorVillageCode,
            setVillageCodeVal: setDirectorVillageCode,
            policeStationVal: directorPoliceStation,
            setPoliceStationVal: setDirectorPoliceStation,
            pinVal: directorPin,
            setPinVal: setDirectorPin,
            districtOpts: directorDistrictOptions,
            subdivisionOpts: directorSubdivisionOptions,
            areaCodeOpts: directorAreaCodeOptions,
            villageOpts: directorVillageOptions,
            policeStationOpts: directorPoliceStationOptions,
          })}
        </div>
      </div>

      {/* Section E */}
      <div className="bg-white rounded-md shadow border mx-4 mb-6">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md flex justify-between items-center">
          <span>E. NO. OF WORKERS EMPLOYED</span>
        </div>

        <div className="p-6">
          {/* Grid Headers */}
          <div className="grid grid-cols-[2.5fr_1.7fr_1.7fr_1.7fr_1.7fr] gap-4 mb-4 font-semibold text-sm items-center border-b pb-2 text-gray-700">
            <div>TYPE OF WORKER</div>
            <div>Male *</div>
            <div>Female *</div>
            <div>Adolescent Male *</div>
            <div>Adolescent Female *</div>
          </div>

          {/* Row 1: Regular */}
          <div className="grid grid-cols-[2.5fr_1.7fr_1.7fr_1.7fr_1.7fr] gap-4 items-center mb-4 text-sm">
            <div className="font-medium text-gray-700">No of workman of master role / regular</div>
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.regular.male}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  regular: {
                    ...prev.regular,
                    male: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.regular.female}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  regular: {
                    ...prev.regular,
                    female: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.regular.adolescentMale}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  regular: {
                    ...prev.regular,
                    adolescentMale: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.regular.adolescentFemale}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  regular: {
                    ...prev.regular,
                    adolescentFemale: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
          </div>

          {/* Row 2: Contract */}
          <div className="grid grid-cols-[2.5fr_1.7fr_1.7fr_1.7fr_1.7fr] gap-4 items-center mb-4 text-sm">
            <div className="font-medium text-gray-700">No of contractual labour</div>
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.contract.male}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  contract: {
                    ...prev.contract,
                    male: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.contract.female}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  contract: {
                    ...prev.contract,
                    female: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.contract.adolescentMale}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  contract: {
                    ...prev.contract,
                    adolescentMale: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.contract.adolescentFemale}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  contract: {
                    ...prev.contract,
                    adolescentFemale: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
          </div>

          {/* Row 3: Others */}
          <div className="grid grid-cols-[2.5fr_1.7fr_1.7fr_1.7fr_1.7fr] gap-4 items-center mb-4 text-sm">
            <div className="font-medium text-gray-700">No of other worker engaged</div>
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.others.male}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  others: {
                    ...prev.others,
                    male: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.others.female}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  others: {
                    ...prev.others,
                    female: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.others.adolescentMale}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  others: {
                    ...prev.others,
                    adolescentMale: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
            <Input
              type="number"
              className="w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm"
              value={workers.others.adolescentFemale}
              onChange={(e) =>
                setWorkers((prev: any) => ({
                  ...prev,
                  others: {
                    ...prev.others,
                    adolescentFemale: Math.max(0, parseInt(e.target.value) || 0),
                  },
                }))
              }
            />
          </div>

          {/* Summary Box */}
          <div className="mt-6 border-t pt-4 text-sm text-gray-700">
            <div className="grid grid-cols-[2.5fr_1.7fr_1.7fr_1.7fr_1.7fr] gap-4 items-center mb-2 font-medium">
              <div>Total Workers (Male + Female):</div>
              <div className="text-left font-bold text-gray-900">{totalMale} (M)</div>
              <div className="text-left font-bold text-gray-900">{totalFemale} (F)</div>
              <div className="col-span-2 text-left font-bold text-blue-800">
                Consolidated Total: {totalWorkers}
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-sm flex justify-between items-center">
              <div>
                <span className="font-semibold text-blue-900 text-base block">Calculated Application Fee:</span>
                <span className="text-xs text-gray-500 block mt-0.5">Based on employee count slabs: 0-9: ₹2,500 | 10-99: ₹10,000 | 100+: ₹15,000</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                ₹{computedFees.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mb-10">
        <Button
          onClick={handleApply}
          className="bg-[#1e73be] hover:bg-[#175a93] text-white px-6 py-2"
        >
          APPLY
        </Button>
      </div>
    </div>
  );
};

export default SelfCertificationPerticulars;
