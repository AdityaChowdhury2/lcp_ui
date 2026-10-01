import React from "react";
import { IMAGE_BASE } from "@/constants/constants";

type PreviewDocument = {
  name: string;
  status: string;
  uploaded: boolean;
  documentCode?: string;
  fileUrl?: string;
};

interface DocumentsSectionProps {
  applicationId: string | null;
  documents: PreviewDocument[];
  onViewDocument: (documentCode: string) => void;
}

const TABLE_STYLE = "w-full border border-[#c7ced6] text-[13px]";
const ROW_ALT = "bg-[#f3f4f6]";
const ROW_BASE = "bg-white";

export function DocumentsSection({
  applicationId,
  documents,
  onViewDocument,
}: DocumentsSectionProps) {
  return (
    <>
      <div className="bg-[#7c8a96] text-white font-semibold px-4 py-2">
        Documents Uploaded
      </div>
      <table className={TABLE_STYLE}>
        <tbody>
          {documents.map((doc, i) => (
            <tr key={doc.name || i} className={i % 2 === 0 ? ROW_ALT : ROW_BASE}>
              <td className="border px-3 py-2 w-[45%]">{doc.name}</td>
              <td className="border px-3 py-2 font-semibold">
                {doc.uploaded ? (
                  doc.documentCode && applicationId ? (
                    <button
                      type="button"
                      className="inline-flex items-center"
                      title="View document"
                      onClick={() => onViewDocument(doc.documentCode as string)}
                    >
                      <img src={`${IMAGE_BASE}pdfred.png`} alt="PDF" className="w-5 h-5" />
                    </button>
                  ) : doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center"
                      title="View document"
                    >
                      <img src={`${IMAGE_BASE}pdfred.png`} alt="PDF" className="w-5 h-5" />
                    </a>
                  ) : (
                    <img src={`${IMAGE_BASE}pdfred.png`} alt="PDF" className="w-5 h-5" />
                  )
                ) : (
                  doc.status
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
