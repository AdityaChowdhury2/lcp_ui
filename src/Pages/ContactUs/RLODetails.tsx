// src/Pages/DeputyCommissionerDetails.tsx

import React, { useState, useMemo } from "react";
import DataTable, { TableColumn } from "react-data-table-component";

//
// -------------------- DATA SECTION (OUTSIDE JSX) --------------------
//

// Upper Table Details
const officeDetails = {
  address: "DOOARS KANYA, 5TH FLOOR, ALIPURDUAR, PIN-736122",
  district: "Alipurduar",
  subdivision: "Alipurduar",
  pincode: "Not available",
  email: "dlcapdrlo[at]gmail[dot]com",
};

// Officer Table Columns
const officerColumns: TableColumn<any>[] = [
  {
    name: "SL. NO.",
    selector: (row) => row.sl,
    width: "90px",
    center: true,
  },
  {
    name: "NAME",
    selector: (row) => row.name,
    wrap: true,
  },
  {
    name: "DESIGNATION",
    selector: (row) => row.designation,
    wrap: true,
  },
  {
    name: "OFFICE POSTING",
    selector: (row) => row.officePosting,
    wrap: true,
  },
  {
    name: "EMAIL ADDRESS",
    selector: (row) => row.email,
    wrap: true,
  },
  {
    name: "MOBILE",
    selector: (row) => row.mobile,
    wrap: true,
  },
];

// Officer Table Data
const officerData = [
  {
    sl: 1,
    name: "PRADEEP TAMANG",
    designation: "ALC",
    officePosting: "Alipurduar",
    email: "dlcapdrlo[at]gmail[dot]com",
    mobile: "7603091359",
  },
  {
    sl: 2,
    name: "SUBHAJIT SAHA",
    designation: "INSPECTOR",
    officePosting: "RLO Alipurduar",
    email: "",
    mobile: "9679154254",
  },
  {
    sl: 3,
    name: "USHA MARY KERKETTA",
    designation: "",
    officePosting: "Alipurduar",
    email: "",
    mobile: "7603091575",
  },
  {
    sl: 4,
    name: "ISWAR CHANDRA BARMAN",
    designation: "INSPECTOR",
    officePosting: "Alipurduar - II",
    email: "lwfc[dot]apd2[at]gmail[dot]com",
    mobile: "8250422801",
  },
  {
    sl: 5,
    name: "SUBRATA BISWAS",
    designation: "INSPECTOR",
    officePosting: "Alipurduar - I",
    email: "",
    mobile: "7603091508",
  },
  {
    sl: 6,
    name: "SHOUVIK KARMAKAR",
    designation: "",
    officePosting: "Kumargram",
    email: "",
    mobile: "7003858148",
  },
];

//
// -------------------- MAIN COMPONENT --------------------
//

export default function RLODetails() {
  const [activeTab, setActiveTab] = useState("aboutoffice");

  return (
    <div className="w-full px-50 py-8">
      <h1 className="text-3xl font-semibold mb-6 tracking-wide">
        OFFICE OF THE DEPUTY LABOUR COMMISSIONER, ALIPURDUAR
      </h1>

      {/* UPPER INFORMATION TABLE */}
      <div className="border border-gray-300">
        {[
          ["Office Address", officeDetails.address],
          ["District", officeDetails.district],
          ["Sub division", officeDetails.subdivision],
          ["Pin Code", officeDetails.pincode],
          ["Email Address", officeDetails.email],
        ].map(([title, value], index) => (
          <div
            key={index}
            className="grid grid-cols-2 border-b border-gray-300 last:border-b-0"
          >
            <div className="bg-gray-100 px-4 py-2 font-medium">{title}</div>
            <div className="px-4 py-2">{value}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="flex border-b mt-6">
        {["About Office", "Officers", "Gallery", "Map", "Others Activity"].map(
          (tab) => {
            const key = tab.toLowerCase().replace(" ", "");
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-2 border rounded-t-md mr-2 ${
                  activeTab === key
                    ? "bg-white text-black border-b-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {tab}
              </button>
            );
          }
        )}
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white border border-gray-300 p-4">

        {/* Officers Tab */}
        {activeTab === "officers" && (
          <>
            <h2 className="text-lg font-semibold mb-3">Officers</h2>

            <DataTable
              columns={officerColumns}
              data={officerData}
              pagination
              highlightOnHover
              dense
              customStyles={{
                tableWrapper: {
                  style: {
                    border: "1px solid #c6b8ae",
                  },
                },
                headRow: {
                  style: {
                    backgroundColor: "#4b3022",
                    color: "#fff",
                    borderBottom: "2px solid #c6b8ae",
                  },
                },
                headCells: {
                  style: {
                    padding: "12px 10px",
                    fontWeight: 700,
                    borderRight: "1px solid #c6b8ae",
                  },
                },
                rows: {
                  style: {
                    minHeight: "48px",
                    borderBottom: "1px solid #c6b8ae",
                  },
                },
                cells: {
                  style: {
                    padding: 5,
                    borderRight: "1px solid #c6b8ae",
                  },
                },
              }}
            />
          </>
        )}

        {/* Temporary empty content for other tabs */}
        {activeTab === "aboutoffice" && (
          <div className="text-gray-500"></div>
        )}
        {activeTab === "gallery" && (
          <div className="text-gray-500">Photo not available</div>
        )}
        {activeTab === "othersactivity" && (
          <div className="text-gray-500">Not Available</div>
        )}
        {activeTab === "map" && (
          <div className="text-gray-500">
            <div className="w-[100%]">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14736.925933867728!2d88.34487!3d22.570444!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0277a21c8ada0b%3A0x3d3f489186fa18a2!2sLabour%20Commissionerate!5e0!3m2!1sen!2sus!4v1764913412594!5m2!1sen!2sus" 
                width="100%" 
                height="400" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
