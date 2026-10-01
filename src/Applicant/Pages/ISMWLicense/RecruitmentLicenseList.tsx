import { FC, useEffect, useState, useMemo } from "react";
import DataTable, {
  TableColumn,
  TableStyles,
} from "react-data-table-component";
import { toast } from "react-toastify";
import {
  fetchIsmwApplications,
  type IsmwApplicationRow,
} from "./ismwLicenseApi";

const fmtDate = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const customStyles: TableStyles = {
  headRow: { style: { backgroundColor: "#2b5d87", minHeight: "42px" } },
  headCells: {
    style: {
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: 500,
      borderRight: "1px solid #ffffff",
      textTransform: "uppercase",
      padding: "8px 12px",
    },
  },
  rows: { style: { minHeight: "40px", borderBottom: "1px solid #e5e7eb" } },
  cells: { style: { fontSize: "13px", borderRight: "1px solid #e5e7eb" } },
};

const RecruitementLicenseList: FC = () => {
  const [data, setData] = useState<IsmwApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchIsmwApplications("REC")
      .then((rows) => !cancelled && setData(rows))
      .catch((err) => {
        const message = err?.response?.data?.message;
        toast.error(
          Array.isArray(message)
            ? message[0]
            : message || "Failed to load recruitment license list."
        );
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredData = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((row) =>
      [
        row.formSixRec,
        row.formSix,
        row.contractor.name,
        row.establishment.registrationNumber,
        row.status,
        row.service,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(lower)
    );
  }, [search, data]);

  const columns: TableColumn<IsmwApplicationRow>[] = [
    { name: "SL.", selector: (_r, i) => (i ?? 0) + 1, width: "60px" },
    {
      name: "FORM-VI",
      selector: (row) => row.formSixRec || row.formSix || "—",
      sortable: true,
      width: "110px",
    },
    {
      name: "CONTRACTOR / APPLY DATE",
      cell: (row) => (
        <div className="py-1">
          <div className="font-semibold">{row.contractor.name || "—"}</div>
          <div className="text-xs text-gray-500">
            {fmtDate(row.contractor.applicationDate) || "Not submitted"}
          </div>
        </div>
      ),
      wrap: true,
      grow: 1.6,
    },
    {
      name: "PRINCIPAL EMPLOYER REG.",
      cell: (row) => (
        <div className="py-1">
          <div>{row.establishment.registrationNumber || "—"}</div>
          {row.establishment.issuedOn && (
            <div className="text-xs text-gray-500">
              Reg. {fmtDate(row.establishment.issuedOn)}
            </div>
          )}
        </div>
      ),
      wrap: true,
      grow: 1.8,
    },
    {
      name: "LICENSE DETAILS",
      cell: (row) =>
        typeof row.license === "string" ? (
          <span className="text-gray-500">{row.license}</span>
        ) : (
          <div className="py-1">
            <div className="font-semibold">{row.license.licenseNumber}</div>
            <div className="text-xs text-gray-500">
              {fmtDate(row.license.issuedOn)} – {fmtDate(row.license.validTill)}
            </div>
          </div>
        ),
      wrap: true,
      grow: 1.5,
    },
    { name: "SERVICE", selector: (row) => row.service ?? "", grow: 1 },
    {
      name: "STATUS",
      cell: (row) => (
        <span className="inline-block px-2 py-0.5 rounded bg-[#eaf2f8] text-[#2c5f8a] text-xs font-semibold">
          {row.status}
        </span>
      ),
      grow: 1.2,
    },
    {
      name: "ACTION",
      cell: (row) => {
        const enabled = Object.entries(row.actions || {})
          .filter(([, v]) => v)
          .map(([k]) => k);
        if (!enabled.length) return <span className="text-gray-400">—</span>;
        return (
          <div className="flex flex-col gap-0.5 text-xs text-blue-600">
            {enabled.map((a) => (
              <span key={a} className="capitalize">
                {a.replace(/([A-Z])/g, " $1").trim()}
              </span>
            ))}
          </div>
        );
      },
      grow: 1.2,
    },
  ];

  return (
    <div className="w-full bg-[#ecf0f1] min-h-screen">
      <div className="bg-white border-b border-gray-300 shadow-sm mb-3">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 px-6 py-4 tracking-wide">
          Recruitment license list
        </h1>
      </div>
      <div className="bg-white rounded shadow border border-gray-300">
        <div className="bg-[#2c5f8a] text-white px-4 py-2 font-semibold text-sm uppercase">
          Inter-State Migrant Workmen License List for Recruitment
        </div>

        <div className="p-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="border px-3 py-1.5 rounded text-sm w-64"
          />
        </div>

        <div className="px-3 pb-3">
          <DataTable
            columns={columns}
            data={filteredData}
            striped
            dense
            responsive
            customStyles={customStyles}
            pagination
            progressPending={loading}
            persistTableHead
            noDataComponent={
              <div className="py-4 text-sm text-gray-500 w-full text-left px-3">
                No applications found.
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default RecruitementLicenseList;
