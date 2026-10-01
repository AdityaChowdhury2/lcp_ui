import { IMAGE_BASE } from "@/constants/constants";
import React, { ReactElement, useEffect, useState } from "react";
import { GrNotes } from "react-icons/gr";
import { FaRegNoteSticky, FaMagnifyingGlass, FaInfo } from "react-icons/fa6";
import { TiArrowLeft } from "react-icons/ti";
import { FaUser } from "react-icons/fa";
import { MdDelete, MdDone, MdQuestionMark } from "react-icons/md";
import { IoMdWarning } from "react-icons/io";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../../Components/ui/table";

import {
  Dialog,
  DialogContent,
} from "../../../Components/ui/dialog";

import { Card, CardHeader } from "../../../Components/ui/card";
import { Button } from "../../../Components/ui/button";
import { Checkbox } from "../../../Components/ui/checkbox";
import axios from "axios";
import { getAuthToken, getUserId } from "../../../utils/auth";
import { Eye } from "lucide-react";
import { IoDownload, IoInformationCircle, IoRemove } from "react-icons/io5";
import { X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../../../Components/ui/dialog";

interface RemarkData {
  id: string;
  datetime: string;
  remark: ReactElement | string;
  status: ReactElement | string;
  remarkby: string;
}



// --------------------- Main Component ---------------------

const BOCWARemarkDetails = () => {
  const navigate = useNavigate();

//   const { applicationId } = useParams<{ applicationId: string }>();
//   const { applicantUserId } = useParams<{ applicantUserId: string }>();
//   const alcUserId = getUserId();
  const [remarkData, setRemarkData] = useState<RemarkData[]>([]);

  const demoRemarkData: RemarkData[] = [
    {
      id: "1",
      datetime: "2024-01-12",
      remark: "Congratulations! Certificate is issued by the Registering Authority. You can download it from the dashboard.",
      status: "Issued",
      remarkby: "ALC",
    },
    {
      id: "2",
      datetime: "2024-01-12",
      remark: "Payment successfully updated",
      status: "Final Submitted",
      remarkby: "Applicant",
    },
    {
      id: "3",
      datetime: "2024-01-12",
      remark: "Application is verified and approved by Registering Authority and directed to pay fees. After successful payment download FORM-I from the dashboard and upload it after signing the downloaded FORM-I.",
      status: "Fees Pending",
      remarkby: "ALC",
    },
  ];

  const statusImageMap: Record<string, string> = {
    Approved: `${IMAGE_BASE}btn-approved.png`,
    Applied: `${IMAGE_BASE}btn-applied.png`,
    "Fees Paid": `${IMAGE_BASE}btn-fees-paid.png`,
    "Fees Pending": `${IMAGE_BASE}btn-fees-pending.png`,
    Pending: `${IMAGE_BASE}btn-applied.png`,
    "Final Submitted": `${IMAGE_BASE}btn-final-submit.png`,
    Issued: `${IMAGE_BASE}btn-issued.png`,
    "Certificate Issued": `${IMAGE_BASE}btn-issued.png`,
    Rectification: `${IMAGE_BASE}btn-rectification.png`,
    Backed: `${IMAGE_BASE}btn-rectification.png`,
    "Back to Inspector": `${IMAGE_BASE}btn-inspector.png`,
    "Back for Rectification": `${IMAGE_BASE}btn-rectification.png`,
    Rejected: `${IMAGE_BASE}btn-reject.png`,
    Forwarded: `${IMAGE_BASE}btn-to-alc.png`,
  };

  const renderStatusImage = (
    status: string
  ): ReactElement | null => {
    const src = status ? statusImageMap[status] : null;
    if (!src) {
      return <span className="text-gray-500">{status}</span>;
    }
    return (
      <img
        src={src}
        alt={status}
        className="object-contain w-auto h-auto max-w-none max-h-none"
      />
    );
  };


  useEffect(() => {
    const fetchRemarkData = async () => {
      try {
        // const remarkRes = await axios.get(
        //   `${API_BASE}bocwa/100/1094/get-remark`,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${getAuthToken()}`,
        //     },
        //   }
        // );

        // console.log("remarkRes", remarkRes);

        // if (!remarkRes.data) {
        //   setRemarkData([]);
        //   return;
        // }

        // const remarkTableData: RemarkData[] = remarkRes?.data?.remarks.map((r: any) => ({
        const remarkTableData: RemarkData[] = demoRemarkData.map((r: any) => ({
          id: String(r.id ?? ""),
          datetime: r.datetime
            ? new Date(r.datetime).toLocaleString()
            : "",
          remark: <p className="text-wrap break-words">{r.remark}</p>,
          status: renderStatusImage(r.status) ?? <></>,
          remarkby: r.remarkby ?? "",

        }));

        console.log("remarkTableData", remarkTableData);
        setRemarkData(remarkTableData);

      } catch (error) {
        console.error("API Error:", error);
        setRemarkData([]); // prevent stale UI
      }
    };

    fetchRemarkData();
  }, []);


  return (
    <div className="min-h-[250px] mb-15">

      {/* --------------------- PAGE TITLE --------------------- */}
      <h1 className="text-xl mb-6">Remark Details - CAF2025000272</h1>

      {/* --------------------- REMARK SUMMARY --------------------- */}
      <div className="mt-5">
        {/* <Card className="p-3 text-black"> */}
          <Table className="border rounded-md text-black bg-white">
            <TableHeader className="bg-[#2A628C]">
              <TableRow>
                <TableHead className="text-white border-r">Sl. No.</TableHead>
                <TableHead className="text-white border-r">Date - Time</TableHead>
                <TableHead className="text-white border-r">Remark</TableHead>
                <TableHead className="text-white border-r">Remark Status</TableHead>
                <TableHead className="text-white border-r">Remark By</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {remarkData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="border-r">{item.id}</TableCell>
                  <TableCell className="border-r">{item.datetime}</TableCell>
                  <TableCell className="border-r">{item.remark}</TableCell>
                  <TableCell className="border-r">{item.status}</TableCell>
                  <TableCell className="border-r">{item.remarkby}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        {/* </Card> */}
      </div>
    </div>
  );
};

export default BOCWARemarkDetails;
