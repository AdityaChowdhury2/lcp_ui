import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { Field, Form, Formik, type FormikHelpers } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import DataTable, { type TableColumn } from "react-data-table-component";
import { Link, useNavigate } from "react-router-dom";

interface SearchFormValues {
  district: string;
  tu_number: string;
  tu_name: string;
}

interface DistrictOption {
  districtCode: number;
  districtName: string;
}

interface TradeUnionListRow {
  slNo: number;
  id: number;
  registrationNo: number;
  tradeUnionName: string;
  address: string;
  districtName: string;
  status: string;
  canEdit: boolean;
}

interface MasterListPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const initialValues: SearchFormValues = {
  district: "",
  tu_number: "",
  tu_name: "",
};

const MastersList = () => {
  const token = getAuthToken() ?? "";
  const navigate = useNavigate();
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [rows, setRows] = useState<TradeUnionListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [filters, setFilters] = useState<SearchFormValues>(initialValues);
  /** When false, ignore DataTable server pagination callbacks (see Strict Mode + react-data-table-component). */

  useEffect(() => {
    fetchDistricts();
    fetchMasterList(initialValues, 1, 10);
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await fetch(`${API_BASE}trade-union/master-list/districts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      setDistricts(Array.isArray(data?.result) ? data.result : []);
    } catch {
      setDistricts([]);
    }
  };

  const fetchMasterList = async (values: SearchFormValues, page: number, limit: number) => {
    setErrorMsg("");

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (values.district) params.set("districtCode", String(Number(values.district)));
      if (values.tu_number) params.set("tradeUnionNo", values.tu_number);
      if (values.tu_name) params.set("tradeUnionName", values.tu_name);

      const response = await fetch(`${API_BASE}trade-union/master-list?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = (await response.json().catch(() => ({}))) as {
        result?: unknown;
        pagination?: MasterListPagination;
        message?: string;
      };
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load trade union list.");
      }
      setRows(Array.isArray(data?.result) ? data.result : []);
      const pagination = data?.pagination;
      setTotalRows(Number(pagination?.total) || 0);
      setCurrentPage(Number(pagination?.page) || page);
      setPerPage(Number(pagination?.limit) || limit);
    } catch (error: unknown) {
      setRows([]);
      setTotalRows(0);
      setErrorMsg(
        error instanceof Error && error.message
          ? error.message
          : "Failed to load trade union list.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    values: SearchFormValues,
    { setSubmitting }: FormikHelpers<SearchFormValues>,
  ) => {
    setFilters(values);
    await fetchMasterList(values, 1, perPage);
    setSubmitting(false);
  };

  const handlePageChange = async (
    page: number,
  ) => {
    await fetchMasterList(
      filters,
      page,
      perPage,
    );
  };

  const handlePerRowsChange =
    async (
      newPerPage: number,
      page: number,
    ) => {
      await fetchMasterList(
        filters,
        page,
        newPerPage,
      );
    };

  const columns: TableColumn<TradeUnionListRow>[] = useMemo(
    () => [
      {
        name: "Sl. No",
        selector: (row) => row.slNo,
        sortable: true,
        width: "90px",
      },
      {
        name: "Registration Number",
        selector: (row) => row.registrationNo,
        sortable: true,
        wrap: true,
      },
      {
        name: "Name of the Trade Union",
        selector: (row) => row.tradeUnionName,
        sortable: true,
        wrap: true,
        grow: 2,
      },
      {
        name: "Address",
        selector: (row) => row.address,
        wrap: true,
        grow: 2,
      },
      {
        name: "District Name",
        selector: (row) => row.districtName,
        sortable: true,
        wrap: true,
      },
      {
        name: "Status",
        selector: (row) => row.status,
        wrap: true,
        cell: (row) => {
          const normalizedStatus = String(row.status || "").toLowerCase();
          const isActive = normalizedStatus === "active";
          const isInactiveOrDisabled =
            normalizedStatus.includes("inactive") ||
            normalizedStatus.includes("disable");

          const badgeClass = isActive
            ? "bg-[#e7f7ed] text-[#1f8b4c]"
            : isInactiveOrDisabled
              ? "bg-[#fdeaea] text-[#c0392b]"
              : "bg-[#eef6fd] text-[#1d6fa5]";

          return (
            <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${badgeClass}`}>
              {row.status || "-"}
            </span>
          );
        },
      },
      {
        name: "Action",
        center: true,
        width: "120px",
        cell: (row) => (
          <span className="inline-flex items-center gap-2">
            {row.canEdit ? (
              <button
                type="button"
                title="Edit"
                onClick={() => navigate(`/trade-union-master-list/edit-trade-union/${row.id}`)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#eef6fd] text-[#1d6fa5]"
              >
                <FaPencilAlt />
              </button>
            ) : null}
            <button
              type="button"
              title="View"
              onClick={() => navigate(`/trade-union-master-list/view-trade-union/${row.id}`)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#eef6fd] text-[#1d6fa5]"
            >
              <FaEye />
            </button>
          </span>
        ),
      },
    ],
    [],
  );

  const tableStyles = {
    table: {
      style: {
        border: "1px solid #d2d6de",
      },
    },
    headCells: {
      style: {
        background: "#3c8dbc",
        color: "#ffffff",
        fontWeight: 500,
        fontSize: "13px",
        borderRight: "1px solid #2f6f92",
        minHeight: "42px",
      },
    },
    rows: {
      style: {
        minHeight: "44px",
        borderBottom: "1px solid #e5e7eb",
        fontSize: "13px",
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f8fbff",
        outline: "none",
      },
    },
    cells: {
      style: {
        borderRight: "1px solid #e5e7eb",
        paddingTop: "10px",
        paddingBottom: "10px",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #e5e7eb",
        minHeight: "48px",
      },
    },
  };

  return (
    <div className="min-h-screen font-['Source_Sans_Pro']">
      <h1 className="max-w-6xl mx-auto mt-1 mb-2 text-[24px] font-medium opacity-90">
        Trade Union Master List
      </h1>

      <div className="max-w-6xl mx-auto py-3">
        <div className="relative rounded-[3px] bg-white border-t-[3px] border-t-[#3c8dbc] mb-5 w-full shadow">
          <div className="rounded-t-none rounded-b-[3px] p-[10px] overflow-hidden">
            <Formik initialValues={initialValues} onSubmit={handleSubmit}>
              {({ isSubmitting, resetForm }) => (
                <Form className="px-[15px]">
                  <div className="grid grid-cols-1 min-[768px]:grid-cols-3 gap-4">
                    <div className="my-[14px]">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        District
                      </label>
                      <Field
                        as="select"
                        name="district"
                        className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                      >
                        <option value="">- Select -</option>
                        {districts.map((d) => (
                          <option key={d.districtCode} value={String(d.districtCode)}>
                            {d.districtName}
                          </option>
                        ))}
                      </Field>
                    </div>

                    <div className="my-[14px]">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Trade Union Number
                      </label>
                      <Field
                        type="text"
                        name="tu_number"
                        className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                      />
                    </div>

                    <div className="my-[14px]">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Trade Union Name
                      </label>
                      <Field
                        type="text"
                        name="tu_name"
                        className="w-full px-[12px] py-[6px] h-[34px] border border-[#d2d6de] bg-white focus:border-[#3c8dbc] rounded-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="px-[12px] py-[6px] text-[14px] bg-[#3c8dbc] h-[34px] hover:bg-[#357ca5] text-white font-normal uppercase rounded-none shadow-md disabled:opacity-60"
                    >
                      {loading ? "Searching..." : "Search"}
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting || loading}
                      onClick={async () => {
                        resetForm();
                        setFilters(initialValues);
                        await fetchMasterList(initialValues, 1, perPage);
                      }}
                      className="px-[12px] py-[6px] text-[14px] bg-[#f39c12] h-[34px] hover:bg-[#d8890f] text-white font-normal uppercase rounded-none shadow-md disabled:opacity-60"
                    >
                      Reset
                    </button>
                  </div>
                  {errorMsg ? (
                    <p className="text-red-600 text-sm mt-3">{errorMsg}</p>
                  ) : null}
                </Form>
              )}
            </Formik>
          </div>
        </div>

        <div className="relative rounded-[3px] bg-white border-t-[3px] border-t-[#3c8dbc] mb-5 w-full shadow">
          <div className="rounded-t-none rounded-b-[3px] p-[10px] overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-normal text-gray-700">
                Trade Union Information
              </label>
              <Link
                to="/trade-union-master-list/add-trade-union"
                className="px-3 py-1 text-sm bg-[#3c8dbc] text-white rounded-[3px]"
              >
                Add New
              </Link>
            </div>

            <DataTable
              columns={columns}
              data={rows}
              progressPending={loading}
              noDataComponent="No data found!"
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationPerPage={perPage}
              paginationDefaultPage={currentPage}
              paginationRowsPerPageOptions={[
                10, 20, 50, 100,
              ]}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={
                handlePerRowsChange
              }
              highlightOnHover
              striped
              dense
              customStyles={tableStyles}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MastersList;
