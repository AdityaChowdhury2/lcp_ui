import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BiSolidMessageSquareDetail } from "react-icons/bi";
import { BsBuildingFill } from "react-icons/bs";
import { IoDocumentText } from "react-icons/io5";
import { FaTrainSubway } from "react-icons/fa6";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../Components/ui/accordion";
import DataTable, { TableColumn } from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  getAuthToken,
  getUserDetails,
  getUserId,
  getUserRole,
} from "../../utils/auth";
import { API_BASE, IMAGE_BASE } from "@/constants/constants";

interface DashboardCard {
  title: string;
  count: number;
  countExtra: string;
  icon?: React.ReactNode;
  // info: string;
  bg: string;
  url: string;
}

interface InfoRow {
  id: number;
  label: string;
  value: string | number;
  action?: React.ReactNode;
}

interface ApplicationSummary {
  service_name: string;
  total: number;
  incomplete_citizen: number;
  pending_alc: number;
  back_for_correction: number;
  payment_made: number;
  payment_not_made: number;
  issued: number;
  rejected: number;
}

interface AreawiseApplicationSummary {
  block_name: string;
  pe_reg: number;
  bocwa_reg: number;
  mtw_reg: number;
  ismw_reg: number;
  clra_lic: number;
  clra_renewal: number;
  clra_amend: number;
}

interface PendingItem {
  id: number;
  service: string;
  pendingCount: number;
}

const DashboardHome: FC = () => {
  // const navigate = useNavigate();
  const token = getAuthToken();
  const user = getUserDetails();

  const [regMTWCount, setRegMTWCount] = useState<number>();
  const [regBOCWACount, setRegBOCWACount] = useState<number>();
  const [regCLRACount, setRegCLRACount] = useState<number>();
  const [licenseCLRACount, setLicenseCLRACount] = useState<number>();

  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingModalData, setPendingModalData] = useState<PendingItem[]>();
  const [hrmsId, setHrmsId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [contactNo, setContactNo] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [userPlace, setUserPlace] = useState<string>("");
  const [distCode, setDistCode] = useState<number | null>();
  const [subDivCode, setSubDivCode] = useState<string | null>("");
  const [districtName, setDistrictName] = useState<string>("");
  const [subDivName, setSubDivName] = useState<string>("");
  const [officeName, setOfficeName] = useState<string>("");
  const [officeNumber, setOfficeNumber] = useState<string>("");
  const [certificateAddress, setCertificateAddress] = useState<string>("");
  const [noOfBlocks, setNoOfBlocks] = useState<number>();
  const [noOfInspectors, setNoOfInspectors] = useState<number>();
  const [applicationSummaryData, setApplicationSummaryData] =
    useState<ApplicationSummary[]>();
  const [areawiseApplicationSummaryData, setAreawiseApplicationSummaryData] =
    useState<AreawiseApplicationSummary[]>();

  // Cards for ALC Login
  const cards: DashboardCard[] = [
    {
      title: "Registration under Contract Labour (R&A) Act, 1970",
      count: regCLRACount ?? 0,
      countExtra: "",
      bg: "bg-[#00c0ef]",
      icon: <BiSolidMessageSquareDetail />,
      // info: "More Info",
      url: "/applications/clra",
    },
    {
      title: "Licensing of Contractors Under Contract Labour (R&A) Act, 1970",
      count: licenseCLRACount ?? 0,
      countExtra: "",
      bg: "bg-[#00a65a]",
      icon: <IoDocumentText />,
      // info: "More Info",
      url: "/official/list-license",
    },
    {
      title:
        "Registration Under Building & Other Construction Workers'(RE&CS)Act, 1996",
      count: regBOCWACount ?? 0,
      countExtra: "",
      bg: "bg-[#f39c12]",
      icon: <BsBuildingFill />,
      // info: "More Info",
      url: "/official/list-of-bocwa",
    },
    {
      title: "Registration Under Motor Transport Workers Act, 196",
      count: regMTWCount ?? 0,
      countExtra: "",
      bg: "bg-[#dd4b39]",
      icon: <FaTrainSubway />,
      // info: "More Info",
      url: "",
    },
  ];

  const rloColumns: TableColumn<InfoRow>[] = [
    {
      width: "60px",
      cell: (row) => <span className="font-semibold">{row.id}.</span>,
    },
    {
      selector: (row) => row.label,
      grow: 2,
      cell: (row) => (
        <span className="font-semibold text-gray-700">{row.label}</span>
      ),
    },
    {
      selector: (row) => row.value,
      grow: 3,
      cell: (row) => <span>{row.value}</span>,
    },
    {
      width: "150px",
      cell: (row) => row.action || null,
    },
  ];

  const applicationSummaryColumns: TableColumn<ApplicationSummary>[] = [
    {
      name: (
        <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
          SERVICE NAME
        </div>
      ),
      selector: (row) => row.service_name,
      wrap: true,
      grow: 2,
    },
    {
      name: (
        <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
          TOTAL
        </div>
      ),
      width: "70px",
      selector: (row) => row.total,
      center: true,
    },
    {
      name: (
        <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
          INCOMPLETE [CITIZEN]
        </div>
      ),
      width: "120px",
      selector: (row) => row.incomplete_citizen,
      center: true,
    },
    {
      name: (
        <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
          PENDING [ALC]
        </div>
      ),
      width: "90px",
      selector: (row) => row.pending_alc,
      center: true,
    },
    {
      name: (
        <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
          BACK FOR CORRECTION
        </div>
      ),
      width: "120px",
      selector: (row) => row.back_for_correction,
      center: true,
    },
    {
      name: (
        <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
          PAYMENT MADE
        </div>
      ),
      width: "90px",
      selector: (row) => row.payment_made,
      center: true,
    },
    {
      name: (
        <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
          PAYMENT NOT MADE
        </div>
      ),
      width: "90px",
      selector: (row) => row.payment_not_made,
      center: true,
    },
    {
      name: (
        <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
          ISSUED
        </div>
      ),
      width: "80px",
      selector: (row) => row.issued,
      center: true,
    },
    {
      name: (
        <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
          REJECTED
        </div>
      ),
      width: "100px",
      selector: (row) => row.rejected,
      center: true,
    },
  ];

  const areawiseApplicationSummaryColumns: TableColumn<AreawiseApplicationSummary>[] =
    [
      {
        name: (
          <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
            BLOCK NAME
          </div>
        ),
        selector: (row) => row.block_name,
        wrap: true,
        grow: 2,
      },
      {
        name: (
          <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
            PE REG
          </div>
        ),
        width: "70px",
        selector: (row) => row.pe_reg,
        center: true,
      },
      {
        name: (
          <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
            BOCWA REG
          </div>
        ),
        width: "80px",
        selector: (row) => row.bocwa_reg,
        center: true,
      },
      {
        name: (
          <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
            MTW REG
          </div>
        ),
        width: "80px",
        selector: (row) => row.mtw_reg,
        center: true,
      },
      {
        name: (
          <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
            ISMW REG
          </div>
        ),
        width: "80px",
        selector: (row) => row.ismw_reg,
        center: true,
      },
      {
        name: (
          <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
            CLRA LIC
          </div>
        ),
        width: "80px",
        selector: (row) => row.clra_lic,
        center: true,
      },
      {
        name: (
          <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
            CLRA RENEWAL
          </div>
        ),
        width: "95px",
        selector: (row) => row.clra_renewal,
        center: true,
      },
      {
        name: (
          <div className="text-center whitespace-normal leading-snug text-xs font-semibold">
            CLRA AMEND
          </div>
        ),
        width: "80px",
        selector: (row) => row.clra_amend,
        center: true,
      },
    ];

  const rloRows = [
    {
      id: 1,
      label: "RLO/Sub Division Name",
      value: subDivName,
    },
    {
      id: 2,
      label: "District Name",
      value: districtName,
    },
    {
      id: 3,
      label: "Phone Number",
      value: officeNumber,
      action: (
        // <button className="bg-yellow-500 text-white px-3 py-1 rounded text-xs">
        //   Change
        // </button>
        <></>
      ),
    },
    {
      id: 4,
      label: "Number of Block/Municipality",
      value: noOfBlocks ?? 0,
      action: (
        // <button className="hover:bg-blue-700 bg-blue-600 text-white px-3 py-1 rounded text-xs" onClick={() => { navigate("/rlo_block_details") }}>
        //   View List
        // </button>
        <></>
      ),
    },
    {
      id: 5,
      label: "Number of Inspector",
      value: noOfInspectors ?? 0,
      action: (
        // <button className="hover:bg-blue-700 bg-blue-600 text-white px-3 py-1 rounded text-xs" onClick={() => { navigate("/rlo_insp_details") }}>
        //   View List
        // </button>
        <></>
      ),
    },
    {
      id: 6,
      label: "Office Name [For Certificate]",
      value: officeName,
      action: (
        // <button className="bg-red-500 text-white px-3 py-1 rounded text-xs">
        //   Edit
        // </button>
        <></>
      ),
    },
    {
      id: 7,
      label: "Office Address [For Certificate]",
      value: certificateAddress,
      // "183, Old Calcutta Road, 3rd Floor, P.O. - Talpukur, Barrackpore, North 24 Parganas, Kolkata - 700123",
      action: (
        // <button className="bg-red-500 text-white px-3 py-1 rounded text-xs">
        //   Edit
        // </button>
        <></>
      ),
    },
  ];

  const pendingTableColumns: TableColumn<PendingItem>[] = [
    {
      name: "",
      cell: (row) => row.id,
      width: "60px",
    },
    {
      name: "",
      cell: (row) => row.service,
      grow: 1,
      wrap: true,
    },
    {
      name: "",
      cell: (row) => (
        <span className="text-orange-500 font-semibold">
          {row.pendingCount}
        </span>
      ),
      width: "80px",
      right: true,
    },
  ];

  // Initial RTPS auto-issue API calls only for ALC (role id 4)
  useEffect(() => {
    if (Number(getUserRole()) !== 4) return;

    const runRtpsAutoIssue = async () => {
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      try {
        await fetch(`${API_BASE}rtps/auto-issue-clra-pe`, {
          method: "POST",
          headers,
        });

        await fetch(`${API_BASE}rtps/auto-issue-clra-license`, {
          method: "POST",
          headers,
        });

        await fetch(`${API_BASE}rtps/auto-issue-clra-license-renewal`, {
          method: "POST",
          headers,
        });

        await fetch(`${API_BASE}rtps/auto-issue-clra-license-amendment`, {
          method: "POST",
          headers,
        });

        await fetch(`${API_BASE}rtps/auto-issue-bocwa-licence`, {
          method: "POST",
          headers,
        });
      } catch (error) {
        console.warn("RTPS auto-issue calls failed:", error);
      }
    };

    void runRtpsAutoIssue();
  }, []);

  // Initial pending modal API call
  useEffect(() => {
    const initializePendingModal = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}dashboard/pending-modal?userId=${user?.uid}`,
        );
        const data = response.data;

        if (data?.code === 200) {
          setShowPendingModal(Boolean(data.showModal));
          setPendingModalData(data?.result || []);
        } else {
          setShowPendingModal(false);
          setPendingModalData([]);
        }
      } catch (error) {
        console.error("Pending modal initialization error:", error);

        setShowPendingModal(false);
        setPendingModalData([]);
      }
    };

    initializePendingModal();
  }, []);

  useEffect(() => {
    const fetchAlcRloDetails = async () => {
      try {
        const response = await axios.get<any>(
          `${API_BASE}dashboard/rlo-details?userId=${user?.uid}`,
        );

        const data = await response.data;

        if (data?.code === 200) {
          const result = data?.result;
          setName(result.alc_name);
          setHrmsId(result.hrms_id);
          setEmail(result.email);
          setContactNo(result.contact_no);
          setDesignation(result.designation);
          setUserPlace(result.user_place);
          setDistrictName(result.district_name);
          setSubDivName(result.subdivision_name);
          setOfficeName(result.office_name);
          setOfficeNumber(result.office_number);
          setCertificateAddress(result.certificate_address);
        } else {
          console.error("ALC RLO Data not fetched");
        }
      } catch (error) {
        console.error("Fetch ALC RLO details API error:", error);
      }
    };

    fetchAlcRloDetails();
  }, []);

  useEffect(() => {
    const fetchNoOfBlock = async () => {
      if (!distCode || !subDivCode) return;
      const distcode = 11;
      const subdivcode = 111002;
      const areaTypes = ["b", "m", "c"];
      const blocksList = [];
      for (const type of areaTypes) {
        const blockRes = await axios.get<any>(
          `${API_BASE}block/${distCode}/${subDivCode}/${type}`,
        );
        blockRes.data.forEach((block: any) => {
          blocksList.push({
            area_name: block.block_mun_name,
          });
        });
      }
      setNoOfBlocks(blocksList.length);
    };

    fetchNoOfBlock();
  }, [distCode, subDivCode]);

  useEffect(() => {
    const fetchNoOfInspector = async () => {
      const inspectorRes = await axios.get(
        `${API_BASE}rlo_insp_details?userId=${user?.uid}`,
      );
      const inspectorData = inspectorRes.data.result;
      setNoOfInspectors(inspectorData.length);
      // setDistCode(inspectorData[0].district_code ?? 0);
      // setSubDivCode(inspectorData[0].sub_div_code ?? 0);
    };

    fetchNoOfInspector();
  }, []);

  // dashboard/application-summary?userId=461
  useEffect(() => {
    const fetchApplicationSummary = async () => {
      const response = await axios.get<any>(
        `${API_BASE}dashboard/application-summary?userId=${user?.uid}`,
      );

      const data = await response.data?.result;
      setApplicationSummaryData(data);

      data.map((d: ApplicationSummary) => {
        if (d.service_name === "MTW") {
          setRegMTWCount(d.issued);
        } else if (d.service_name === "Est. Reg. (BOCWA)") {
          setRegBOCWACount(d.issued);
        } else if (d.service_name === "PE Reg.(CLRA)") {
          setRegCLRACount(d.issued);
        }
        else if (d.service_name === "License (CLRA)") {
          setLicenseCLRACount(d.issued);
        }
      });
    };

    fetchApplicationSummary();
  }, []);

  // dashboard/area-wise-pending-summary?userId=461
  useEffect(() => {
    const fetchAreawiseApplicationSummary = async () => {
      const response = await axios.get<any>(
        `${API_BASE}dashboard/area-wise-pending-summary?userId=${user?.uid}`,
      );

      const data = await response.data?.result;
      setAreawiseApplicationSummaryData(data);
    };

    fetchAreawiseApplicationSummary();
  }, []);

  // Get district and subdivision code of User
  useEffect(() => {
    const fetchUserDistrictSubdiv = async () => {
      const response = await axios.get<any>(
        `${API_BASE}user-district-subdiv?userId=${user?.uid}`,
      );
      const data = await response.data?.result;
      setDistCode(data.district_code);
      setSubDivCode(data.sub_div_code);
    };

    fetchUserDistrictSubdiv();
  }, []);

  return (
    <div className="min-h-[250px]">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 min-[1200px]:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.bg} rounded-[2px] relative overflow-hidden flex flex-col justify-between`}
          >
            <div className="text-white p-[10px]  transform transition hover:scale-105">
              {/* Uncomment to show icon */}
              {/* <div className="text-5xl">{card.icon}</div> */}

              <h3 className="text-[38px] font-bold mb-[10px] leading-none">
                {card.count}
              </h3>

              <h5 className="text-[14px] opacity-90 font-medium my-[10px] leading-[1.1]">
                {card.countExtra}
              </h5>

              <p className="text-[15px] opacity-80 mt-2 mb-[10px]">
                {card.title}
              </p>
            </div>

            <div
              className="transition-all duration-300 ease-linear 
       absolute 
       -top-[-10px] 
       right-[10px] 
       z-0 
       text-[80px] 
       text-black/15"
            >
              {card.icon}
            </div>

            {/* <Link
              to={card.url}
              className="block text-center py-[3px] text-white/90 bg-black/10 hover:bg-black/20 transition"
            >
              {card.info} →
            </Link> */}
          </div>
        ))}
      </div>

      <div className="mt-4 min-[1200px]:flex gap-6 justify-center">
        <div className="w-full min-[1200px]:w-1/3 pr-[15px] relative min-h-[100px]">
          <div className="relative w-full bg-white rounded-[3px] border-t-[3px] border-t-[#00c0ef] mb-5 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
            <div className="text-[#444] block p-[10px] relative">
              <img
                src={`${IMAGE_BASE}default-img-male.png`}
                className="mx-auto w-[100px] p-[3px] border-[3px] border-[#d2d6de] rounded-full"
                alt=""
              />
              <h3 className="text-[21px] mt-[5px] text-center uppercase mb-[10px] font-500 leading-[1.1]">
                {name}
              </h3>
              <p className="text-[#777] mb-[10px] text-center text-[14px] font-500">
                {designation}, {userPlace}
              </p>
              <ul className="mb-[20px] ml-0">
                <li className="relative block px-[15px] py-[10px] -mb-px bg-white border border-[#ddd] rounded-t-[4px]">
                  <b className="font-700">HRMS ID</b>{" "}
                  <span className="float-right text-[#444]">{hrmsId}</span>
                </li>
                <li className="relative block px-[15px] py-[10px] -mb-px bg-white border border-[#ddd] rounded-t-[4px]">
                  <b className="font-700">Email</b>{" "}
                  <span className="float-right text-[#444]">{email}</span>
                </li>
                <li className="relative block px-[15px] py-[10px] -mb-px bg-white border border-[#ddd] rounded-t-[4px]">
                  <b className="font-700">Contact Number</b>{" "}
                  <span className="float-right text-[#444]">{contactNo}</span>
                </li>
              </ul>
              {(user?.role == 4 || user?.role == 12) && (
                <Link
                  to="/custom_user/edit"
                  className="text-[#fff] font-bold px-[12px] py-[6px] mb-0 text-[14px] font-normal leading-[1.42857143] text-center whitespace-nowrap align-middle touch-manipulation cursor-pointer block w-full bg-[#3c8dbc] border border-[#367fa9] rounded-[3px] shadow-none"
                >
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="w-full min-[1200px]:w-2/3">
          {/* e-Services */}
          <div className="w-full">
            <div className="relative w-full bg-white rounded-[3px] border-t-[3px] border-t-[#00c0ef] mb-5 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
              {/* <div className="relative block text-[#444] p-[10px]">
              <h3 className="inline-block text-[16px] m-0 leading-[1] font-['Source_Sans_Pro',sans-serif]">
    e-Services
  </h3>

              </div> */}
              <Accordion
                type="single"
                collapsible
                defaultValue="item-1"
                className="space-y-1.5"
              >
                <AccordionItem value="item-1" className="">
                  <AccordionTrigger className=" group flex items-center justify-between relative block text-[#444] p-[10px] bg-white [&>svg]:hidden">
                    <h3 className="inline-block text-[16px] m-0 leading-[1] font-['Source_Sans_Pro',sans-serif]">
                      e-Services
                    </h3>
                    <div
                      className="
            ml-2 inline-flex h-6 w-6 items-center justify-center
            rounded-[3px] bg-[#00c0ef] text-white text-[16px] font-bold
            before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right
          "
                    />
                  </AccordionTrigger>
                  <AccordionContent className="rounded-t-none rounded-b-[3px] p-[10px] overflow-hidden">
                    <ul className="list-none overflow-auto">
                      <li className="rounded-[2px] p-[10px] bg-[#f4f4f4] mb-[2px] border-l-2 border-[#e6e7e8] text-[#444]">
                        <a
                          href="https://wb.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          <span className="inline-block ml-[5px] font-600">
                            Registration of Principal Employers Under Contract
                            Labour (R&A) Act, 1970
                          </span>
                          {/* <small className="inline align-baseline text-center whitespace-nowrap font-bold leading-none rounded-[0.25em] text-[9px] px-[0.6em] py-[0.2em] pb-[0.3em] text-[#fff] ml-[10px] text-9px] bg-[#3c8dbc]">
                            {" "}
                            View More
                          </small> */}
                        </a>
                      </li>
                      <li className="rounded-[2px] p-[10px] bg-[#f4f4f4] mb-[2px] border-l-2 border-[#e6e7e8] text-[#444]">
                        <a
                          href="https://wb.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          <span className="inline-block ml-[5px] font-600">
                            Licensing for Contractors Under Contract Labour
                            (R&A) Act, 1970
                          </span>
                          {/* <small className="inline align-baseline text-center whitespace-nowrap font-bold leading-none rounded-[0.25em] text-[9px] px-[0.6em] py-[0.2em] pb-[0.3em] text-[#fff] ml-[10px] text-9px] bg-[#3c8dbc]">
                            {" "}
                            View More
                          </small> */}
                        </a>
                      </li>
                      <li className="rounded-[2px] p-[10px] bg-[#f4f4f4] mb-[2px] border-l-2 border-[#e6e7e8] text-[#444]">
                        <a
                          href="https://wb.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          <span className="inline-block ml-[5px] font-600">
                            Registration of Establishments Under Building &
                            Other Construction Workers'(RE&CS) Act, 1996
                          </span>
                          {/* <small className="inline align-baseline text-center whitespace-nowrap font-bold leading-none rounded-[0.25em] text-[9px] px-[0.6em] py-[0.2em] pb-[0.3em] text-[#fff] ml-[10px] text-9px] bg-[#3c8dbc]">
                            {" "}
                            View More
                          </small> */}
                        </a>
                      </li>
                      <li className="rounded-[2px] p-[10px] bg-[#f4f4f4] mb-[2px] border-l-2 border-[#e6e7e8] text-[#444]">
                        <a
                          href="https://wb.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          <span className="inline-block ml-[5px] font-600">
                            Registration of Principal Employers Under
                            Inter-State Migrant Workmen'(RE&CS) Act, 1979
                          </span>
                          {/* <small className="inline align-baseline text-center whitespace-nowrap font-bold leading-none rounded-[0.25em] text-[9px] px-[0.6em] py-[0.2em] pb-[0.3em] text-[#fff] ml-[10px] text-9px] bg-[#3c8dbc]">
                            {" "}
                            View More
                          </small> */}
                        </a>
                      </li>
                      <li className="rounded-[2px] p-[10px] bg-[#f4f4f4] mb-[2px] border-l-2 border-[#e6e7e8] text-[#444]">
                        <a
                          href="https://wb.gov.in"
                          target="_blank"
                          className="hover:text-[#cc9900]"
                        >
                          <span className="inline-block ml-[5px] font-600">
                            Registration of Motor Transport Workers under Motor
                            Transport Workers Act, 1961
                          </span>
                          {/* <small className="inline align-baseline text-center whitespace-nowrap font-bold leading-none rounded-[0.25em] text-[9px] px-[0.6em] py-[0.2em] pb-[0.3em] text-[#fff] ml-[10px] text-9px] bg-[#3c8dbc]">
                            {" "}
                            View More
                          </small> */}
                        </a>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* NOTIFICATION */}
              </Accordion>
            </div>
          </div>

          {/* RLO Details */}
          <div className="w-full">
            <div className="relative w-full bg-white rounded-[3px] border-t-[3px] border-t-[#00c0ef] mb-5 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
              {/* <div className="relative block text-[#444] p-[10px]">
              <h3 className="inline-block text-[16px] m-0 leading-[1] font-['Source_Sans_Pro',sans-serif]">
    e-Services
  </h3>

              </div> */}
              <Accordion
                type="single"
                collapsible
                defaultValue="item-1"
                className="space-y-1.5"
              >
                <AccordionItem value="item-1" className="">
                  <AccordionTrigger className=" group flex items-center justify-between relative block text-[#444] p-[10px] bg-white [&>svg]:hidden">
                    <h3 className="inline-block text-[16px] m-0 leading-[1] font-['Source_Sans_Pro',sans-serif]">
                      RLO DETAILS
                    </h3>
                    <div
                      className="
            ml-2 inline-flex h-6 w-6 items-center justify-center
            rounded-[3px] bg-[#00c0ef] text-white text-[16px] font-bold
            before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right
          "
                    />
                  </AccordionTrigger>

                  <AccordionContent className="rounded-t-none rounded-b-[3px] p-[10px] overflow-hidden">
                    <DataTable
                      columns={rloColumns}
                      data={rloRows}
                      noHeader
                      dense
                      striped
                      customStyles={{
                        head: {
                          style: {
                            display: "none", // hide original header row
                          },
                        },
                        rows: {
                          style: {
                            minHeight: "48px",
                          },
                        },
                        cells: {
                          style: {
                            paddingTop: "8px",
                            paddingBottom: "8px",
                            borderLeft: "0.25px solid #e5e5e5",
                            borderRight: "0.25px solid #e5e5e5",
                          },
                        },
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* NOTIFICATION */}
              </Accordion>
            </div>
          </div>

          {/* Application Summary */}
          <div className="w-full">
            <div className="relative w-full bg-white rounded-[3px] border-t-[3px] border-t-[#00a65a] mb-5 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
              {/* <div className="relative block text-[#444] p-[10px]">
              <h3 className="inline-block text-[16px] m-0 leading-[1] font-['Source_Sans_Pro',sans-serif]">
    e-Services
  </h3>

              </div> */}
              <Accordion
                type="single"
                collapsible
                // defaultValue="item-1"
                className="space-y-1.5"
              >
                <AccordionItem value="item-1" className="">
                  <AccordionTrigger className=" group flex items-center justify-between relative block text-[#444] p-[10px] bg-white [&>svg]:hidden">
                    <h3 className="inline-block text-[16px] m-0 leading-[1] font-['Source_Sans_Pro',sans-serif]">
                      APPLICATION SUMMARY
                    </h3>
                    <div
                      className="
            ml-2 inline-flex h-6 w-6 items-center justify-center
            rounded-[3px] bg-[#00a65a] text-white text-[16px] font-bold
            before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right
          "
                    />
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="bg-white p-2">
                      <DataTable
                        columns={applicationSummaryColumns}
                        data={applicationSummaryData || []}
                        highlightOnHover
                        striped
                        dense
                        responsive
                        customStyles={{
                          headCells: {
                            style: {
                              backgroundColor: "#ffffff",
                              fontWeight: "600",
                              fontSize: "13px",
                              // paddingLeft: "5px",
                              // paddingRight: "5px",
                              borderBottom: "1px solid #e5e7eb",
                            },
                          },
                          cells: {
                            style: {
                              fontSize: "13px",
                              paddingTop: "5px",
                              paddingBottom: "5px",
                              paddingLeft: "7px",
                              paddingRight: "5px",
                              borderBottom: "1px solid #f3f4f6",
                            },
                          },
                        }}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* NOTIFICATION */}
              </Accordion>
            </div>
          </div>

          {/* Pending Application Summary */}
          <div className="w-full">
            <div className="relative w-full bg-white rounded-[3px] border-t-[3px] border-t-[#00a65a] mb-5 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
              {/* <div className="relative block text-[#444] p-[10px]">
              <h3 className="inline-block text-[16px] m-0 leading-[1] font-['Source_Sans_Pro',sans-serif]">
    e-Services
  </h3>

              </div> */}
              <Accordion
                type="single"
                collapsible
                // defaultValue="item-1"
                className="space-y-1.5"
              >
                <AccordionItem value="item-1" className="">
                  <AccordionTrigger className=" group flex items-center justify-between relative block text-[#444] p-[10px] bg-white [&>svg]:hidden">
                    <h3 className="inline-block text-[16px] m-0 leading-[1] font-['Source_Sans_Pro',sans-serif]">
                      AREA WISE OFFICE PENDING APPLICATION SUMMARY
                    </h3>
                    <div
                      className="
            ml-2 inline-flex h-6 w-6 items-center justify-center
            rounded-[3px] bg-[#00a65a] text-white text-[16px] font-bold
            before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right
          "
                    />
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="bg-white p-2">
                      <DataTable
                        columns={areawiseApplicationSummaryColumns}
                        data={areawiseApplicationSummaryData || []}
                        highlightOnHover
                        striped
                        dense
                        responsive
                        customStyles={{
                          headCells: {
                            style: {
                              backgroundColor: "#ffffff",
                              fontWeight: "600",
                              fontSize: "13px",
                              borderBottom: "1px solid #e5e7eb",
                            },
                          },
                          cells: {
                            style: {
                              fontSize: "13px",
                              paddingTop: "10px",
                              paddingBottom: "10px",
                              borderBottom: "1px solid #f3f4f6",
                            },
                          },
                        }}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* NOTIFICATION */}
              </Accordion>
            </div>
          </div>

          {/* Google Maps Integration */}
          <div className="w-full mb-20">
            <div className="relative w-full bg-white rounded-[3px] border-t-[3px] border-t-[#f39c12] mb-5 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
              {/* <div className="relative block text-[#444] p-[10px]">
              <h3 className="inline-block text-[16px] m-0 leading-[1] font-['Source_Sans_Pro',sans-serif]">
    e-Services
  </h3>

              </div> */}
              <Accordion
                type="single"
                collapsible
                // defaultValue="item-1"
                className="space-y-1.5"
              >
                <AccordionItem value="item-1" className="">
                  <AccordionTrigger className=" group flex items-center justify-between relative block text-[#444] p-[10px] bg-white [&>svg]:hidden">
                    <h3 className="inline-block text-[16px] m-0 leading-[1] font-['Source_Sans_Pro',sans-serif]">
                      AREA MAP
                    </h3>
                    <div
                      className="
            ml-2 inline-flex h-6 w-6 items-center justify-center
            rounded-[3px] bg-[#f39c12] text-white text-[16px] font-bold
            before:content-['+']
            group-data-[state=open]:before:content-['-'] float-right
          "
                    />
                  </AccordionTrigger>
                </AccordionItem>

                {/* NOTIFICATION */}
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      {/* ================= Pending Applications Modal ================= */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 flex justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPendingModal(false)}
          />

          {/* Modal */}
          <div className="relative mt-6 w-full max-w-2xl bg-white border border-red-700 rounded shadow-lg h-max mt-15">
            {/* Header */}
            <div className="flex justify-between items-center bg-[#990000] text-white px-4 py-3 rounded-t">
              <h2 className="text-lg font-semibold">Pending Applications</h2>
              <button
                onClick={() => setShowPendingModal(false)}
                className="text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-3">
              <DataTable
                columns={pendingTableColumns}
                data={pendingModalData || []}
                noHeader
                dense
                highlightOnHover
                customStyles={{
                  head: {
                    style: {
                      display: "none", // hide original header row
                    },
                  },
                  rows: {
                    style: {
                      backgroundColor: "#f9fafb",
                      marginBottom: "4px",
                    },
                  },
                  cells: {
                    style: {
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      fontSize: "13px",
                    },
                  },
                }}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t px-3 py-3">
              <button
                onClick={() => setShowPendingModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= End Modal ================= */}
    </div>
  );
};

export default DashboardHome;
