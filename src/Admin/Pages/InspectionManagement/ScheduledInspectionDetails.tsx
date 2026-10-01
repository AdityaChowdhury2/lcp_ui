import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, FileText } from "lucide-react";
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
  };
  existingAssignment: {
    assignedInspector: {
      usrId: number;
      fullname: string | null;
      mobile: string | null;
    };
    assignedBlock: string | null;
  } | null;
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

interface AssignInspectorResponse {
  scheduleRowId: number;
  scheduleId: string;
  establishmentName: string | null;
  assignedBlock: string | null;
  assignedInspector: {
    usrId: number;
    fullname: string | null;
    mobile: string | null;
  };
}

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

const formatDisplayDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const statusLabelClass = (status?: string | null) => {
  switch ((status || "").trim().toLowerCase()) {
    case "received":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "inspector assigned":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "draft":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "final submit":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const StatusLabel: FC<{ status: string | null }> = ({ status }) => {
  if (!status) return <span className="text-gray-400">-</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusLabelClass(status)}`}
    >
      {status}
    </span>
  );
};

const groupLaws = (laws: LawItem[]) => {
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

const display = (value: unknown) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string" && message.trim()) return message;

  return fallback;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

interface DetailRowItem {
  id: string;
  parameter: string;
  details: ReactNode;
}

const DetailsTable: FC<{ title: string; rows: DetailRowItem[] }> = ({
  title,
  rows,
}) => (
  <div className="mb-4 bg-white p-4 shadow-sm">
    <h2 className="mb-2 text-base font-semibold text-[#1E73BE]">{title}</h2>
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
);

const ScheduledInspectionDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isInspectorView = pathname.includes(
    "/central-inspection/inspector/scheduled-inspection",
  );
  const listPath = isInspectorView
    ? "/central-inspection/inspector/scheduled-inspection"
    : "/central-inspection/scheduled-inspection";

  const [detail, setDetail] = useState<ScheduledInspectionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignedInspector, setAssignedInspector] =
    useState<AssignInspectorResponse | null>(null);

  const [generatingOrder, setGeneratingOrder] = useState(false);
  const [orderGenerated, setOrderGenerated] = useState(false);
  const [laws, setLaws] = useState<LawItem[]>([]);

  const applyDetail = (data: ScheduledInspectionDetail) => {
    setDetail(data);
    if (data.existingAssignment) {
      setAssignedInspector({
        scheduleRowId: data.inspection.id,
        scheduleId: data.inspection.scheduleId,
        establishmentName: data.registration.establishmentName,
        assignedBlock: data.existingAssignment.assignedBlock,
        assignedInspector: data.existingAssignment.assignedInspector,
      });
      setOrderGenerated(true);
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
        applyDetail(response.data);
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

  useEffect(() => {
    const infringementCount = Object.keys(
      detail?.inspectionNote?.infringements ?? {},
    ).length;
    if (infringementCount === 0 || laws.length > 0) return;

    const fetchLaws = async () => {
      try {
        const res = await axios.get(`${API_BASE}inspections/law/get-laws`, {
          headers: getAuthHeaders(),
        });
        if (res.data?.status) {
          setLaws(res.data.data || []);
        }
      } catch {
        // Remarks still render without law titles if this fails.
      }
    };

    void fetchLaws();
  }, [detail, laws.length]);

  const handleAssignInspector = async () => {
    if (!id) return;

    setAssigning(true);
    setAssignError("");
    setOrderGenerated(false);

    try {
      const userId = getUserId();
      const response = await axios.post<AssignInspectorResponse>(
        `${API_BASE}inspections/scheduled-inspections/${id}/assign-inspector`,
        { userId },
        { headers: getAuthHeaders() },
      );
      setAssignedInspector(response.data);
    } catch (error) {
      setAssignError(getApiErrorMessage(error, "Failed to assign inspector."));
    } finally {
      setAssigning(false);
    }
  };

  const handleGenerateOrder = async () => {
    if (!id || !assignedInspector) return;

    setGeneratingOrder(true);

    try {
      const userId = getUserId();
      await axios.post(
        `${API_BASE}inspections/scheduled-inspections/${id}/generate-order`,
        { userId, inspectorId: assignedInspector.assignedInspector.usrId },
        { headers: getAuthHeaders() },
      );
      setOrderGenerated(true);
      toast.success("Order generated successfully");
      try {
        const refreshUserId = getUserId();
        const refreshed = await axios.get<ScheduledInspectionDetail>(
          `${API_BASE}inspections/scheduled-inspections/${id}`,
          { params: { userId: refreshUserId }, headers: getAuthHeaders() },
        );
        applyDetail(refreshed.data);
      } catch {
        // Order already generated; a refresh failure shouldn't undo that.
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to generate order."));
    } finally {
      setGeneratingOrder(false);
    }
  };

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

      ]
    : [];

  const note = detail?.inspectionNote ?? null;
  const selectedInfringementIds = useMemo(
    () =>
      Object.keys(note?.infringements ?? {})
        .map((key) => Number(key))
        .filter((n) => Number.isFinite(n) && n > 0),
    [note],
  );

  const selectedInfringementGroups = useMemo(() => {
    const selectedSet = new Set(selectedInfringementIds);
    const groups = groupLaws(laws).filter((group) =>
      group.items.some((item) => selectedSet.has(item.ispection_id)),
    );
    if (groups.length > 0) return groups;
    if (selectedInfringementIds.length === 0) return [];
    return [
      {
        name: "Selected Infringements",
        type: "",
        items: selectedInfringementIds.map((lawId) => ({
          ispection_id: lawId,
          inspection_txt: `Infringement #${lawId}`,
          inspection_txt_type: "",
          txt_order: 0,
          inspection_name: "Selected Infringements",
        })),
      },
    ];
  }, [laws, selectedInfringementIds]);

  const noteFileHref = (() => {
    const uri = note?.noteFileUri;
    if (!uri) return null;
    if (/^https?:\/\//i.test(uri)) return uri;
    return `${API_BASE.replace(/\/$/, "")}${uri.startsWith("/") ? uri : `/${uri}`}`;
  })();

  const inspectorProgressRows: DetailRowItem[] = [
    {
      id: "status",
      parameter: "Status",
      details: <StatusLabel status={detail?.inspection.status ?? null} />,
    },
    {
      id: "draftSavedAt",
      parameter: "Draft Saved",
      details: formatDisplayDateTime(note?.draftSavedAt),
    },
    {
      id: "finalSubmittedAt",
      parameter: "Final Submit",
      details: formatDisplayDateTime(note?.finalSubmittedAt),
    },
    {
      id: "noteFile",
      parameter: "Inspection Note",
      details: noteFileHref ? (
        <a
          href={noteFileHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E73BE] hover:underline"
        >
          <FileText size={16} />
          View Uploaded Document
        </a>
      ) : (
        "Not uploaded"
      ),
    },
  ];

  const assignedInspectorRows: DetailRowItem[] = assignedInspector
    ? [
        {
          id: "inspectionDate",
          parameter: "Inspection Date",
          details: formatDisplayDate(detail?.inspection.scheduleDate),
        },
        {
          id: "officer",
          parameter: "Officer",
          details: display(assignedInspector.assignedInspector.fullname),
        },
        {
          id: "mobile",
          parameter: "Mobile",
          details: display(assignedInspector.assignedInspector.mobile),
        },
        {
          id: "block",
          parameter: "Assigned Block",
          details: display(assignedInspector.assignedBlock),
        },
      ]
    : [];

  return (
    <div className="w-full bg-[#ededed] pb-5 pl-[20px] pr-5 pt-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl text-gray-800">Scheduled Inspection Details</h1>
        <button
          type="button"
          onClick={() => navigate(listPath)}
          className="inline-flex items-center gap-2 border border-[#1E73BE] bg-white px-3 py-2 text-sm font-medium text-[#1E73BE]"
        >
          <ArrowLeft size={16} />
          Back to List
        </button>
      </div>

      {errorMessage ? (
        <div className="mb-3 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="bg-white p-4 text-sm text-gray-600">Loading...</div>
      ) : null}

      {!loading && detail ? (
        <>
          {/* <DetailsTable title="Inspection Details" rows={inspectionRows} /> */}
          <DetailsTable title="Establishment Details" rows={establishmentRows} />

          {!isInspectorView ? (
            !assignedInspector ? (
              <div className="mb-4 bg-white p-4 shadow-sm">
                {assignError ? (
                  <div className="mb-3 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {assignError}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleAssignInspector()}
                  disabled={assigning}
                  className="inline-flex items-center justify-center rounded-[6px] bg-[#2f80ed] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2569c9] disabled:opacity-60"
                >
                  {assigning ? "Randomizing..." : "Randomize Inspector"}
                </button>
              </div>
            ) : (
              <>
                <DetailsTable title="Assigned Inspector" rows={assignedInspectorRows} />
                {!orderGenerated ? (
                  <div className="mb-4 flex flex-col gap-3 bg-white p-4 shadow-sm sm:flex-row">
                    <button
                      type="button"
                      onClick={() => void handleAssignInspector()}
                      disabled={assigning}
                      className="inline-flex items-center justify-center rounded-[6px] bg-[#2f80ed] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2569c9] disabled:opacity-60"
                    >
                      {assigning ? "Regenerating..." : "Regenerate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleGenerateOrder()}
                      disabled={generatingOrder}
                      className="inline-flex items-center justify-center rounded-[6px] bg-green-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-60"
                    >
                      {generatingOrder ? "Generating..." : "Generate Order"}
                    </button>
                  </div>
                ) : (
                  <>
              

                    <div className="mb-4 bg-white p-4 shadow-sm">
                      <h2 className="mb-3 text-base font-semibold text-[#1E73BE]">
                        Infringements (read only)
                      </h2>
                      {selectedInfringementGroups.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          Inspector has not saved infringements yet.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {selectedInfringementGroups.map((group) => (
                            <div
                              key={group.name}
                              className="overflow-hidden rounded border border-[#d7e0ea]"
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
                                    selectedInfringementIds.includes(
                                      item.ispection_id,
                                    ),
                                  )
                                  .map((item) => (
                                    <div
                                      key={item.ispection_id}
                                      className="px-4 py-3"
                                    >
                                      <p className="text-sm text-[#203040]">
                                        {item.inspection_txt}
                                      </p>
                                      <div className="mt-2 rounded bg-[#f8fafc] px-3 py-2 text-sm">
                                        <span className="font-semibold text-gray-600">
                                          Remark:
                                        </span>{" "}
                                        {display(
                                          note?.infringements?.[
                                            String(item.ispection_id)
                                          ],
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {noteFileHref ? (
                      <div className="mb-4 bg-white p-4 shadow-sm">
                        <h2 className="mb-3 text-base font-semibold text-[#1E73BE]">
                          Inspection Note
                        </h2>
                        <a
                          href={noteFileHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-[6px] bg-[#1E73BE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1862a3]"
                        >
                          <FileText size={16} />
                          View Uploaded Document
                        </a>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            )
          ) : null}
        </>
      ) : null}

      {!loading && !detail && !errorMessage ? (
        <div className="bg-white p-4 text-sm text-gray-600">
          No details found for this scheduled inspection.
        </div>
      ) : null}
    </div>
  );
};

export default ScheduledInspectionDetails;
