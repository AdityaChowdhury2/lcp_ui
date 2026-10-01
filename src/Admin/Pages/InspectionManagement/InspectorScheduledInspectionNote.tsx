import { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
  Search,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import { getAuthToken, getUserId } from "@/utils/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";

interface ScheduledInspectionDetail {
  inspection: {
    id: number;
    scheduleId: string;
    cisId: string | null;
    estId: string;
    estSource: string;
    scheduleDate: string;
    fromDate: string;
    toDate: string;
    actCode: string;
    mapStatus: string;
    mapNote: string | null;
    status: string | null;
    riskCategory: string | null;
    riskScore?: number | null;
  };
  registration: {
    registrationNumber: string | null;
    establishmentName: string | null;
    establishmentType: string | null;
    registrationDate: string | null;
    address: string | null;
    location: {
      district: string | null;
      subdivision: string | null;
      areaType: string | null;
      villageWard: string | null;
      blockMunicipality: string | null;
      policeStation: string | null;
      pincode: number | null;
    };
    principalEmployer: {
      name: string | null;
      mobile: string | null;
      address: string | null;
    };
    manager: {
      name: string | null;
      address: string | null;
    };
    natureOfWork: string | null;
    maxWorkmen: number | null;
  };
  inspectionNote: {
    infringements: Record<string, string>;
    draftSavedAt: string | null;
    finalSubmittedAt: string | null;
    noteFileId: number | null;
    noteFileUri: string | null;
  } | null;
}

interface LawItem {
  ispection_id: number;
  inspection_txt: string;
  inspection_txt_type: string;
  txt_order: number;
  inspection_name: string;
}

interface LawGroup {
  name: string;
  type: string;
  items: LawItem[];
}

interface DetailRowItem {
  id: string;
  parameter: string;
  details: ReactNode;
}

const STEPS = [
  { id: 1, label: "Establishment" },
  { id: 2, label: "Infringements" },
  { id: 3, label: "Preview & Upload" },
];

const MAX_UPLOAD_BYTES = 200 * 1024;

const formatDisplayDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const display = (value: unknown) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
  const message = error.response?.data?.message;
  if (error.response?.status === 413) {
    return "Inspection note must be 200 KB or smaller";
  }
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message.trim()) return message;
  return fallback;
};

const groupLaws = (laws: LawItem[]): LawGroup[] => {
  const map = new Map<string, LawItem[]>();
  for (const law of laws) {
    const key = law.inspection_name?.trim() || "Other";
    const list = map.get(key) ?? [];
    list.push(law);
    map.set(key, list);
  }
  return [...map.entries()].map(([name, items]) => ({
    name,
    type: items[0]?.inspection_txt_type || "",
    items: [...items].sort((a, b) => (a.txt_order ?? 0) - (b.txt_order ?? 0)),
  }));
};

const DetailsTable: FC<{ title: string; rows: DetailRowItem[] }> = ({
  title,
  rows,
}) => (
  <div className="overflow-hidden rounded-xl border border-[#d7e0ea] bg-white shadow-sm">
    <div className="border-b border-[#d7e0ea] bg-[#f4f8fc] px-4 py-3">
      <h2 className="text-base font-semibold text-[#1E73BE]">{title}</h2>
    </div>
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[260px] whitespace-normal">Parameter</TableHead>
            <TableHead className="whitespace-normal">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="align-top font-medium whitespace-normal">
                {row.parameter}
              </TableCell>
              <TableCell className="align-top whitespace-normal">
                {row.details}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

const InspectorScheduledInspectionNote: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState(1);
  const [detail, setDetail] = useState<ScheduledInspectionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [laws, setLaws] = useState<LawItem[]>([]);
  const [lawLoading, setLawLoading] = useState(false);
  const [lawSearch, setLawSearch] = useState("");
  const [expandedActs, setExpandedActs] = useState<string[]>([]);
  const [selectedInfringements, setSelectedInfringements] = useState<number[]>([]);
  const [infringementRemarks, setInfringementRemarks] = useState<
    Record<number, string>
  >({});

  const [hasDraft, setHasDraft] = useState(false);
  const [savingInfringements, setSavingInfringements] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const hydrateNote = (note: ScheduledInspectionDetail["inspectionNote"], status?: string | null) => {
    const remarks = note?.infringements ?? {};
    const ids = Object.keys(remarks)
      .map((key) => Number(key))
      .filter((n) => Number.isFinite(n) && n > 0);
    const remarksMap: Record<number, string> = {};
    ids.forEach((lawId) => {
      remarksMap[lawId] = remarks[String(lawId)] || "";
    });
    setSelectedInfringements(ids);
    setInfringementRemarks(remarksMap);
    setHasDraft(!!note?.draftSavedAt || status === "Draft" || status === "Final Submit");
    setIsSubmitted(!!note?.finalSubmittedAt || status === "Final Submit");
    setUploadedFilePath(note?.noteFileUri ?? null);
    if (note?.finalSubmittedAt || status === "Final Submit") {
      setActiveTab(3);
    } else if (note?.draftSavedAt || status === "Draft") {
      setActiveTab(2);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const userId = getUserId();
        const response = await axios.get<ScheduledInspectionDetail>(
          `${API_BASE}inspections/scheduled-inspections/${id}`,
          { params: { userId }, headers: getAuthHeaders() },
        );
        setDetail(response.data);
        hydrateNote(response.data.inspectionNote, response.data.inspection.status);
      } catch (error) {
        setDetail(null);
        setErrorMessage(
          getApiErrorMessage(error, "Failed to load scheduled inspection details."),
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchDetail();
  }, [id]);

  const fetchLaws = useCallback(async () => {
    try {
      setLawLoading(true);
      const res = await axios.get(`${API_BASE}inspections/law/get-laws`, {
        headers: getAuthHeaders(),
      });
      if (res.data?.status) {
        setLaws(res.data.data || []);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to fetch laws"));
    } finally {
      setLawLoading(false);
    }
  }, []);

  useEffect(() => {
    if ((activeTab === 2 || activeTab === 3) && laws.length === 0) {
      void fetchLaws();
    }
  }, [activeTab, fetchLaws, laws.length]);

  const location = detail?.registration.location;

  const establishmentRows: DetailRowItem[] = detail
    ? [
        {
          id: "name",
          parameter: "Name of the Establishment",
          details: (
            <div>
              <p className="font-semibold">
                {display(detail.registration.establishmentName)}
              </p>
              <p>{display(detail.registration.establishmentType)}</p>
            </div>
          ),
        },
        {
          id: "reg",
          parameter: "Registration Number / Date",
          details: (
            <div>
              <p>
                {detail.registration.registrationNumber &&
                String(detail.registration.registrationNumber).trim()
                  ? detail.registration.registrationNumber
                  : "Not registered"}
              </p>
              <p>{formatDisplayDate(detail.registration.registrationDate)}</p>
            </div>
          ),
        },
        {
          id: "address",
          parameter: "Address of the Establishment",
          details: (
            <div>
              <p>{display(detail.registration.address)}</p>
              <p>
                Ward - {display(location?.villageWard)}, Block/Municipality -{" "}
                {display(location?.blockMunicipality)}, {display(location?.subdivision)},
              </p>
              <p>
                PS - {display(location?.policeStation)}, {display(location?.district)},
                PIN - {display(location?.pincode)}, West Bengal
              </p>
            </div>
          ),
        },
        {
          id: "pe",
          parameter: "Principal Employer",
          details: (
            <div>
              <p>{display(detail.registration.principalEmployer.name)}</p>
              <p>{display(detail.registration.principalEmployer.mobile)}</p>
              <p>{display(detail.registration.principalEmployer.address)}</p>
            </div>
          ),
        },
        {
          id: "manager",
          parameter: "Manager",
          details: (
            <div>
              <p>{display(detail.registration.manager.name)}</p>
              <p>{display(detail.registration.manager.address)}</p>
            </div>
          ),
        },
        {
          id: "work",
          parameter: "Nature of Work",
          details: display(detail.registration.natureOfWork),
        },
        {
          id: "workmen",
          parameter: "Max. Number of Workmen",
          details: display(detail.registration.maxWorkmen),
        },
        ...(detail.inspection.riskCategory
          ? [
              {
                id: "risk",
                parameter: "Risk",
                details: display(detail.inspection.riskCategory),
              },
            ]
          : []),
      ]
    : [];

  const filteredLaws = useMemo(() => {
    if (!lawSearch.trim()) return laws;
    const search = lawSearch.toLowerCase();
    return laws.filter(
      (item) =>
        item.inspection_txt?.toLowerCase().includes(search) ||
        item.inspection_name?.toLowerCase().includes(search) ||
        item.inspection_txt_type?.toLowerCase().includes(search),
    );
  }, [laws, lawSearch]);

  const lawGroups = useMemo(() => groupLaws(filteredLaws), [filteredLaws]);

  useEffect(() => {
    if (lawGroups.length === 0) return;
    if (lawSearch.trim()) {
      setExpandedActs(lawGroups.map((group) => group.name));
      return;
    }
    setExpandedActs((prev) => {
      if (prev.length > 0) return prev;
      const selectedParents = lawGroups
        .filter((group) =>
          group.items.some((item) =>
            selectedInfringements.includes(item.ispection_id),
          ),
        )
        .map((group) => group.name);
      return selectedParents.length > 0
        ? selectedParents
        : [lawGroups[0].name];
    });
  }, [lawGroups, lawSearch, selectedInfringements]);

  const selectedGroups = useMemo(() => {
    const selectedSet = new Set(selectedInfringements);
    return groupLaws(laws).filter((group) =>
      group.items.some((item) => selectedSet.has(item.ispection_id)),
    );
  }, [laws, selectedInfringements]);

  const toggleAct = (name: string) => {
    setExpandedActs((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
  };

  const handleInfringementChange = (lawId: number) => {
    if (isSubmitted) return;
    setSelectedInfringements((prev) => {
      if (prev.includes(lawId)) {
        setInfringementRemarks((remarks) => {
          const next = { ...remarks };
          delete next[lawId];
          return next;
        });
        return prev.filter((item) => item !== lawId);
      }
      return [...prev, lawId];
    });
  };

  const handleLockAndContinue = () => {
    setActiveTab(2);
  };

  const handleSaveInfringements = async () => {
    if (isSubmitted) {
      setActiveTab(3);
      return;
    }
    if (!id) return;
    if (selectedInfringements.length === 0) {
      toast.error("Please select at least one infringement");
      return;
    }

    const missingRemark = selectedInfringements.find(
      (lawId) => !infringementRemarks[lawId]?.trim(),
    );
    if (missingRemark != null) {
      toast.error("Please enter a remark for every selected infringement");
      return;
    }

    const infringements: Record<string, string> = {};
    selectedInfringements.forEach((lawId) => {
      infringements[String(lawId)] = infringementRemarks[lawId].trim();
    });

    setSavingInfringements(true);
    try {
      const res = await axios.post(
        `${API_BASE}inspections/scheduled-inspections/${id}/save-draft`,
        { userId: getUserId(), infringements },
        { headers: getAuthHeaders() },
      );
      if (res.data?.status) {
        toast.success(res.data.message || "Draft saved");
        setHasDraft(true);
        setActiveTab(3);
      } else {
        toast.error("Failed to save draft");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save infringements"));
    } finally {
      setSavingInfringements(false);
    }
  };

  const handleFile = (file: File | null) => {
    if (!file || isSubmitted) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Inspection note must be 200 KB or smaller");
      return;
    }
    setUploadFile(file);
  };

  const handleFinalSubmit = async () => {
    if (isSubmitted) return;
    if (!id) return;
    if (!uploadFile) {
      toast.error("Please upload inspection note");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("userId", String(getUserId() ?? ""));

      const res = await axios.post(
        `${API_BASE}inspections/scheduled-inspections/${id}/submit-note`,
        formData,
        { headers: getAuthHeaders() },
      );

      if (res.data?.status) {
        toast.success(res.data.message || "Inspection submitted successfully");
        setIsSubmitted(true);
        setUploadedFilePath(res.data.data?.noteFileUri ?? null);
        navigate("/central-inspection/inspector/scheduled-inspection");
      } else {
        toast.error("Failed to submit inspection");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to submit inspection"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#ededed] pb-6 pl-[20px] pr-5 pt-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl text-gray-800">Inspection Note</h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete establishment details, infringements, then preview and upload.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate("/central-inspection/inspector/scheduled-inspection")
          }
          className="inline-flex items-center gap-2 border border-[#1E73BE] bg-white px-3 py-2 text-sm font-medium text-[#1E73BE]"
        >
          <ArrowLeft size={16} />
          Back to List
        </button>
      </div>

      <div className="mb-5 overflow-hidden rounded-xl border border-[#d7e0ea] bg-white shadow-sm">
        <div className="grid grid-cols-3">
          {STEPS.map((step, index) => {
            const isActive = activeTab === step.id;
            const isDone = activeTab > step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (step.id === 1 || hasDraft || isDone || activeTab >= step.id) {
                    setActiveTab(step.id);
                  }
                }}
                className={`relative flex items-center gap-3 border-r border-[#d7e0ea] px-4 py-4 text-left last:border-r-0 ${
                  isActive
                    ? "bg-[#1E73BE] text-white"
                    : isDone
                      ? "bg-[#e8f3fb] text-[#1E73BE]"
                      : "bg-white text-gray-500"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    isActive
                      ? "bg-white text-[#1E73BE]"
                      : isDone
                        ? "bg-[#1E73BE] text-white"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isDone ? <Check size={16} /> : index + 1}
                </span>
                <span className="text-sm font-semibold">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-sm">
          Loading...
        </div>
      ) : null}

      {!loading && !detail && !errorMessage ? (
        <div className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow-sm">
          No details found for this scheduled inspection.
        </div>
      ) : null}

      {!loading && detail && activeTab === 1 ? (
        <div>
          <DetailsTable title="Establishment Details" rows={establishmentRows} />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleLockAndContinue}
              className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {!loading && detail && activeTab === 2 ? (
        <div className="rounded-xl border border-[#d7e0ea] bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#203040]">
                Select Infringements
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Expand an Act, select the applicable clauses, and add a remark for each.
              </p>
            </div>
            <span className="rounded-full bg-[#e8f3fb] px-3 py-1 text-xs font-semibold text-[#1E73BE]">
              {selectedInfringements.length} selected
            </span>
          </div>

          <div className="relative mb-4">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={lawSearch}
              onChange={(e) => setLawSearch(e.target.value)}
              placeholder="Search by law text, Act name, or type..."
              className="w-full rounded-lg border border-[#d7e0ea] py-2.5 pl-9 pr-4 text-sm focus:border-[#1E73BE] focus:outline-none"
            />
          </div>

          <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
            {lawLoading ? (
              <div className="py-10 text-center text-sm text-gray-500">
                Loading laws...
              </div>
            ) : lawGroups.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                No records found
              </div>
            ) : (
              lawGroups.map((group) => {
                const open = expandedActs.includes(group.name);
                const selectedCount = group.items.filter((item) =>
                  selectedInfringements.includes(item.ispection_id),
                ).length;
                return (
                  <div
                    key={group.name}
                    className="overflow-hidden rounded-xl border border-[#d7e0ea]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAct(group.name)}
                      className="flex w-full items-start justify-between gap-3 bg-[#f4f8fc] px-4 py-3 text-left"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <ChevronDown
                          size={18}
                          className={`mt-0.5 shrink-0 text-[#1E73BE] transition ${
                            open ? "rotate-0" : "-rotate-90"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#203040]">
                            {group.name}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {group.items.length} clause
                            {group.items.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {group.type ? (
                          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#1E73BE] ring-1 ring-[#c5daf0]">
                            Type {group.type}
                          </span>
                        ) : null}
                        {selectedCount > 0 ? (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                            {selectedCount} selected
                          </span>
                        ) : null}
                      </div>
                    </button>

                    {open ? (
                      <div className="divide-y divide-[#eef2f6] p-3">
                        {group.items.map((item) => {
                          const checked = selectedInfringements.includes(
                            item.ispection_id,
                          );
                          return (
                            <label
                              key={item.ispection_id}
                              className={`mb-0 block rounded-lg p-3 last:mb-0 ${
                                checked ? "bg-[#eef7ff]" : "hover:bg-gray-50"
                              } ${isSubmitted ? "opacity-80" : "cursor-pointer"}`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  disabled={isSubmitted}
                                  checked={checked}
                                  onChange={() =>
                                    handleInfringementChange(item.ispection_id)
                                  }
                                  className="mt-1 h-4 w-4 accent-[#1E73BE] disabled:cursor-not-allowed"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm text-[#203040]">
                                    {item.inspection_txt}
                                  </p>
                                  {checked ? (
                                    <div className="mt-3">
                                      <label className="mb-1 block text-xs font-semibold text-gray-600">
                                        Remark <span className="text-red-500">*</span>
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
                                            ? "No remarks"
                                            : "Enter remark for this infringement..."
                                        }
                                        className="w-full rounded-lg border border-[#d7e0ea] p-3 text-sm disabled:cursor-not-allowed disabled:bg-gray-50"
                                      />
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab(1)}
              className="rounded-lg bg-gray-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-600"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => void handleSaveInfringements()}
              disabled={savingInfringements}
              className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {isSubmitted
                ? "Next"
                : savingInfringements
                  ? "Saving..."
                  : "Save & Next"}
            </button>
          </div>
        </div>
      ) : null}

      {!loading && detail && activeTab === 3 ? (
        <div className="space-y-4">
          <DetailsTable title="Establishment Details" rows={establishmentRows} />

          <div className="rounded-xl border border-[#d7e0ea] bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-[#203040]">
              Selected Infringements
            </h3>
            {selectedGroups.length === 0 ? (
              <p className="text-sm text-gray-500">No infringements selected.</p>
            ) : (
              <div className="space-y-4">
                {selectedGroups.map((group) => (
                  <div
                    key={group.name}
                    className="overflow-hidden rounded-xl border border-[#d7e0ea]"
                  >
                    <div className="flex items-center justify-between gap-3 bg-[#f4f8fc] px-4 py-3">
                      <p className="text-sm font-semibold text-[#203040]">
                        {group.name}
                      </p>
                      {group.type ? (
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#1E73BE] ring-1 ring-[#c5daf0]">
                          Type {group.type}
                        </span>
                      ) : null}
                    </div>
                    <div className="divide-y divide-[#eef2f6]">
                      {group.items
                        .filter((item) =>
                          selectedInfringements.includes(item.ispection_id),
                        )
                        .map((item) => (
                          <div key={item.ispection_id} className="px-4 py-3">
                            <p className="text-sm text-[#203040]">
                              {item.inspection_txt}
                            </p>
                            <div className="mt-2 rounded-lg bg-[#f8fafc] px-3 py-2 text-sm">
                              <span className="font-semibold text-gray-600">
                                Remark:
                              </span>{" "}
                              {infringementRemarks[item.ispection_id] || "-"}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#d7e0ea] bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-[#203040]">
              Upload Inspection Note
            </h3>
            {isSubmitted ? (
              uploadedFilePath ? (
                <a
                  href={`${API_BASE.replace(/\/$/, "")}${uploadedFilePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1E73BE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1862a3]"
                >
                  <FileText size={16} />
                  View Uploaded Document
                </a>
              ) : (
                <p className="text-sm italic text-gray-500">
                  Document path not found.
                </p>
              )
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFile(e.dataTransfer.files?.[0] || null);
                  }}
                  className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${
                    dragOver
                      ? "border-[#1E73BE] bg-[#e8f3fb]"
                      : "border-[#c5d4e2] bg-[#f8fafc] hover:border-[#1E73BE]"
                  }`}
                >
                  <Upload className="mb-2 text-[#1E73BE]" size={28} />
                  <p className="text-sm font-semibold text-[#203040]">
                    Drop the inspection note here, or click to browse
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF or image files, maximum 200 KB
                  </p>
                </button>
                {uploadFile ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                    <FileText size={16} />
                    Selected: {uploadFile.name}
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab(2)}
              className="rounded-lg bg-gray-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-600"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => void handleFinalSubmit()}
              disabled={isSubmitted || submitting}
              className="rounded-lg bg-[#1E73BE] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1862a3] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitted
                ? "Inspection Submitted"
                : submitting
                  ? "Submitting..."
                  : "Submit Inspection"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default InspectorScheduledInspectionNote;
