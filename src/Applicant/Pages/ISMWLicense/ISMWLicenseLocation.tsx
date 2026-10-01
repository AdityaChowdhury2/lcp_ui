import { IMAGE_BASE } from "@/constants/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../Components/ui/select';
import { memo } from 'react';
import DataTable, { TableColumn } from "react-data-table-component";
import { IoIosArrowDroprightCircle } from 'react-icons/io';
// import ClraRegDashboardTabs from './ClraRegDashboardTabs';
import { useNavigate } from 'react-router-dom';

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

const ISMWLicenseLocation = () => {
    const FormField = ({
        label,
        required,
        children,
    }: {
        label: string;
        required?: boolean;
        children: React.ReactNode;
    }) => (
        <div>
            <label className="block mb-1 font-semibold">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );


    const navigate = useNavigate()
    const columns: TableColumn<RowData>[] = [
        {
            name: "Sl. No",
            selector: (row) => row.id,
            width: "80px",
        },
        {
            name: "Contractor Name",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{row.regNo}</span>
                    <span className="text-sm">{row.regDate}</span>
                </div>
            ),
            wrap: true,
        },
        {
            name: "Contractor Address",
            selector: (row) => row.establishment,
            wrap: true,
        },
        {
            name: "Nature of Work",
            selector: (row) => row.service,
            wrap: true,
        },
        {
            name: "Maximum Number of Contractor Labour",
            selector: (row) => row.service,
            wrap: true,
        },
        //   {
        //     name: "STATUS",
        //     width: "150px",
        //     selector: (row) => row.status,
        //     cell: (row) => (
        //       row.status === "Approved" ?
        //       <img
        //         src={`${IMAGE_BASE}btn-approved.png`}
        //         alt="logo"
        //         className="object-contain"
        //       /> :
        //       row.status === "Applied" ?
        //       <img
        //         src={`${IMAGE_BASE}btn-applied.png`}
        //         alt="logo"
        //         className="object-contain"
        //       /> :
        //       row.status === "Fees Paid" ?
        //       <img
        //         src={`${IMAGE_BASE}btn-fees-paid.png`}
        //         alt="logo"
        //         className="object-contain"
        //       /> :
        //       row.status === "Fees Pending" ?
        //       <img
        //         src={`${IMAGE_BASE}btn-fees-pending.png`}
        //         alt="logo"
        //         className="object-contain"
        //       /> :
        //       row.status === "Pending" ?
        //       <img
        //         src={`${IMAGE_BASE}btn-applied.png`}
        //         alt="logo"
        //         className="object-contain"
        //       /> :
        //       row.status === "Final Submitted" ?
        //       <img
        //         src={`${IMAGE_BASE}btn-final-submit.png`}
        //         alt="logo"
        //         className="object-contain"
        //       /> :
        //       row.status === "Issued" ?
        //       <img
        //         src={`${IMAGE_BASE}btn-issued.png`}
        //         alt="logo"
        //         className="object-contain"
        //       /> :
        //       row.status === "Rectification" ?
        //       <img
        //         src={`${IMAGE_BASE}btn-rectification.png`}
        //         alt="logo"
        //         className="object-contain"
        //       /> :
        //       row.status === "Rejected" ?
        //       <img
        //         src={`${IMAGE_BASE}btn-reject.png`}
        //         alt="logo"
        //         className="object-contain"
        //       /> :
        //       row.status === "Forwarded" &&
        //       <img
        //         src={`${IMAGE_BASE}btn-to-alc.png`}
        //         alt="logo"
        //         className="object-contain"
        //       /> 
        //     ),
        //   },
        {
            name: "Actions",
            selector: (row) => row.establishment,
            wrap: true,
        },
        {
            name: "Form V/Ref. No.",
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
        <div className='bg-slate-200'>
            <div className="bg-gray-100 p-4 border-b">
                <h1 className="text-xl font-semibold text-gray-900">
                   LICENSE APPLICATION FOR INTER STATE MIGRANT WORKMEN
                </h1>
            </div>

            <div className="bg-white border rounded shadow mx-4 mt-8">
                {/* Blue Header */}
                {/* <ClraRegDashboardTabs /> */}
                <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
                    ESTABLISHMENT LOCATION AND FORM-VI NUMBER
                </div>

                <div className="p-4">
                    <FormField label="Select Location of the Establishment" required>
                        <Select defaultValue="Dec">
                            <SelectTrigger className="w-1/3 h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Dec">West Bengal</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>

                {/* Row 5 */}
            </div>
        </div>

    );
};

export default ISMWLicenseLocation;