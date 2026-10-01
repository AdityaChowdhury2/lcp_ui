import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../Components/ui/button";
import { Table } from "../../../Components/ui/table";
import { Input } from "../../../Components/ui/input";
import { scheduledEmployments } from "./scheduledEmployments";
import { toast } from "react-toastify";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

const toRoman = (num: number): string => {
  const romanMap: [number, string][] = [
    [1000, "m"],
    [900, "cm"],
    [500, "d"],
    [400, "cd"],
    [100, "c"],
    [90, "xc"],
    [50, "l"],
    [40, "xl"],
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];

  let result = "";
  for (const [value, numeral] of romanMap) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
};

const getFullUrl = (filePath: string) => {
  if (!filePath) return "";
  if (filePath.startsWith("http")) return filePath;
  const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
  const relative = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${base}${relative}`;
};

const docIndexToMasterId = [21, 22, 23, 24, 25, 26, 27];

const actsRows = [
  "Minimum Wages Act, 1948 and Rules framed thereunder if",
  "Payment of Wages Act, 1936 and Rules framed thereunder (other than those seen by the Factories Directorate) if",
  "Contract Labour (Regulation and Abolition) Act, 1970 and Rules framed thereunder if",
  "Payment of Bonus Act, 1965 and Rules framed thereunder if",
  "Payment of Gratuity Act, 1972 and Rules framed thereunder if",
  "Maternity Benefit Act, 1961 and Rules framed thereunder(for those establishments where officers of labour commissioners are the inspectors) if",
  "West Bengal Shops and Establishments Act, 1963 and Rules framed thereunder.",
  "The Inter-State Migrant Workmen (RECS) Act, 1979 and Rules framed thereunder.",
  "The Equal Remuneration Act, 1976 and Rules framed thereunder",
  "Motor Transport Workers Act, 1961 and Rules framed thereunder",
  "The Building and Other Construction Workers(RE&CSW), Act, and Rules framed thereunder other than provisions relating to safety and health",
  "The Child Labour (P&R), Act, 1986 and Rules framed thereunder",
  "The West Bengal Workmens House Rent Allowance Act, 1974 and Rules framed thereunder",
  "The West Bengal Payment of Subsistence Allowance Act, 1969 and Rules framed thereunder",
  "The Beedi and Cigar Workers (Condition of Employment) Act, 1966 and Rules framed thereunder",
  "Working Journalist and other Newspaper Employees (Conditions of Service) and Miscellaneous Provisions Act, 1955 and Rules framed thereunder",
  "West Bengal Labour Welfare Fund Act, 1974 and Rules framed thereunder",
  "Sales Promotion Employees (CS) Act, 1976 and Rules framed thereunder",
];

const Section = ({
  sectionKey,
  title,
  rows,
  showUpload = false,
  showCheckbox = false,
  checkedStates,
  onCheckedChange,
  uploadedFiles,
  uploadingState,
  onUploadClick,
  onFileChange,
  docIndexToMasterId,
}: {
  sectionKey: string; // "C", "D"
  title: string;
  rows: string[];
  showUpload?: boolean;
  showCheckbox?: boolean;
  checkedStates?: boolean[];
  onCheckedChange?: (index: number, val: boolean) => void;
  uploadedFiles?: Record<number, { fileName: string; filePath: string }>;
  uploadingState?: Record<number, boolean>;
  onUploadClick?: (index: number) => void;
  onFileChange?: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  docIndexToMasterId?: number[];
}) => {
  const colSpanVal = showUpload ? 3 : (showCheckbox ? 2 : 1);

  return (
    <div className="bg-white border rounded mx-4 mb-6 shadow">
      <Table className="w-full text-sm border-collapse">
        <tbody>
          {/* SECTION TITLE ROW */}
          <tr className="bg-[#ecf0f3] font-semibold text-gray-700">
            <td className="border px-3 py-2 w-[40px] text-center">
              {sectionKey}.
            </td>

            <td className="border px-3 py-2" colSpan={colSpanVal}>
              {title}
            </td>
          </tr>

          {/* SECTION DATA ROWS */}
          {rows.map((row, i) => {
            const masterId = docIndexToMasterId ? docIndexToMasterId[i] : (i + 1);
            return (
              <tr key={i} className={(i + 1) % 2 ? "bg-white" : "bg-[#ecf0f3]"}>
                <td className="border px-3 py-2 w-[40px] text-center">
                  {toRoman(i + 1)}.
                </td>

                <td className="border px-3 py-2">{row}</td>

                {showUpload && (
                  <td className="border px-2 py-2 text-center align-middle whitespace-nowrap min-w-[140px]">
                    <input
                      type="file"
                      id={`file-input-${i}`}
                      style={{ display: "none" }}
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => onFileChange && onFileChange(i, e)}
                    />
                    {uploadingState && uploadingState[masterId] ? (
                      <span className="text-xs text-gray-500 font-semibold animate-pulse">Uploading...</span>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        {uploadedFiles && uploadedFiles[masterId] ? (
                          <>
                            <span className="text-[11px] text-green-600 max-w-[120px] truncate block font-medium">
                              {uploadedFiles[masterId].fileName}
                            </span>
                            <div className="flex gap-2">
                              <a
                                href={getFullUrl(uploadedFiles[masterId].filePath)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-[#1e73be] hover:underline font-bold"
                              >
                                VIEW
                              </a>
                              <button
                                type="button"
                                onClick={() => onUploadClick && onUploadClick(i)}
                                className="text-[11px] text-gray-500 hover:text-gray-700 font-bold hover:underline"
                              >
                                CHANGE
                              </button>
                            </div>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => onUploadClick && onUploadClick(i)}
                            className="bg-[#1e73be] hover:bg-[#175a93] text-white px-3 h-8 text-xs font-semibold"
                          >
                            UPLOAD
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                )}

                {(showUpload || showCheckbox) && (
                  <td className="border px-2 py-2 w-[40px] text-center align-middle">
                    <Input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer"
                      checked={checkedStates ? checkedStates[i] : false}
                      onChange={(e) => onCheckedChange && onCheckedChange(i, e.target.checked)}
                    />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

// const QuestionSection = ({
//   items,
//   startLetter,
// }: {
//   items: string[];
//   startLetter: string;
// }) => (
//   <div className="bg-white border rounded mx-4">
//     <Table className="w-full text-sm border-collapse">
//       <tbody>
//         {items.map((item, i) => (
//           <tr key={i} className={i % 2 ? "bg-[#ecf0f3]" : ""}>
//             <td className="border px-3 py-4 w-[40px]">
//               {String.fromCharCode(startLetter.charCodeAt(0) + i)}.
//             </td>
//             <td className="border px-3 py-4">{item}</td>
//           </tr>
//         ))}
//       </tbody>
//     </Table>
//   </div>
// );

const QuestionSection = ({
  items,
  startLetter,
  answers,
  onAnswerChange,
}: {
  items: string[];
  startLetter: string;
  answers: Record<string, string>;
  onAnswerChange: (key: string, value: string) => void;
}) => (
  <div className="bg-white border rounded shadow mx-4 mb-6">
    <Table className="w-full text-sm border-collapse">
      <tbody>
        {items.map((item, i) => {
          const charCode = startLetter.charCodeAt(0) + i;
          const letter = String.fromCharCode(charCode);
          const rowKey = letter;

          return (
            <tr key={i} className={i % 2 ? "bg-[#ecf0f3]" : "bg-white"}>
              {/* Serial */}
              <td className="border px-3 py-3 w-[40px] text-center align-top">
                {letter}.
              </td>

              {/* Question */}
              <td className="border px-3 py-3 align-top">{item}</td>

              {/* No */}
              <td className="border px-3 py-3 w-[70px] text-center align-middle">
                <label className="flex items-center justify-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name={rowKey}
                    value="no"
                    checked={answers[rowKey] === "no"}
                    onChange={() => onAnswerChange(rowKey, "no")}
                  />
                  <span>No</span>
                </label>
              </td>

              {/* Yes */}
              <td className="border px-3 py-3 w-[70px] text-center align-middle">
                <label className="flex items-center justify-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name={rowKey}
                    value="yes"
                    checked={answers[rowKey] === "yes"}
                    onChange={() => onAnswerChange(rowKey, "yes")}
                  />
                  <span>Yes</span>
                </label>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  </div>
);

const SelectRowSection = ({
  sectionKey,
  label,
  options,
  selectedValues,
  onChange,
}: {
  sectionKey: string; // "E"
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}) => (
  <div className="bg-white border rounded shadow mx-4">
    <Table className="w-full text-sm border-collapse">
      <tbody>
        <tr className="bg-[#ecf0f3]">
          {/* E. */}
          <td className="border px-3 py-3 w-[40px] text-center align-top">
            {sectionKey}.
          </td>

          {/* Label */}
          <td className="border px-3 py-3 w-[40%] align-top">{label}</td>

          {/* Select box */}
          <td className="border px-3 py-3">
            <select
              multiple
              value={selectedValues}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value);
                onChange(values);
              }}
              className="w-full min-h-[250px] border bg-white border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e73be]"
            >
              {options.map((opt, i) => (
                <option key={i} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </td>
        </tr>
      </tbody>
    </Table>
  </div>
);

const SelfCertificationOthers: React.FC = () => {
  const navigate = useNavigate();

  const [checkedActs, setCheckedActs] = useState<boolean[]>(new Array(18).fill(false));
  const [checkedDocs, setCheckedDocs] = useState<boolean[]>(new Array(7).fill(false));
  const [selectedEmployments, setSelectedEmployments] = useState<string[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({
    F: "",
    G: "",
    H: "",
    I: "",
    J: "",
    K: "",
    L: "",
    M: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<number, { fileName: string; filePath: string }>>({});
  const [uploadingState, setUploadingState] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchChecklistData = async () => {
      const appId = sessionStorage.getItem("selfCertAppId");
      if (!appId) return;

      try {
        const token = getAuthToken();
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const res = await fetch(`${API_BASE}self-cert/checklist/${appId}`, {
          headers,
        });
        const result = await res.json();
        if (res.ok && result.status === "success") {
          const { uploads, applicableFieldData } = result.data;
          
          // 1. Populate uploaded files
          const newUploadedFiles: Record<number, { fileName: string; filePath: string }> = {};
          const newCheckedDocs = [...checkedDocs];
          
          if (Array.isArray(uploads)) {
            uploads.forEach((upload: any) => {
              const masterId = Number(upload.masterId);
              const idx = docIndexToMasterId.indexOf(masterId);
              if (idx !== -1) {
                newUploadedFiles[masterId] = {
                  fileName: upload.fileName,
                  filePath: upload.filePath,
                };
                newCheckedDocs[idx] = true;
              }
            });
            setUploadedFiles(newUploadedFiles);
            setCheckedDocs(newCheckedDocs);
          }

          // 2. Populate form fields from applicableFieldData
          if (applicableFieldData) {
            const parts: string[] = applicableFieldData.split(", ");
            
            const newCheckedActs = actsRows.map(act => parts.includes(act));
            setCheckedActs(newCheckedActs);

            const newQuestionAnswers = { ...questionAnswers };
            parts.forEach(part => {
              const match = part.match(/^([F-M]):\s*(yes|no)$/i);
              if (match) {
                const key = match[1].toUpperCase();
                const val = match[2].toLowerCase();
                newQuestionAnswers[key] = val;
              }
            });
            setQuestionAnswers(newQuestionAnswers);

            const newSelectedEmployments: string[] = [];
            parts.forEach(part => {
              const foundOpt = scheduledEmployments.find(opt => opt.label === part);
              if (foundOpt) {
                newSelectedEmployments.push(foundOpt.value);
              }
            });
            setSelectedEmployments(newSelectedEmployments);
          }
        }
      } catch (err) {
        console.error("Error fetching checklist data:", err);
      }
    };

    fetchChecklistData();
  }, []);

  const handleCheckedActChange = (index: number, val: boolean) => {
    setCheckedActs((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleCheckedDocChange = (index: number, val: boolean) => {
    setCheckedDocs((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleAnswerChange = (key: string, value: string) => {
    setQuestionAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleUploadClick = (index: number) => {
    document.getElementById(`file-input-${index}`)?.click();
  };

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const appId = sessionStorage.getItem("selfCertAppId");
    if (!appId) {
      toast.error("Application ID missing. Please fill the particulars form first.");
      return;
    }

    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const masterId = docIndexToMasterId[index];

    // Validate type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, JPEG, and PNG files are allowed.");
      return;
    }

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    setUploadingState((prev) => ({ ...prev, [masterId]: true }));

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", appId);
      formData.append("masterId", String(masterId));

      const res = await fetch(`${API_BASE}self-cert/others/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to upload document.");
      }

      toast.success("Document uploaded successfully!");
      
      setUploadedFiles((prev) => ({
        ...prev,
        [masterId]: {
          fileName: result.data.fileName,
          filePath: result.data.filePath,
        },
      }));

      // Automatically check the corresponding checkbox in Section D
      handleCheckedDocChange(index, true);

    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Something went wrong during upload.");
    } finally {
      setUploadingState((prev) => ({ ...prev, [masterId]: false }));
      e.target.value = "";
    }
  };

  const handleConfirmSubmit = async () => {
    const appId = sessionStorage.getItem("selfCertAppId");
    if (!appId) {
      toast.error("Application ID missing. Please fill the particulars form first.");
      return;
    }

    // Validation: Check if checked docs have uploaded files
    for (let i = 0; i < checkedDocs.length; i++) {
      const masterId = docIndexToMasterId[i];
      if (checkedDocs[i] && !uploadedFiles[masterId]) {
        toast.error(`Please upload the document for item ${toRoman(i + 1)} in Section D.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // 1. Gather Section C Checked Acts
      const checkedC = actsRows.filter((_, idx) => checkedActs[idx]);

      // 2. Gather Section E Selected Employments
      const selectedE = selectedEmployments.map(
        (val) => scheduledEmployments.find((opt) => opt.value === val)?.label || val
      );

      // 3. Gather F-M answers
      const answersFM = Object.entries(questionAnswers)
        .filter(([_, val]) => val !== "")
        .map(([key, val]) => `${key}: ${val}`);

      // Combined payload
      const combined = [...checkedC, ...selectedE, ...answersFM];
      const applicableFieldData = combined.join(", ");

      const payload = {
        applicationId: Number(appId),
        applicableFieldData,
      };

      const res = await fetch(`${API_BASE}self-cert/checklist/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to submit application");
      }

      toast.success("Application submitted successfully!");
      sessionStorage.removeItem("selfCertAppId");
      navigate("/self-certification-application/list");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#ecf0f3] font-sans py-[5em]">
      {/* Page Title */}
      <div className="bg-white p-4 mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          APPLICATION FOR SELF CERTIFICATION SCHEME, 2016
        </h1>
      </div>

      {/* ===== C. LIST OF ACTS ===== */}
      <Section
        sectionKey="C"
        title="List of Acts applicable to the establishment [Tick whichever is applicable]"
        rows={actsRows}
        showCheckbox
        checkedStates={checkedActs}
        onCheckedChange={handleCheckedActChange}
      />

      {/* ===== D. DOCUMENTS ===== */}
      <Section
        sectionKey="D"
        title="Documents and Information submitted [Tick whichever is applicable and attach copies thereof]"
        rows={[
          "Registration / License No. under Contract Labour (Regulation & Abolition) Act, 1970 and Rules framed thereunder",
          "Registration Number under West Bengal Shops & Establishments Act, 1963 and Rules framed thereunder",
          "Registration No. / License No. under the Inter-State Migrant Workman (RECS) Act, 1979 and Rules framed thereunder",
          "Registration No. under Motor Transport Workers Act, 1961 and Rules framed thereunder",
          "Registration No. under the Building & Other Construction Workers (RE & CSW) Act, 1996 and Rules framed thereunder",
          "Registration Number under the Beedi & Cigar Workers (Condition of Employment) Act, 1966 & Rules framed thereunder",
          "Registration No. West Bengal Labour Welfare Fund Act, 1974 and Rules framed thereunder",
        ]}
        showUpload
        checkedStates={checkedDocs}
        onCheckedChange={handleCheckedDocChange}
        uploadedFiles={uploadedFiles}
        uploadingState={uploadingState}
        onUploadClick={handleUploadClick}
        onFileChange={handleFileChange}
        docIndexToMasterId={docIndexToMasterId}
      />

      {/* ===== E. SCHEDULED EMPLOYMENT ===== */}
      <SelectRowSection
        sectionKey="E"
        label="Specify the name of scheduled employment and wages paid:"
        options={scheduledEmployments}
        selectedValues={selectedEmployments}
        onChange={setSelectedEmployments}
      />

      {/* ===== F–M QUESTIONS ===== */}
      <QuestionSection
        items={[
          "Whether appointment letters / ID Cards issued to all Employees",
          "Whether required registered under all the relevant Acts maintained by the Principal Employer and Contractor",
          "Whether returns as per Schedule under the Acts / Rules submitted before due date",
          "Whether Maternity benefit extended to the women employees",
          "Whether arrangements are made to pay the wages to the employees by 7th. / 10th. of the succeeding month:",
          "Whether retired / resigned etc. employees are paid gratuity, leave encashment etc. as per the provisions of Act / Rules",
          "Whether the conditions of service, holidays, leaves, weekly offs etc. allowed to the employees under the relevant Act / Rules",
          "Nature of business",
        ]}
        startLetter="F"
        answers={questionAnswers}
        onAnswerChange={handleAnswerChange}
      />

      {/* Footer Buttons */}
      <div className="mx-4 mb-10">
        <div className="bg-[#337ab7] px-4 py-3 flex justify-between items-center rounded shadow">
          <span
            className="text-white cursor-pointer hover:underline font-semibold"
            onClick={() => navigate(-1)}
          >
            &lt; Back
          </span>
          <Button
            onClick={handleConfirmSubmit}
            disabled={submitting}
            className="bg-[#1e73be] hover:bg-[#175a93] text-white font-semibold px-6 py-2"
          >
            {submitting ? "SUBMITTING..." : "CONFIRM SUBMIT"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelfCertificationOthers;
