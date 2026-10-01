import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";
import { Eye } from "lucide-react";
import DataTable, { TableColumn } from "react-data-table-component";

interface WageRow {
  // id: number;
  type: string;
  title: string;
  month?: string | null;
  year?: string | number | null;
  monthint?: number | null;
  fileUrl?: string | null;
  synopsisUrl?: string | null;
  isNew?: boolean;
  name?: string;
  pdf?: string;
}

// ------------------
// COMPONENT
// ------------------
const MinWagesAct: FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [allCPIData, setAllCPIData] = useState<WageRow[]>([]);

  const [scheduledEmploymentsData, setScheduledEmploymentsData] = useState<
    WageRow[]
  >([]);
  const [otherMinimumWagesData, setOtherMinimumWagesData] = useState<WageRow[]>(
    [],
  );
  const [filteredScheduledData, setFilteredScheduledData] = useState<WageRow[]>(
    [],
  );

  const [filteredOtherData, setFilteredOtherData] = useState<WageRow[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");

  const columns: TableColumn<WageRow>[] = [
    {
      name: "SL NO.",
      width: "100px",
      cell: (_row, index) => (page - 1) * limit + ((index ?? 0) + 1),
    },
    {
      name: "NAME",
      cell: (row) => (
        <div className="">
          <span>{row.title}</span>

          {row.isNew && (
            <div className="absolute top-[21%] left-[70%] rotate-[7deg] animate-blink">
              <span className="text-white text-[9px] font-bold px-4 shadow-md tracking-wide bg-red-600">
                NEW
              </span>
            </div>
          )}
        </div>
      ),
      wrap: true,
      grow: 3,
    },
    {
      name: "",
      width: "100px",
      cell: (row) => (
        <button
          onClick={() => {
            if (row.type === "static") {
              //console.log(row.fileUrl);

              if (row.fileUrl) {
                window.open(row.fileUrl, "_blank");
              }
            } else if (row.type === "dynamic" || row.type === "legacy") {
              // navigate to detail page
              navigate("/synopsys", {
                state: {
                  month: row.month,
                  year: row.year,
                  type: row.type,
                },
              });
            }
          }}
          className="flex justify-center w-full"
        >
          {row.type === "static" ? (
            <img
              src={`${IMAGE_BASE}pdf.png`}
              alt="pdf"
              className="w-6 cursor-pointer"
            />
          ) : (
            <Eye size={14} />
          )}
        </button>
      ),
      center: true,
    },
  ];

  useEffect(() => {
    const fetchAnnualReturns = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE}minimum-wages/get-minimum-wages-list`,
        );
        const result = await response.json();

        const formattedData: WageRow[] = result?.map(
          (item: any, index: number) => ({
            id: index + 1,
            type: item.type,
            title: item.title,
            month: item.month,
            year: item.year,
            monthint: item.monthint,
            fileUrl: item.fileUrl,
            synopsisUrl: item.synopsisUrl,
            isNew: item.isNew,
            name: item.title,
            pdf: item.fileUrl || "",
          }),
        );

        const scheduledEmployments = formattedData.filter((item) =>
          item.title?.includes(
            "Minimum Rates of Wages in Scheduled Employments in West Bengal",
          ),
        );

        const otherMinimumWages = formattedData.filter(
          (item) =>
            !item.title?.includes(
              "Minimum Rates of Wages in Scheduled Employments in West Bengal",
            ),
        );

        setScheduledEmploymentsData(scheduledEmployments);
        setFilteredScheduledData(scheduledEmployments);

        setOtherMinimumWagesData(otherMinimumWages);
        setFilteredOtherData(otherMinimumWages);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnualReturns();

    const fetchAllCPI = async () => {
      setAllCPIData([]);
      const response = await fetch(`${API_BASE}minimum-wages/get-cpi-list`, {
        // headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${token}`,
        // },
      });

      const result = await response.json();
      setAllCPIData(result);
    };
    fetchAllCPI();
  }, []);

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredScheduledData(scheduledEmploymentsData);
      setFilteredOtherData(otherMinimumWagesData);
    } else {
      const filteredScheduled = scheduledEmploymentsData.filter((item) =>
        item.title?.toLowerCase().includes(searchText.toLowerCase()),
      );

      const filteredOther = otherMinimumWagesData.filter((item) =>
        item.title?.toLowerCase().includes(searchText.toLowerCase()),
      );

      setFilteredScheduledData(filteredScheduled);
      setFilteredOtherData(filteredOther);
    }

    setPage(1);
  }, [searchText, scheduledEmploymentsData, otherMinimumWagesData]);

  return (
    <div className="p-5">
      <h1 className="text-3xl italic text-gray-700 mb-4">Minimum Wages Act</h1>

      <div className="flex justify-end mb-3">
        <input
          type="text"
          placeholder="Search..."
          className="border px-2 py-1 w-72 border-[#111] text-sm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* First table to display scheduled employments */}
      <h1 className="text-2xl italic text-gray-700 mb-3">
        Minimum Rates of Wages in Scheduled Employments in West Bengal
      </h1>

      <DataTable
        columns={columns}
        data={filteredScheduledData}
        striped
        highlightOnHover
        dense
        pagination
        paginationPerPage={limit}
        onChangePage={(p) => setPage(p)}
        onChangeRowsPerPage={(newLimit, p) => {
          setLimit(newLimit);
          setPage(p);
        }}
        customStyles={{
          headCells: {
            style: {
              fontWeight: "bold",
              fontSize: "13px",
              backgroundColor: "#3a2310",
              color: "#fff",
            },
          },
          cells: {
            style: {
              width: "100%",
              position: "relative",
              borderRight: "1px solid #3a2310",
              borderBottom: "1px solid #55351a",
            },
          },
          rows: {
            style: {
              fontSize: "13px",
              borderLeft: "1px solid #55351a",
            },
          },
        }}
      />

      {/* Second table to display other minimum wages */}
      <h1 className="text-2xl italic text-gray-700 mt-8 mb-3">
        Other Minimum Wages
      </h1>

      <DataTable
        columns={columns}
        data={filteredOtherData}
        striped
        highlightOnHover
        dense
        pagination
        paginationPerPage={limit}
        onChangePage={(p) => setPage(p)}
        onChangeRowsPerPage={(newLimit, p) => {
          setLimit(newLimit);
          setPage(p);
        }}
        customStyles={{
          headCells: {
            style: {
              fontWeight: "bold",
              fontSize: "13px",
              backgroundColor: "#3a2310",
              color: "#fff",
            },
          },
          cells: {
            style: {
              width: "100%",
              position: "relative",
              borderRight: "1px solid #3a2310",
              borderBottom: "1px solid #55351a",
            },
          },
          rows: {
            style: {
              fontSize: "13px",
              borderLeft: "1px solid #55351a",
            },
          },
        }}
      />

      <h1 className="text-3xl italic text-gray-700 mb-4">CPI</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {allCPIData.slice(0, 12).map((each, index) => (
          <li
            onClick={() => {
              if (each.fileUrl) {
                window.open(each.fileUrl, "_blank");
              }
            }}
            key={index}
            style={{
              backgroundImage: "url('/images/cpi-pdf.png')",
              backgroundPosition: "center 25px",
            }}
            className="relative w-[162px] h-[185px] py-[15px] mr-[25px] mb-[25px] border border-[#bdbdbd] text-center bg-white bg-no-repeat bg-position-[center_25px]"
          >
            {each.isNew && (
              <div className="absolute top-[30px] left-[85px] rotate-[-10deg] animate-blink">
                <span className="text-white text-[9px] font-bold px-4 shadow-md tracking-wide">
                  NEW
                </span>
              </div>
            )}
            <h1 className="text-[#f4382b] mt-10 text-[24px] font-bold uppercase">
              CPI
            </h1>

            <p className="text-black text-[16px] font-normal mb-2.5">
              {each.month}
              <br />
              {each.year}
            </p>
          </li>
        ))}
      </ul>

      {allCPIData.length > 12 && (
        <div className="text-center mt-4">
          <button
            onClick={() =>
              navigate("/cpi-information", {
                state: {
                  allCPI: allCPIData,
                },
              })
            }
            className="px-4 py-2 bg-[#3a2310] text-white text-sm rounded"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};

export default MinWagesAct;
