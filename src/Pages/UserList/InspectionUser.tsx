// src/pages/districtsWiseUser.tsx
import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikProps } from "formik";

interface ApplicantFormValues {
  fromMonth: string;
  fromYear: string;
  fromDay: string;
  toMonth: string;
  toYear: string;
  toDay: string;
  district: string;
  subdivision: string;
  block_municipality:string;
  inspection_act:string;
  status: string
  // add more fields as needed
}

const initialValues: ApplicantFormValues = {
  fromMonth: "Dec",
  fromYear: "2025",
  fromDay: "1",
  toMonth: "Dec",
  toYear: "2025",
  toDay: "1",
  district: "",
  subdivision: "",
  block_municipality:"",
  inspection_act: "",
  status:""
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate(); // month is 0-indexed in Date constructor
};

// Month names mapping
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const InspectionUser: React.FC = () => {
  const handleSubmit = (values: ApplicantFormValues) => {
    console.log("Form submitted:", values);
    // Handle form submission
  };

  return (
    <div className="min-h-screen font-['Source_Sans_Pro']">
      {/* Page Title */}
      <p className="font-['Source Sans Pro',sans-serif'] text-[24px] font-500 opacity-90 mt-1">
        Inspection user list
      </p>

      {/* Main Card */}
      <div className="max-w-6xl mx-auto py-3 flex flex-col min-[992px]:flex-row">
        <div className="w-full min-[992px]:w-1/4 pr-[15px] relative min-h-[100px] ">
          <div className="relative rounded-[3px] bg-white border-t-[3px] border-t-[#3c8dbc] mb-5 w-full shadow">
            <div className="rounded-t-none rounded-b-[3px] p-[10px] overflow-hidden">
              <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                {({
                  values,
                  handleChange,
                  setFieldValue,
                }: FormikProps<ApplicantFormValues>) => {
                  React.useEffect(() => {
                    const monthIndex = months.indexOf(values.toMonth);
                     const fromMonthIndex = months.indexOf(values.fromMonth);
                    const year = parseInt(values.toYear);
                    const daysInMonth = getDaysInMonth(year, monthIndex + 1);
                       const fromDaysInMonth = getDaysInMonth(year, fromMonthIndex + 1);
                    const currentDay = parseInt(values.toDay);
                    const fromCurrentDay = parseInt(values.fromDay);

                    if (currentDay > daysInMonth) {
                      setFieldValue("toDay", daysInMonth.toString());
                    }
                     if (fromCurrentDay > fromDaysInMonth) {
                      setFieldValue("fromDay", fromDaysInMonth.toString());
                    }
                  }, [
                    values.toMonth,
                     values.fromMonth,
                    values.toYear,
                     values.fromYear,
                    values.toDay,
                     values.fromDay,
                    setFieldValue,
                  ]);

                  return (
                    <Form className="px-[15px]">
                      {/* Row 1: district + District */}
                      <div className="grid grid-cols-1 ">
                        <div className="my-[14px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            District <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="district"
                            className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] focus:border-[#3c8dbc] rounded-none shadow-inner"
                          >
                            <option value="">- Select -</option>
                            <option>
                              Registration of Principal Emp. Under CLRA
                            </option>
                            <option>Licensing under ISMW Act</option>
                            <option>Registration under BOCW Act</option>
                            <option>Trade Union Registration</option>
                          </Field>
                        </div>

                        <div className="my-[14px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Sub Divison{" "}
                           
                          </label>
                          <Field
                            as="select"
                            name="subdivision"
                            className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                          >
                            <option value="">- Select -</option>
                            <option>Kolkata</option>
                            <option>Howrah</option>
                            <option>North 24 Parganas</option>
                          </Field>
                        </div>
                      </div>

                      {/* Row 2: Subdivision */}
                      <div className="my-[14px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                         Block / Municipality
                        </label>
                        <Field
                          as="select"
                          name="block_municipality"
                          className="w-full max-w-md px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        >
                          <option value="">-- Select --</option>
                          <option>Barrackpore</option>
                          <option>Barasat</option>
                        </Field>
                      </div>

                      <div className="my-[14px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                         Inspection Act <span className=" text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="inspection_act"
                          className="w-full max-w-md px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        >
                          <option value="">-- Select --</option>
                          <option>Barrackpore</option>
                          <option>Barasat</option>
                        </Field>
                      </div>

                      <div className="my-[14px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="status"
                          className="w-full max-w-md px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        >
                          <option value="">-- Select --</option>
                          <option>Barrackpore</option>
                          <option>Barasat</option>
                        </Field>
                      </div>

                      {/* Row 3: From Date + To Date */}
                      <div className="grid grid-cols-2 min-[992px]:grid-cols-1 items-end">
                        <div className="my-[14px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            From date <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <Field
                              as="select"
                              name="fromMonth"
                              className="h-[22px] border border-[#d2d6de] rounded-none shadow-inner"
                            >
                              <option>Jan</option>
                              <option>Feb</option>
                              <option>Mar</option>
                              <option>Apr</option>
                              <option>May</option>
                              <option>Jun</option>
                              <option>Jul</option>
                              <option>Aug</option>
                              <option>Sep</option>
                              <option>Oct</option>
                              <option>Nov</option>
                              <option selected>Dec</option>
                            </Field>
                              {/* To Date - Day Dropdown (Always 1–31) */}
                            <Field
                              as="select"
                              name="fromDay"
                              className="h-[22px] border border-[#d2d6de] rounded-none shadow-inner text-sm"
                            >
                              {Array.from({ length: 31 }, (_, i) => (
                                <option key={i + 1} value={(i + 1).toString()}>
                                  {i + 1}
                                </option>
                              ))}
                            </Field>
                            <Field
                              as="select"
                              name="fromYear"
                              className="h-[22px] border border-[#d2d6de] rounded-none shadow-inner"
                            >
                              <option>2024</option>
                              <option selected>2025</option>
                              <option>2026</option>
                            </Field>
                          </div>
                        </div>

                        <div className="my-[14px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            To date <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <Field
                              as="select"
                              name="toMonth"
                              className=" h-[22px] border border-[#d2d6de] rounded-none shadow-inner"
                            >
                              {months.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </Field>
                            {/* To Date - Day Dropdown (Always 1–31) */}
                            <Field
                              as="select"
                              name="toDay"
                              className="h-[22px] border border-[#d2d6de] rounded-none shadow-inner text-sm"
                            >
                              {Array.from({ length: 31 }, (_, i) => (
                                <option key={i + 1} value={(i + 1).toString()}>
                                  {i + 1}
                                </option>
                              ))}
                            </Field>
                            <Field
                              as="select"
                              name="toYear"
                              className="h-[22px] border border-[#d2d6de] rounded-none shadow-inner"
                            >
                              <option>2024</option>
                              <option selected>2025</option>
                              <option>2026</option>
                            </Field>
                          </div>
                        </div>
                      </div>

                      {/* Search Button */}
                      <div className="">
                        <button
                          type="submit"
                          className="px-[12px] py-[6px] text-[14px] bg-[#3c8dbc] h-[34px] hover:bg-[#357ca5] text-white font-normal uppercase tracking-wider rounded-none shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                        >
                          Search
                        </button>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
        <div className="w-full min-[992px]:w-3/4 relative min-h-[100x] px-[15px]">
          <div className="relative rounded-[3px] bg-white border-t-[3px] border-t-[#3c8dbc] mb-5 w-full shadow">
            <div className="rounded-t-none rounded-b-[3px] p-[10px] overflow-hidden">
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Report
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionUser;
