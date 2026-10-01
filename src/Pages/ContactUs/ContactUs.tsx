import { API_BASE } from "@/constants/constants";
import axios from "axios";
import { Eye } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DataTable, {
  type TableColumn,
  type ConditionalStyles,
} from "react-data-table-component";
import { useNavigate } from "react-router-dom";

type ApiContactUs = {
  usr_id?: number;
  district?: string;
  officename: string;
  contactno?: string;
  emailaddress?: string;
};

interface ContactUsRow extends ApiContactUs {
  _rowIndex: number;
}

type ContactInfoResponse = {
  data?: ApiContactUs[];
  total?: number;
  page?: number;
  limit?: number;
};

const PAGE_SIZE = 20;

const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ContactUsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const fetchContactInfo = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await axios.get<ContactInfoResponse | ApiContactUs[]>(
        `${API_BASE}misc/contact-info`,
        {
          params: {
            page: pageNum,
            limit: PAGE_SIZE,
          },
        },
      );

      const payload = res.data;
      const raw = Array.isArray(payload)
        ? payload
        : (payload.data ?? []);
      const total = Array.isArray(payload)
        ? payload.length
        : (payload.total ?? raw.length);

      const withIndex: ContactUsRow[] = raw.map((item, idx) => ({
        ...item,
        _rowIndex: (pageNum - 1) * PAGE_SIZE + idx,
      }));

      setData(withIndex);
      setTotalRows(total);
    } catch (err) {
      console.error(err);
      setData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContactInfo(page);
  }, [page, fetchContactInfo]);

  const columns: TableColumn<ContactUsRow>[] = useMemo(
    () => [
      {
        name: "DISTRICT",
        width: "150px",
        selector: (row) => row.district ?? "",
        cell: (row) => (
          <div className="px-2 py-2 break-words">{row.district}</div>
        ),
        sortable: true,
      },
      {
        name: "NAME OF THE OFFICE",
        selector: (row) => row.officename ?? "",
        cell: (row) => (
          <div className="px-2 py-2 break-words">{row.officename}</div>
        ),
      },
      {
        name: "CONTACT NUMBER",
        selector: (row) => row.contactno ?? "",
        width: "150px",
        cell: (row) => (
          <div className="w-full px-2 py-2 break-words text-center">
            {row.contactno}
          </div>
        ),
      },
      {
        name: "EMAIL ADDRESS",
        selector: (row) => row.emailaddress ?? "",
        width: "200px",
        cell: (row) => (
          <div className="w-full px-2 py-2 break-words text-center">
            {row.emailaddress}
          </div>
        ),
      },
      {
        name: "ACTION",
        width: "110px",
        cell: (row) => (
          <button
            className="px-2 py-2 flex items-center justify-center"
            onClick={() =>
              row._rowIndex === 0
                ? navigate("/labour-commissionerate-contact-details")
                : navigate("/rlo-details")
            }
          >
            <Eye size={16} />
          </button>
        ),
      },
    ],
    [navigate],
  );

  const conditionalRowStyles: ConditionalStyles<ContactUsRow>[] = [
    {
      when: (row) => row._rowIndex % 2 === 0,
      style: { backgroundColor: "#ffffff" },
    },
    {
      when: (row) => row._rowIndex % 2 !== 0,
      style: { backgroundColor: "#f9f6f0ff" },
    },
  ];

  return (
    <div className="min-h-screen px-6 py-8 bg-white">
      <div className="max-w-6xl mx-auto bg-white p-6 shadow-sm">
        <h2 className="text-center text-2xl font-semibold text-[#5b3f2f] mb-4">
          Contact Us
        </h2>

        <div className="w-full overflow-hidden border border-[#e7dfd6] rounded">
          <div className="h-[500px] overflow-y-auto">
            <DataTable
              columns={columns}
              data={data}
              progressPending={loading}
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
                    padding: 0,
                    borderRight: "1px solid #c6b8ae",
                  },
                },
              }}
              conditionalRowStyles={conditionalRowStyles}
              noHeader
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationPerPage={PAGE_SIZE}
              paginationDefaultPage={page}
              onChangePage={setPage}
              responsive
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
