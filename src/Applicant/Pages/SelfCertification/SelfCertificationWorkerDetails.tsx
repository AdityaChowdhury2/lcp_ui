import React, { useMemo, useState } from "react";
import { Input } from "../../../Components/ui/input";
import { Button } from "../../../Components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../Components/ui/select";
import { Textarea } from "../../../Components/ui/textarea";

type AreaType = "B" | "M";
type Ownership = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "";

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const years = Array.from({ length: 101 }, (_, i) => `${1926 + i}`);
const days = Array.from({ length: 31 }, (_, i) => `${i + 1}`);

const states = [
  "Andaman and Nicobar Island",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli",
  "Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttarakhand",
  "Uttar Pradesh",
  "West Bengal",
];

const districts = [
  "Alipurduar",
  "Bankura",
  "Birbhum",
  "Coochbehar",
  "Dakshin Dinajpur",
  "Darjeeling",
  "Hooghly",
  "Howrah",
  "Jalpaiguri",
  "Jhargram",
  "Kalimpong",
  "Kolkata",
  "Maldah",
  "Murshidabad",
  "Nadia",
  "North 24 Parganas",
  "Paschim Bardhaman",
  "Paschim Medinipur",
  "Purba Bardhaman",
  "Purba Medinipur",
  "Purulia",
  "South 24 Parganas",
  "Uttar Dinajpur",
];

const spanMap = {
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
};

const FormField = ({
  label,
  required,
  children,
  span = 4,
}: any) => (
  <div className={`col-span-12 ${spanMap[span as 2 | 3 | 4]}`}>
    <label className="block mb-1 font-semibold text-sm">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const WorkerRow = ({ label }: { label: string }) => (
  <div className="grid grid-cols-[2.5fr_1.7fr_1.7fr_1.7fr_1.7fr] gap-4 items-center mb-4">
    <div className="text-sm font-medium">{label}</div>

    <Input className={inputClass} defaultValue="0" />
    <Input className={inputClass} defaultValue="0" />
    <Input className={inputClass} defaultValue="0" />
    <Input className={inputClass} defaultValue="0" />
  </div>
);

const inputClass =
  "w-full h-[34px] border border-[#999] px-2 rounded-sm text-sm";

const selectClass =
  "w-full h-[34px] border border-[#999] rounded-sm text-sm";

const SelfCertificationWorkerDetails = () => {
  const [areaType, setAreaType] = useState<AreaType>("M");
  const [ownership, setOwnership] = useState<Ownership>("");

  const [govType, setGovType] = useState("");
  const [privateType, setPrivateType] = useState("");
  const [otherOwnership, setOtherOwnership] = useState("");
  const [undertakingName, setUndertakingName] = useState("");
  const [otherGovName, setOtherGovName] = useState("");
  const [localBody, setLocalBody] = useState("");
  const [urbanLocalBody, setUrbanLocalBody] = useState("");
  const [otherPrivateName, setOtherPrivateName] = useState("");

  return (
    <div className="w-full min-h-screen bg-[#ecf0f3] font-sans pb-0.5">
      <div className="bg-white p-4 mb-4">
        <h1 className="text-xl font-semibold text-gray-900">
          MY PROFILE
        </h1>
      </div>

      <div className="bg-white border rounded shadow mx-4 mb-8">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
          BASIC INFORMATION
        </div>

        <div className="p-6">
          <div className="grid grid-cols-12 gap-6">

            <FormField label="First Name" required>
              <Input className={inputClass} defaultValue="MALAY" />
            </FormField>

            <FormField label="Middle Name">
              <Input className={inputClass} />
            </FormField>

            <FormField label="Last Name" required>
              <Input className={inputClass} defaultValue="SIKDER" />
            </FormField>

            <FormField label="Email" required>
              <Input
                className={inputClass}
                defaultValue="rm.jhargramreg@wbsedcl.in"
              />
            </FormField>

            <FormField label="Mobile" required>
              <Input className={inputClass} defaultValue="8900799010" />
            </FormField>

            <FormField label="Gender" required>
              <div className="flex gap-4 mt-2 items-center">
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" defaultChecked className="mt-px" />
                  <span>Male</span>
                </label>

                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" className="mt-px" />
                  <span>Female</span>
                </label>

                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" className="mt-px" />
                  <span>Other</span>
                </label>
              </div>
            </FormField>

            <FormField label="Date Of Birth" required>
              <div className="flex gap-2">
                <Select defaultValue="Jul">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select defaultValue="2">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select defaultValue="2026">
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </FormField>

            <FormField label="ID Card Type" required>
              <Select defaultValue="AADHAR">
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AADHAR">AADHAR</SelectItem>
                  <SelectItem value="PAN">PAN</SelectItem>
                  <SelectItem value="TAN">TAN</SelectItem>
                  <SelectItem value="LIN">LIN</SelectItem>
                  <SelectItem value="EPIC">EPIC</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="ID Card Number" required>
              <Input className={inputClass} defaultValue="1" />
            </FormField>

            <FormField label="Address Line1" required>
              <Input
                className={inputClass}
                defaultValue="OFFICE OF THE REGIONAL MANAGER,GHORADHARA,JHARGRAM,PIN-721507"
              />
            </FormField>

            <FormField label="Country" required>
              <Select defaultValue="India">
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Select State" required>
              <Select defaultValue="West Bengal">
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Select District" required>
              <Select defaultValue="Jhargram">
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {districts.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Select Sub-Division" required>
              <Input className={inputClass} defaultValue="Jhargram" />
            </FormField>

            <FormField label="Select Area Type" required>
              <Select
                value={areaType}
                onValueChange={(v: AreaType) => setAreaType(v)}
              >
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">Block</SelectItem>
                  <SelectItem value="M">Municipality</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            {areaType === "B" ? (
              <>
                <FormField label="Name of Block" required>
                  <Input className={inputClass} />
                </FormField>

                <FormField label="Gram Panchayat" required>
                  <Input className={inputClass} />
                </FormField>
              </>
            ) : (
              <>
                <FormField label="Name of Municipality" required>
                  <Input
                    className={inputClass}
                    defaultValue="Jhargram Municipality"
                  />
                </FormField>

                <FormField label="Ward Number" required>
                  <Input className={inputClass} defaultValue="Ward-12" />
                </FormField>
              </>
            )}

            <FormField label="Select Police Station" required>
              <Input className={inputClass} defaultValue="Jhargram" />
            </FormField>

            <FormField label="Pin Code" required>
              <Input className={inputClass} defaultValue="721507" />
            </FormField>

          </div>
        </div>
      </div>

      {/* ESTABLISHMENT DETAILS */}
      <div className="bg-white border rounded shadow mx-4 mb-8">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
          ESTABLISHMENT DETAILS
        </div>

        <div className="p-6">
          <div className="grid grid-cols-12 gap-6">

            <FormField label="Name of Establishment" required>
              <Input
                className={inputClass}
                defaultValue="JHARGRAM REGION OFFICE"
              />
            </FormField>

            <FormField label="Type of The Establishment" required>
              <Select defaultValue="large">
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="micro">Micro</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Location of The Establishment" required>
              <Input
                className={inputClass}
                defaultValue="OFFICE OF THE REGIONAL MANAGER, POWER HOUSE COMPLEX, ADMINISTRATIVE BUILDING (1ST FLOOR), GHORADHARA, JHARGRAM"
              />
            </FormField>

            <FormField label="Select District" required>
              <Select defaultValue="Jhargram">
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Select Subdivision" required>
              <Input
                className={inputClass}
                defaultValue="Jhargram"
              />
            </FormField>

            <FormField label="Select AreaType" required>
              <Select defaultValue={areaType}>
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">Block</SelectItem>
                  <SelectItem value="M">Municipality</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {areaType === "B" ? (
              <>
                <FormField label="Select Block" required>
                  <Input className={inputClass} />
                </FormField>

                <FormField label="Select Gram Panchayat" required>
                  <Input className={inputClass} />
                </FormField>
              </>
            ) : (
              <>
                <FormField label="Select Municipality" required>
                  <Input
                    className={inputClass}
                    defaultValue="Jhargram Municipality"
                  />
                </FormField>

                <FormField label="Select Ward" required>
                  <Select defaultValue="Ward-12">
                    <SelectTrigger className={selectClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 18 }, (_, i) => (
                        <SelectItem
                          key={i}
                          value={`Ward-${i + 1}`}
                        >
                          Ward-{i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </>
            )}

            <FormField label="Select Police Station" required>
              <Select defaultValue="Jhargram">
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beliabera">Beliabera</SelectItem>
                  <SelectItem value="Belpahari">Belpahari</SelectItem>
                  <SelectItem value="Binpur">Binpur</SelectItem>
                  <SelectItem value="Gopiballavpur">Gopiballavpur</SelectItem>
                  <SelectItem value="Jamboni">Jamboni</SelectItem>
                  <SelectItem value="Jhargram">Jhargram</SelectItem>
                  <SelectItem value="Lalgarh">Lalgarh</SelectItem>
                  <SelectItem value="Nayagram">Nayagram</SelectItem>
                  <SelectItem value="Sankrail">Sankrail</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Pin Code" required>
              <Input
                className={inputClass}
                defaultValue="721507"
              />
            </FormField>

          </div>
        </div>
      </div>

      {/* OWNERSHIP DETAILS */}
      <div className="bg-white border rounded shadow mx-4 mb-8">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
          OWNERSHIP DETAILS OF ESTABLISHMENT OF WHICH APPLICATION TO BE SUBMITED
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start gap-6">

            {/* Ownership */}
            <div className="w-[170px]">
              <label className="block mb-1 font-semibold text-sm">
                Type of Ownership <span className="text-red-500">*</span>
              </label>

              <Select
                value={ownership}
                onValueChange={(val: Ownership) => {
                  setOwnership(val);
                  setGovType("");
                  setPrivateType("");
                  setOtherOwnership("");
                  setUndertakingName("");
                  setOtherGovName("");
                  setLocalBody("");
                  setUrbanLocalBody("");
                  setOtherPrivateName("");
                }}
              >
                <SelectTrigger className="h-[34px] border border-[#999] rounded-sm text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="1">Government</SelectItem>
                  <SelectItem value="2">Private</SelectItem>
                  <SelectItem value="3">Cooperative</SelectItem>
                  <SelectItem value="4">Trust</SelectItem>
                  <SelectItem value="5">NGO</SelectItem>
                  <SelectItem value="6">Society</SelectItem>
                  <SelectItem value="7">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Private */}
            {ownership === "2" && (
              <div className="w-[170px]">
                <label className="block mb-1 font-semibold text-sm">
                  Private Ownership Type <span className="text-red-500">*</span>
                </label>

                <Select value={privateType} onValueChange={setPrivateType}>
                  <SelectTrigger className="h-[34px] border border-[#999] rounded-sm text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="proprietorship">Proprietorship</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="llp">LLP</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Government */}
            {ownership === "1" && (
              <div className="mt-4">
                <FormField label="Government Ownership Type" required>
                  <Select
                    value={govType}
                    onValueChange={(val) => {
                      setGovType(val);
                      setUndertakingName("");
                      setOtherGovName("");
                      setLocalBody("");
                      setUrbanLocalBody("");
                    }}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="directorate">Directorate</SelectItem>
                      <SelectItem value="psu">Public Sector Undertaking</SelectItem>
                      <SelectItem value="localBodies">Local Bodies</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            )}

            {govType === "psu" && (
              <div className="mt-4">
                <FormField label="Name of Undertaking" required>
                  <Input
                    value={undertakingName}
                    onChange={(e) => setUndertakingName(e.target.value)}
                  />
                </FormField>
              </div>
            )}

            {govType === "others" && (
              <div className="mt-4">
                <FormField label="Other Government Name" required>
                  <Input
                    value={otherGovName}
                    onChange={(e) => setOtherGovName(e.target.value)}
                  />
                </FormField>
              </div>
            )}

            {govType === "localBodies" && (
              <div className="mt-4">
                <FormField label="Local Bodies" required>
                  <Select
                    value={localBody}
                    onValueChange={(val) => {
                      setLocalBody(val);
                      setUrbanLocalBody("");
                    }}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Rural</SelectItem>
                      <SelectItem value="2">Urban</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            )}

            {localBody === "urban" && (
              <div className="mt-4">
                <FormField label="Urban Local Bodies" required>
                  <Select
                    value={urbanLocalBody}
                    onValueChange={setUrbanLocalBody}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="municipality">Municipality</SelectItem>
                      <SelectItem value="corporation">Municipal Corporation</SelectItem>
                      <SelectItem value="notified">Notified Area</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            )}

            {ownership === "2" && privateType === "others" && (
              <div className="mt-4">
                <FormField label="Other Private Name" required>
                  <Input
                    value={otherPrivateName}
                    onChange={(e) => setOtherPrivateName(e.target.value)}
                  />
                </FormField>
              </div>
            )}

            {ownership === "7" && (
              <div className="mt-4">
                <FormField label="Other Ownership" required>
                  <Input
                    value={otherOwnership}
                    onChange={(e) => setOtherOwnership(e.target.value)}
                  />
                </FormField>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded shadow mx-4 mb-8">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
          PRINCIPAL EMPLOYER / CONTRACTOR DETAILS (As Per Aadhaar)
        </div>

        <div className="p-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4">
              <label className="block mb-1 font-semibold text-sm">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                className={inputClass}
                defaultValue="MALAY SIKDER"
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <label className="block mb-1 font-semibold text-sm">
                Gender <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-4 mt-2 items-center">
                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" defaultChecked className="mt-px" />
                  <span>Male</span>
                </label>

                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" className="mt-px" />
                  <span>Female</span>
                </label>

                <label className="flex items-center gap-1 text-sm">
                  <input type="radio" className="mt-px" />
                  <span>Other</span>
                </label>
              </div>
            </div>

            <div className="col-span-12 md:col-span-3">
              <label className="block mb-1 font-semibold text-sm">
                Date Of Birth <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-2">
                <Select defaultValue="Jul">
                  <SelectTrigger className="w-[75px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select defaultValue="2">
                  <SelectTrigger className="w-[60px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select defaultValue="2026">
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="col-span-12 md:col-span-3">
              <label className="block mb-1 font-semibold text-sm">
                Mobile <span className="text-red-500">*</span>
              </label>

              <Input
                className={inputClass}
                defaultValue="8900799010"
              />
            </div>
            <FormField label="Address Line1" required>
              <Textarea
                className="w-full border border-[#999]"
                defaultValue="OFFICE OF THE REGIONAL MANAGER,GHORADHARA,JHARGRAM,PIN-721507"
              />
            </FormField>

            <FormField label="Country" required>
              <Select defaultValue="India">
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Select State" required>
              <Select defaultValue="West Bengal">
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Select District" required>
              <Select defaultValue="Jhargram">
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Select Sub-Division" required>
              <Input className={inputClass} defaultValue="Jhargram" />
            </FormField>

            <FormField label="Select Area Type" required>
              <Select value={areaType}>
                <SelectTrigger className={selectClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B">Block</SelectItem>
                  <SelectItem value="M">Municipality</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            {areaType === "B" ? (
              <>
                <FormField label="Name of Block" required>
                  <Input className={inputClass} />
                </FormField>

                <FormField label="Gram Panchayat" required>
                  <Input className={inputClass} />
                </FormField>
              </>
            ) : (
              <>
                <FormField label="Name of Municipality" required>
                  <Input
                    className={inputClass}
                    defaultValue="Jhargram Municipality"
                  />
                </FormField>

                <FormField label="Ward Number" required>
                  <Input
                    className={inputClass}
                    defaultValue="Ward-12"
                  />
                </FormField>
              </>
            )}
            <FormField label="Select Police Station" required>
              <Input
                className={inputClass}
                defaultValue="Jhargram"
              />
            </FormField>

            <FormField label="Pin Code" required>
              <Input
                className={inputClass}
                defaultValue="721507"
              />
            </FormField>
          </div>
        </div>
      </div >
      {/* WORKER DETAILS */}
      <div className="bg-white border rounded shadow mx-4 mb-8">
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
          WORKER DETAILS
        </div>

        <div className="p-6">

          <div className="grid grid-cols-[2.5fr_1.7fr_1.7fr_1.7fr_1.7fr] gap-4 mb-4 font-semibold text-sm items-center">
            <div></div>
            <div>Male *</div>
            <div>Female *</div>
            <div>Adolescent Male *</div>
            <div>Adolescent Female *</div>
          </div>
          <WorkerRow label="No of workman of master role / regular" />
          <WorkerRow label="No of contractual labour" />
          <WorkerRow label="No of other worker engaged" />
          <div className="mt-8">
            <Button className="bg-[#337ab7] hover:bg-[#286090] text-white px-8 py-2 rounded-sm">
              UPDATE
            </Button>
          </div>
        </div >
      </div >
    </div >
  );
};

export default SelfCertificationWorkerDetails;