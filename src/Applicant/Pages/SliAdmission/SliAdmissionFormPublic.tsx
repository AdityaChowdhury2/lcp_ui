import React, { useState } from "react";
import { Button } from "@/Components/ui/button";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/constants/constants";

const SliAdmissionFormPublic: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Saved Application Details after Step 1
  const [appEncId, setAppEncId] = useState("");

  // Step 1: Details state
  const [formData, setFormData] = useState({
    course_type: "",
    center: "",
    center_code: "",
    name: "",
    father_name: "",
    dob: "",
    phone: "",
    email: "",
    present_address: "",
    copy_address: false,
    permanent_address: "",
    year_graduation: "",
    university_name: "",
    canditate_cast: "",
    sponsored: "",
    sponsored_name: "",
    fee_payment_transaction_id: "",
    fee_payment_transaction_date: "",
  });

  // Step 2: Documents state
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Handle Course selected -> Center constraints
      if (name === "course_type") {
        next.center = "";
        next.center_code = "";
      }

      // Handle Center name resolution based on center_code
      if (name === "center_code") {
        if (value === "1") {
          next.center = "State Labour Institute, Kolkata: P-3, CIT Scheme VII M, Maniktala Main Road, Kankurgachhi, Kolkata-700054";
        } else if (value === "2") {
          next.center = "State Labour Institute, Siliguri: Dagapur Complex, P.O Pradhan Nagar, Siliguri, Dist : Darjeeling Pin - 734403";
        } else if (value === "3") {
          next.center = "State Labour Institute, Asansol: Kanyapur, Asansol, Dist : Paschim Burdwan, Pin : 713341";
        } else {
          next.center = "";
        }
      }

      // Handle present address copy
      if (next.copy_address && name === "present_address") {
        next.permanent_address = value;
      }

      return next;
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      copy_address: checked,
      permanent_address: checked ? prev.present_address : prev.permanent_address,
    }));
  };

  const handleFileUpload = async (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!appEncId) {
      alert("Please complete and save Step 1 details first.");
      return;
    }

    // Type and size validations
    const isImage = file.type === "image/jpeg" || file.type === "image/jpg";
    const isPdf = file.type === "application/pdf";

    if (fieldName === "profile_pic") {
      if (!isImage) {
        alert("Only JPG/JPEG files are allowed for Photograph.");
        return;
      }
      if (file.size > 70 * 1024) {
        alert("Photograph file size must be less than 70 KB.");
        return;
      }
    } else {
      if (!isPdf) {
        alert("Only PDF files are allowed for documents.");
        return;
      }
      if (file.size > 300 * 1024) {
        alert("Document file size must be less than 300 KB.");
        return;
      }
    }

    try {
      setUploadingField(fieldName);
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("fieldName", fieldName);
      uploadData.append("encId", appEncId);

      const response = await fetch(`${API_BASE}sli/public/upload-document`, {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const result = await response.json();
      setUploadedFiles((prev) => ({
        ...prev,
        [fieldName]: result[fieldName],
      }));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  const handleNextStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.course_type || !formData.center_code || !formData.name || !formData.father_name || !formData.dob || !formData.phone || !formData.email || !formData.present_address || !formData.permanent_address || !formData.year_graduation || !formData.university_name || !formData.canditate_cast || !formData.sponsored || !formData.fee_payment_transaction_id || !formData.fee_payment_transaction_date) {
      setError("Please fill all the mandatory fields.");
      return;
    }

    if (formData.phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (formData.sponsored === "yes" && !formData.sponsored_name) {
      setError("Please enter the name and address of the sponsored organization.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}sli/public/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message || "Failed to save details");
      }

      const result = await response.json();
      setAppEncId(result.encId);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while saving details");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep2 = () => {
    setError("");
    // Check mandatory uploads
    const mandatory = ["profile_pic", "proof_dob", "proof_address", "final_marksheet", "bank_documents"];
    for (const f of mandatory) {
      if (!uploadedFiles[f]) {
        setError(`Please upload document: ${f.replace("_", " ").toUpperCase()}`);
        return;
      }
    }

    if (formData.canditate_cast !== "GENERAL" && !uploadedFiles["cast_certificate"]) {
      setError("Please upload Caste Certificate.");
      return;
    }

    if (formData.sponsored === "yes" && !uploadedFiles["emp_certificate"]) {
      setError("Please upload Employment Certificate.");
      return;
    }

    setStep(3);
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}sli/public/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ encId: appEncId }),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message || "Final submission failed");
      }

      setSuccess("Application submitted successfully! You can now login with your registered mobile number using OTP.");
      setTimeout(() => {
        navigate("/sli-login");
      }, 5000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during final submission");
    } finally {
      setLoading(false);
    }
  };

  // Helper arrays
  const graduationYears = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 40; y--) {
    graduationYears.push(y);
  }

  const centersForCourse = formData.course_type === "Advanced Diploma in Construction Safety"
    ? [
        { code: "1", label: "State Labour Institute, Kolkata: P-3, CIT Scheme VII M, Maniktala Main Road, Kankurgachhi, Kolkata-700054" },
        { code: "3", label: "State Labour Institute, Asansol: Kanyapur, Asansol, Dist : Paschim Burdwan, Pin : 713341" }
      ]
    : [
        { code: "1", label: "State Labour Institute, Kolkata: P-3, CIT Scheme VII M, Maniktala Main Road, Kankurgachhi, Kolkata-700054" },
        { code: "2", label: "State Labour Institute, Siliguri: Dagapur Complex, P.O Pradhan Nagar, Siliguri, Dist : Darjeeling Pin - 734403" },
        { code: "3", label: "State Labour Institute, Asansol: Kanyapur, Asansol, Dist : Paschim Burdwan, Pin : 713341" }
      ];

  return (
    <div className="w-full min-h-screen font-sans bg-[#ecf0f3] p-4 flex flex-col items-center">
      {/* Page Header */}
      <div className="max-w-4xl w-full bg-white p-4 mb-4 rounded border shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#215e87]">SLI Course Admission Form</h1>
          <p className="text-xs text-gray-500 mt-0.5">Apply for academic examinations and training courses.</p>
        </div>
        <Button onClick={() => navigate("/sli-login")} className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1">
          Back to Login
        </Button>
      </div>

      {/* Form Card */}
      <div className="max-w-4xl w-full bg-white rounded border shadow-md overflow-hidden">
        {/* Stepper Header */}
        <div className="bg-[#215e87] text-white p-4 flex items-center justify-around text-xs md:text-sm font-semibold border-b">
          <div className={`flex items-center space-x-2 ${step === 1 ? "text-yellow-300 font-bold" : "opacity-70"}`}>
            <span className="bg-white text-[#215e87] rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
            <span>Personal & Academic Details</span>
          </div>
          <div className={`flex items-center space-x-2 ${step === 2 ? "text-yellow-300 font-bold" : "opacity-70"}`}>
            <span className="bg-white text-[#215e87] rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
            <span>Document Uploads</span>
          </div>
          <div className={`flex items-center space-x-2 ${step === 3 ? "text-yellow-300 font-bold" : "opacity-70"}`}>
            <span className="bg-white text-[#215e87] rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
            <span>Preview & Submit</span>
          </div>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 border border-red-200 p-3 rounded">{error}</div>}
          {success && <div className="mb-4 text-xs font-bold text-green-600 bg-green-50 border border-green-200 p-3 rounded">{success}</div>}

          {/* STEP 1: Candidate details */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase text-[#215e87] border-b pb-1.5 mb-4">Course & Center Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Course Applying For <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="course_type"
                      value={formData.course_type}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Course --</option>
                      <option value="Post Graduate Diploma in Human Resource Development & Labour Welfare">
                        PG Diploma in Human Resource Development & Labour Welfare (PGDHRD&LW)
                      </option>
                      <option value="Advanced Diploma in Construction Safety">
                        Advanced Diploma in Construction Safety (ADCS)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Exam Centre <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="center_code"
                      value={formData.center_code}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.course_type}
                      className="w-full border rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">-- Select Center --</option>
                      {centersForCourse.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label.split(":")[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase text-[#215e87] border-b pb-1.5 mb-4">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Candidate Name (in Block Letters) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="ENTER FULL NAME"
                      className="w-full border rounded p-2 text-xs uppercase focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Father's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="father_name"
                      value={formData.father_name}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={10}
                      required
                      placeholder="10-digit mobile number"
                      className="w-full border rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="name@domain.com"
                      className="w-full border rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Candidate Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="canditate_cast"
                      value={formData.canditate_cast}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Category --</option>
                      <option value="GENERAL">GENERAL</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OBC-A">OBC-A</option>
                      <option value="OBC-B">OBC-B</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase text-[#215e87] border-b pb-1.5 mb-4">Contact Addresses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Present Address for Communication <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="present_address"
                      value={formData.present_address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full border rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-gray-700 uppercase">
                        Permanent Address <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          id="copy_address"
                          name="copy_address"
                          checked={formData.copy_address}
                          onChange={handleCheckboxChange}
                          className="h-3 w-3"
                        />
                        <label htmlFor="copy_address" className="text-[10px] text-gray-500 font-semibold cursor-pointer">
                          Same as Present
                        </label>
                      </div>
                    </div>
                    <textarea
                      name="permanent_address"
                      value={formData.permanent_address}
                      onChange={handleInputChange}
                      required
                      disabled={formData.copy_address}
                      rows={3}
                      className="w-full border rounded p-2 text-xs focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase text-[#215e87] border-b pb-1.5 mb-4">Academic & Sponsorship Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Year of Graduation / Diploma <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="year_graduation"
                      value={formData.year_graduation}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Year --</option>
                      {graduationYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      University/Institution Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="university_name"
                      value={formData.university_name}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Sponsored Candidate? <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="sponsored"
                      value={formData.sponsored}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Option --</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                {formData.sponsored === "yes" && (
                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Sponsored Org Name & Full Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="sponsored_name"
                      value={formData.sponsored_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Name and complete address of the employer organization"
                      className="w-full border rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase text-[#215e87] border-b pb-1.5 mb-4">Application Fee Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Transaction Reference ID (from bank transfer) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fee_payment_transaction_id"
                      value={formData.fee_payment_transaction_id}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Date of Fee Payment <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="fee_payment_transaction_date"
                      value={formData.fee_payment_transaction_date}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2">
                  {loading ? "Saving..." : "Save & Continue →"}
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: Document uploads */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded text-xs leading-relaxed">
                <strong>Upload Guidelines:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li><strong>Candidate Photograph</strong>: Must be in <strong>JPG/JPEG</strong> format and size must not exceed <strong>70 KB</strong>.</li>
                  <li><strong>All Other Supporting Documents</strong>: Must be in <strong>PDF</strong> format and size must not exceed <strong>300 KB</strong> each.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Profile Pic */}
                <div className="border p-4 rounded bg-gray-50 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">1. Candidate Photograph (JPG/JPEG, max 70KB) <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-gray-500 mt-1 block">Recent passport size photo of applicant.</span>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <input type="file" accept="image/jpeg, image/jpg" onChange={(e) => handleFileUpload("profile_pic", e)} disabled={uploadingField !== null} className="text-xs w-full" />
                    {uploadedFiles["profile_pic"] && <span className="text-xs text-green-600 font-bold">✓ Uploaded</span>}
                  </div>
                </div>

                {/* 2. DOB Proof */}
                <div className="border p-4 rounded bg-gray-50 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">2. Date of Birth Proof (PDF, max 300KB) <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-gray-500 mt-1 block">Admit Card of Madhyamik/Secondary Exam or Birth Certificate.</span>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload("proof_dob", e)} disabled={uploadingField !== null} className="text-xs w-full" />
                    {uploadedFiles["proof_dob"] && <span className="text-xs text-green-600 font-bold">✓ Uploaded</span>}
                  </div>
                </div>

                {/* 3. Address Proof */}
                <div className="border p-4 rounded bg-gray-50 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">3. Address Proof Document (PDF, max 300KB) <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-gray-500 mt-1 block">Aadhaar card / Voter ID / Passport.</span>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload("proof_address", e)} disabled={uploadingField !== null} className="text-xs w-full" />
                    {uploadedFiles["proof_address"] && <span className="text-xs text-green-600 font-bold">✓ Uploaded</span>}
                  </div>
                </div>

                {/* 4. Graduation Marks */}
                <div className="border p-4 rounded bg-gray-50 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">4. Final Marksheet / Certificate (PDF, max 300KB) <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-gray-500 mt-1 block">Marksheet of graduation degree or engineering diploma.</span>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload("final_marksheet", e)} disabled={uploadingField !== null} className="text-xs w-full" />
                    {uploadedFiles["final_marksheet"] && <span className="text-xs text-green-600 font-bold">✓ Uploaded</span>}
                  </div>
                </div>

                {/* 5. Bank / Fee Payment doc */}
                <div className="border p-4 rounded bg-gray-50 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">5. Bank Payment Counterfoil / Transaction Slip (PDF, max 300KB) <span className="text-red-500">*</span></span>
                    <span className="text-[10px] text-gray-500 mt-1 block">Proof of transaction showing fee payment to State Labour Institute.</span>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload("bank_documents", e)} disabled={uploadingField !== null} className="text-xs w-full" />
                    {uploadedFiles["bank_documents"] && <span className="text-xs text-green-600 font-bold">✓ Uploaded</span>}
                  </div>
                </div>

                {/* SC/ST Cast Certificate (Conditional) */}
                {formData.canditate_cast !== "GENERAL" && (
                  <div className="border p-4 rounded bg-gray-50 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-700 block">6. Caste Certificate (PDF, max 300KB) <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-gray-500 mt-1 block">Certificate issued by competent authority in West Bengal.</span>
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload("cast_certificate", e)} disabled={uploadingField !== null} className="text-xs w-full" />
                      {uploadedFiles["cast_certificate"] && <span className="text-xs text-green-600 font-bold">✓ Uploaded</span>}
                    </div>
                  </div>
                )}

                {/* Sponsored Employee Certificate (Conditional) */}
                {formData.sponsored === "yes" && (
                  <div className="border p-4 rounded bg-gray-50 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-700 block">7. Employment / No-Objection Certificate (PDF, max 300KB) <span className="text-red-500">*</span></span>
                      <span className="text-[10px] text-gray-500 mt-1 block">Certificate from employer verifying sponsorship and granting leave/NOC.</span>
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload("emp_certificate", e)} disabled={uploadingField !== null} className="text-xs w-full" />
                      {uploadedFiles["emp_certificate"] && <span className="text-xs text-green-600 font-bold">✓ Uploaded</span>}
                    </div>
                  </div>
                )}
              </div>

              {uploadingField && <div className="text-xs font-semibold text-blue-600 italic">Uploading {uploadingField.replace("_", " ").toUpperCase()}... Please wait.</div>}

              <div className="flex justify-between pt-4 border-t">
                <Button onClick={() => setStep(1)} className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2">
                  ← Back to Details
                </Button>
                <Button onClick={handleNextStep2} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-6 py-2">
                  Review Application Preview →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Preview & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#215e87] border-b pb-1.5 mb-3 uppercase">Review Applied Details</h3>
                <div className="overflow-x-auto border rounded text-xs">
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="bg-gray-50">
                        <td className="border p-2 font-semibold w-1/3">Course Applied</td>
                        <td className="border p-2">{formData.course_type}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold">Preference Centre</td>
                        <td className="border p-2">{formData.center}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border p-2 font-semibold">Candidate Name</td>
                        <td className="border p-2 uppercase font-semibold">{formData.name}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold">Father's Name</td>
                        <td className="border p-2">{formData.father_name}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border p-2 font-semibold">Date of Birth</td>
                        <td className="border p-2">{formData.dob}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold">Mobile Number</td>
                        <td className="border p-2">{formData.phone}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border p-2 font-semibold">Email ID</td>
                        <td className="border p-2">{formData.email}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold">Present Address</td>
                        <td className="border p-2">{formData.present_address}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border p-2 font-semibold">Permanent Address</td>
                        <td className="border p-2">{formData.permanent_address}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold">Year of Graduation</td>
                        <td className="border p-2">{formData.year_graduation}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border p-2 font-semibold">University Name</td>
                        <td className="border p-2">{formData.university_name}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold">Caste Category</td>
                        <td className="border p-2">{formData.canditate_cast}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border p-2 font-semibold">Sponsored Candidate</td>
                        <td className="border p-2 uppercase">{formData.sponsored}</td>
                      </tr>
                      {formData.sponsored === "yes" && (
                        <tr>
                          <td className="border p-2 font-semibold">Sponsored Employer</td>
                          <td className="border p-2">{formData.sponsored_name}</td>
                        </tr>
                      )}
                      <tr className="bg-gray-50">
                        <td className="border p-2 font-semibold">Transaction ID</td>
                        <td className="border p-2 font-mono">{formData.fee_payment_transaction_id}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-semibold">Transaction Date</td>
                        <td className="border p-2">{formData.fee_payment_transaction_date}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#215e87] border-b pb-1.5 mb-3 uppercase">Attached Documentation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {Object.keys(uploadedFiles).map((key) => (
                    <div key={key} className="border p-2 rounded bg-gray-50 flex items-center justify-between">
                      <span className="font-semibold text-gray-700 capitalize">{key.replace("_", " ")}</span>
                      <span className="text-green-600 font-bold">✓ Attached</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded text-xs leading-relaxed">
                <strong>Self Declaration:</strong>
                <p className="mt-1">I hereby declare that all the information furnished above is true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect at any stage, my candidature/admission is liable to be cancelled.</p>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <Button onClick={() => setStep(2)} className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2">
                  ← Back to Documents
                </Button>
                <Button onClick={handleFinalSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs px-8 py-2">
                  {loading ? "Submitting..." : "Confirm & Final Submit Application"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SliAdmissionFormPublic;
