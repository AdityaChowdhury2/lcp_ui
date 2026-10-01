import { IMAGE_BASE } from "@/constants/constants";
import { memo } from 'react';
import DataTable, { TableColumn } from "react-data-table-component";
import { IoIosArrowDroprightCircle } from 'react-icons/io';
import ClraRegDashboardTabs from './ClraRegDashboardTabs';
import { useNavigate } from 'react-router-dom';
import { FaPrint } from "react-icons/fa";
import ClraRegDashboardTabsContractorAdded from './ClraRegDashboardTabsContractorAdded';

const ExcelIcon = `${IMAGE_BASE}excel-icon.png`;

interface RowData {
  id: number;
  regNo: string;
  regDate: string;
  establishment: string;
  service: string;
  status: string;
}

const data: RowData[] = [
  {
    id: 1,
    regNo: "HWH05/CLR/000883",
    regDate: "08th Jul 2024",
    establishment: "CHAYNA ENTERPRISE",
    service: "CLRA REG AMENDMENT",
    status: "Issued",
  },

];

const ClraRegViewContractInfoContractorAdded = () => {
  const navigate = useNavigate()
  const columns: TableColumn<RowData>[] = [
    {
      name: "Sl. No",
      selector: (row) => row.id,
      width: "80px",
    },
    {
      name: "Contractor Name License Number",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold">{row.regNo}</span>
          <span className="text-sm">{row.regDate}</span>
        </div>
      ),
      wrap: true,
    },
    {
      name: "Nature of Work",
      selector: (row) => row.establishment,
      wrap: true,
    },
    {
      name: "Duration of Contract",
      selector: (row) => row.service,
      wrap: true,
    },
    {
      name: "No. of Contract Labour",
      selector: (row) => row.service,
      wrap: true,
    },
    {
      name: "Status",
      width: "150px",
      selector: (row) => row.status,
      cell: (row) => (
        row.status === "Approved" ?
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
            row.status === "Fees Paid" ?
              <img
                src={`${IMAGE_BASE}btn-fees-paid.png`}
                alt="logo"
                className="object-contain"
              /> :
              row.status === "Fees Pending" ?
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
                          row.status === "Forwarded" &&
                          <img
                            src={`${IMAGE_BASE}btn-to-alc.png`}
                            alt="logo"
                            className="object-contain"
                          />
      ),
    },

    {
      name: "View & Download",
      width: "230px",
      cell: () => (
        <div className="flex flex-col gap-1 text-blue-600 text-xs font-medium">
          <a href="#" className="hover:text-blue-800 flex gap-1"><IoIosArrowDroprightCircle /> View Details</a>
          <a href="#" className="hover:text-blue-800 flex gap-1"><IoIosArrowDroprightCircle /> View Remarks</a>
          <a href="#" className="hover:text-blue-800 flex gap-1"><IoIosArrowDroprightCircle /> Download Certificate</a>
          <a href="#" className="text-gray-400 flex gap-1 cursor-not-allowed"><IoIosArrowDroprightCircle /> Download Form-V</a>
          <a href="#" className="hover:text-blue-800 flex gap-1"><IoIosArrowDroprightCircle /> Download Acknowledgement</a>
        </div>
      ),
      grow: 2,
    },
  ];


  return (
    <div>
      <div className="bg-white border rounded shadow mx-4 mb-8">
        <div className="bg-gray-100 p-4 border-b">
          <h1 className="text-xl font-semibold text-gray-900">
            CONTRACTOR INFORMATION
          </h1>
        </div>
        {/* Tabs When clicked 'Back To Contractor' from Add To Contractor page */}
        <ClraRegDashboardTabsContractorAdded />
        <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
          CONTRACTOR LIST
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            //   onClick={handleDownloadExcel}
            className="text-[#337ab7] flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 font-medium py-2 px-6 rounded shadow-sm transition"
          >
            <img src={ExcelIcon} alt="Excel" className="h-5 w-5" />
            Download Excel
          </button>


          <button
            //   onClick={handlePrint}
            className="text-[#337ab7] flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 font-medium py-2 px-6 rounded shadow-sm transition"
          >

            <FaPrint className="h-5 w-5" />
            Print
          </button>
        </div>


        {/* Content */}
        <div className="p-6 text-sm">
          {/* Row 1 */}
          <DataTable
            columns={columns}
            data={data}
            striped
            highlightOnHover
            responsive
            customStyles={{
              headRow: {
                style: {
                  backgroundColor: "#2b5f88",
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: "13px",
                },
              },
              headCells: {
                style: {
                  borderRight: "1px solid #e5e7eb",
                  whiteSpace: "normal",
                },
              },
              rows: {
                style: {
                  fontSize: "13px",
                },
              },
              cells: {
                style: {
                  borderRight: "1px solid #e5e7eb",
                  alignItems: "flex-start",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                },
              },
            }}
          />
        </div>

        {/* Row 5 */}
      </div>
    </div>

  );
};

export default ClraRegViewContractInfoContractorAdded;