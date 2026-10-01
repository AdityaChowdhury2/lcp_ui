import React, {
  useEffect,
  useState,
} from "react";
import axios from "axios";
import DataTable, {
  TableColumn,
  ConditionalStyles,
} from "react-data-table-component";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Search } from "lucide-react";
import { API_BASE } from "@/constants/constants";
import { getAuthToken, getUserRole } from "@/utils/auth";
import { useNavigate } from "react-router-dom";

type UserRow = {
  userId: number;
  username: string;
  fullname: string;
  email: string;
  mobile: string;
  userPlace: string;
  designationOfficer: string;
};

type ApiUser = {
  uid: number;
  username: string;
  fullname: string;
  email: string;
  mobile: string;
  login: string | null;
  role_id: number;
  user_place: string;
  degisnation_officer: string;
};

const SUPER_ADMIN_ROLE_ID = 12;
const DLCList = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const isSuperAdminViewer = Number(getUserRole()) === SUPER_ADMIN_ROLE_ID;
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);


  /*
  =========================================
  FETCH DLC USERS
  =========================================
  */

  useEffect(() => {
    fetchDLCUsers();
  }, []);

  const fetchDLCUsers = async () => {
    try {
      setLoading(true);

      const token = getAuthToken();

      const response = await axios.get(
        `${API_BASE}users/role/5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const users =
        response?.data?.data ?? [];

      const formattedData: UserRow[] =
        users.map((user: ApiUser) => ({
          userId: user.uid,
          username:
            user.username || "N/A",
          fullname:
            user.fullname || "N/A",
          email:
            user.email || "N/A",
          mobile:
            user.mobile || "N/A",
          userPlace:
            user.user_place || "N/A",
          designationOfficer:
            user.degisnation_officer ||
            "N/A",
        }));

      setData(formattedData);
    } catch (error) {
      console.error(
        "Error fetching DLC users:",
        error
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /*
  =========================================
  SEARCH
  =========================================
  */

  const filteredData = data.filter(
    (user) =>
      [
        user.username,
        user.fullname,
        user.email,
        user.mobile,
        user.userPlace,
        user.designationOfficer,
        user.userId.toString(),
      ]
        .join(" ")
        .toLowerCase()
        .includes(
          searchText.toLowerCase()
        )
  );

  /*
  =========================================
  TABLE COLUMNS
  =========================================
  */

  const columns: TableColumn<UserRow>[] =
    [
      {
        name: "SL. NO.",
        cell: (_row, index) =>
          (currentPage - 1) *
          perPage +
          index +
          1,
        width: "90px",
      },
      {
        name: "USERNAME",
        selector: (row) =>
          row.username,
        sortable: true,
        width: "160px",
        wrap: true,
      },
      {
        name: "AREA",
        selector: (row) =>
          row.userPlace,
        sortable: true,
        wrap: true,
      },
      {
        name: "NAME",
        selector: (row) =>
          row.fullname,
        sortable: true,
        width: "200px",
        wrap: true,
      },
      {
        name: "EMAIL ADDRESS",
        selector: (row) =>
          row.email,
        sortable: true,
        width: "220px",
        wrap: true,
      },
      {
        name: "PHONE",
        selector: (row) =>
          row.mobile,
        sortable: true,
        width: "150px",
      },
      {
        name: "ACTION",
        center: true,
        width: "180px",
        cell: (row) => (
          <div className="flex flex-col gap-2 w-full py-2">
            {isSuperAdminViewer && (
              <Button
                onClick={() =>
                  navigate(`/user-list/dlc/${row.userId}/alc`, {
                    state: { dlcName: row.fullname },
                  })
                }
                className="bg-[#00a65a] hover:bg-[#008d4c] text-white text-sm px-4 h-9 rounded-md w-full"
              >
                ALC List
              </Button>
            )}
            <Button
              onClick={() =>
                navigate(
                  `/update-profile?userId=${row.userId}&from=alc`
                )
              }
              className="bg-[#3c8dbc] hover:bg-[#357ca5] text-white text-sm px-4 h-9 rounded-md w-full"
            >
              Update Profile
            </Button>
          </div>
        ),
      },
    ];

  /*
  =========================================
  ROW STYLE
  =========================================
  */

  const conditionalRowStyles:
    ConditionalStyles<UserRow>[] =
    [
      {
        when: (
          _row,
          index?: number
        ) =>
          (index ?? 0) % 2 === 0,
        style: {
          backgroundColor:
            "#ffffff",
        },
      },
      {
        when: (
          _row,
          index?: number
        ) =>
          (index ?? 0) % 2 !== 0,
        style: {
          backgroundColor:
            "#f8f9fa",
        },
      },
    ];

  return (
    <div className="min-h-screen bg-[#f4f6f9] p-5">
      <div className="w-full mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-[#2c3e50]">
            Deputy Labour
            Commissioners
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage users and reset
            passwords
          </p>
        </div>

        <div className="bg-white shadow-sm border overflow-hidden mb-15">
          <div className="p-4 border-b flex justify-end">
            <div className="relative w-full sm:w-[320px]">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <Input
                type="text"
                placeholder="Search user..."
                value={searchText}
                onChange={(e) =>
                  setSearchText(
                    e.target.value
                  )
                }
                className="pl-10 h-10 border-gray-300 focus:border-[#3c8dbc] focus:ring-[#3c8dbc]"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            progressPending={loading}
            pagination
            paginationPerPage={perPage}
            onChangePage={(page) =>
              setCurrentPage(page)
            }
            onChangeRowsPerPage={(
              newPerPage,
              page
            ) => {
              setPerPage(newPerPage);
              setCurrentPage(page);
            }}
            responsive
            highlightOnHover
            striped
            noDataComponent={
              <div className="py-6 text-gray-500">
                No users found
              </div>
            }
            customStyles={{
              table: {
                style: {
                  border:
                    "1px solid #d1d5db",
                },
              },
              headRow: {
                style: {
                  backgroundColor:
                    "#3c8dbc",
                  color: "#fff",
                  minHeight:
                    "55px",
                  fontSize:
                    "14px",
                  fontWeight:
                    "600",
                  borderBottom:
                    "1px solid #d1d5db",
                },
              },
              headCells: {
                style: {
                  paddingLeft:
                    "16px",
                  paddingRight:
                    "16px",
                  borderRight:
                    "1px solid #d1d5db",
                },
              },
              rows: {
                style: {
                  minHeight:
                    "60px",
                  fontSize:
                    "14px",
                  borderBottom:
                    "1px solid #e5e7eb",
                },
              },
              cells: {
                style: {
                  paddingLeft:
                    "16px",
                  paddingRight:
                    "16px",
                  borderRight:
                    "1px solid #e5e7eb",
                },
              },
              pagination: {
                style: {
                  borderTop:
                    "1px solid #eee",
                },
              },
            }}
            conditionalRowStyles={
              conditionalRowStyles
            }
          />
        </div>
      </div>
    </div>
  );
};

export default DLCList;