import { Field, Formik, FormikProps, Form } from "formik";
import React from "react";

interface ApplicantFormValues {
 
  district: string;
 tu_number:string;
 tu_name:string;
 union_type: string;
 year:string
  // add more fields as needed
}

const initialValues: ApplicantFormValues = {
  
  district: "",
  tu_number:"",
  tu_name:"",
  union_type:"",
  year:""
};
const AnnualReturn = () => {
  const handleSubmit = (values: ApplicantFormValues) => {
    console.log("Form submitted:", values);
    // Handle form submission
  };

  return (
    <div className="min-h-screen font-['Source_Sans_Pro']">
      {/* Page Title */}
      <p className="font-['Source Sans Pro',sans-serif'] text-[24px] font-500 opacity-90 mt-1">
        List Of Annual Return
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
                  //  React.useEffect(() => {
                  //    const monthIndex = months.indexOf(values.toMonth);
                  //     const fromMonthIndex = months.indexOf(values.fromMonth);
                  //    const year = parseInt(values.toYear);
                  //    const daysInMonth = getDaysInMonth(year, monthIndex + 1);
                  //       const fromDaysInMonth = getDaysInMonth(year, fromMonthIndex + 1);
                  //    const currentDay = parseInt(values.toDay);
                  //    const fromCurrentDay = parseInt(values.fromDay);

                  //    if (currentDay > daysInMonth) {
                  //      setFieldValue("toDay", daysInMonth.toString());
                  //    }
                  //     if (fromCurrentDay > fromDaysInMonth) {
                  //      setFieldValue("fromDay", fromDaysInMonth.toString());
                  //    }
                  //  }, [
                  //    values.toMonth,
                  //     values.fromMonth,
                  //    values.toYear,
                  //     values.fromYear,
                  //    values.toDay,
                  //     values.fromDay,
                  //    setFieldValue,
                  //  ]);

                  return (
                    <Form className="px-[15px]">
                      {/* Row 1: district + District */}
                      <div className="grid grid-cols-1 ">
                        <div className="my-[14px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Type of Union <span className="text-red-500">*</span>
                          </label>
                          <Field
                            as="select"
                            name="union_type"
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
                            Year{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            name="year"
                            className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                          />
                        </div>

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
                            Trade Union Number{" "}
                          
                          </label>
                          <Field
                            type="text"
                            name="tu_number"
                            className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                          />
                        </div>

                        <div className="my-[14px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Trade Union Name{" "}
                          
                          </label>
                          <Field
                            type="text"
                            name="tu_name"
                            className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                          />
                        </div>
                      </div>

                      {/* Row 2: Subdivision */}

                      {/* Row 3: From Date + To Date */}

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
                     Annual Return Submission Information
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualReturn;
