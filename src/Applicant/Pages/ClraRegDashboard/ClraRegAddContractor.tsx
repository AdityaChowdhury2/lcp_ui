import { Textarea } from '../../../Components/ui/textarea';
import { Input } from '../../../Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../Components/ui/select';
import { memo } from 'react';
import { Button } from '../../../Components/ui/button';
import { useNavigate } from 'react-router-dom';

const ClraRegAddContractor = () => {
    const navigate = useNavigate()
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

    return (
        <div>
            <div className="bg-white border rounded shadow mx-4 mb-8">
                {/* Blue Header */}
                <div className="bg-[#215e87] text-white font-semibold px-4 py-3 rounded-t">
                    PARTICULARS OF CONTRACTORS AND CONTRACT LABOUR
                </div>

                {/* Content */}
                <div className="p-6 text-sm">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <FormField label="2. Name of The Contractor" required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KAMALA CLEARING"
                            />
                        </FormField>


                        <FormField label="3. Email of the Contractor" required>
                            <Select defaultValue="Dec">
                                <SelectTrigger className="w-full h-[34px] border border-[#999] rounded-[2px] text-[14px] px-2 focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Dec">West Bengal</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="3. Select State" required>
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

                    <div className="w-full mb-4">
                        <FormField label="3.(a) Address Line 1 [If other State please provide detailed address ]" required>
                            <Textarea
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>
                    </div>
                    <div className='w-2/3 mb-4'>
                        <FormField label="4.Nature of Work in which Contract Labour is Employed or is to be Employed" required>
                            <select
                                multiple
                                className="w-full min-h-[120px] border bg-white border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e73be]"
                            >
                                {/* {options.map((opt, i) => (
                                <option key={i} value={opt}>
                                    {opt}
                                </option>
                            ))} */}
                            </select>
                        </FormField>
                    </div>
                    <div className='w-full mb-4'>
                        <FormField label="5. Maximum Number of Contractor Labour to be Employed on any day Through Each Contractor to be engaged " required>
                            <Input
                                className="w-full h-[34px] border border-[#999] px-2 py-[4px] rounded-[2px] text-[14px] focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                defaultValue="KULDANGA, SHYAMCHAK, JUJARSAHA"
                            />
                        </FormField>
                    </div>
                    {/* 6. Estimated Date of Employment */}
                    <div className="mb-8">
                        <FormField
                            label="6. Estimated Date of Employment of Each Contract Work Under Each Contractor"
                            required
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                                {/* From Date */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">
                                        From
                                    </label>
                                    <Input
                                        type="date"
                                        className="w-full h-[40px] border border-[#ccc] px-3 py-2 rounded-[4px] text-[14px] bg-white focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                    />
                                </div>

                                {/* To Date */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">
                                        To
                                    </label>
                                    <Input
                                        type="date"
                                        className="w-full h-[40px] border border-[#ccc] px-3 py-2 rounded-[4px] text-[14px] bg-white focus:outline-none focus:ring-0 focus:border-[#66afe9]"
                                    />
                                </div>

                                {/* Total Days */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-600">
                                        Total Days
                                    </label>
                                    <Input
                                        type="number"


                                        className="w-full h-[40px] border border-[#ccc] px-3 py-2 rounded-[4px] text-[14px] cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </FormField>
                    </div>
                    <div className="flex justify-between px-4 gap-4 mt-6">
                        <div className='flex gap-4'>
                        <Button onClick={() => navigate('/add-contractor')} className="bg-white hover:bg-[#1890ff] text-[#215e87] font-medium py-2 px-6 rounded-sm shadow border border-[#215e87] transition-colors">
                            GO TO DASHBOARD
                        </Button>
                          <Button onClick={() => navigate('/view-clra-application-details/clra-contractor-info')} className="bg-white hover:bg-[#1890ff] text-[#215e87] font-medium py-2 px-6 rounded-sm shadow border border-[#215e87] transition-colors">
                            BACK TO CONTRACTOR LIST
                        </Button>
                        </div>

                        
                        <Button className="bg-[#1e73be] hover:bg-[#175a93] text-white">
                            SAVE
                        </Button>
                    </div>

                    
                   

                </div>
            </div>
        </div>
    );
};

export default ClraRegAddContractor;