import React from "react";

type DocType = "WO" | "FV" | "TL" | "OD";

type Props = {
  visible: boolean;
  saving: boolean;
  onPickWorkOrder: (file: File | null) => void;
  onPickFormV: (file: File | null) => void;
  onPickResidential: (file: File | null) => void;
  onPickOther: (file: File | null) => void;
  onOpenDoc: (docType: DocType) => void;
  onSubmit: () => void;
};

const LegacyFormIvUploadPanel: React.FC<Props> = ({
  visible,
  saving,
  onPickWorkOrder,
  onPickFormV,
  onPickResidential,
  onPickOther,
  onOpenDoc,
  onSubmit,
}) => {
  if (!visible) return null;

  return (
    <div className="border rounded-lg shadow">
      <div className="bg-indigo-500 text-white px-4 py-2 font-semibold rounded-t-lg">
        Legacy Form-IV Document Upload (Route compatibility)
      </div>
      <div className="p-4 text-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="font-medium">Work Order (WO)</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => onPickWorkOrder(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full"
            />
          </label>
          <label className="block">
            <span className="font-medium">Form V (FV)</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => onPickFormV(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full"
            />
          </label>
          <label className="block">
            <span className="font-medium">Residential / Trade Licence (TL)</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => onPickResidential(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full"
            />
          </label>
          <label className="block">
            <span className="font-medium">Other Document (OD)</span>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => onPickOther(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="rounded bg-slate-700 px-3 py-1 text-white" onClick={() => onOpenDoc("WO")}>
            View WO
          </button>
          <button type="button" className="rounded bg-slate-700 px-3 py-1 text-white" onClick={() => onOpenDoc("FV")}>
            View FV
          </button>
          <button type="button" className="rounded bg-slate-700 px-3 py-1 text-white" onClick={() => onOpenDoc("TL")}>
            View TL
          </button>
          <button type="button" className="rounded bg-slate-700 px-3 py-1 text-white" onClick={() => onOpenDoc("OD")}>
            View OD
          </button>
          <button
            type="button"
            className="rounded bg-indigo-600 px-4 py-1 text-white disabled:opacity-50"
            onClick={onSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegacyFormIvUploadPanel;
