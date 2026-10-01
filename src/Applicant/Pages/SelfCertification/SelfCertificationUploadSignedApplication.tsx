import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "../../../Components/ui/button";
import { Input } from "../../../Components/ui/input";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "../../../utils/auth";
import { toast } from "react-toastify";

interface ApplicationInfo {
  id: number;
  encId: string;
  estName: string;
  identificationNo: string;
}

const SelfCertificationUploadSignedApplication: React.FC = () => {
  const { encId } = useParams<{ encId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appInfo, setAppInfo] = useState<ApplicationInfo | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (encId) {
      fetchApplicationInfo();
    }
  }, [encId]);

  const fetchApplicationInfo = async () => {
    try {
      setLoading(true);
      setError("");
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE}self-cert/app-list?page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch application list");
      }

      const match = (result.data || []).find(
        (app: any) => decodeURIComponent(app.encId) === decodeURIComponent(encId || "")
      );

      if (!match) {
        throw new Error("Application details not found in list.");
      }

      setAppInfo({
        id: match.id,
        encId: match.encId,
        estName: match.estName,
        identificationNo: match.identificationNo,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are allowed.");
        setFile(null);
        e.target.value = "";
        return;
      }
      // 8MB limit
      if (selectedFile.size > 8 * 1024 * 1024) {
        toast.error("File size should be less than 8MB.");
        setFile(null);
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a file to upload.");
      return;
    }

    try {
      setSubmitting(true);
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("applicationId", encId || "");
      formData.append("signedDocument", file);

      const response = await fetch(
        `${API_BASE}self-cert/upload-signed-doc`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to upload signed application");
      }
      toast.success(result.message || "Uploaded successfully");
      navigate("/self-certification-application/list");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadBlankApplication = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!encId) return;

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE}self-cert/application-form/${encodeURIComponent(encId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to generate application form PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `self-certification-application-${encId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to download blank application form.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full min-h-screen font-sans bg-[#ecf0f3] p-4">
      <div className="bg-white p-4 mb-4 rounded-md shadow border">
        <h1 className="text-2xl font-semibold text-gray-900">
          UPLOAD SIGNED SELF CERTIFICATION APPLICATION
        </h1>
      </div>

      <div className="bg-white rounded-md shadow border max-w-4xl mx-auto">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t-md">
          Signed Application Upload
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-[#fcf8e3] border border-[#faebcc] text-[#8a6d3b] p-4 rounded text-sm">
            <strong>Note:</strong> Your application successfully generated. Please{" "}
            <a
              href="#"
              onClick={handleDownloadBlankApplication}
              className="text-blue-600 font-bold hover:underline"
            >
              CLICK HERE
            </a>{" "}
            to download generated self-certificate application and upload this application with sign.
          </div>

          {appInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">
                  Establishment Name
                </span>
                <span className="text-gray-900 font-medium">
                  {appInfo.estName}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs uppercase tracking-wider font-semibold">
                  Identification No.
                </span>
                <span className="text-gray-900 font-medium">
                  {appInfo.identificationNo}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Choose File <span className="text-red-500">*</span>
            </label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              required
              className="max-w-md cursor-pointer file:cursor-pointer file:bg-gray-100 file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-2"
            />
            <p className="text-xs text-gray-500">
              Only PDF format is allowed. Maximum file size: 8MB.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#1e73be] hover:bg-[#175a93] text-white px-6"
            >
              {submitting ? "Saving..." : "Save"}
            </Button>
            <Link to="/self-certification-application/list">
              <Button
                type="button"
                variant="outline"
                className="px-6 border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelfCertificationUploadSignedApplication;
