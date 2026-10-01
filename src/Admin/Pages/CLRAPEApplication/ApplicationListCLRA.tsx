import { IMAGE_BASE } from "@/constants/constants";
import { FC, useState, useEffect } from "react";
import { Eye } from "lucide-react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store/store";
import {
  fetchAlcClraList,
  selectAlcClraListState,
  type ClraListRow,
} from "@/store/alcClraListSlice";
import { getUserRole } from "@/utils/auth";


// ------------------
// TYPE DEFINITIONS
// ------------------
type TableRow = ClraListRow;

// ------------------------------------
// REUSABLE TAB PANEL (Typed)
// ------------------------------------
// interface TabPanelProps {
//   value: string;
//   children: React.ReactNode;
// }

// const TabPanel: FC<TabPanelProps> = ({ value, children }) => (
//   <TabsContent value={value}>
//     <div className="pt-2">{children}</div>
//   </TabsContent>
// );

// ------------------------------------
// MAIN COMPONENT
// ------------------------------------
const ApplicationListCLRA: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, meta } = useSelector(selectAlcClraListState);

  const [tabValue, setTabValue] = useState<string>("Pending");
  const [headerText, setHeaderText] = useState<string>("");
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [allTableData, setAllTableData] = useState<TableRow[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const userRole = Number(getUserRole());
  const serialOffset = (page - 1) * limit;

  const tableColumns: TableColumn<TableRow>[] = [
    {
      name: "SL NO.",
      width: "100px",
      selector: (_row: TableRow, index?: number) => serialOffset + (index ?? 0) + 1,
      cell: (_row: TableRow, index?: number) => (
        <div className="w-full">{serialOffset + (index ?? 0) + 1}</div>
      ),
      sortable: true,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>ID NUMBER</div>,
      minWidth: "200px",
      selector: (row: TableRow) => row.id_no,
      sortable: true,
      cell: (row: TableRow) =>
        <div className="grid gap-1">
          <p>{row.id_no}</p>
          {row?.id_no.toLowerCase().includes("AMEND".toLowerCase()) && <p className="text-amber-600">[AMENDMENT APPLICATION]</p>}
        </div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>REG NO. & DATE</div>,
      width: "180px",
      selector: (row: TableRow) => row.reg_no,
      sortable: true,
      cell: (row: TableRow) =>
        <div className="grid gap-1">
          <p className="font-semibold">{row.reg_no}</p>
          <p>{row.reg_date}</p>
        </div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>B/M/C/NA/SEZ</div>,
      minWidth: "150px",
      selector: (row: TableRow) => row.bmcnasez,
      sortable: true,
      cell: (row: TableRow) => <div>{row.bmcnasez}</div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>ESTABLISHMENT NAME</div>,
      minWidth: "200px",
      selector: (row: TableRow) => row.establishment,
      sortable: true,
      cell: (row: TableRow) => <div>{row.establishment}</div>,
    },
    {
      name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>APPLY DATE</div>,
      width: "130px",
      selector: (row: TableRow) => row.applydate,
      sortable: true,
      cell: (row: TableRow) => <div>{row.applydate}</div>,
    },
    {
      name: "STATUS",
      width: "150px",
      selector: (row: TableRow) => row.status,
      cell: (row: TableRow) => (
        row.status === "Approved" || row.status === "VA" ?
          <img
            src={`${IMAGE_BASE}btn-approved.png`}
            alt="logo"
            className="object-contain"
          /> :
          row.status === "Applied" ?
            <img
              src={`${IMAGE_BASE}btn-applied.png`}
              alt="logo"
              className="object-contain"
            /> :
            row.status === "Fees Paid" || row.status === "T" ?
              <img
                src={`${IMAGE_BASE}btn-fees-paid.png`}
                alt="logo"
                className="object-contain"
              /> :
              row.status === "Fees Pending" || row.status === "V" ?
                <img
                  src={`${IMAGE_BASE}btn-fees-pending.png`}
                  alt="logo"
                  className="object-contain"
                /> :
                row.status === "Pending" ?
                  <img
                    src={`${IMAGE_BASE}btn-applied.png`}
                    alt="logo"
                    className="object-contain"
                  /> :
                  row.status === "Final Submitted" ?
                    <img
                      src={`${IMAGE_BASE}btn-final-submit.png`}
                      alt="logo"
                      className="object-contain"
                    /> :
                    row.status === "Issued" ?
                      <img
                        src={`${IMAGE_BASE}btn-issued.png`}
                        alt="logo"
                        className="object-contain"
                      /> :
                      row.status === "Rectification" ?
                        <img
                          src={`${IMAGE_BASE}btn-rectification.png`}
                          alt="logo"
                          className="object-contain"
                        /> :
                        row.status === "Rejected" ?
                          <img
                            src={`${IMAGE_BASE}btn-reject.png`}
                            alt="logo"
                            className="object-contain"
                          /> :
                          row.status === "U" ?
                            <img
                              src={`${IMAGE_BASE}btn-rectify-signed-form.png`}
                              alt="logo"
                              className="object-contain"
                            /> :
                            row.status === "Forwarded" &&
                            <img
                              src={`${IMAGE_BASE}btn-to-alc.png`}
                              alt="logo"
                              className="object-contain"
                            />
      ),
    },
    {
      name: "ACTION",
      width: "140px",
      omit: userRole === 7,
      cell: (row: TableRow) => (
        <button
          className="bg-[#1E73BE] hover:bg-blue-700 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 whitespace-nowrap"
          onClick={() => row?.id_no.toLowerCase().includes("AMEND".toLowerCase()) ?
            navigate(`/alc-view-amended-application/${row.application_id}/${row.applicantUserId}`) :
            navigate(`/alc-visible-applications/${row.application_id}/${row.applicantUserId}`)}>
          <Eye size={16} /> View Details
        </button>
      ),
    },
  ];

  const tabHeaders: Record<string, string> = {
    All: "Application for Registration of Principal Employer under the Contract Labour (R&A) Act, 1970",
    Pending: "Pending Application for Registration of Principal Employer under the Contract Labour (R&A) Act, 1970",
    "Sent Back for Rectification": "Rectification Application for Registration of Principal Employer under the Contract Labour (R&A) Act, 1970",
    Forward: "Forwarded Application for Registration of Principal Employer under the Contract Labour (R&A) Act, 1970",
    "Final Submit": "Final Submitted Application for Registration of Principal Employer under the Contract Labour (R&A) Act, 1970",
    Issued: "Issued Application for Registration of Principal Employer under the Contract Labour (R&A) Act, 1970",
    Rejected: "Rejected Application for Registration of Principal Employer under the Contract Labour (R&A) Act, 1970",
  };

  const tabValueStatusCode: Record<string, number> = {
    All: 6,
    Pending: 0,
    "Sent Back for Rectification": 1,
    Forward: 2,
    "Final Submit": 3,
    Issued: 4,
    Rejected: 5,
  };

  useEffect(() => {
    setHeaderText(tabHeaders[tabValue] || "");
    const statusCode = tabValueStatusCode[tabValue];
    if (statusCode === undefined) return;
    dispatch(fetchAlcClraList({ statusCode, page, limit }));
  }, [dispatch, tabValue, page, limit]);

  useEffect(() => {
    setAllTableData(items);
  }, [items]);

  // filtering data for search
  useEffect(() => {
    // Apply search on baseData
    if (searchText.trim() === "") {
      setTableData(allTableData);
    } else {
      const filteredData = allTableData.filter((item) =>
        item.id_no?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.reg_no?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.bmcnasez?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.establishment?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.applydate?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.status?.toLowerCase().includes(searchText.toLowerCase())
      );

      setTableData(filteredData);
    }
  }, [searchText, tabValue, allTableData]);

  return (
    <div className="overflow-x-auto">
      {/* HEADER */}
      <h1 className="text-2xl mb-4 text-gray-800">
        {headerText}
      </h1>

      <div style={{ backgroundColor: "#fff", padding: "10px" }}>
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 mb-2 w-80"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* ----------------------------
            PURE HTML TAB HEADERS
        ----------------------------- */}
        <div className="flex gap-0 border-b border-gray-300 bg-white justify-start p-0">
          {Object.keys(tabHeaders).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setTabValue(tab);
                setPage(1);
              }}
              className={`
                px-5 py-2 text-sm font-medium rounded-none border-b-2 transition-all
                ${tabValue === tab
                  ? "border-[#1E73BE] text-gray-800 bg-white"
                  : "border-transparent text-[#F2A33C] hover:text-blue-500"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ----------------------------
            PURE HTML TAB PANELS
        ----------------------------- */}
        {Object.keys(tabHeaders).map((tab) =>
          tabValue === tab ? (
            <div key={tab} className="pt-2 mb-2 overflow-x-auto">
              <DataTable
                columns={tableColumns}
                data={tableData || []}
                progressPending={loading}
                pagination
                paginationServer
                paginationTotalRows={meta.total}
                paginationPerPage={limit}
                paginationDefaultPage={page}
                paginationRowsPerPageOptions={[10, 20, 50]}
                onChangePage={(currentPage) => setPage(currentPage)}
                onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                  setLimit(currentRowsPerPage);
                  setPage(currentPage);
                }}
                striped
                highlightOnHover
                dense
                noDataComponent="No applications found"
                customStyles={{
                  headCells: {
                    style: {
                      background: "#3C8DBC",
                      color: "white",
                      fontWeight: "200",
                      fontSize: "12px",
                      borderRight: "1px solid #c9c9c9",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflow: "visible",
                      lineHeight: "1.2",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                    },
                  },
                  rows: {
                    style: {
                      fontSize: "12px",
                      borderBottom: "1px solid #e5e7eb",
                    },
                  },
                  cells: {
                    style: {
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      borderRight: "1px solid #e5e7eb",
                    },
                  },
                }}
                conditionalRowStyles={[
                  {
                    when: (row) => row.highlight === true,
                    style: {
                      backgroundColor: "#e3994bff",
                    },
                  },
                ]}
              />
            </div>
          ) : null
        )}

      </div>
    </div>
  );
};

export default ApplicationListCLRA;
