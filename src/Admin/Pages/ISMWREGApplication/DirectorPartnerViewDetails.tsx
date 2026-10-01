import { FC, useState, useEffect, useMemo, ReactElement } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
// import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { IoInformationCircle } from "react-icons/io5";
import { Dialog, DialogContent } from "../../../Components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "../../../Components/ui/table";
import { X } from "lucide-react";
import { getAuthToken, getUserId } from "../../../utils/auth";
import { useParams } from "react-router-dom";
import { API_BASE } from "@/constants/constants";

// ------------------
// TYPE DEFINITIONS
// ------------------
interface TableRow {
  name: string;
  designation: string;
  contact_details: string | ReactElement;
  highlight?: boolean;
  raw: any;
}

// ------------------------------------
// MAIN COMPONENT
// ------------------------------------
const DirectorPartnerViewDetails: FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { personType } = useParams<{ personType: string }>();
  const alcUserId = getUserId();
  
  const [tableData, setTableData] = useState<any>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  const [distCode, setDistCode] = useState<string | number | null>();
  const [subDivCode, setSubDivCode] = useState<string | number | null>();
  const [distName, setDistName] = useState<string | null>();
  const [subDivName, setSubDivName] = useState<string | null>();
  const [areaTypeCode, setAreaTypeCode] = useState<string | null>();
  const [blockCode, setBlockCode] = useState<string | number | null>();
  const [blockName, setBlockName] = useState<string | null>();
  const [villageWardCode, setVillageWardCode] = useState<string | number | null>();
  const [villageWardName, setVillageWardName] = useState<string | null>();
  const [policeStationCode, setPoliceStationCode] = useState<string | null>();
  const [policeStationName, setPoliceStationName] = useState<string | null>();
  const [pinCode, setPinCode] = useState<string | number | null>();

  // DEMO DATA (typed)
  // const demoTableData: TableRow[] = [
  //   {
  //       name: "Deepak Babulal Kharwad",
  //       designation: "Director",
  //       contact_details: 
  //       <div>
  //           <p>Email : soumajit.chowdhury@karkinos.in</p>
  //           <p>Contact : 8697935126</p>
  //       </div>,
  //   },
  // ];

  // const directorData = {
  //   name: "Deepak Babulal Kharwad",
  //   fatherName: "Not Applicable",
  //   designation: "Director",
  //   address:
  //   <div className="text-wrap break-words">
  //       804, Parvati, Heritage, Cama Lane, Opp Jolly Gymkhana, Ghatkopar, Mumbai MH 400086 Maharashtra
  //   </div>,
  //   email: "soumajit.chowdhury@karkinos.in",
  //   contact: "8697935126",
  // };


  // ------------------------------------
  // TABLE COLUMNS (typed)
  // ------------------------------------
  const tableColumns: TableColumn<TableRow>[] = [
  {
    name: "SL NO.",
    width: "100px",
    selector: (_row: TableRow, index?: number) => (index ?? 0) + 1,
    cell: (_row: TableRow, index?: number) => (
      <div className="w-full">{(index ?? 0) + 1}</div>
    ),
    sortable: true,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>NAME</div>,
    width: "350px",
    selector: (row: TableRow) => row.name,
    sortable: true,
    cell: (row: TableRow) => <div>{row.name}</div>,
  },
  {
    name: "DESIGNATION",
    minWidth: "200px",
    selector: (row: TableRow) => row.designation,
    cell: (row: TableRow) => <div>{row.designation}</div>,
  },
  {
    name: <div style={{ whiteSpace: "normal", wordBreak: "normal", overflowWrap: "normal", }}>CONTACT DETAILS</div>,
    width: "350px",
    cell: (row: TableRow) => <div>{row.contact_details}</div>,
  },
  {
    name: "ACTIONS",
    width: "150px",
    cell: (row: any) => (
      <button 
        className="flex gap-1 bg-blue-400 text-white hover:bg-blue-500 rounded-sm px-2 py-1" 
        onClick={() => {
          setSelectedPerson(row.raw);
          setDistCode(personType!=="CONTRACTOR" ? row.raw?.district_code : row.raw?.con_dist);
          setSubDivCode(personType!=="CONTRACTOR" ? row.raw?.subdivision_code : row.raw?.con_subdivision);
          setAreaTypeCode(personType!=="CONTRACTOR" ? row.raw?.areaType?.toLowerCase() : row.raw?.con_areatype?.toLowerCase());
          setBlockCode(personType!=="CONTRACTOR" ? row.raw?.area_type_code : row.raw?.con_areatype_code);
          setVillageWardCode(personType!=="CONTRACTOR" ? row.raw?.village_code : row.raw?.con_vill_ward);
          setPoliceStationCode(personType!=="CONTRACTOR" ? row.raw?.police_station : row.raw?.con_ps);
          setPinCode(personType!=="CONTRACTOR" ? row.raw?.pin : row.raw?.con_pin);
          setModalOpen(true);
        }}>
        <IoInformationCircle/> More
      </button>
    ),
  },
  ];



  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        if (!distCode || distCode == null) return;

        const districtNameRes = await axios.get<any>(
          `${API_BASE}district/${distCode}`,
        );
        setDistName(districtNameRes?.data.district_name);
        const subDivisionNameRes = await axios.get<any>(
          `${API_BASE}subdivision/${distCode}/${subDivCode}`,
        );
        setSubDivName(subDivisionNameRes?.data.sub_div_name);
        const blockNameRes = await axios.get<any>(
          `${API_BASE}block/${distCode}/${subDivCode}/${areaTypeCode}/${blockCode}`,
        );
        setBlockName(blockNameRes?.data.block_mun_name);
        const villageOrWardNameRes = await axios.get<any>(
          `${API_BASE}villageward/${blockCode}/${villageWardCode}`,
        );
        setVillageWardName(villageOrWardNameRes?.data.village_name);
        const policeStationNameRes = await axios.get<any>(
          `${API_BASE}policestation/${distCode}/${policeStationCode}`,
        );
        setPoliceStationName(policeStationNameRes?.data.name_of_police_station);

      } catch (error) {
        console.error("API Error:", error);
      }
    }
    fetchAddressData();
  }, [distCode, subDivCode, areaTypeCode, blockCode, villageWardCode, policeStationCode, pinCode])


  
  useEffect(() => {
    const fetchData = async () => {
      const userId = getUserId();
      try {
        const response = await axios.get<any>(
          `${API_BASE}ismw/${applicationId}/1094/personnel/${personType}`,
        );
        console.log("table data", response.data)
        const apiData = response.data;

        const formattedData: TableRow[] = (apiData.rows || []).map(
          (item: any) => ({
            name: apiData?.type==="CONTRACTOR" ? item?.name_of_contractor : item?.name,
            designation: apiData?.type, // DIRECTOR
            contact_details: (
              <div>
                <p><span className="font-semibold">Email:</span> {(apiData?.type==="CONTRACTOR" ? item?.email_of_contractor : item?.email)?.toLowerCase() ?? "-"}</p>
                <p><span className="font-semibold">Contact:</span> {item?.contact_number ?? "-"}</p>
              </div>
            ),
            raw: item,
          })
        );

        setTableData(Array.isArray(formattedData) ? formattedData : []);

      } catch (err) {
        console.error("Failed to get data: ", err);
      }
    };

    fetchData();
  }, []);



  return (
    <div className="w-full">
      <div style={{ backgroundColor: "#fff", padding: "10px", borderTop: "3px solid blue", borderRadius: "4px" }}>
          <DataTable
            columns={tableColumns}
            data={tableData || []}
            pagination
            striped
            highlightOnHover
            dense
            customStyles={{
                headCells: {
                    style: {
                    background: "#1E73BE",
                    color: "white",
                    fontWeight: "200",
                    fontSize: "14px",
                    borderRight: "1px solid #c9c9c9",
                    whiteSpace: "normal",      // allow wrapping
                    wordBreak: "break-word",   // break long words
                    overflow: "visible",       // no clipping
                    lineHeight: "1.2",
                    paddingTop: "8px",
                    paddingBottom: "8px",
                    },
                },
                rows: {
                    style: {
                    fontSize: "14px",
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

      {/* More Details Modal */}
      {selectedPerson && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between bg-[#3f8fbf] px-4 py-3 text-white">
              <h1 className="text-sm font-semibold text-wrap break-words max-w-8/9">
                {personType}: {selectedPerson?.name ?? selectedPerson?.name_of_contractor}
              </h1>
            </div>

            {/* BODY */}
            <div className="p-4">
              <Table className="border">
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold w-[260px] border-r">
                      Name
                    </TableCell>
                    <TableCell>
                      <p className="text-wrap break-words">
                        {personType==="CONTRACTOR" ? selectedPerson.name_of_contractor : selectedPerson.name}
                      </p>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold border-r">
                      Father / Guardian Name
                    </TableCell>
                    <TableCell>
                      {selectedPerson.guardian_name ?? "Not Applicable"}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold border-r">
                      Designation
                    </TableCell>
                    <TableCell>
                      {personType==="CONTRACTOR" ? personType : (selectedPerson.designation)?.toUpperCase()}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold border-r">
                      Address
                    </TableCell>
                    <TableCell className="break-words">
                      {selectedPerson.address_line || selectedPerson.address_of_contractor ?
                        <div>
                          <p className="text-wrap break-words">{personType==="CONTRACTOR" ? selectedPerson.address_of_contractor : selectedPerson.address_line}</p>
                          <p>{villageWardName}, {blockName},</p>
                          <p>{subDivName}, PS - {policeStationName},</p>
                          <p>{distName}, PIN - {pinCode}</p>
                        </div>
                        : <></>
                      }
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-semibold border-r">
                      Contact Details
                    </TableCell>
                    <TableCell>
                      {selectedPerson.contact_number}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      )}



    </div>
  );
};

export default DirectorPartnerViewDetails;
