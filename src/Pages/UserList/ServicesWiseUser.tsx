import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, FormikProps } from "formik";
import axios from "axios";
import DataTable, { TableColumn } from "react-data-table-component";
import { API_BASE } from "@/constants/constants";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

/** ---------------- TYPES ---------------- */
interface FormValues {
  service: string;
  district: string;
  subdivision: string;
  fromDate: string;
  toDate: string;
}

interface Option {
  id: number;
  name: string;
}

interface TableRow {
  sl: number;
  establishment: string;
  principalEmployer: string;
  regDate: string;
}

/** ---------------- SERVICE MAP ---------------- */
const serviceMap: Record<string, string> = {
  "1": "Registration of Principal Emp. Under CLRA",
  "12": "Licensing of Contractors Under CLRA",
  "2": "Est.Registration Under BOCWA",
  "3": "Est.Registration Under MTW",
  "4": "Est.Registration Under ISMW",
  "5": "Annual Return User List",
};

/** ---------------- INITIAL ---------------- */
const initialValues: FormValues = {
  service: "",
  district: "",
  subdivision: "",
  fromDate: "",
  toDate: "",
};

const ServicesWiseUser: React.FC = () => {
  const formikRef = useRef<FormikProps<FormValues> | null>(null);

  const [districts, setDistricts] = useState<Option[]>([]);
  const [subdivisions, setSubdivisions] = useState<Option[]>([]);
  const [data, setData] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(false);

  /** ---------------- TABLE ---------------- */
  const columns: TableColumn<TableRow>[] = [
    { name: "SL. NO.", selector: (row) => row.sl, width: "80px" },
    {
      name: "ESTABLISHMENT DETAILS",
      selector: (row) => row.establishment,
      wrap: true,
    },
    {
      name: "PRINCIPAL EMPLOYER",
      selector: (row) => row.principalEmployer,
    },
    {
      name: "REG. NO. & DATE",
      selector: (row) => row.regDate,
    },
  ];

  /** ---------------- LOAD DISTRICT ---------------- */
  useEffect(() => {
    const load = async () => {
      const res = await axios.get(`${API_BASE}district`);
      const list = res.data.map((d: any) => ({
        id: d.district_code,
        name: d.district_name,
      }));
      setDistricts(list);
    };
    load();
  }, []);

  /** ---------------- SUBDIVISION ---------------- */
  const fetchSubdivision = async (districtId: string) => {
    if (!districtId) {
      setSubdivisions([]);
      return;
    }

    const res = await axios.get(`${API_BASE}subdivision/${districtId}`);
    const list = res.data.map((s: any) => ({
      id: s.sub_div_code,
      name: s.sub_div_name,
    }));
    setSubdivisions(list);
  };

  /** ---------------- API CALL ---------------- */
  const fetchReport = async (values: FormValues) => {
    try {
      setLoading(true);

      const payload = {
        reportName: "SERVICE_WISE_INFO",
        serviceId: values.service,
        serviceName: serviceMap[values.service] || "",
        district: values.district || "",
        subdivision: values.subdivision || "0",
        fromDate: values.fromDate,
        toDate: values.toDate,
      };

      const res = await axios.post(
        `${API_BASE}reports/administrative`,
        payload
      );

      const apiData = res.data;

      if (!apiData || !apiData.rows) {
        setData([]);
        return;
      }

      /** MAP RESPONSE */
      const mapped: TableRow[] = apiData.rows.map((row: any) => ({
        sl: row.sl_no,
        establishment: row.establishment_name,
        principalEmployer: row.principal_employer,
        regDate: row.reg_no_date,
      }));

      setData(mapped);
    } catch (e) {
      console.error("API ERROR:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- SUBMIT ---------------- */
  const handleSubmit = (values: FormValues) => {
    fetchReport(values);
  };

  /** ---------------- EXPORT ---------------- */
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const rows = [
      ["SL NO", "ESTABLISHMENT", "PRINCIPAL EMPLOYER", "REG NO & DATE"],
      ...data.map((d) => [
        d.sl,
        d.establishment,
        d.principalEmployer,
        d.regDate,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "ServiceWiseUser");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(new Blob([buffer]), "SERVICE_WISE_USER_REPORT.xlsx");
  };

  /** ---------------- DATE PICKER ---------------- */
  const openDatePicker = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (input.showPicker) input.showPicker();
    else input.focus();
  };

  // Custom Datatble styles
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#3c8dbc",
        minHeight: "35px",
      },
    },
    headCells: {
      style: {
        color: "#fff",
        fontSize: "12px",
        fontWeight: 600,
        borderRight: "1px solid #ffffff",
        justifyContent: "center",
      },
    },
    rows: {
      style: {
        minHeight: "32px",
        fontSize: "12px",
      },
    },
    cells: {
      style: {
        borderRight: "1px solid #d2d6de",
        borderBottom: "1px solid #d2d6de",
        justifyContent: "center",
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
  };

  /** ---------------- UI ---------------- */
  return (
    <div className="min-h-screen p-[15px]">
      <p className="text-[24px] font-semibold mb-2.5">
        Service wise User List
      </p>

      <div className="flex flex-wrap">
        {/* LEFT */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white border-t-[3px] border-t-[#3c8dbc] shadow">
            <div className="p-2.5">
              <Formik
                innerRef={formikRef}
                initialValues={initialValues}
                onSubmit={handleSubmit}
              >
                {({ setFieldValue }) => (
                  <Form>
                    {/* SERVICE */}
                    <div className="mb-2.5">
                      <label className="text-[13px] font-bold">
                        Services <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="select"
                        name="service"
                        className="w-full h-[34px] border border-[#d2d6de] px-2"
                      >
                        <option value="">- Select -</option>
                        <option value="1">
                          Registration of Principal Emp. Under CLRA
                        </option>
                        <option value="12">
                          Licensing of Contractors Under CLRA
                        </option>
                        <option value="2">
                          Est.Registration Under BOCWA
                        </option>
                        <option value="3">
                          Est.Registration Under MTW
                        </option>
                        <option value="4">
                          Est.Registration Under ISMW
                        </option>
                        <option value="5">
                          Annual Return User List
                        </option>
                      </Field>
                    </div>

                    {/* DISTRICT */}
                    <div className="mb-2.5">
                      <label className="text-[13px] font-bold">
                        Select district *
                      </label>
                      <Field
                        as="select"
                        name="district"
                        className="w-full h-[34px] border border-[#d2d6de] px-2"
                        onChange={(e: any) => {
                          setFieldValue("district", e.target.value);
                          setFieldValue("subdivision", "");
                          fetchSubdivision(e.target.value);
                        }}
                      >
                        <option value="">- Select -</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </Field>
                    </div>

                    {/* SUBDIVISION */}
                    <div className="mb-2.5">
                      <label className="text-[13px] font-bold">
                        Select subdivision
                      </label>
                      <Field
                        as="select"
                        name="subdivision"
                        className="w-full h-[34px] border border-[#d2d6de] px-2"
                      >
                        <option value="">- Select -</option>
                        {subdivisions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </Field>
                    </div>

                    {/* FROM DATE */}
                    <div className="mb-2.5">
                      <label className="text-[13px] font-bold">
                        From date *
                      </label>
                      <Field name="fromDate">
                        {({ field, form }: any) => (
                          <input
                            type="date"
                            className="w-full h-[34px] border border-[#d2d6de] px-2"
                            value={field.value}
                            onChange={(e) =>
                              form.setFieldValue("fromDate", e.target.value)
                            }
                            onClick={openDatePicker}
                          />
                        )}
                      </Field>
                    </div>

                    {/* TO DATE */}
                    <div className="mb-2.5">
                      <label className="text-[13px] font-bold">
                        To date *
                      </label>
                      <Field name="toDate">
                        {({ field, form }: any) => (
                          <input
                            type="date"
                            className="w-full h-[34px] border border-[#d2d6de] px-2"
                            value={field.value}
                            onChange={(e) =>
                              form.setFieldValue("toDate", e.target.value)
                            }
                            onClick={openDatePicker}
                          />
                        )}
                      </Field>
                    </div>

                    <button
                      type="submit"
                      className="mt-[5px] px-3 py-1.5 bg-[#3c8dbc] text-white"
                    >
                      SEARCH
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-3/4 pl-[35px]">
          <div className="bg-white border-t-[3px] border-t-[#3c8dbc] shadow">
            <div className="p-2.5">
              <div className="flex justify-between mb-2.5">
                <label className="text-[13px]">Report</label>

                <button
                  onClick={exportExcel}
                  className="bg-green-600 text-white px-3 py-1 text-[13px]"
                >
                  Download Excel
                </button>
              </div>

              {loading && <p>Loading...</p>}

              <DataTable
                columns={columns}
                data={data}
                dense
                highlightOnHover
                customStyles={customStyles}
                noDataComponent="There are no records to display"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesWiseUser;