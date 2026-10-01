import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../../../Components/ui/table";
import { Button } from "../../../Components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MdPerson } from "react-icons/md";

// ------------------ TYPES ------------------
interface ApplicantProfile {
  name: string;
  gender: string;
  dob: string;
  username: string;
  unitCode: string;
  phone: string;
  email: string;
  selfCertified: string;
  lastReturn: string;
  peRegCLRA: string;
  estRegBOCWA: string;
}



// ------------------ COMPONENT ------------------
export default function ApplicantProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);

  const demoProfileData: ApplicantProfile[] = [
    {
        "name": "DEEPAK KHARWAD",
        "gender": "Male",
        "dob": "01st Jan, 1970",
        "username": "CAF2023648282",
        "unitCode": "Not Available",
        "phone": "9874111550",
        "email": "sutonu.chakraborty@karkinos.in",
        "selfCertified": "No",
        "lastReturn": "Not Available",
        "peRegCLRA": "Not Available",
        "estRegBOCWA": "Not Available"
    },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // const res = await axios.get(`${API_BASE}view-applicant-profile/123`);

        // // mapping API → UI model
        // setProfile(res.data.result);


        setProfile(demoProfileData[0]);
      } catch (error) {
        console.error("Failed to fetch applicant profile", error);
      } 
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen">
      <h1 className="text-xl font-semibold mb-4">Applicant Profile</h1>

      <div className="border rounded-md bg-white">
        {/* Header */}
        <div className="bg-[#3b8dbd] rounded-t-md text-white px-4 py-2 text-sm font-medium">
          {profile.name} 's Profile
        </div>

        {/* Table */}
        <div className="p-4">
          <Table className="border">
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold w-1/6">Name</TableCell>
                <TableCell colSpan={3}>{profile.name}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-semibold">Gender</TableCell>
                <TableCell>{profile.gender}</TableCell>
                <TableCell className="font-semibold">Date of Birth</TableCell>
                <TableCell>{profile.dob}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-semibold">Username</TableCell>
                <TableCell>{profile.username}</TableCell>
                <TableCell className="font-semibold">Unit Code</TableCell>
                <TableCell>{profile.unitCode}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-semibold">Phone Number</TableCell>
                <TableCell>{profile.phone}</TableCell>
                <TableCell className="font-semibold">Email address</TableCell>
                <TableCell className="text-orange-600">
                  {profile.email}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-semibold">Self certified?</TableCell>
                <TableCell>{profile.selfCertified}</TableCell>
                <TableCell className="font-semibold">
                  Last online return submitted year/date
                </TableCell>
                <TableCell>{profile.lastReturn}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-semibold">PE Regs. under CLRA</TableCell>
                <TableCell>{profile.peRegCLRA}</TableCell>
                <TableCell className="font-semibold">Est. Regs. under BOCWA</TableCell>
                <TableCell>{profile.estRegBOCWA}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Contact Button */}
      <div className="flex justify-end mt-4">
        <Button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6">
          <MdPerson size={20} />
          Click To Contact
        </Button>
      </div>
    </div>
  );
}
