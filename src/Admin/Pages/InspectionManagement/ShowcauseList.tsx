import { IMAGE_BASE } from "@/constants/constants";
import { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";

/* ----------------------------------------------
   BULLET STYLE DETECTION
---------------------------------------------- */
const detectStyle = (label: string) => {
  const upper = label.toUpperCase();

  if (
    upper.includes("FULL COMPLIANCE") ||
    upper.includes("PARTIAL/NO COMPLIANCE") ||
    upper.includes("SHOWCAUSE") ||
    upper.includes("COURTCASE") ||
    upper.includes("APPROVED")
  ) {
    return { colorClass: "text-pink-700 font-semibold", warning: false };
  }

  if (
    upper.includes("GENERATE") ||
    upper.includes("UPLOAD") ||
    upper.includes("CLICK") ||
    upper.includes("VERIFICATION")
  ) {
    return { colorClass: "text-green-700 font-semibold", warning: false };
  }

  if (
    upper.includes("OVER") ||
    upper.includes("ANOTHER DATE") ||
    upper.includes("REQUIRES") ||
    upper.includes("EXPIRED")
  ) {
    return { colorClass: "text-red-700 font-semibold", warning: true };
  }

  return { colorClass: "text-gray-800", warning: false };
};

/* ----------------------------------------------
   TYPES
---------------------------------------------- */
type BulletItem = { label: string };

type ShowCauseRow = {
  id: string;
  date?: string;
  establishment: string;
  showCauseItems: BulletItem[];
};

/* ----------------------------------------------
   DATA
---------------------------------------------- */

/* ----------------------------------------------
   CELL COMPONENT
---------------------------------------------- */
const ShowCauseListCell = ({ items }: { items: BulletItem[] }) => {
  if (!items.length) return <span className="text-gray-400 text-xs">—</span>;

  return (
    <div className="flex flex-col gap-1 leading-tight">
      {items.map((item, i) => {
        const style = detectStyle(item.label);
        return (
          <div key={i} className="flex items-start text-[12px]">
            <img
              src={
                style.warning
                  ? `${IMAGE_BASE}alert-icon.png`
                  : `${IMAGE_BASE}bullet-green.png`
              }
              className="w-3 h-3 mr-2 mt-0.5"
            />
            <span className={style.colorClass}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ----------------------------------------------
   COLUMNS
---------------------------------------------- */
const columns: TableColumn<ShowCauseRow>[] = [
  {
    name: "FILE NO./DATE",
    selector: row => row.id,
    sortable: true,
    grow: 1.2,
    cell: row => (
      <div className="text-xs">
        {row.id}
        {row.date && <div className="text-gray-500">{row.date}</div>}
      </div>
    )
  },
  {
    name: "NAME OF THE ESTABLISHMENT/INDUSTRY/SHOP",
    selector: row => row.establishment,
    sortable: true,
    grow: 2,
    cell: row => <div className="text-[13px]">{row.establishment}</div>
  },
  {
    name: "SHOW CAUSE/LET OFF",
    selector: row => row.showCauseItems.map(s => s.label).join(" "),
    sortable: true,
    grow: 2.5,
    cell: row => <ShowCauseListCell items={row.showCauseItems} />
  }
];

/* ----------------------------------------------
   MAIN COMPONENT WITH SEARCH ADDED
---------------------------------------------- */
export default function ShowcauseList() {
  const [search, setSearch] = useState<string>("");
  const [filteredRows, setFilteredRows] = useState<ShowCauseRow[]>([]);

  const handleSearch = (value: string) => {
    setSearch(value);
    const lower = value.toLowerCase();
  };

  return (
    <div className="bg-white border rounded shadow-sm p-3">
      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={search}
          placeholder="Search..."
          onChange={e => handleSearch(e.target.value)}
          className="border px-3 py-1.5 rounded w-64 text-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        pagination
        striped
        dense
        highlightOnHover
        responsive
        customStyles={{
          headCells: {
            style: {
              background: "#1E73BE",
              color: "white",
              fontSize: "12px",
              fontWeight: 600,
              borderRight: "1px solid #c9c9c9"
            }
          },
          cells: {
            style: {
              paddingTop: "8px",
              paddingBottom: "8px",
              fontSize: "13px",
              borderRight: "1px solid #c9c9c9"
            }
          }
        }}
      />
    </div>
  );
}
