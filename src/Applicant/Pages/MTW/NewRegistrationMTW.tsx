import axios from "axios";
import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { API_BASE } from "@/constants/constants";

interface ApiOption {
  id: number;
  name: string;
}

export default function NewRegistrationMTW() {
  const [districts, setDistricts] = useState<ApiOption[]>([]);
  const [subdivisions, setSubdivisions] = useState<ApiOption[]>([]);
  const [areatype, setAreatype] = useState<string>("b");
  const [blocks, setBlocks] = useState<ApiOption[]>([]);
  const [villageward, setVillageward] = useState<ApiOption[]>([]);
  const [selectedDistId, setSelectedDistId] = useState<string | null>("");
  const [selectedSubdivId, setSelectedSubdivId] = useState<string | null>("");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>("");
  const [formData, setFormData] = useState({});

  /** -------------------------------
   * Load Districts
   --------------------------------*/
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await axios.get(`${API_BASE}district`);
        const distList = Array.isArray(res.data)
          ? res.data.map((d: any) => ({
            id: d.id,
            name: d.district_name,
          }))
          : [];
        setDistricts(distList);
      } catch (e) {
        console.error("District API error:", e);
      }
    };
    loadDistricts();
  }, []);


  const fetchSubdivisions = async (districtId: string) => {
    try {
      setSelectedDistId(districtId);
      const res = await axios.get(`${API_BASE}subdivision/${districtId}`);

      const subdivList = Array.isArray(res.data)
        ? res.data.map((sd: any) => ({
          id: sd.sub_div_code,
          name: sd.sub_div_name,
        }))
        : [];

      setSubdivisions(subdivList);
      setBlocks([]);
      setVillageward([]);
    } catch (e) {
      console.error("Subdivision API error:", e);
    }
  };

  const fetchBlocks = async (subdivisionId: string) => {
    try {
      setSelectedSubdivId(subdivisionId);

      const res = await axios.get(
        `${API_BASE}block/${selectedDistId}/${subdivisionId}/${areatype}`
      );

      const blockList = Array.isArray(res.data)
        ? res.data.map((b: any) => ({
          id: b.block_code,
          name: b.block_mun_name,
        }))
        : [];

      setBlocks(blockList);
      setVillageward([]);
    } catch (e) {
      console.error("Blocks API error:", e);
    }
  };

  const fetchVillageWard = async (blockId: string) => {
    try {
      setSelectedBlockId(blockId);

      const res = await axios.get(`${API_BASE}villageward/${blockId}`);

      const villageList = Array.isArray(res.data)
        ? res.data.map((v: any) => ({
          id: v.village_code,
          name: v.village_name,
        }))
        : [];

      setVillageward(villageList);
    } catch (e) {
      console.error("Village/Ward API error:", e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("/api/mtw-registration", formData);
      alert("Form Submitted Successfully!");
      console.log(res.data);
    } catch (error) {
      alert("Submission Failed");
      console.error(error);
    }
  };

  return (
    <Formik
      initialValues={{
        undertakingName: "",
        address1: "",
        district: "",
        subdivision: "",
        areatype: "",
        block_municipality: "",
        village_ward: "",
        pincode: "",
        ps: "",
        serviceType: "",
        totalRoutes: "",
        totalVehicles: "",
        maxWorkers: "",
      }}
      onSubmit={async (values) => {
        try {
          const res = await axios.post("/api/mtw-registration", values);
          alert("Form Submitted Successfully!");
          console.log(res.data);
        } catch (error) {
          alert("Submission Failed");
          console.error(error);
        }
      }}
    >
      {({ setFieldValue }) => (
        <Form className="w-full bg-gray-100 p-2 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            REGISTRATION OF MOTOR TRANSPORT UNDERTAKING (MTW)
          </h1>

          {/* SECTION 1 */}
          <div className="bg-white shadow rounded mb-6">
            <div className="bg-[#1D5A89] text-white px-4 py-2 font-semibold">
              Name and Address to which communications relating to the Motor Transport undertaking should be sent
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Name of Motor Transport Undertaking *</label>
                <input
                  name="undertakingName"
                  onChange={handleChange}
                  className="border w-full p-2 mt-1 rounded"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="font-medium">Address Line 1 *</label>
                <input
                  name="address1"
                  onChange={handleChange}
                  className="border w-full p-2 mt-1 rounded"
                  placeholder="Enter address"
                />
              </div>

              <div>
                <label className="font-medium">Select District *</label>
                <Field
                  as="select"
                  name="district"
                  className="w-full border p-2 mt-1 rounded"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val = e.target.value;
                    setFieldValue("district", val);
                    setFieldValue("subdivision", "");
                    setFieldValue("areatype", "");
                    setFieldValue("block_municipality", "");
                    fetchSubdivisions(val);
                  }}
                >
                  <option value="">- Select -</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Field>
              </div>

              <div>
                <label className="font-medium">Select Subdivision *</label>
                <Field
                  as="select"
                  name="subdivision"
                  className="w-full border p-2 mt-1 rounded"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val = e.target.value;
                    setFieldValue("subdivision", val);
                    setFieldValue("areatype", "");
                    setFieldValue("block_municipality", "");
                    fetchBlocks(val);
                  }}
                >
                  <option value="">- Select -</option>
                  {subdivisions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Field>
              </div>

              <div>
                <label className="font-medium">Select Block/Municipality/Corporation/SEZ/Notified Area *</label>
                <Field
                  as="select"
                  name="areatype"
                  className="w-full border p-2 mt-1 rounded"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val = e.target.value;
                    setFieldValue("areatype", val);
                    setFieldValue("block_municipality", "");
                    setAreatype(val);
                  }}
                >
                  <option value="">Select</option>
                  <option value="b">Block</option>
                  <option value="c">Corporation</option>
                  <option value="m">Municipality</option>
                </Field>
              </div>

              <div>
                <label className="font-medium">Select Block *</label>
                <Field
                  as="select"
                  name="block_municipality"
                  className="w-full border p-2 mt-1 rounded"
                >
                  <option value="">-- Select --</option>
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Field>
              </div>

              <div>
                <label className="font-medium">Gram Panchayat *</label>
                <Field
                  as="select"
                  name="village_ward"
                  className="w-full border p-2 mt-1 rounded"
                >
                  <option value="">-- Select --</option>
                  {villageward.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Field>
              </div>

              <div>
                <label className="font-medium">Pin Code *</label>
                <input
                  name="pincode"
                  onChange={handleChange}
                  className="border w-full p-2 mt-1 rounded"
                  placeholder="Enter pin code"
                />
              </div>

              <div>
                <label className="font-medium">Police Station *</label>
                <select
                  name="ps"
                  onChange={handleChange}
                  className="border w-full p-2 mt-1 rounded"
                >
                  <option value="">Select</option>
                  <option>Panchla</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="bg-white shadow rounded mb-6">
            <div className="bg-[#1D5A89] text-white px-4 py-2 font-semibold">
              NATURE OF MOTOR TRANSPORT SERVICE
            </div>
            <div className="p-4">
              <label className="font-medium">Nature Of Service *</label>
              <select
                name="serviceType"
                onChange={handleChange}
                className="border w-full p-2 mt-1 rounded"
              >
                <option value="">Select</option>
                <option>Passenger</option>
                <option>Goods Transport</option>
              </select>
            </div>
          </div>

          {/* SECTION 3 */}
          <div className="bg-white shadow rounded mb-6">
            <div className="bg-[#1D5A89] text-white px-4 py-2 font-semibold">
              ROUTE INFORMATION DETAILS
            </div>
            <div className="p-4">
              <label className="font-medium">Total Number of Routes *</label>
              <input
                name="totalRoutes"
                onChange={handleChange}
                className="border w-full p-2 mt-1 rounded"
                placeholder="Enter number"
              />
            </div>
          </div>

          {/* SECTION 4 */}
          <div className="bg-white shadow rounded mb-6">
            <div className="bg-[#1D5A89] text-white px-4 py-2 font-semibold">
              Number of Motor Transport / Vehicles on the last date of the preceeding year
            </div>
            <div className="p-4">
              <label className="font-medium">
                Total Number of Motor Transport / Vehicles on the last date of the preceeding year *
              </label>
              <input
                name="totalVehicles"
                onChange={handleChange}
                className="border w-full p-2 mt-1 rounded"
                placeholder="Enter number"
              />
            </div>
          </div>

          {/* SECTION 5 */}
          <div className="bg-white shadow rounded mb-6">
            <div className="bg-[#1D5A89] text-white px-4 py-2 font-semibold">
              Number of Motor Transport Worker employed on any day during the preceeding year
            </div>
            <div className="p-4">
              <label className="font-medium">
                Maximum number motor transport workers employed on any day during the preceeding year *
              </label>
              <input
                name="maxWorkers"
                onChange={handleChange}
                className="border w-full p-2 mt-1 rounded"
                placeholder="Enter number"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end">
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-[#1D5A89] text-white px-6 py-2 rounded shadow hover:bg-blue-800 mb-6"
            >
              SAVE & CONTINUE
            </button>
          </div>
        </Form>
      )}
    </Formik>

  );
}
