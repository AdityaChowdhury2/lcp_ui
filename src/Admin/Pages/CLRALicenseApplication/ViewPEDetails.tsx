import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../../../Components/ui/table";
import { Button } from "../../../Components/ui/button";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { MdPerson } from "react-icons/md";
import { API_BASE } from "@/constants/constants";


// ------------------ COMPONENT ------------------
export default function ViewPEDetails() {
  const navigate = useNavigate();

  const { applicationId } = useParams<{ applicationId: string }>();
  const { applicantUserId } = useParams<{ applicantUserId: string }>();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // const res = await axios.get(`${API_BASE}view-applicant-profile/123`);

        // // mapping API → UI model
        // setProfile(res.data.result);
        
      } catch (error) {
        console.error("Failed to fetch applicant profile", error);
      } 
    };

    fetchProfile();
  }, []);


  return (
    <div className="min-h-screen">
      <h1 className="text-xl font-semibold mb-4">Details of the principal employer</h1>

      <div className="border rounded-md bg-white">
        {/* Header */}
        <div className="bg-[#3b8dbd] rounded-t-md text-white px-4 py-2 text-sm font-medium">
          1.Information Given by Principal Employeer.
        </div>

        <div className="p-4">
          <p>
            <span className="font-semibold">Details of the principal employer, establishment and nature of work,where contractor has worked within the past five years: </span> Not Available
          </p>
          <p><span className="font-semibold">Given Reg. No of PE:</span> </p>
          <p><span className="font-semibold">Given License No.:</span> </p>
        </div>
      </div>
    </div>
  );
}
