import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

interface DistrictOption {
  districtCode: number;
  districtName: string;
}

interface AddTradeUnionFormValues {
  eTradeUnionName: string;
  eTradeUnionAddress: string;
  unionType: string;
  districtCode: string;
  pin: string;
  isDisable: "N" | "Y";
  isCanceled: "0" | "1";
  eOfficeFileNo: string;
  remarks: string;
  registrationNo: string;
  registrationDate: string;
}

const initialValues: AddTradeUnionFormValues = {
  eTradeUnionName: "",
  eTradeUnionAddress: "",
  unionType: "",
  districtCode: "",
  pin: "",
  isDisable: "N",
  isCanceled: "0",
  eOfficeFileNo: "",
  remarks: "",
  registrationNo: "",
  registrationDate: "",
};

const AddEditTradeUnion = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const token = getAuthToken() ?? "";
  const navigate = useNavigate();
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [pageError, setPageError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [formInitialValues, setFormInitialValues] = useState<AddTradeUnionFormValues>(initialValues);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [tuApplicationCpDoc, setTuApplicationCpDoc] = useState<File | null>(null);
  const [tuApplicationNspDoc, setTuApplicationNspDoc] = useState<File | null>(null);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    message: string;
    regNo: string | number;
  }>({
    isOpen: false,
    message: "",
    regNo: "",
  });

  const handleCloseModal = () => {
    setSuccessModal({ isOpen: false, message: "", regNo: "" });
    navigate("/trade-union-master-list");
  };

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await fetch(`${API_BASE}trade-union/master-list/districts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const result = Array.isArray(data?.result) ? data.result : [];
        setDistricts(result.filter((d: DistrictOption) => Number(d.districtCode) !== 99));
      } catch {
        setDistricts([]);
      }
    };

    loadDistricts();
  }, [token]);

  useEffect(() => {
    if (!isEditMode || !id) {
      setFormInitialValues(initialValues);
      setTuApplicationCpDoc(null);
      setTuApplicationNspDoc(null);
      return;
    }

    const loadDetails = async () => {
      setPageError("");
      setLoadingDetails(true);
      try {
        const response = await fetch(`${API_BASE}trade-union/master-list/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.message || "Failed to load trade union details.");
        }

        const result = data?.result || {};
        setFormInitialValues({
          eTradeUnionName: result.eTradeUnionName || "",
          eTradeUnionAddress: result.eTradeUnionAddress || "",
          unionType: result.unionType || "",
          districtCode: result.districtCode ? String(result.districtCode) : "",
          pin: result.pin || "",
          isDisable: result.isDisable === "Y" ? "Y" : "N",
          isCanceled: String(result.isCanceled ?? 0) === "1" ? "1" : "0",
          eOfficeFileNo: result.eOfficeFileNo || "",
          remarks: result.remarks || "",
          registrationNo: result.registrationNo ? String(result.registrationNo) : "",
          registrationDate: result.registrationDate || "",
        });
      } catch (error: any) {
        setPageError(error?.message || "Failed to load trade union details.");
      } finally {
        setLoadingDetails(false);
      }
    };

    loadDetails();
  }, [id, isEditMode, token]);

  const validateForm = (values: AddTradeUnionFormValues) => {
    const errors: Partial<Record<keyof AddTradeUnionFormValues, string>> = {};

    if (!values.eTradeUnionName.trim()) {
      errors.eTradeUnionName = "Name of the Trade Union is required.";
    }
    if (!values.eTradeUnionAddress.trim()) {
      errors.eTradeUnionAddress = "Address is required.";
    }
    if (!values.unionType) {
      errors.unionType = "Select Type is required.";
    }
    if (!values.districtCode) {
      errors.districtCode = "Select district is required.";
    }
    if (!/^\d{6}$/.test(values.pin.trim())) {
      errors.pin = "Please enter six digit pin number.";
    }
    if (isEditMode && !values.isDisable) {
      errors.isDisable = "Select action is required.";
    }
    if (isEditMode && !values.isCanceled) {
      errors.isCanceled = "Registration status is required.";
    }

    return errors;
  };

  const handleSubmit = async (
    values: AddTradeUnionFormValues,
    { setSubmitting, resetForm }: FormikHelpers<AddTradeUnionFormValues>,
  ) => {
    setPageError("");
    setSuccessMsg("");

    try {
      const basePayload = {
        eTradeUnionName: values.eTradeUnionName.trim(),
        eTradeUnionAddress: values.eTradeUnionAddress.trim(),
        unionType: values.unionType,
        districtCode: Number(values.districtCode),
        pin: values.pin.trim(),
      };

      const requestPayload = isEditMode
        ? {
            ...basePayload,
            isDisable: values.isDisable,
            isCanceled: Number(values.isDisable === "Y" ? 1 : values.isCanceled),
            eOfficeFileNo: values.eOfficeFileNo.trim() || undefined,
            remarks: values.remarks.trim() || undefined,
          }
        : basePayload;

      const response = isEditMode
        ? await (async () => {
            const formData = new FormData();
            Object.entries(requestPayload).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                formData.append(key, String(value));
              }
            });
            if (tuApplicationCpDoc) {
              formData.append("tuApplicationCpDoc", tuApplicationCpDoc);
            }
            if (tuApplicationNspDoc) {
              formData.append("tuApplicationNspDoc", tuApplicationNspDoc);
            }

            return fetch(`${API_BASE}trade-union/master-list/${id}`, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            });
          })()
        : await fetch(`${API_BASE}trade-union/master-list`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestPayload),
          });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || `Failed to ${isEditMode ? "update" : "add"} trade union.`);
      }

      const regNo =
        data?.result?.e_trade_union_regn_no ??
        data?.result?.registrationNo ??
        (isEditMode ? formInitialValues.registrationNo : "");

      setSuccessModal({
        isOpen: true,
        message:
          data?.message ||
          (isEditMode
            ? "Trade Union updated successfully."
            : "A new Trade Union has been registered successfully."),
        regNo: String(regNo || ""),
      });
      resetForm();
    } catch (error: any) {
      setPageError(error?.message || `Failed to ${isEditMode ? "update" : "add"} trade union.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-['Source_Sans_Pro']">
      <h1 className="max-w-6xl mx-auto mt-1 mb-2 text-[24px] font-medium opacity-90">
        {isEditMode ? "Edit Trade Union" : "Add New Trade Union"}
      </h1>

      <div className="max-w-6xl mx-auto py-3">
        <div className="relative w-full bg-white rounded-[3px] border-t-[3px] border-t-[#3c8dbc] mb-5 shadow">
          <div className="rounded-t-none rounded-b-[3px] p-[10px] overflow-hidden">
            <Formik
              initialValues={formInitialValues}
              enableReinitialize
              validate={validateForm}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                <Form className="px-[15px]">
                  {loadingDetails ? (
                    <p className="text-sm text-gray-600 py-2">Loading details...</p>
                  ) : null}
                  <div className="grid grid-cols-1 gap-4">
                    {isEditMode ? (
                      <div className="grid grid-cols-1 min-[768px]:grid-cols-2 gap-4">
                        <div className="my-[10px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Registration Number</label>
                          <Field
                            type="text"
                            name="registrationNo"
                            disabled
                            className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-gray-100 rounded-none"
                          />
                        </div>
                        <div className="my-[10px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Registration Date</label>
                          <Field
                            type="text"
                            name="registrationDate"
                            disabled
                            className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-gray-100 rounded-none"
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className="my-[10px]">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Name of the Trade Union <span className="text-red-500">*</span>
                      </label>
                      <Field
                        type="text"
                        name="eTradeUnionName"
                        className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                      />
                      {touched.eTradeUnionName && errors.eTradeUnionName ? (
                        <p className="text-red-600 text-xs mt-1">{errors.eTradeUnionName}</p>
                      ) : null}
                    </div>

                    <div className="my-[10px]">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        rows={2}
                        name="eTradeUnionAddress"
                        className="w-full px-[12px] py-[6px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                      />
                      {touched.eTradeUnionAddress && errors.eTradeUnionAddress ? (
                        <p className="text-red-600 text-xs mt-1">{errors.eTradeUnionAddress}</p>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 min-[768px]:grid-cols-3 gap-4">
                      <div className="my-[10px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Select Type <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="unionType"
                          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        >
                          <option value="">- Select -</option>
                          <option value="T">Trade Union</option>
                          <option value="F">Federation</option>
                        </Field>
                        {touched.unionType && errors.unionType ? (
                          <p className="text-red-600 text-xs mt-1">{errors.unionType}</p>
                        ) : null}
                      </div>

                      <div className="my-[10px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Select district <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="districtCode"
                          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        >
                          <option value="">- Select -</option>
                          {districts.map((district) => (
                            <option key={district.districtCode} value={String(district.districtCode)}>
                              {district.districtName}
                            </option>
                          ))}
                        </Field>
                        {touched.districtCode && errors.districtCode ? (
                          <p className="text-red-600 text-xs mt-1">{errors.districtCode}</p>
                        ) : null}
                      </div>

                      <div className="my-[10px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Pin number <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="pin"
                          maxLength={6}
                          className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        />
                        {touched.pin && errors.pin ? (
                          <p className="text-red-600 text-xs mt-1">{errors.pin}</p>
                        ) : null}
                      </div>
                    </div>

                    {isEditMode ? (
                      <div className="grid grid-cols-1 min-[768px]:grid-cols-3 gap-4">
                        <div className="my-[10px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">Select Action</label>
                          <div className="flex items-center gap-6 h-[34px]">
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name="isDisable"
                                value="N"
                                checked={values.isDisable === "N"}
                                onChange={() => setFieldValue("isDisable", "N")}
                              />
                              <span className="text-sm">Enable</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name="isDisable"
                                value="Y"
                                checked={values.isDisable === "Y"}
                                onChange={() => {
                                  setFieldValue("isDisable", "Y");
                                  setFieldValue("isCanceled", "1");
                                }}
                              />
                              <span className="text-sm">Disable</span>
                            </label>
                          </div>
                          {touched.isDisable && errors.isDisable ? (
                            <p className="text-red-600 text-xs mt-1">{errors.isDisable}</p>
                          ) : null}
                        </div>

                        <div className="my-[10px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Registration status
                          </label>
                          <div className="flex items-center gap-6 h-[34px]">
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name="isCanceled"
                                value="0"
                                disabled={values.isDisable === "Y"}
                                checked={values.isCanceled === "0"}
                                onChange={() => setFieldValue("isCanceled", "0")}
                              />
                              <span className="text-sm">Grant</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name="isCanceled"
                                value="1"
                                checked={values.isCanceled === "1"}
                                onChange={() => setFieldValue("isCanceled", "1")}
                              />
                              <span className="text-sm">Cancel</span>
                            </label>
                          </div>
                          {touched.isCanceled && errors.isCanceled ? (
                            <p className="text-red-600 text-xs mt-1">{errors.isCanceled}</p>
                          ) : null}
                        </div>

                        <div className="my-[10px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            E-Office File Number
                          </label>
                          <Field
                            type="text"
                            name="eOfficeFileNo"
                            className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                          />
                        </div>
                      </div>
                    ) : null}

                    {isEditMode ? (
                      <div className="my-[10px]">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Remarks</label>
                        <Field
                          as="textarea"
                          rows={2}
                          name="remarks"
                          className="w-full px-[12px] py-[6px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                        />
                      </div>
                    ) : null}

                    {isEditMode ? (
                      <div className="grid grid-cols-1 min-[768px]:grid-cols-2 gap-4">
                        <div className="my-[10px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Upload Corresponding Part of the Application
                          </label>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(event) => setTuApplicationCpDoc(event.target.files?.[0] ?? null)}
                            className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                          />
                        </div>
                        <div className="my-[10px]">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Upload Notesheet Part of the Application
                          </label>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(event) => setTuApplicationNspDoc(event.target.files?.[0] ?? null)}
                            className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center gap-6">
                    <button
                      type="submit"
                      disabled={isSubmitting || loadingDetails}
                      className="px-[12px] py-[6px] text-[14px] bg-[#3c8dbc] h-[34px] hover:bg-[#357ca5] text-white font-normal uppercase rounded-none shadow-md disabled:opacity-60"
                    >
                      {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Save"}
                    </button>
                    <Link to="/trade-union-master-list" className="text-[rgb(243,156,18)] text-sm font-semibold">
                      Back to Master List
                    </Link>
                  </div>

                  {pageError ? <p className="text-red-600 text-sm mt-3">{pageError}</p> : null}
                  {successMsg ? <p className="text-green-700 text-sm mt-3">{successMsg}</p> : null}
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      {successModal.isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-[#3c8dbc] px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white tracking-wide">
                {isEditMode ? "Trade Union Updated" : "Trade Union Added"}
              </h3>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base text-gray-800 font-medium mb-4">
                {successModal.message}
              </p>
              {successModal.regNo ? (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <span className="block text-xs uppercase tracking-wider text-blue-700 font-bold mb-1">
                    Registration Number (e_trade_union_regn_no)
                  </span>
                  <span className="text-2xl font-extrabold text-[#3c8dbc]">
                    {successModal.regNo}
                  </span>
                </div>
              ) : null}
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full px-4 py-2.5 bg-[#3c8dbc] hover:bg-[#357ca5] text-white font-semibold text-sm rounded shadow transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AddEditTradeUnion;
