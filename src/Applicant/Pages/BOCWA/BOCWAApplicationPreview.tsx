import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from "../../../Components/ui/table";
import { API_BASE } from "@/constants/constants";
import { encryptionDecryptionFun } from "@/utils/encryption";

interface Option {
  code: string;
  name: string;
}

const BOCWAApplicationPreview: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const [districts, setDistricts] = useState<Option[]>([]);
  const [subdivisions, setSubdivisions] = useState<Option[]>([]);
  const [blocks, setBlocks] = useState<Option[]>([]);
  const [wards, setWards] = useState<Option[]>([]);
  const [policeStations, setPoliceStations] = useState<Option[]>([]);

  const documents = [
    "Trade License",
    "Articles of Association and Memorandum of Association / Partnership Deed",
    "Any other document in support of correctness of the particulars mentioned in the application if required",
    "Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.",
    "Challan",
    "Work Order",
    "Form I for assessment of CESS",
    "Documents in Support of Payment of CESS",
    "Documents in Support of Correctness of Application",
    "Address Proof",
  ];

  // dummy data for application preview table
  const establishmentDetails: Record<string, string> = {
    "Name of the Establishment": "TEST SUCHINTA",
    "Establishment Type": "Micro",
    "Location of the Establishment": `TEST SUCHINTA JHARGRAM
    Ward-16, Jhargram Municipality,
    Jhargram, PS - Gopiballavpur,
    Jhargram, PIN - 721501`,
    "Postal Address of the Establishment": `Fartabad, beltala, Garia
    Ward-7, Jhargram Municipality,
    Jhargram, PS - Belabera,
    Jhargram, PIN - 700086`,
    "Nature of Work Carried on in the Establishment": "",
    "Maximum Number of Workmen Employed Directly on any day in the Establishment": ``,
    "Number of Workmen Engaged as Permanent / Regular Workmen": "",
    "Number of Workmen Engaged as Temporary / Regular Workmen": "",
    "A complete job description of the contract labour": "",
  };

  const employerDetails: Record<string, string> = {
    "Full Name of the Principal Employer": "Lopamudra Jana",
    Gender: "Female",
    "Mobile No.": "",
    "Address of the Principal Employer": `Fartabad, beltala, Garia
    Ward-9, Jhargram Municipality,
    Jhargram, PS - Jhargram,
    Jhargram, PIN - 700086`,
    "Full name of the Manager or Person Responsible for the Supervision and control of the Establishment": "Lopamudra Jana",
    "Address of the Manager or Person Responsible for the Supervision and control of the Establishment": `Fartabad, beltala, Garia
    Ward-11, Jhargram Municipality,
    Jhargram, PS - Jhargram,
    Jhargram, PIN - 700086`,
    "Whether the Workmen employed / intended to be Employment by the Contractor Perform the same or similar kind of work as the Workmen employed directly by the Principal Employer": "Yes",
    "Wage rates and other cash benefits paid/to be paid": "",
    "Settlement or award or judgement or minimum wages (if any applicable in the establishment)": "",
    "Maximum number of contract labour to be employed on any day through each contractor": "",
    "Category / designation / nomenclature of the job": "",
  };

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggleCheck = (name: string) => {
    setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const [checkedFinal, setCheckedFinal] = useState<boolean>(false);

  useEffect(() => {
    // initial form data
    axios.get(`${API_BASE}bocwa/amendment/init`).then((res) => {
      setFormData(res.data);
    });

    // districts list
    axios.get(`${API_BASE}district/list`).then((res) => setDistricts(res.data));
  }, []);

  useEffect(() => {
    if (!formData.distCode) return;
    axios
      .get(`${API_BASE}subdivision/${formData.distCode}`)
      .then((res) => setSubdivisions(res.data));
  }, [formData.distCode]);

  useEffect(() => {
    if (!formData.subDivCode) return;
    axios
      .get(
        `${API_BASE}block/${formData.distCode}/${formData.subDivCode}/${formData.areaTypeCode}`,
      )
      .then((res) => setBlocks(res.data));
  }, [formData.subDivCode, formData.areaTypeCode]);

  useEffect(() => {
    if (!formData.blockCode) return;
    axios
      .get(`${API_BASE}villageward/${formData.blockCode}`)
      .then((res) => setWards(res.data));
  }, [formData.blockCode]);

  useEffect(() => {
    if (!formData.distCode) return;
    axios
      .get(`${API_BASE}policestation/${formData.distCode}`)
      .then((res) => setPoliceStations(res.data));
  }, [formData.distCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API_BASE}bocwa/amendment/submit`, formData);
    alert("Form submitted successfully");
  };


  function ApplicationPreviewTable({ data }: { data: Record<string, string> }) {
    return (
      <Table className="border">
        <TableHeader>
          <TableRow className="bg-slate-600">
            <TableHead className="text-white font-semibold w-1/2">
              Parameters
            </TableHead>
            <TableHead className="text-white font-semibold w-1/2">
              Inputs
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(data).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell className="align-top font-medium border-r">
                <p className="text-wrap break-words">{key}</p>
              </TableCell>
              <TableCell className="whitespace-pre-line">
                <p className="text-wrap break-words">{value}</p>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <h1 className="text-lg bg-white font-semibold p-4 mb-4">
        APPLICATION PREVIEW
      </h1>

      {/* {activeTab === 2 && ( */}
        <>
        <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm">ESTABLISHMENT DETAILS</div>
        <div className="bg-white pb-4">
          <div className="flex gap-2 p-4">
            <p><span className="font-semibold">Authorized Registering office for this application:</span> Regional Labour Office, Jhargram, Jhargram</p>
            <button 
              className="px-3 py-1 bg-sky-500 text-xs rounded-md text-white hover:bg-sky-600"
              onClick={() => navigate("/rlo-details/jhargram/10")}>     
              MORE INFO
            </button>
          </div>

          <div className="max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ApplicationPreviewTable data={establishmentDetails} />
              <ApplicationPreviewTable data={employerDetails} />
            </div>
          </div>

          <div className="bg-slate-600 text-white mx-4 p-2">
            Documents Uploaded
          </div>
          <div className="bg-white">
            {/* Documents Uploaded Section will be here */}
          </div>

          <div className="bg-slate-600 text-white mx-4 p-2 mt-4">
            Fees Details
          </div>
          <div className="w-full mx-4 flex">
            <div className="bg-gray-100 p-2 border border-x max-w-1/2">
                <p>Fees Details</p>
                <p className="text-red-500 text-wrap break-words">[ ** Fees calculation depend on "Maximum number of contract labour to be employed on any day through each contractor".]</p>
            </div>

            <div className="bg-gray-100 p-2 border border-r w-full mr-8">
                <p>Total Fees: </p>
                <p>Fees Chart</p>
                <p>Previous deposited fees: </p>
                <p>Payable Fees: </p>
            </div>
          </div>
        </div>

        <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm mt-4">CONTRACTORS AND CONRACT LABOUR DETAILS</div>
        <div className="bg-white py-4">
          <div className="bg-gray-100 p-4 mx-4 border border-gray-200">
            <p>No Contractors Added</p>
          </div>
        </div>

        <div className="bg-[#2A628C] text-white px-4 py-2 font-semibold text-sm mt-4">TRADE UNION DETAILS</div>
        <div className="bg-white py-4">
          <div className="bg-gray-100 p-4 mx-4 border border-gray-200">
            <p>No Trade Union Added</p>
          </div>
        </div>


        <div className="flex justify-end gap-3 mt-4 mb-15">
          <button
            type="button"
            className="bg-[#2A628C] text-white px-6 py-2 rounded hover:bg-black"
            disabled={!checkedFinal}
          >
            VIEW & PRINT
          </button>

          {(() => {
            const encApplicationId = searchParams.get("id") ?? "";
            const encActId = encryptionDecryptionFun("encrypt", "2") ?? "";
            const disabled = !encApplicationId;

            const handlePayNowClick = () => {
              if (!encApplicationId) return;
              navigate(
                `/epayments-preview?applicationId=${encodeURIComponent(
                  encApplicationId
                )}&actId=${encodeURIComponent(encActId)}`
              );
            };

            return (
              <button
                type="button"
                onClick={handlePayNowClick}
                disabled={disabled}
                className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pay Now
              </button>
            );
          })()}
        </div>
        </>
      {/* )} */}
    </div>
  );
};

export default BOCWAApplicationPreview;
