import { API_BASE } from "@/constants/constants";
import React from "react";
import { FaFilePdf } from "react-icons/fa";

export interface TimelineDoc {
  name: string;
  url: string;
}

export interface TimelineActItem {
  act: string;
  remark: string;
}

export interface TimelineEvent {
  key: string;
  title: string;
  date: string | null;
  time?: string | null;
  remark: string | null;
  previousDate?: string | null;
  previousTime?: string | null;
  extendedDate?: string | null;
  extendedTime?: string | null;
  initialComplianceDate?: string | null;
  initialComplianceTime?: string | null;
  documents: TimelineDoc[];
  acts: TimelineActItem[];
}

export interface CaseStatus {
  code: string;
  label: string;
}

interface Props {
  currentStatus: CaseStatus | null;
  timeline: TimelineEvent[];
}

// Normalized status → badge colour. Keys match backend statusCode values.
const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-300",
  SUBMITTED: "bg-yellow-100 text-yellow-800 border-yellow-300",
  FINAL_SUBMITTED: "bg-blue-100 text-blue-800 border-blue-300",
  SHOW_CAUSE: "bg-amber-100 text-amber-800 border-amber-300",
  SHOW_CAUSE_VERIFIED: "bg-purple-100 text-purple-800 border-purple-300",
  COURT_CASE_RECOMMENDED: "bg-orange-100 text-orange-800 border-orange-300",
  LET_OFF: "bg-emerald-100 text-emerald-800 border-emerald-300",
  COURT_CASE: "bg-red-100 text-red-800 border-red-300",
};

// Timeline dot colour per event key.
const EVENT_DOT: Record<string, string> = {
  submitted: "bg-blue-500",
  compliance_extension: "bg-teal-500",
  show_cause: "bg-amber-500",
  show_cause_verified: "bg-purple-500",
  show_cause_2: "bg-amber-500",
  show_cause_verified_2: "bg-purple-500",
  court_case_recommended: "bg-orange-500",
  let_off: "bg-emerald-500",
  court_case: "bg-red-500",
};

const fileUrl = (url: string) => `${API_BASE.replace(/\/$/, "")}${url}`;

const formatDate = (date: string | null, time?: string | null) => {
  if (!date) return "-";
  const d = new Date(date);
  const dateStr = isNaN(d.getTime()) ? String(date) : d.toLocaleDateString();
  return time ? `${dateStr} at ${time}` : dateStr;
};

export const StatusBadge: React.FC<{ status: CaseStatus | null }> = ({ status }) => {
  if (!status) return null;
  const cls = STATUS_STYLES[status.code] || STATUS_STYLES.DRAFT;
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-bold ${cls}`}>
      {status.label}
    </span>
  );
};

const CaseTimeline: React.FC<Props> = ({ currentStatus, timeline }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Case Timeline</h3>
          <p className="text-sm text-gray-500">
            All actions taken on this inspection after submission.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase">
            Current Status
          </span>
          <StatusBadge status={currentStatus} />
        </div>
      </div>

      {timeline.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-500">
          No actions have been recorded yet.
        </div>
      ) : (
        <ol className="relative border-l-2 border-gray-200 ml-3">
          {timeline.map((ev) => (
            <li key={ev.key} className="mb-8 ml-6 last:mb-0">
              <span
                className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
                  (ev.key.startsWith("compliance_extension")
                    ? EVENT_DOT.compliance_extension
                    : EVENT_DOT[ev.key]) || "bg-gray-400"
                }`}
              />
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-gray-900">{ev.title}</h4>
                  <span className="text-xs font-medium text-gray-500">
                    {formatDate(ev.date, ev.time)}
                  </span>
                </div>

                {/* Initial compliance schedule on submission */}
                {ev.key === "submitted" && ev.initialComplianceDate && (
                  <div className="mt-2.5 inline-flex items-center gap-2 rounded bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs text-blue-900">
                    <span className="font-medium text-gray-600">
                      Initial Compliance Schedule:
                    </span>
                    <span className="font-bold">
                      {formatDate(ev.initialComplianceDate, ev.initialComplianceTime)}
                    </span>
                  </div>
                )}

                {/* Compliance extension schedule comparison */}
                {(ev.previousDate || ev.extendedDate) && (
                  <div className="mt-3 p-3.5 rounded-lg bg-teal-50/80 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 font-medium block text-[11px] uppercase tracking-wider">
                        Previous Compliance Schedule
                      </span>
                      <span className="font-semibold text-gray-800 text-sm">
                        {formatDate(ev.previousDate, ev.previousTime)}
                      </span>
                    </div>
                    <div className="text-teal-600 font-bold text-lg hidden sm:block">
                      ➔
                    </div>
                    <div>
                      <span className="text-teal-700 font-semibold block text-[11px] uppercase tracking-wider">
                        Extended Compliance Schedule
                      </span>
                      <span className="font-bold text-teal-900 text-sm">
                        {formatDate(ev.extendedDate, ev.extendedTime)}
                      </span>
                    </div>
                  </div>
                )}

                {ev.remark && (
                  <p className="mt-2 rounded-lg bg-gray-50 p-2.5 text-sm text-gray-700">
                    <span className="font-semibold text-gray-500">Remark: </span>
                    {ev.remark}
                  </p>
                )}

                {/* Per-act remarks (verification step) */}
                {ev.acts.length > 0 && ev.acts.some((a) => a.remark) && (
                  <div className="mt-3 space-y-2">
                    {ev.acts
                      .filter((a) => a.remark)
                      .map((a, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-gray-100 bg-gray-50/60 p-2.5"
                        >
                          <p className="text-xs font-semibold text-gray-800">{a.act}</p>
                          <p className="mt-1 text-sm text-gray-600">{a.remark}</p>
                        </div>
                      ))}
                  </div>
                )}

                {/* Documents */}
                {ev.documents.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ev.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={fileUrl(doc.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        <FaFilePdf size={12} />
                        <span className="truncate max-w-[180px]">{doc.name}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default CaseTimeline;
