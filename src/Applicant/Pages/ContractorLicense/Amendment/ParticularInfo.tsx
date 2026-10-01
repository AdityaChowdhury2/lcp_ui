import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useForm } from "react-hook-form";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

type Option = { value: string; label: string };
const AREA_TYPE_LABELS: Record<string, string> = {
  B: "Block",
  M: "Municipality",
  C: "Corporation",
  S: "SEZ",
  N: "Notified Area",
};

const COUNTRY_BY_ID: Record<string, string> = {
  "1": "India",
  "2": "Others",
};

function countryIdToLabel(idOrName: unknown): string {
  const raw = String(idOrName ?? "").trim();
  if (!raw) return COUNTRY_BY_ID["1"];
  if (COUNTRY_BY_ID[raw]) return COUNTRY_BY_ID[raw];
  const byName = Object.entries(COUNTRY_BY_ID).find(
    ([, label]) => label.toLowerCase() === raw.toLowerCase(),
  );
  return byName?.[1] ?? raw;
}

function countryLabelToId(idOrName: unknown): string {
  const raw = String(idOrName ?? "").trim();
  if (!raw) return "1";
  if (COUNTRY_BY_ID[raw]) return raw;
  const byName = Object.entries(COUNTRY_BY_ID).find(
    ([, label]) => label.toLowerCase() === raw.toLowerCase(),
  );
  return byName?.[0] ?? raw;
}

type ParticularInfoFormValues = {
  nameOfAgent: string;
  addressOfManager: string;
  managerState: string;
  managerDistrict: string;
  managerSubdivision: string;
  managerAreaType: string;
  managerAreaName: string;
  managerVillWard: string;
  managerPs: string;
  managerPin: string;
  categoryDesignation: string;
  unskilled: string;
  semiskilled: string;
  skilled: string;
  highlyskilled: string;
  hoursWork: string;
  spredOver: string;
  overtime: string;
  overtimeWages: string;
};

const ParticularInfo: React.FC = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue: setFormValue,
  } = useForm<ParticularInfoFormValues>();

  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nameOfAgent, setNameOfAgent] = useState("");
  const [managerCountry, setManagerCountry] = useState("");
  const [addressOfManager, setAddressOfManager] = useState("");
  const [managerState, setManagerState] = useState("");
  const [managerDistrict, setManagerDistrict] = useState("");
  const [managerSubdivision, setManagerSubdivision] = useState("");
  const [managerAreaType, setManagerAreaType] = useState("");
  const [managerAreaName, setManagerAreaName] = useState("");
  const [managerVillWard, setManagerVillWard] = useState("");
  const [managerPs, setManagerPs] = useState("");
  const [managerPin, setManagerPin] = useState("");
  const [managerStateOptions, setManagerStateOptions] = useState<Option[]>([]);
  const [managerDistrictOptions, setManagerDistrictOptions] = useState<Option[]>([]);
  const [managerSubdivisionOptions, setManagerSubdivisionOptions] = useState<Option[]>([]);
  const [managerAreaTypeOptions, setManagerAreaTypeOptions] = useState<Option[]>([]);
  const [managerAreaCodeOptions, setManagerAreaCodeOptions] = useState<Option[]>([]);
  const [managerVillageWardOptions, setManagerVillageWardOptions] = useState<Option[]>([]);
  const [managerPoliceStationOptions, setManagerPoliceStationOptions] = useState<Option[]>([]);
  const [categoryDesignation, setCategoryDesignation] = useState("");
  const [unskilled, setUnskilled] = useState("");
  const [semiskilled, setSemiskilled] = useState("");
  const [skilled, setSkilled] = useState("");
  const [highlyskilled, setHighlyskilled] = useState("");
  const [hoursWork, setHoursWork] = useState("");
  const [spredOver, setSpredOver] = useState("");
  const [overtime, setOvertime] = useState("");
  const [overtimeWages, setOvertimeWages] = useState("");
  const [weeklyHoliday, setWeeklyHoliday] = useState<"0" | "1">("0");
  const [noHolidayList, setNoHolidayList] = useState<string[]>([]);
  const [holidayWages, setHolidayWages] = useState("");
  const [annualLeaveNo, setAnnualLeaveNo] = useState("");
  const [casualLeaveNo, setCasualLeaveNo] = useState("");
  const [sickLeaveNo, setSickLeaveNo] = useState("");
  const [maternityLeaveNo, setMaternityLeaveNo] = useState("");
  const [otherLeaveNo, setOtherLeaveNo] = useState("");
  const [earnedLeaveNo, setEarnedLeaveNo] = useState("");
  const [specialBenifites, setSpecialBenifites] = useState("");
  const [stateInsurance, setStateInsurance] = useState("");
  const [miscellaneousProvisions, setMiscellaneousProvisions] = useState("");
  const [contractorConvicted, setContractorConvicted] = useState<"0" | "1">("0");
  const [detailsContractorConvicted, setDetailsContractorConvicted] = useState("");
  const [contractorPreviousEmployer, setContractorPreviousEmployer] = useState<"0" | "1">("0");
  const [previousLicenseNumber, setPreviousLicenseNumber] = useState("");
  const [regNoPrincipalEmployer, setRegNoPrincipalEmployer] = useState("");
  const [contractorRevoking, setContractorRevoking] = useState<"0" | "1">("0");
  const [detailsContractorRevoking, setDetailsContractorRevoking] = useState("");

  // ======================
  // Load details initially
  // ======================
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const ctx = JSON.parse(
          sessionStorage.getItem("CLRA_LICENSE_RENEWAL_AMENDMENT_CTX") || "{}"
        );

        const formVNo = ctx.formVSerialNo;
        const updatedFormVNo = ctx.updatedFormV;
        const amendId = ctx.amendmentDraftId;

        const res = await fetch(
          `${API_BASE}contractor-license/amendment/details-new?formVNo=${formVNo}&updatedFormVNo=${updatedFormVNo}&amendId=${amendId}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        );

        const json = await res.json();

        if (!json?.status) {
          toast.error(json?.message || "Failed to load details");
          return;
        }

        setDetails(json.data);

      } catch (error) {
        toast.error("Unable to load amendment details");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, []);

  // =============================================
  // useEffect for mapping the data in form fields
  // =============================================
  useEffect(() => {
    const amendmentDraft = details?.amendmentDraft;

    if (!amendmentDraft) return;

    setUnskilled((p) =>
      p.trim() ? p : valOrZero(amendmentDraft.unskilled_rate_wages)
    );

    setSemiskilled((p) =>
      p.trim() ? p : valOrZero(amendmentDraft.semiskilled_rate_wages)
    );

    setSkilled((p) =>
      p.trim() ? p : valOrZero(amendmentDraft.skilled_rate_wages)
    );

    setHighlyskilled((p) =>
      p.trim() ? p : valOrZero(amendmentDraft.highlyskilled_rate_wages)
    );

    setHoursWork((p) =>
      p.trim() ? p : valOrZero(amendmentDraft.hours_work)
    );

    setSpredOver((p) =>
      p.trim() ? p : valOrZero(amendmentDraft.spred_over)
    );

    setOvertime((p) =>
      p.trim() ? p : valOrZero(amendmentDraft.overtime)
    );

    setOvertimeWages((p) =>
      p.trim() ? p : valOrZero(amendmentDraft.overtime_wages)
    );

    setWeeklyHoliday(
      amendmentDraft.weekly_holiday === 1 ||
        String(amendmentDraft.weekly_holiday) === "1"
        ? "1"
        : "0"
    );

    setNoHolidayList((p) =>
      p.length
        ? p
        : String(amendmentDraft.no_holiday ?? "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
    );

    setHolidayWages((p) =>
      p.trim() ? p : valOrZero(amendmentDraft.holiday_wages)
    );

    setNameOfAgent((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.name_of_agent ?? "")
    );

    setManagerCountry((p) =>
      p.trim()
        ? countryLabelToId(p)
        : countryLabelToId(
          amendmentDraft.manager_country ??
          amendmentDraft.contractor_country ??
          "1"
        )
    );

    setAddressOfManager((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.address_of_manager ?? "")
    );

    setManagerState((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.manager_state ?? "")
    );

    setManagerDistrict((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.contractor_manager_dist ?? "")
    );

    setManagerSubdivision((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.contractor_manager_subdivision ?? "")
    );

    setManagerAreaType((p) =>
      p.trim()
        ? p
        : normalizeAreaTypeCode(
          String(amendmentDraft.contractor_manager_areatype ?? "")
        )
    );

    setManagerAreaName((p) =>
      p.trim()
        ? p
        : String(
          amendmentDraft.contractor_manager_name_areatype ?? ""
        )
    );

    setManagerVillWard((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.contractor_managerr_vill_ward ?? "")
    );

    setManagerPs((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.contractor_manager_ps ?? "")
    );

    setManagerPin((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.contractor_manager_pin ?? "")
    );

    setCategoryDesignation((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.category_designation ?? "")
    );

    setAnnualLeaveNo((p) =>
      p.trim()
        ? p
        : valOrZero(amendmentDraft.annual_leave_no)
    );

    setCasualLeaveNo((p) =>
      p.trim()
        ? p
        : valOrZero(amendmentDraft.casual_leave_no)
    );

    setSickLeaveNo((p) =>
      p.trim()
        ? p
        : valOrZero(amendmentDraft.sick_leave_no)
    );

    setMaternityLeaveNo((p) =>
      p.trim()
        ? p
        : valOrZero(amendmentDraft.maternity_leave_no)
    );

    setOtherLeaveNo((p) =>
      p.trim()
        ? p
        : valOrZero(amendmentDraft.other_leave_no)
    );

    setEarnedLeaveNo((p) =>
      p.trim()
        ? p
        : valOrZero(amendmentDraft.earned_leave_no)
    );

    setSpecialBenifites((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.special_benifites ?? "")
    );

    setStateInsurance((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.state_insurance ?? "")
    );

    setMiscellaneousProvisions((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.miscellaneous_provisions ?? "")
    );

    setContractorConvicted(
      amendmentDraft.contractor_convicted === 1 ||
        String(amendmentDraft.contractor_convicted) === "1"
        ? "1"
        : "0"
    );

    setDetailsContractorConvicted((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.details_contractor_convicted ?? "")
    );

    setContractorPreviousEmployer(
      amendmentDraft.contractor_previous_employer === 1 ||
        String(amendmentDraft.contractor_previous_employer) === "1"
        ? "1"
        : "0"
    );

    const parsedPrev = parsePreviousEmployerDetails(
      String(amendmentDraft.details_previous_employer ?? "")
    );

    setPreviousLicenseNumber((p) =>
      p.trim()
        ? p
        : String(
          amendmentDraft.add_license_number ??
          parsedPrev.previousLicenseNumber ??
          ""
        )
    );

    setRegNoPrincipalEmployer((p) =>
      p.trim()
        ? p
        : String(
          amendmentDraft.add_reg_no_pe ??
          parsedPrev.regNoPrincipalEmployer ??
          ""
        )
    );

    setContractorRevoking(
      amendmentDraft.contractor_revoking === 1 ||
        String(amendmentDraft.contractor_revoking) === "1"
        ? "1"
        : "0"
    );

    setDetailsContractorRevoking((p) =>
      p.trim()
        ? p
        : String(amendmentDraft.details_contractor_revoking ?? "")
    );
  }, [details]);

  useEffect(() => {
    const run = async () => {
      const token = getAuthToken();
      const { data } = await axios.get(`${API_BASE}states`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setManagerStateOptions(
        list.map((s: any, index: number) => ({
          value: String(s.id ?? s.code ?? index),
          label: String(s.name ?? s.state_name ?? s.stateName ?? s.id ?? s.code ?? "State"),
        })),
      );
    };
    run().catch(() => setManagerStateOptions([]));
  }, []);

  useEffect(() => {
    if (managerState !== "1") {
      setManagerDistrictOptions([]);
      setManagerSubdivisionOptions([]);
      setManagerAreaTypeOptions([]);
      setManagerAreaCodeOptions([]);
      setManagerVillageWardOptions([]);
      setManagerPoliceStationOptions([]);
      return;
    }
    const run = async () => {
      const token = getAuthToken();
      const { data } = await axios.get(`${API_BASE}district`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setManagerDistrictOptions(
        list.map((d: any) => ({
          value: String(d.district_code),
          label: String(d.district_name ?? d.name ?? d.district_code),
        })),
      );
    };
    run().catch(() => setManagerDistrictOptions([]));
  }, [managerState]);

  useEffect(() => {
    if (managerState !== "1" || !managerDistrict) {
      setManagerSubdivisionOptions([]);
      setManagerAreaTypeOptions([]);
      setManagerAreaCodeOptions([]);
      setManagerVillageWardOptions([]);
      setManagerPoliceStationOptions([]);
      return;
    }
    const run = async () => {
      const token = getAuthToken();
      const [subdivRes, psRes] = await Promise.all([
        axios.get(`${API_BASE}subdivision/${managerDistrict}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
        axios.get(`${API_BASE}policestation/${managerDistrict}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
      ]);
      const subdivList = Array.isArray(subdivRes.data?.data)
        ? subdivRes.data.data
        : Array.isArray(subdivRes.data)
          ? subdivRes.data
          : [];
      const psList = Array.isArray(psRes.data?.data) ? psRes.data.data : Array.isArray(psRes.data) ? psRes.data : [];
      setManagerSubdivisionOptions(
        subdivList.map((s: any) => ({ value: String(s.sub_div_code), label: String(s.sub_div_name) })),
      );
      setManagerPoliceStationOptions(
        psList.map((p: any) => ({
          value: String(p.police_station_code),
          label: String(p.name_of_police_station),
        })),
      );
    };
    run().catch(() => {
      setManagerSubdivisionOptions([]);
      setManagerPoliceStationOptions([]);
    });
  }, [managerDistrict, managerState]);

  useEffect(() => {
    if (managerState !== "1" || !managerDistrict || !managerSubdivision) {
      setManagerAreaTypeOptions([]);
      setManagerAreaCodeOptions([]);
      setManagerVillageWardOptions([]);
      return;
    }
    const run = async () => {
      const token = getAuthToken();
      const { data } = await axios.get(`${API_BASE}areatype/${managerDistrict}/${managerSubdivision}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const typeList: string[] = (list as any[])
        .map((a: any) => normalizeAreaTypeCode(String(a?.type ?? "")))
        .filter((v: string) => v.length > 0);
      const uniqueTypes = [...new Set(typeList)];
      const mapped = uniqueTypes
        .filter((t) => AREA_TYPE_LABELS[t])
        .map((t) => ({ value: t, label: AREA_TYPE_LABELS[t] }));
      if (managerAreaType && !mapped.some((m) => m.value === managerAreaType)) {
        mapped.push({ value: managerAreaType, label: AREA_TYPE_LABELS[managerAreaType] ?? managerAreaType });
      }
      setManagerAreaTypeOptions(mapped);
    };
    run().catch(() => setManagerAreaTypeOptions([]));
  }, [managerDistrict, managerSubdivision, managerState, managerAreaType]);

  useEffect(() => {
    if (managerState !== "1" || !managerDistrict || !managerSubdivision || !managerAreaType) {
      setManagerAreaCodeOptions([]);
      setManagerVillageWardOptions([]);
      return;
    }
    const run = async () => {
      const token = getAuthToken();
      const areaTypeCode = normalizeAreaTypeCode(managerAreaType);
      if (!areaTypeCode) {
        setManagerAreaCodeOptions([]);
        return;
      }
      const { data } = await axios.get(
        `${API_BASE}block/${managerDistrict}/${managerSubdivision}/${areaTypeCode.toLowerCase()}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setManagerAreaCodeOptions(
        list.map((b: any) => ({ value: String(b.block_code), label: String(b.block_mun_name) })),
      );
    };
    run().catch(() => setManagerAreaCodeOptions([]));
  }, [managerAreaType, managerDistrict, managerSubdivision, managerState]);

  useEffect(() => {
    if (managerState !== "1" || !managerAreaName) {
      setManagerVillageWardOptions([]);
      return;
    }
    const run = async () => {
      const token = getAuthToken();
      const { data } = await axios.get(`${API_BASE}villageward/${managerAreaName}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setManagerVillageWardOptions(
        list.map((v: any) => ({ value: String(v.village_code), label: String(v.village_name) })),
      );
    };
    run().catch(() => setManagerVillageWardOptions([]));
  }, [managerAreaName, managerState]);

  useEffect(() => {
    setFormValue("nameOfAgent", nameOfAgent);
    setFormValue("addressOfManager", addressOfManager);
    setFormValue("managerState", managerState);
    setFormValue("managerDistrict", managerDistrict);
    setFormValue("managerSubdivision", managerSubdivision);
    setFormValue("managerAreaType", managerAreaType);
    setFormValue("managerAreaName", managerAreaName);
    setFormValue("managerVillWard", managerVillWard);
    setFormValue("managerPs", managerPs);
    setFormValue("managerPin", managerPin);
    setFormValue("categoryDesignation", categoryDesignation);
    setFormValue("unskilled", unskilled);
    setFormValue("semiskilled", semiskilled);
    setFormValue("skilled", skilled);
    setFormValue("highlyskilled", highlyskilled);
    setFormValue("hoursWork", hoursWork);
    setFormValue("spredOver", spredOver);
    setFormValue("overtime", overtime);
    setFormValue("overtimeWages", overtimeWages);
  }, [
    addressOfManager,
    categoryDesignation,
    highlyskilled,
    hoursWork,
    managerAreaName,
    managerAreaType,
    managerDistrict,
    managerPin,
    managerPs,
    managerState,
    managerSubdivision,
    managerVillWard,
    nameOfAgent,
    overtime,
    overtimeWages,
    semiskilled,
    spredOver,
    skilled,
    unskilled,
    setFormValue,
  ]);

  const toNum = (value: string): number | undefined => {
    const v = value.trim();
    if (!/^\d+(\.\d+)?$/.test(v)) return undefined;
    return Number(v);
  };
  const toInt = (value: string): number | undefined => {
    const v = value.trim();
    if (!/^\d+$/.test(v)) return undefined;
    return Number(v);
  };
  const normalizePin = (value: string): string => value.replace(/\D/g, "").slice(0, 6);
  const isValidPin = (value: string): boolean => /^\d{6}$/.test(value.trim());

  const goBackToSections = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const payload = {
        id: details?.amendmentDraft?.id,
        flag: "FORM_3",

        // Manager / Agent Details
        nameOfAgent: nameOfAgent?.trim(),
        addressOfManager: addressOfManager?.trim(),
        contractorManagerDist: managerDistrict || undefined,
        contractorManagerSubdivision: toInt(managerSubdivision),
        contractorManagerAreatype: managerAreaType || undefined,
        contractorManagerNameAreatype: toInt(managerAreaName),
        contractorManagerrVillWard: toInt(managerVillWard),
        contractorManagerPs: managerPs || undefined,
        managerPin: toInt(managerPin),
        managerState: toInt(managerState),
        managerCountry: toInt(managerCountry),

        // Category / Designation
        categoryDesignation: categoryDesignation?.trim(),

        // Wage Details
        unskilledRateWages: toNum(unskilled) ?? 0,
        semiskilledRateWages: toNum(semiskilled) ?? 0,
        skilledRateWages: toNum(skilled) ?? 0,
        highlyskilledRateWages: toNum(highlyskilled) ?? 0,

        // Work Details
        hoursWork: toNum(hoursWork) ?? 0,
        spredOver: toNum(spredOver) ?? 0,
        overtime: toNum(overtime) ?? 0,
        overtimeWages: toNum(overtimeWages) ?? 0,

        weeklyHoliday: Number(weeklyHoliday),
        noHoliday: noHolidayList.join(","),

        holidayWages: toNum(holidayWages) ?? 0,

        // Leave Details
        annualLeaveNo: toInt(annualLeaveNo) ?? 0,
        casualLeaveNo: toInt(casualLeaveNo) ?? 0,
        sickLeaveNo: toInt(sickLeaveNo) ?? 0,
        maternityLeaveNo: toInt(maternityLeaveNo) ?? 0,
        earnedLeaveNo: toInt(earnedLeaveNo) ?? 0,
        otherLeaveNo: toInt(otherLeaveNo) ?? 0,

        // Benefits
        specialBenifites: specialBenifites?.trim(),
        stateInsurance: stateInsurance?.trim(),
        miscellaneousProvisions: miscellaneousProvisions?.trim(),

        // Conviction
        contractorConvicted: Number(contractorConvicted),
        detailsContractorConvicted:
          contractorConvicted === "1"
            ? detailsContractorConvicted?.trim()
            : "",

        // Previous Employer
        contractorPreviousEmployer:
          Number(contractorPreviousEmployer),

        detailsPreviousEmployer:
          contractorPreviousEmployer === "1"
            ? buildPreviousEmployerDetails(
              previousLicenseNumber,
              regNoPrincipalEmployer
            )
            : "",

        // Revoking
        contractorRevoking: Number(contractorRevoking),

        detailsContractorRevoking:
          contractorRevoking === "1"
            ? detailsContractorRevoking
            : "",
      };

      const response = await fetch(
        `${API_BASE}contractor-license/amendment/edit-draft`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        toast.error(
          result?.message ||
          "Failed to save particular information"
        );
        return;
      }

      toast.success(
        result?.message ||
        "Particular of contract labour details saved."
      );

      goBackToSections();
    } catch (err) {
      console.error(err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Save failed."
      );
    } finally {
      setSaving(false);
    }
  };

  const onSubmitForm = handleFormSubmit(async () => {
    await handleSubmit();
  });

  if (loading) {
    return (
      <div className="w-full p-8 text-sm text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#ececec] font-sans px-2 md:px-6 py-4">
      <button
        type="button"
        onClick={goBackToSections}
        className="text-sm text-[#1D5A89] mb-4 hover:underline"
      >
        ← Back to sections
      </button>
      <div className="mx-auto w-full max-w-[1200px] border border-gray-300 bg-white shadow-sm">
        <div className="border-b border-gray-300 bg-[#1d5f8d] px-4 py-2 text-center text-sm font-semibold uppercase text-white">
          Particular of Contract Labour
        </div>
        <div className="px-4 py-4 [&_input:disabled]:bg-gray-100 [&_input:disabled]:text-gray-600 [&_select:disabled]:bg-gray-100 [&_select:disabled]:text-gray-600 [&_textarea:disabled]:bg-gray-100 [&_textarea:disabled]:text-gray-600">
          <form onSubmit={onSubmitForm} className="space-y-4">
            <h4 className="border-b border-gray-300 pb-1 text-[13px] font-semibold text-[#1d5f8d]">
              Details of manager/agent of contractor at the worksite
            </h4>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">A. Name of agent/manager *</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  {...register("nameOfAgent")}
                  value={nameOfAgent}
                  onChange={(e) => setNameOfAgent(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">B. Select Country</label>
                <input
                  className="w-full border rounded bg-gray-100 px-3 py-2 text-sm text-gray-700"
                  value={countryIdToLabel(managerCountry)}
                  readOnly
                  disabled
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">C. Address Line1 of agent/manager *</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  {...register("addressOfManager")}
                  value={addressOfManager}
                  onChange={(e) => setAddressOfManager(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">D. Select State *</label>
                <select className="w-full border rounded px-3 py-2 text-sm" {...register("managerState")} value={managerState} onChange={(e) => setManagerState(e.target.value)}>
                  <option value="">Select state</option>
                  {managerStateOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              {managerState === "1" ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">E. Select District *</label>
                    <select className="w-full border rounded px-3 py-2 text-sm" {...register("managerDistrict")} value={managerDistrict} onChange={(e) => setManagerDistrict(e.target.value)} >
                      <option value="">Select district</option>
                      {managerDistrictOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">F. Select Subdivision *</label>
                    <select className="w-full border rounded px-3 py-2 text-sm" {...register("managerSubdivision")} value={managerSubdivision} onChange={(e) => setManagerSubdivision(e.target.value)} >
                      <option value="">Select subdivision</option>
                      {managerSubdivisionOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">G. Select Areatype *</label>
                    <select className="w-full border rounded px-3 py-2 text-sm" {...register("managerAreaType")} value={managerAreaType} onChange={(e) => setManagerAreaType(e.target.value)} >
                      <option value="">Select areatype</option>
                      {managerAreaTypeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">H. Select Municipality/Block *</label>
                    <select className="w-full border rounded px-3 py-2 text-sm" {...register("managerAreaName")} value={managerAreaName} onChange={(e) => setManagerAreaName(e.target.value)} >
                      <option value="">Select area</option>
                      {managerAreaCodeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">I. Select Gram Panchayat/Ward *</label>
                    <select className="w-full border rounded px-3 py-2 text-sm" {...register("managerVillWard")} value={managerVillWard} onChange={(e) => setManagerVillWard(e.target.value)} >
                      <option value="">Select village/ward</option>
                      {managerVillageWardOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">J. Select Police Station *</label>
                    <select className="w-full border rounded px-3 py-2 text-sm" {...register("managerPs")} value={managerPs} onChange={(e) => setManagerPs(e.target.value)} >
                      <option value="">Select police station</option>
                      {managerPoliceStationOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">E. Select District *</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={managerDistrict} onChange={(e) => setManagerDistrict(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">F. Select Subdivision *</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={managerSubdivision} onChange={(e) => setManagerSubdivision(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">G. Select Areatype *</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={managerAreaType} onChange={(e) => setManagerAreaType(e.target.value)} disabled />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">H. Select Municipality/Block *</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={managerAreaName} onChange={(e) => setManagerAreaName(e.target.value)} disabled />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">I. Select Gram Panchayat/Ward *</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={managerVillWard} onChange={(e) => setManagerVillWard(e.target.value)} disabled />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">J. Select Police Station *</label>
                    <input className="w-full border rounded px-3 py-2 text-sm" value={managerPs} onChange={(e) => setManagerPs(e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">K. PIN Code *</label>
                <input
                  className="w-full border rounded px-3 py-2 text-sm"
                  {...register("managerPin")}
                  value={managerPin}
                  inputMode="numeric"
                  maxLength={6}
                  pattern="\d{6}"
                  onChange={(e) => setManagerPin(normalizePin(e.target.value))}

                />
              </div>
            </div>
            <h4 className="border-b border-gray-300 pb-1 text-[13px] font-semibold text-[#1d5f8d]">
              Category / designation / nomenclature of the contract labour, namely, fitter, welder, carpenter etc.
            </h4>
            <label className="mb-1 block text-sm font-medium text-gray-800">
              Category/designation/nomenclature of the contract labour *
            </label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              {...register("categoryDesignation")}
              rows={2}
              value={categoryDesignation}
              onChange={(e) => setCategoryDesignation(e.target.value)}

            />
            <h4 className="border-b border-gray-300 pb-1 text-[13px] font-semibold text-[#1d5f8d]">
              Rate of Wages (Contract Labour Categories)
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="unskilled-rate" className="mb-1 block text-sm font-medium text-gray-800">
                  A. Rate of Wages of Unskilled Category (including DA and other cash benefits) *
                </label>
                <input id="unskilled-rate" className="w-full border rounded px-3 py-2 text-sm" {...register("unskilled")} value={unskilled} onChange={(e) => setUnskilled(e.target.value)} />
              </div>
              <div>
                <label htmlFor="semiskilled-rate" className="mb-1 block text-sm font-medium text-gray-800">
                  B. Rate of Wages of Semiskilled Category (including DA and other cash benefits) *
                </label>
                <input id="semiskilled-rate" className="w-full border rounded px-3 py-2 text-sm" {...register("semiskilled")} value={semiskilled} onChange={(e) => setSemiskilled(e.target.value)} />
              </div>
              <div>
                <label htmlFor="skilled-rate" className="mb-1 block text-sm font-medium text-gray-800">
                  C. Rate of Wages of Skilled Category (including DA and other cash benefits) *
                </label>
                <input id="skilled-rate" className="w-full border rounded px-3 py-2 text-sm" {...register("skilled")} value={skilled} onChange={(e) => setSkilled(e.target.value)} />
              </div>
              <div>
                <label htmlFor="highlyskilled-rate" className="mb-1 block text-sm font-medium text-gray-800">
                  D. Rate of Wages of Highlyskilled Category (including DA and other cash benefits) *
                </label>
                <input id="highlyskilled-rate" className="w-full border rounded px-3 py-2 text-sm" {...register("highlyskilled")} value={highlyskilled} onChange={(e) => setHighlyskilled(e.target.value)} />
              </div>
            </div>
            <h4 className="border-b border-gray-300 pb-1 pt-2 text-[13px] font-semibold text-[#1d5f8d]">
              Daliy Hours of work, overtime,overtime wages and spread over time
            </h4>
            <div className="grid md:grid-cols-4 gap-3">
              <div>
                <label htmlFor="hours-work" className="mb-1 block text-sm font-medium text-gray-800">
                  A. Hours of Work *
                </label>
                <input id="hours-work" className="w-full border rounded px-3 py-2 text-sm" {...register("hoursWork")} value={hoursWork} onChange={(e) => setHoursWork(e.target.value)} />
              </div>
              <div>
                <label htmlFor="spread-over" className="mb-1 block text-sm font-medium text-gray-800">
                  B. Spread over hour(s) *
                </label>
                <input id="spread-over" className="w-full border rounded px-3 py-2 text-sm" {...register("spredOver")} value={spredOver} onChange={(e) => setSpredOver(e.target.value)} />
              </div>
              <div>
                <label htmlFor="overtime" className="mb-1 block text-sm font-medium text-gray-800">
                  C. Overtime hour(s) *
                </label>
                <input id="overtime" className="w-full border rounded px-3 py-2 text-sm" {...register("overtime")} value={overtime} onChange={(e) => setOvertime(e.target.value)} />
              </div>
              <div>
                <label htmlFor="overtime-wages" className="mb-1 block text-sm font-medium text-gray-800">
                  D. Overtime Wages/per hour *
                </label>
                <input id="overtime-wages" className="w-full border rounded px-3 py-2 text-sm" value={overtimeWages} onChange={(e) => setOvertimeWages(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  E. Whether weekly holiday observed and on which day
                </label>
                <div className="rounded border px-3 py-2">
                  <div className="mb-2 flex items-center gap-4 text-sm">
                    <label className="inline-flex items-center gap-1">
                      <input type="radio" name="weekly-holiday" checked={weeklyHoliday === "0"} onChange={() => setWeeklyHoliday("0")} />
                      No
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input type="radio" name="weekly-holiday" checked={weeklyHoliday === "1"} onChange={() => setWeeklyHoliday("1")} />
                      Yes
                    </label>
                  </div>
                  <label htmlFor="no-holiday" className="mb-1 block text-xs font-medium text-gray-700">
                    Select holiday(s)
                  </label>
                  <select
                    id="no-holiday"
                    multiple
                    className="h-[84px] w-full rounded border px-2 py-1 text-sm"
                    value={noHolidayList}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                      setNoHolidayList(selected);
                    }}
                    disabled={weeklyHoliday === "0"}
                  >
                    <option value="1">Sunday</option>
                    <option value="2">Monday</option>
                    <option value="3">Tuesday</option>
                    <option value="4">Wednesday</option>
                    <option value="5">Thursday</option>
                    <option value="6">Friday</option>
                    <option value="7">Saturday</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="holiday-wages" className="mb-1 block text-sm font-medium text-gray-800">
                  F. holiday Wages/per hour
                </label>
                <input
                  id="holiday-wages"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={holidayWages}
                  onChange={(e) => setHolidayWages(e.target.value)}

                />
              </div>
            </div>
            <h4 className="border-b border-gray-300 pb-1 pt-2 text-[13px] font-semibold text-[#1d5f8d]">
              Other Condition of service like leave (annual leave, casual leave, sick leave, maternity leave etc.) Holidays etc.of the contract labour
            </h4>
            <div className="grid md:grid-cols-3 gap-3">
              <Field label="A.Number of Annual Leave(s) in day(s)" value={annualLeaveNo} setValue={setAnnualLeaveNo} disabled={false} />
              <Field label="B.Number of Casual Leave(s) in day(s)" value={casualLeaveNo} setValue={setCasualLeaveNo} disabled={false} />
              <Field label="C.Number of Sick Leave(s)" value={sickLeaveNo} setValue={setSickLeaveNo} disabled={false} />
              <Field label="D.Number of Maternity Leave(s) in day(s)" value={maternityLeaveNo} setValue={setMaternityLeaveNo} disabled={false} />
              <Field label="E.Number of other Leave(s) in day(s)" value={otherLeaveNo} setValue={setOtherLeaveNo} disabled={false} />
              <Field label="F.Number of Earned Leave(s) in day(s)" value={earnedLeaveNo} setValue={setEarnedLeaveNo} disabled={false} />
            </div>
            <h4 className="border-b border-gray-300 pb-1 pt-2 text-[13px] font-semibold text-[#1d5f8d]">Special benefits provided if any</h4>
            <label className="mb-1 block text-sm font-medium text-gray-800">Special benefits provided</label>
            <textarea
              className={`w-full border rounded px-3 py-2 text-sm`}
              rows={2}
              value={specialBenifites}
              onChange={(e) => setSpecialBenifites(e.target.value)}

            />
            <h4 className="border-b border-gray-300 pb-1 pt-2 text-[13px] font-semibold text-[#1d5f8d]">Contribution made under the Employees State Insurance Act,1948</h4>
            <label className="mb-1 block text-sm font-medium text-gray-800">Contribution made under the Employees State Insurance Act,1948</label>
            <textarea
              className={`w-full border rounded px-3 py-2 text-sm`}
              rows={2}
              value={stateInsurance}
              onChange={(e) => setStateInsurance(e.target.value)}

            />
            <h4 className="border-b border-gray-300 pb-1 pt-2 text-[13px] font-semibold text-[#1d5f8d]">Contribution made under the Employees Provident Fund and Miscellaneous Provision Act,1952</h4>
            <label className="mb-1 block text-sm font-medium text-gray-800">Contribution made under the Employees Provident Fund and Miscellaneous Provision Act,1952</label>
            <textarea
              className={`w-full border rounded px-3 py-2 text-sm`}
              rows={2}
              value={miscellaneousProvisions}
              onChange={(e) => setMiscellaneousProvisions(e.target.value)}

            />

            <h4 className="border-b border-gray-300 pb-1 pt-2 text-[13px] font-semibold text-[#1d5f8d]">
              Whether the contractor was convicted of any offence within the preceeding five years. If so, give details
            </h4>
            <YesNoGroup value={contractorConvicted} setValue={setContractorConvicted} disabled={false} />
            {contractorConvicted === "1" ? (
              <>
                <label className="mb-1 block text-sm font-medium text-gray-800">If yes please give details</label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={2}
                  value={detailsContractorConvicted}
                  onChange={(e) => setDetailsContractorConvicted(e.target.value)}

                />
              </>
            ) : null}

            <h4 className="border-b border-gray-300 pb-1 pt-2 text-[13px] font-semibold text-[#1d5f8d]">
              Whether the contractor has worked in any other establishment within the past five years. If so give details of the principal employer, establishment
            </h4>
            <YesNoGroup value={contractorPreviousEmployer} setValue={setContractorPreviousEmployer} disabled={false} />
            {contractorPreviousEmployer === "1" ? (
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-800">Give your Previous License Number</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={2}
                    value={previousLicenseNumber}
                    onChange={(e) => setPreviousLicenseNumber(e.target.value)}

                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-800">Give Registration Number of Principal Employer</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 text-sm"
                    rows={2}
                    value={regNoPrincipalEmployer}
                    onChange={(e) => setRegNoPrincipalEmployer(e.target.value)}

                  />
                </div>
              </div>
            ) : null}

            <h4 className="border-b border-gray-300 pb-1 pt-2 text-[13px] font-semibold text-[#1d5f8d]">
              Whether there was any order against the contract or revoking or suspending license or forfeiting security deposit in respect of an earlier contract. If so, the date of such order
            </h4>
            <YesNoGroup value={contractorRevoking} setValue={setContractorRevoking} disabled={false} />
            {contractorRevoking === "1" ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">The date of such order</label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={normalizeToDateInput(detailsContractorRevoking)}
                  onChange={(e) => setDetailsContractorRevoking(e.target.value)}

                />
              </div>
            ) : null}
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={goBackToSections}
                className="rounded-sm border border-[#2e6da4] bg-[#337ab7] px-6 py-2 text-sm font-semibold text-white hover:bg-[#286090]"
              >
                Back
              </button>
              <button type="submit" disabled={saving} className="rounded-sm border border-[#2e6da4] bg-[#337ab7] px-8 py-2 text-sm font-semibold text-white hover:bg-[#286090] disabled:opacity-60">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ParticularInfo;

function Field({
  label,
  value,
  setValue,

}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-800">{label}</label>
      <input className="w-full border rounded px-3 py-2 text-sm" value={value} onChange={(e) => setValue(e.target.value)} disabled={false} />
    </div>
  );
}

function YesNoGroup({
  value,
  setValue,
  disabled,
}: {
  value: "0" | "1";
  setValue: (v: "0" | "1") => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <label className="inline-flex items-center gap-1">
        <input type="radio" checked={value === "0"} onChange={() => setValue("0")} disabled={disabled} />
        No
      </label>
      <label className="inline-flex items-center gap-1">
        <input type="radio" checked={value === "1"} onChange={() => setValue("1")} disabled={disabled} />
        Yes
      </label>
    </div>
  );
}

function valOrZero(v: unknown): string {
  if (v == null || v === "") return "0";
  return String(v);
}

function buildPreviousEmployerDetails(previousLicense: string, regNoPe: string): string {
  const a = previousLicense.trim();
  const b = regNoPe.trim();
  if (!a && !b) return "";
  if (a && b) return `Previous License Number: ${a}; Registration Number of Principal Employer: ${b}`;
  if (a) return `Previous License Number: ${a}`;
  return `Registration Number of Principal Employer: ${b}`;
}

function parsePreviousEmployerDetails(raw: string): {
  previousLicenseNumber: string;
  regNoPrincipalEmployer: string;
} {
  const text = raw.trim();
  if (!text) return { previousLicenseNumber: "", regNoPrincipalEmployer: "" };
  const m1 = /Previous License Number:\s*([^;]+)/i.exec(text);
  const m2 = /Registration Number of Principal Employer:\s*(.+)$/i.exec(text);
  return {
    previousLicenseNumber: (m1?.[1] ?? "").trim(),
    regNoPrincipalEmployer: (m2?.[1] ?? "").trim(),
  };
}

function normalizeAreaTypeCode(raw: string): string {
  const v = String(raw ?? "").trim().toUpperCase();
  if (!v) return "";
  if (["B", "M", "C", "S", "N"].includes(v)) return v;
  if (v.startsWith("BLOCK")) return "B";
  if (v.startsWith("MUNICIPAL")) return "M";
  if (v.startsWith("CORPORATION")) return "C";
  if (v === "SEZ" || v.startsWith("SPECIAL ECONOMIC")) return "S";
  if (v.startsWith("NOTIFIED")) return "N";
  return "";
}

function normalizeToDateInput(raw: string): string {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (v.includes("T")) return v.slice(0, 10);
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
