import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "../../../Components/ui/input";
import { Textarea } from "../../../Components/ui/textarea";
import { Button } from "../../../Components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import { encryptionDecryptionFun } from "@/utils/encryption";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

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

type Option = { value: string; label: string };

const AREA_TYPE_LABELS: Record<string, string> = {
  B: "Block",
  M: "Municipality",
  C: "Corporation",
  S: "SEZ",
  N: "Notified Area",
};

const SelfCertificationAddPerson = () => {
  const [searchParams] = useSearchParams();
  const personType = searchParams.get("personType");

  const navigate = useNavigate();

  // console.log("personType:", personType);
  const designation =
    personType === "PE"
      ? "PrincipalEmployer"
      : "Proprietor";

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
  const [areaTypeOptions, setAreaTypeOptions] = useState<Option[]>([]);
  const [areaCodeOptions, setAreaCodeOptions] = useState<Option[]>([]);
  const [villageOptions, setVillageOptions] = useState<Option[]>([]);
  const [policeStationOptions, setPoliceStationOptions] = useState<Option[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    guardianName: "",
    email: "",
    contactNumber: "",
    addressLine: "",
  });

  const [prefillData, setPrefillData] = useState<any>(null);

  const fetchPersonDetails = async () => {
    try {
      const res = await fetch(
        `${API_BASE}self-cert/comm-emp-view?desg=${designation}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const result = await res.json();

      if (result?.data) {
        const data = result.data;

        setFormData({
          name: data.name || "",
          gender: data.gender || "",
          guardianName: data.guardianName || "",
          email: data.email || "",
          contactNumber: data.contactNumber || "",
          addressLine: data.addressLine || "",
        });

        setCountry(String(data.countryCode || "1"));
        setPin(String(data.pin || ""));
        setPoliceStation(String(data.policeStation || ""));

        setPrefillData(data);

        // IMPORTANT: start chain from state first
        setStateCode(String(data.stateCode || ""));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPersonDetails();
  }, []);

  // 3. Load states on mount
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

  // 4. Load district when state changes
  useEffect(() => {
    if (stateCode !== "1") {
      setDistrictOptions([]);
      return;
    }

    const loadDistricts = async () => {
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

      // prefill district AFTER options load
      if (prefillData?.districtCode) {
        setDistrictCode(String(prefillData.districtCode));
      }
    };

    loadDistricts();
  }, [stateCode, prefillData]);

  // 5. Load subdivision + PS
  useEffect(() => {
    if (!districtCode) return;

    const loadData = async () => {
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

      console.log("subdivisionData:", subdivisionData);
      console.log("psData:", psData);

      const subdivisionList = Array.isArray(subdivisionData)
        ? subdivisionData
        : subdivisionData?.data || [];

      const psList = Array.isArray(psData)
        ? psData
        : psData?.data || [];

      setSubdivisionOptions(
        subdivisionList.map((x: any) => ({
          value: String(x.sub_div_code),
          label: x.sub_div_name,
        }))
      );

      if (prefillData?.subdivisionCode) {
        setSubdivisionCode(String(prefillData.subdivisionCode));
      }

      setPoliceStationOptions(
        psList.map((x: any) => ({
          value: String(x.police_station_code),
          label: x.name_of_police_station,
        }))
      );
    };

    loadData();
  }, [districtCode]);

  // 6. Load area type
  useEffect(() => {
    if (!districtCode || !subdivisionCode) return;

    const loadAreaTypes = async () => {
      const res = await fetch(
        `${API_BASE}areatype/${districtCode}/${subdivisionCode}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : data;

      const unique = [
        ...new Set(
          list.map((x: any) => String(x.type).toUpperCase())
        ),
      ];

      setAreaTypeOptions(
        unique.map((type: any) => ({
          value: type,
          label: AREA_TYPE_LABELS[type] ?? type,
        }))
      );
    };

    if (prefillData?.areaType) {
      setAreaType(String(prefillData.areaType));
    }

    loadAreaTypes();
  }, [districtCode, subdivisionCode]);

  // 7. Load area names
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

        console.log("Area API response:", data);

        const areaList = Array.isArray(data) ? data : data?.data || [];

        setAreaCodeOptions(
          areaList.map((x: any) => ({
            value: String(x.block_code),
            label: x.block_mun_name,
          }))
        );

        if (prefillData?.areaTypeCode) {
          setAreaCode(String(prefillData.areaTypeCode));
        }
      } catch (err) {
        console.error("Area load error:", err);
        setAreaCodeOptions([]);
      }
    };

    loadAreas();
  }, [districtCode, subdivisionCode, areaType]);

  // 8. Load village/ward
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

        console.log("Village API response:", data);

        const villageList = Array.isArray(data) ? data : data?.data || [];

        setVillageOptions(
          villageList.map((x: any) => ({
            value: String(x.village_code),
            label: x.village_name,
          }))
        );

        if (prefillData?.villageCode) {
          setVillageCode(String(prefillData.villageCode));
        }
      } catch (error) {
        console.error("Village load error:", error);
        setVillageOptions([]);
      }
    };

    loadVillage();
  }, [areaCode]);

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        gender: formData.gender,
        guardianName: formData.guardianName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        addressLine: formData.addressLine,

        stateCode,
        districtCode,
        subdivisionCode: Number(subdivisionCode),
        areaType,
        areaTypeCode: Number(areaCode),
        villageCode: Number(villageCode),
        policeStation,
        pin: Number(pin),
        countryCode: Number(country),

        designation,
        isActive: 1,
        deleted: "N",
      };

      const res = await fetch(
        `${API_BASE}self-cert/comm-emp-add-edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message);
      }

      navigate("/self-certification-application/particulars");
    } catch (error) {
      console.error(error);
    }
  };


  const title =
    personType === "PE"
      ? "PRINCIPAL EMPLOYER INFORMATION"
      : "PROPRIETOR INFORMATION";

  return (
    <div className="w-full min-h-screen bg-[#ecf0f3] py-4">
      <div className="bg-white border rounded shadow mx-4 mb-8">
        {/* Header */}
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
          {title}
        </div>

        {/* Form */}
        <div className="p-6 text-sm">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-4">
            <FormField
              label={`Full Name of the ${personType === "PE"
                ? "Principal Employer"
                : "Proprietor"
                }`}
              required
            >
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="w-full h-9"
              />
            </FormField>

            <FormField label="5.(b) Gender" required>
              <div className="flex flex-wrap gap-5 mt-2 h-9 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="M"
                    checked={formData.gender === "M"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  />
                  Male
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="F"
                    checked={formData.gender === "F"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  />
                  Female
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="O"
                    checked={formData.gender === "O"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  />
                  Transgender
                </label>
              </div>
            </FormField>

            <FormField label="Furnish Father's / Husband's name in case of Individual">
              <Input
                value={formData.guardianName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    guardianName: e.target.value,
                  }))
                }
                className="w-full h-9"
              />
            </FormField>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-4">
            <FormField label="Email" required>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full h-9"
              />
            </FormField>

            <FormField label="Contact Number" required>
              <Input
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contactNumber: e.target.value,
                  }))
                }
                className="w-full h-9"
              />
            </FormField>

            <FormField label="Select Country" required>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="-Select-" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">India</SelectItem>
                  <SelectItem value="2">Others</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Address */}
          <div className="mb-4">
            <FormField
              label="Address [ If other Country/State please provide detail address ]"
              required
            >
              <Textarea
                rows={3}
                value={formData.addressLine}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    addressLine: e.target.value,
                  }))
                }
                className="w-full"
              />
            </FormField>
          </div>

          {/* Dynamic Address Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <FormField label="State" required>
              <Select value={stateCode} onValueChange={setStateCode}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
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
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  {districtOptions.map((district) => (
                    <SelectItem key={district.value} value={district.value}>
                      {district.label}
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
                <SelectTrigger className="w-full h-9">
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
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Area Type" />
                </SelectTrigger>
                <SelectContent>
                  {areaTypeOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
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
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select Area" />
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
                onValueChange={(val) => {
                  setVillageCode(val);
                }}
                disabled={!areaCode}
              >
                <SelectTrigger className="w-full h-9">
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
                onValueChange={(val) => {
                  setPoliceStation(val);
                }}
                disabled={!districtCode}
              >
                <SelectTrigger className="w-full h-9">
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
                className="w-full h-9"
              />
            </FormField>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Button
              onClick={handleSave}
              className="bg-[#1e73be] hover:bg-[#175a93] text-white w-fit"
            >
              SAVE
            </Button>

            <button
              type="button"
              onClick={() =>
                navigate("/self-certification-application/particulars")
              }
              className="text-blue-600 font-medium text-left"
            >
              {"<<"} BACK TO SELF CERTIFICATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfCertificationAddPerson;