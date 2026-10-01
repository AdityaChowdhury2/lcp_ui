import React, { useEffect, useState } from "react";
import { Button } from "@/Components/ui/button";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";

const SliAdmissionForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Details state
  const [formData, setFormData] = useState({
    course_type: "",
    center: "",
    center_code: "",
    name: "",
    father_name: "",
    dob: "",
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

  // Load existing application if any
  useEffect(() => {
    fetchExistingApplication();
  }, []);

  const fetchExistingApplication = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}sli/application`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.application) {
          const app = result.application;
          // Format date values to YYYY-MM-DD
          const formatDt = (dStr: string | null) => {
            if (!dStr) return "";
            return new Date(dStr).toISOString().split("T")[0];
          };

          setFormData({
            course_type: app.course_type || "",
            center: app.center || "",
            center_code: app.center_code ? String(app.center_code) : "",
            name: app.name || "",
            father_name: app.father_name || "",
            dob: formatDt(app.dob),
            email: app.email || "",
            present_address: app.present_address || "",
            copy_address: app.present_address === app.permanent_address,
            permanent_address: app.permanent_address || "",
            year_graduation: app.year_graduation ? String(app.year_graduation) : "",
            university_name: app.university_name || "",
            canditate_cast: app.canditate_cast || "",
            sponsored: app.sponsored || "",
            sponsored_name: app.sponsored_name || "",
            fee_payment_transaction_id: app.fee_payment_transaction_id || "",
            fee_payment_transaction_date: formatDt(app.fee_payment_transaction_date),
          });
        }
        if (result && result.documents) {
          setUploadedFiles(result.documents);
        }
      }
    } catch (err) {
      console.error("Error loading application:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const token = getAuthToken();
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("fieldName", fieldName);

      const response = await fetch(`${API_BASE}sli/upload-document`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

    if (!formData.course_type || !formData.center_code || !formData.name || !formData.father_name || !formData.dob || !formData.email || !formData.present_address || !formData.permanent_address || !formData.year_graduation || !formData.university_name || !formData.canditate_cast || !formData.sponsored || !formData.fee_payment_transaction_id || !formData.fee_payment_transaction_date) {
      setError("Please fill all the mandatory fields.");
      return;
    }

    if (formData.sponsored === "yes" && !formData.sponsored_name) {
      setError("Please enter the name and address of the sponsored organization.");
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}sli/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message || "Failed to save details");
      }

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
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}sli/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message || "Final submission failed");
      }

      setSuccess("Application submitted successfully!");
      setTimeout(() => {
        navigate("/sli-admission/list");
      }, 2000);
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
    <div className="w-full min-h-screen font-sans bg-[#ecf0f3] p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-md shadow border">
        {/* Header */}
        <div className="bg-[#215e87] text-white font-semibold px-6 py-4 rounded-t-md flex justify-between items-center">
          <span className="text-lg">Apply for Course Admission</span>
          <span className="text-sm">Step {step} of 3</span>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex border-b text-sm font-semibold bg-gray-50 text-gray-500">
          <div className={`flex-1 py-3 text-center border-r ${step === 1 ? "bg-white text-[#215e87] border-b-2 border-b-[#215e87]" : ""}`}>
            1. Form Details
          </div>
          <div className={`flex-1 py-3 text-center border-r ${step === 2 ? "bg-white text-[#215e87] border-b-2 border-b-[#215e87]" : ""}`}>
            2. Upload Documents
          </div>
          <div className={`flex-1 py-3 text-center ${step === 3 ? "bg-white text-[#215e87] border-b-2 border-b-[#215e87]" : ""}`}>
            3. Preview & Confirm
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded text-sm">{success}</div>}

          {/* Step 1: Form Details */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Course *</label>
                  <select
                    name="course_type"
                    value={formData.course_type}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded p-2 text-sm bg-white"
                  >
                    <option value="">Select Course</option>
                    <option value="Post Graduate Diploma in Human Resource Development & Labour Welfare">
                      Post Graduate Diploma in Human Resource Development & Labour Welfare
                    </option>
                    <option value="Advanced Diploma in Construction Safety">
                      Advanced Diploma in Construction Safety
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Centre *</label>
                  <select
                    name="center_code"
                    value={formData.center_code}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.course_type}
                    className="w-full border rounded p-2 text-sm bg-white disabled:bg-gray-100"
                  >
                    <option value="">Select Centre</option>
                    {centersForCourse.map((c) => (
                      <option key={c.code} value={c.code}>{c.label.split(":")[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Name (In Block Letters) *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter Full Name"
                    className="w-full border rounded p-2 text-sm uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Father's Name *</label>
                  <input
                    type="text"
                    name="father_name"
                    value={formData.father_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter Father's Name"
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email ID *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter Email Address"
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Present Address *</label>
                <input
                  type="text"
                  name="present_address"
                  value={formData.present_address}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter present address"
                  className="w-full border rounded p-2 text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="copy_address"
                  checked={formData.copy_address}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label htmlFor="copy_address" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Present Address is same as Permanent Address
                </label>
              </div>

              {!formData.copy_address && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Permanent Address *</label>
                  <input
                    type="text"
                    name="permanent_address"
                    value={formData.permanent_address}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter permanent address"
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Graduation/Diploma Year *</label>
                  <select
                    name="year_graduation"
                    value={formData.year_graduation}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded p-2 text-sm bg-white"
                  >
                    <option value="">Select Year</option>
                    {graduationYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">University/Institution Name *</label>
                  <input
                    type="text"
                    name="university_name"
                    value={formData.university_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter University/Institution"
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category *</label>
                  <select
                    name="canditate_cast"
                    value={formData.canditate_cast}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded p-2 text-sm bg-white"
                  >
                    <option value="">Select Category</option>
                    <option value="GENERAL">General</option>
                    <option value="OBCA">OBC A</option>
                    <option value="OBCB">OBC B</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">If Sponsored Candidate *</label>
                  <select
                    name="sponsored"
                    value={formData.sponsored}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded p-2 text-sm bg-white"
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {formData.sponsored === "yes" && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Sponsored Organization Details *</label>
                    <input
                      type="text"
                      name="sponsored_name"
                      value={formData.sponsored_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Name & Address of Organization"
                      className="w-full border rounded p-2 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Fee Payment Transaction Ref ID *</label>
                  <input
                    type="text"
                    name="fee_payment_transaction_id"
                    value={formData.fee_payment_transaction_id}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter Transaction Reference"
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date of Payment *</label>
                  <input
                    type="date"
                    name="fee_payment_transaction_date"
                    value={formData.fee_payment_transaction_date}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded p-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <Button type="button" onClick={() => navigate("/sli-admission/list")} className="bg-gray-500 hover:bg-gray-600 text-white">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-[#1e73be] hover:bg-[#175a93] text-white">
                  {loading ? "Saving..." : "Next Step"}
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Upload Documents */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded text-xs leading-relaxed">
                <strong>Upload Guidelines:</strong>
                <ul className="list-disc pl-4 mt-2 space-y-1">
                  <li>Photograph: Max size 70 KB, JPG/JPEG format only.</li>
                  <li>Other Documents: Max size 300 KB, PDF format only.</li>
                </ul>
              </div>

              <div className="space-y-4">
                {/* PHOTOGRAPH */}
                <div className="p-4 border rounded flex items-center justify-between bg-gray-50">
                  <div>
                    <span className="font-semibold text-sm block">1. Photograph *</span>
                    <span className="text-xs text-gray-500">Max size 70 KB, JPG/JPEG only.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {uploadedFiles.profile_pic && <span className="text-xs text-green-600 font-semibold">✓ Uploaded</span>}
                    <input
                      type="file"
                      accept=".jpg,.jpeg"
                      onChange={(e) => handleFileUpload("profile_pic", e)}
                      disabled={uploadingField === "profile_pic"}
                      className="text-xs max-w-xs"
                    />
                  </div>
                </div>

                {/* DOB PROOF */}
                <div className="p-4 border rounded flex items-center justify-between bg-gray-50">
                  <div>
                    <span className="font-semibold text-sm block">2. Proof of Date of Birth *</span>
                    <span className="text-xs text-gray-500">Max size 300 KB, PDF only.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {uploadedFiles.proof_dob && <span className="text-xs text-green-600 font-semibold">✓ Uploaded</span>}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload("proof_dob", e)}
                      disabled={uploadingField === "proof_dob"}
                      className="text-xs max-w-xs"
                    />
                  </div>
                </div>

                {/* ADDRESS PROOF */}
                <div className="p-4 border rounded flex items-center justify-between bg-gray-50">
                  <div>
                    <span className="font-semibold text-sm block">3. Proof of Address *</span>
                    <span className="text-xs text-gray-500">Max size 300 KB, PDF only.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {uploadedFiles.proof_address && <span className="text-xs text-green-600 font-semibold">✓ Uploaded</span>}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload("proof_address", e)}
                      disabled={uploadingField === "proof_address"}
                      className="text-xs max-w-xs"
                    />
                  </div>
                </div>

                {/* MARKSHEET */}
                <div className="p-4 border rounded flex items-center justify-between bg-gray-50">
                  <div>
                    <span className="font-semibold text-sm block">4. Marksheet of Graduation/Diploma *</span>
                    <span className="text-xs text-gray-500">Max size 300 KB, PDF only.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {uploadedFiles.final_marksheet && <span className="text-xs text-green-600 font-semibold">✓ Uploaded</span>}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload("final_marksheet", e)}
                      disabled={uploadingField === "final_marksheet"}
                      className="text-xs max-w-xs"
                    />
                  </div>
                </div>

                {/* FEE RECEIPT */}
                <div className="p-4 border rounded flex items-center justify-between bg-gray-50">
                  <div>
                    <span className="font-semibold text-sm block">5. Fee Payment Receipt *</span>
                    <span className="text-xs text-gray-500">Max size 300 KB, PDF only.</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {uploadedFiles.bank_documents && <span className="text-xs text-green-600 font-semibold">✓ Uploaded</span>}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload("bank_documents", e)}
                      disabled={uploadingField === "bank_documents"}
                      className="text-xs max-w-xs"
                    />
                  </div>
                </div>

                {/* CASTE CERTIFICATE */}
                {formData.canditate_cast !== "GENERAL" && (
                  <div className="p-4 border rounded flex items-center justify-between bg-gray-50">
                    <div>
                      <span className="font-semibold text-sm block">6. Caste Certificate *</span>
                      <span className="text-xs text-gray-500">Max size 300 KB, PDF only. Required for Category: {formData.canditate_cast}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadedFiles.cast_certificate && <span className="text-xs text-green-600 font-semibold">✓ Uploaded</span>}
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload("cast_certificate", e)}
                        disabled={uploadingField === "cast_certificate"}
                        className="text-xs max-w-xs"
                      />
                    </div>
                  </div>
                )}

                {/* EMPLOYMENT CERTIFICATE */}
                {formData.sponsored === "yes" && (
                  <div className="p-4 border rounded flex items-center justify-between bg-gray-50">
                    <div>
                      <span className="font-semibold text-sm block">7. Employment Certificate *</span>
                      <span className="text-xs text-gray-500">Max size 300 KB, PDF only. Required for Sponsored Candidate.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadedFiles.emp_certificate && <span className="text-xs text-green-600 font-semibold">✓ Uploaded</span>}
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload("emp_certificate", e)}
                        disabled={uploadingField === "emp_certificate"}
                        className="text-xs max-w-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6 border-t">
                <Button type="button" onClick={() => setStep(1)} className="bg-gray-500 hover:bg-gray-600 text-white">
                  Back
                </Button>
                <Button type="button" onClick={handleNextStep2} className="bg-[#1e73be] hover:bg-[#175a93] text-white">
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-md font-semibold text-gray-800 border-b pb-2">Application Details Preview</h2>
              
              <div className="overflow-x-auto border rounded">
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-semibold w-1/3">Course</td>
                      <td className="border p-3">{formData.course_type}</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">Centre</td>
                      <td className="border p-3">{formData.center.split(":")[0]}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-semibold">Name</td>
                      <td className="border p-3 uppercase">{formData.name}</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">Father's Name</td>
                      <td className="border p-3">{formData.father_name}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-semibold">Date of Birth</td>
                      <td className="border p-3">{formData.dob}</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">Email ID</td>
                      <td className="border p-3">{formData.email}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-semibold">Present Address</td>
                      <td className="border p-3">{formData.present_address}</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">Permanent Address</td>
                      <td className="border p-3">{formData.permanent_address}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-semibold">Year of Graduation/Diploma</td>
                      <td className="border p-3">{formData.year_graduation}</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">University/Institution Name</td>
                      <td className="border p-3">{formData.university_name}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-semibold">Category</td>
                      <td className="border p-3">{formData.canditate_cast}</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">Sponsored Candidate</td>
                      <td className="border p-3">{formData.sponsored.toUpperCase()}</td>
                    </tr>
                    {formData.sponsored === "yes" && (
                      <tr className="bg-gray-50">
                        <td className="border p-3 font-semibold">Sponsored Organization</td>
                        <td className="border p-3">{formData.sponsored_name}</td>
                      </tr>
                    )}
                    <tr className="bg-gray-50">
                      <td className="border p-3 font-semibold">Application fee Transaction Ref ID</td>
                      <td className="border p-3">{formData.fee_payment_transaction_id}</td>
                    </tr>
                    <tr>
                      <td className="border p-3 font-semibold">Date of Payment</td>
                      <td className="border p-3">{formData.fee_payment_transaction_date}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-md font-semibold text-gray-800 border-b pb-2 pt-4">Uploaded Documents</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold text-[#1e73be]">
                {uploadedFiles.profile_pic && (
                  <div className="p-3 border rounded text-center bg-gray-50">
                    <a href={`/${uploadedFiles.profile_pic}`} target="_blank" rel="noreferrer">
                      View Photograph
                    </a>
                  </div>
                )}
                {uploadedFiles.proof_dob && (
                  <div className="p-3 border rounded text-center bg-gray-50">
                    <a href={`/${uploadedFiles.proof_dob}`} target="_blank" rel="noreferrer">
                      View Date of Birth Proof
                    </a>
                  </div>
                )}
                {uploadedFiles.proof_address && (
                  <div className="p-3 border rounded text-center bg-gray-50">
                    <a href={`/${uploadedFiles.proof_address}`} target="_blank" rel="noreferrer">
                      View Address Proof
                    </a>
                  </div>
                )}
                {uploadedFiles.final_marksheet && (
                  <div className="p-3 border rounded text-center bg-gray-50">
                    <a href={`/${uploadedFiles.final_marksheet}`} target="_blank" rel="noreferrer">
                      View Graduation Marksheet
                    </a>
                  </div>
                )}
                {uploadedFiles.bank_documents && (
                  <div className="p-3 border rounded text-center bg-gray-50">
                    <a href={`/${uploadedFiles.bank_documents}`} target="_blank" rel="noreferrer">
                      View Fee Payment receipt
                    </a>
                  </div>
                )}
                {uploadedFiles.cast_certificate && (
                  <div className="p-3 border rounded text-center bg-gray-50">
                    <a href={`/${uploadedFiles.cast_certificate}`} target="_blank" rel="noreferrer">
                      View Caste Certificate
                    </a>
                  </div>
                )}
                {uploadedFiles.emp_certificate && (
                  <div className="p-3 border rounded text-center bg-gray-50">
                    <a href={`/${uploadedFiles.emp_certificate}`} target="_blank" rel="noreferrer">
                      View Employment Certificate
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 border border-blue-200 bg-blue-50 rounded text-sm text-blue-900 leading-relaxed">
                <input type="checkbox" id="agree" className="mr-2 cursor-pointer" required />
                <label htmlFor="agree" className="font-semibold cursor-pointer select-none">
                  This is to certify that all the information provided above are true to the best of my knowledge and I have deposited the requisite application fees. *
                </label>
              </div>

              <div className="flex justify-between pt-6 border-t">
                <Button type="button" onClick={() => setStep(2)} className="bg-gray-500 hover:bg-gray-600 text-white">
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="bg-[#215e87] hover:bg-[#1a4b6c] text-white"
                >
                  {loading ? "Submitting..." : "Confirm & Final Submit"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SliAdmissionForm;
