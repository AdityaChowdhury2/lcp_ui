
import { Input } from "../../../Components/ui/input";
import { Button } from "../../../Components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../Components/ui/select";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "../../../Components/ui/popover";
import { Textarea } from "../../../Components/ui/textarea";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "../../../Components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "../../../Components/ui/command";
import { cn } from "../../../lib/utils";
import { Label } from "../../../Components/ui/label";
import { Checkbox } from "../../../Components/ui/checkbox";
import ClraRegDashboardTabs from "./ClraRegDashboardTabs";
import ClraRegDashboardTabsContractorAdded from "./ClraRegDashboardTabsContractorAdded";


const WorkerRow = ({ label }: { label: string }) => (
    <div className="grid grid-cols-5 gap-4 items-center mb-3">
        {/* Label */}
        <div className="font-medium text-gray-700">{label}</div>

        {/* Inputs */}
        <Input type="number" defaultValue={0} className="h-9 rounded-none" />
        <Input type="number" defaultValue={0} className="h-9 rounded-none" />
        <Input type="number" defaultValue={0} className="h-9 rounded-none" />
        <Input type="number" defaultValue={0} className="h-9 rounded-none" />
    </div>
);

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

const ClraRegViewApplicationContractorAdded: React.FC = () => {
    const [checkedItems, setCheckedItems] = useState({
        tradeLicense: false,
        articles: false,
        otherSupport: false,
        otherCertificates: false,
        factoryLicense: false,
    });

    const handleCheckboxChange = (key: keyof typeof checkedItems) => {
        setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const natureOfWorkOptions = [
        "Teaching",
        "Research",
        "Therapy",
        "Training",
        "Consultation",
        "Administration",
        "Others",
    ];

    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    return (
        <div className="w-full min-h-screen bg-[#ecf0f3] font-sans">

            {/* Page Title */}
            <div className="bg-white p-4 mb-4">
                <h1 className="text-xl font-semibold text-gray-900">APPLICATION DETAILS FOR AMENDMENT</h1>
            </div>

            <ClraRegDashboardTabsContractorAdded />
            <div className="bg-white border rounded shadow mx-4 mb-8">
                {/* Blue Header */}
                <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
                    1. NAME AND LOCATION OF THE ESTABLISHMENT: CAPITAL
                </div>

                {/* Content */}
                <div className="p-6 text-sm">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <FormField label="Establishment Name" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KAMALA CLEARING"
                            />
                        </FormField>


                        <FormField label="Type of The Establishment" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>


                        <FormField label="Location" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="C AND F"
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <FormField label="Select District" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Subivision" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Block / Municipality / Corporation / SEZ / Notified Area" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <FormField label="Select Municipality" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Ward" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Police Station" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <FormField label="Pin Code" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded shadow mx-4 mb-8">
                {/* Blue Header */}
                <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
                    2. REGISTERED OFFICE ADDRESS OF THE ESTABLISHMENT
                </div>

                {/* Content */}
                <div className="p-6 text-sm">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <FormField label="Address Line 1" required>
                            <Textarea
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>
                        <FormField label="Select District" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Subivision" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <FormField label="Select Block / Municipality / Corporation / SEZ / Notified Area" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <FormField label="Select Municipality" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Ward" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>



                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">

                        <FormField label="Select Police Station" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">AADHAR</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>


                        {/* Row 4 */}

                        <FormField label="Pin Code" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>
                    </div>

                    {/* Row 5 */}
                </div>
            </div>

            <div className="bg-white border rounded shadow mx-4 mb-8">
                {/* Blue Header */}
                <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
                    3. Full Name and address of the Principal Employer
                </div>

                {/* Content */}
                <div className="p-6 text-sm">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">


                        <FormField label="Principal Employer Name" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KAMALA CLEARING"
                            />
                        </FormField>

                        <FormField label="Gender" required>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-1">
                                    <Input type="radio" name="gender" defaultChecked /> Male
                                </label>
                                <label className="flex items-center gap-1">
                                    <Input type="radio" name="gender" /> Female
                                </label>
                                <label className="flex items-center gap-1">
                                    <Input type="radio" name="gender" /> Transgender
                                </label>
                            </div>
                        </FormField>

                        <FormField label="Country" required>
                            <div className="flex gap-2">
                                {/* Month */}
                                <Select defaultValue="Country">
                                    <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dec">India</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Day */}
                            </div>
                        </FormField>

                    </div>

                    <div className="mb-4 flex gap-3">


                        <div className="w-[32%]">
                            <FormField label="Select State" required>
                                <Select defaultValue="Dec">
                                    <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dec">West Bengal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </div>

                        <div className="w-2/3">
                            <FormField label="Address Line 1" required>
                                <Textarea
                                    className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                    defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                                />
                            </FormField>
                        </div>


                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField label="Select District" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">Howrah</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Subdivision" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">Block</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Block / Municipality / Corporation / SEZ / Notified Area" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <FormField label="Select Municipality" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Ward" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Police Station" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    <div className="w-[32%]">
                        <FormField label="Pin Code" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>
                    </div>
                </div>
            </div>


            <div className="bg-white border rounded shadow mx-4 mb-8">
                {/* Blue Header */}
                <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
                    4. FULL NAME AND ADDRESS OF THE MANAGER OR PERSON RESPONSIBLE FOR THE SUPERVISION AND CONTROL OF THE ESTABLISHMENT
                </div>

                {/* Content */}
                <div className="p-6 text-sm">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <FormField label="Name" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KAMALA CLEARING"
                            />
                        </FormField>

                        <FormField label="Select Country" required>
                            <div className="flex gap-2">
                                {/* Month */}
                                <Select defaultValue="Country">
                                    <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dec">India</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Day */}
                            </div>
                        </FormField>
                        <FormField label="Select State" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>



                    </div>

                    {/* Row 4 */}
                    <div className="flex gap-5 mb-4">
                        <div className="w-[66%]">
                            <FormField label="Address Line 1" required>
                                <Textarea
                                    className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                    defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                                />
                            </FormField>
                        </div>
                        <div className="w-[32%]">
                            <FormField label="Select District" required>
                                <Select defaultValue="Dec">
                                    <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dec">Howrah</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>

                        </div>

                    </div>

                    {/* Row 5 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                        <FormField label="Select Sub-Division" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">Block</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Block / Municipality / Corporation / SEZ / Notified Area" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>


                        <FormField label="Select Municipality" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Ward" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Select Police Station" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">India</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Pin Code" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>
                    </div>
                </div>
            </div>

            <div className="bg-white border rounded shadow mx-4 mb-8">
                {/* Blue Header */}
                <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
                    5. NATURE OF WORK CARRIED ON IN THE ESTABLISHMENT

                </div>

                {/* Content */}
                <div className="p-6 text-sm">
                    {/* Row 1 */}
                    <div className="w-full mb-4">
                        <FormField label="Select Nature of Work" required>
                            {/* <Select
              multiple
              className="w-full min-h-[120px] border bg-white border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e73be]"
            > */}
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className={cn(
                                            "w-full min-h-[120px] justify-between text-left font-normal border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e73be] hover:bg-transparent",
                                            selectedValues.length === 0 && "text-muted-foreground"
                                        )}
                                    >
                                        <div className="flex flex-wrap gap-2">
                                            {selectedValues.length > 0 ? (
                                                selectedValues.map((value) => (
                                                    <span
                                                        key={value}
                                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                                    >
                                                        {value}
                                                    </span>
                                                ))
                                            ) : (
                                                <span>Select nature of work...</span>
                                            )}
                                        </div>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-full p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search nature of work..." />
                                        <CommandEmpty>No option found.</CommandEmpty>
                                        <CommandGroup className="max-h-60 overflow-auto">
                                            {natureOfWorkOptions.map((option) => (
                                                <CommandItem
                                                    key={option}
                                                    onSelect={() => {
                                                        setSelectedValues((current) =>
                                                            current.includes(option)
                                                                ? current.filter((item) => item !== option)
                                                                : [...current, option]
                                                        );
                                                    }}
                                                >
                                                    <CheckIcon
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedValues.includes(option)
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        )}
                                                    />
                                                    {option}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                        </FormField>
                    </div>

                    {/* Optional: Hidden inputs for form submission */}
                    {selectedValues.map((val) => (
                        <input key={val} type="hidden" name="nature_of_work[]" value={val} />
                    ))}

                    <div className="mb-4">
                        <FormField label="Other Option for Nature of Work">
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-4">
                        <FormField label="(a) Maximum Number of Workmen Employed Directly on any day in the Establishment" required>

                            {/* Month */}
                            <Select defaultValue="Country">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">India</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Day */}

                        </FormField>
                        <FormField label="(b) Number of Workmen Engaged as Permanent/Regular Workmen" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="(c) Number of Workmen Engaged as Temporary/Regular Workmen" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>


                    </div>

                    <div>
                        <FormField label="(d) Whether the Workmen employed/intended to be Employment by the Contractor Perform the same or similar kind of work as the Workmen employed directly by the Principal Employer (if yes, please give here information as detailed below)" required>


                            <div className="flex gap-8 mt-2">
                                <label className="flex items-center gap-1">
                                    <Input type="radio" name="gender" defaultChecked /> No
                                </label>
                                <label className="flex items-center gap-1">
                                    <Input type="radio" name="gender" /> Yes
                                </label>
                            </div>


                        </FormField>
                    </div>


                    {/* Row 4 */}
                    <div className="grid md:grid-cols-3 gap-5 mb-4">

                        <FormField label="i. A complete job description of the contract labour" required>
                            <Textarea
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>


                        <FormField label="ii. Wage rates and other cash benefits paid/to be paid" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>

                        <FormField label="iii. Category/designation/nomenclature of the job" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>

                    </div>

                    {/* Row 5 */}
                    <div className="w-full">

                        <FormField label="(e) Settlement or award or judgement or minimum wages ( if any applicable in the establishment )" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>

                    </div>
                </div>
            </div>


            <div className="bg-white border rounded shadow mx-4 mb-8">
                {/* Blue Header */}
                <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
                    6. MAXIMUM NUMBER OF CONTRACT LABOUR TO BE EMPLOYED ON ANY DAY THROUGH EACH CONTRACTOR
                </div>
                <div className="w-full mb-4 p-[2em]">
                    <FormField label="Maximum number of contract labour to be employed on any day through each contractor" required>
                        <Input
                            className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                            defaultValue="KAMALA CLEARING"
                        />
                    </FormField>
                </div>
            </div>

            {/* WORKER DETAILS CARD */}
            <div className="bg-white border rounded shadow mx-4 mb-8">
                {/* Blue Header */}
                <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
                    UPLOAD SUPPORTING DOCUMENTS
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-[2em]">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* 1. Trade License */}
                        <div>
                            <div className="flex items-center space-x-3 mb-3">
                                <Checkbox
                                    id="tradeLicense"
                                    checked={checkedItems.tradeLicense}
                                    onCheckedChange={() => handleCheckboxChange("tradeLicense")}
                                />
                                <Label htmlFor="tradeLicense" className="text-base font-medium">
                                    Trade License
                                </Label>
                            </div>
                            {checkedItems.tradeLicense && (
                                <div className="ml-8">
                                    <p className="font-medium mb-2">1. Upload Trade License</p>
                                    <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    <span className="text-sm text-gray-500">No file chosen</span>
                                </div>
                            )}
                        </div>

                        {/* 3. Any other document */}
                        <div>
                            <div className="flex items-center space-x-3 mb-3">
                                <Checkbox
                                    id="otherSupport"
                                    checked={checkedItems.otherSupport}
                                    onCheckedChange={() => handleCheckboxChange("otherSupport")}
                                />
                                <Label htmlFor="otherSupport" className="text-base font-medium">
                                    Any other document in support of correctness of the particulars mentioned in the application if required
                                </Label>
                            </div>
                            {checkedItems.otherSupport && (
                                <div className="ml-8">
                                    <p className="font-medium mb-2">3. Upload any other document in support of correctness of the particulars mentioned in the application if required</p>
                                    <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    <span className="text-sm text-gray-500">No file chosen</span>
                                </div>
                            )}
                        </div>

                        {/* 5. Factory License */}
                        <div>
                            <div className="flex items-center space-x-3 mb-3">
                                <Checkbox
                                    id="factoryLicense"
                                    checked={checkedItems.factoryLicense}
                                    onCheckedChange={() => handleCheckboxChange("factoryLicense")}
                                />
                                <Label htmlFor="factoryLicense" className="text-base font-medium">
                                    Factory License if any
                                </Label>
                            </div>
                            {checkedItems.factoryLicense && (
                                <div className="ml-8">
                                    <p className="font-medium mb-2">5. Upload Factory License</p>
                                    <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    <span className="text-sm text-gray-500">No file chosen</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* 2. Articles of Association */}
                        <div>
                            <div className="flex items-center space-x-3 mb-3">
                                <Checkbox
                                    id="articles"
                                    checked={checkedItems.articles}
                                    onCheckedChange={() => handleCheckboxChange("articles")}
                                />
                                <Label htmlFor="articles" className="text-base font-medium">
                                    Articles of Association and Memorandum of Association/Partnership Deed
                                </Label>
                            </div>
                            {checkedItems.articles && (
                                <div className="ml-8">
                                    <p className="font-medium mb-2">2. Upload Articles of Association and Memorandum of Association/Partnership Deed</p>
                                    <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    <span className="text-sm text-gray-500">No file chosen</span>
                                </div>
                            )}
                        </div>

                        {/* 4. Other certificates */}
                        <div>
                            <div className="flex items-center space-x-3 mb-3">
                                <Checkbox
                                    id="otherCertificates"
                                    checked={checkedItems.otherCertificates}
                                    onCheckedChange={() => handleCheckboxChange("otherCertificates")}
                                />
                                <Label htmlFor="otherCertificates" className="text-base font-medium">
                                    Other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.
                                </Label>
                            </div>
                            {checkedItems.otherCertificates && (
                                <div className="ml-8">
                                    <p className="font-medium mb-2">4. Upload other certificates of registration in case of other than company, proprietorship or partnership firm like cooperative, Trustees etc.</p>
                                    <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    <span className="text-sm text-gray-500">No file chosen</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Content */}

        </div>

    );
};

export default ClraRegViewApplicationContractorAdded;
;