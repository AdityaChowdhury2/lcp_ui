import React, { FC, useState } from "react";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../Components/ui/select";
import { Button } from "../Components/ui/button";
import { RadioGroup, RadioGroupItem } from "../Components/ui/radio-group";
import { Textarea } from "../Components/ui/textarea";
// import { ScrollArea } from "../Components/ui/scroll-area"
import {
  Mail,
  Notebook,
  Phone,
  SquareMenu,
  SquareMinus,
  User,
} from "lucide-react";
import { FaGlobeAmericas } from "react-icons/fa";
import { IMAGE_BASE } from "@/constants/constants";

const districts = [
  { id: "20", name: "Alipurduar" },
  { id: "13", name: "Bankura" },
  { id: "8", name: "Birbhum" },
  { id: "3", name: "Coochbehar" },
  { id: "5", name: "Dakshin Dinajpur" },
  { id: "1", name: "Darjeeling" },
  { id: "12", name: "Hooghly" },
  { id: "16", name: "Howrah" },
  { id: "2", name: "Jalpaiguri" },
  { id: "22", name: "Jhargram" },
  { id: "23", name: "Kalimpong" },
  { id: "17", name: "Kolkata" },
  { id: "6", name: "Maldah" },
  { id: "7", name: "Murshidabad" },
  { id: "10", name: "Nadia" },
  { id: "11", name: "North 24 Parganas" },
  { id: "21", name: "Paschim Bardhaman" },
  { id: "15", name: "Paschim Medinipur" },
  { id: "9", name: "Purba Bardhaman" },
  { id: "19", name: "Purba Medinipur" },
  { id: "14", name: "Purulia" },
  { id: "18", name: "South 24 Parganas" },
  { id: "4", name: "Uttar Dinajpur" },
  { id: "ALL", name: "ALL" },
];
const category = [
  { id: "1", name: "Registration" },
  { id: "2", name: "License" },
  { id: "3", name: "Renewal" },
  { id: "4", name: "Amendment" },
  { id: "5", name: "Others" },
  { id: "6", name: "Inspection" },
  { id: "7", name: "Register Report on visit By Inspector" },
];
const services = [
  {
    id: "A",
    name: "Beedi and Cigar workers(Condition of Employment) Act, 1966 and W.B rules thereunder",
  },
  { id: "B", name: "BOCW(R & C) Act, 1996 & W.B Rules 2004 thereunder" },
  {
    id: "H",
    name: "Child Labour (P & R) Act, 1986 and W.B  Rules, 1995 thereunder",
  },
  {
    id: "C",
    name: "Contract Labour (R & A) Act, 1970 & W.B.  Rules, 1972 thereunder, For  Contractors",
  },
  {
    id: "P",
    name: "Contract Labour (R & A) Act, 1970 & W.B.  Rules, 1972 thereunder , For Principal Employer",
  },
  { id: "E", name: "Equal Remuneration Act, 1976 thereunder" },
  { id: "L", name: "Maternity Bennefit Act, 1961" },
  { id: "W", name: "Minimum Wages Act, 1948 & W.B.  Rules 1951 thereunder" },
  {
    id: "M",
    name: "Motor Transport Workers Act, 1961 and W.B  Rules, 1963 thereunder",
  },
  {
    id: "G",
    name: "Payment of Gratuity Act, 1972 and W.B  Rules, 1973 thereunder",
  },
  {
    id: "O",
    name: "Payment of Wages Act, 1936 & W.B.  Rules, 1958 thereunder",
  },
  { id: "K", name: "Sales Promotion Emp.(C.S) Act, 1976" },
  {
    id: "S",
    name: "Shops & Establishments Act, 1963 and W.B  Rules, 1964 thereunder",
  },
  {
    id: "F",
    name: "The Inter-State Migrant Workmen (RECS) Act 1979 & W.B. Rules 1981, For Contractor",
  },
  {
    id: "I",
    name: "The Inter-State Migrant Workmen (RECS) Act 1979 & W.B. Rules 1981, For Principal Employer",
  },
  {
    id: "D",
    name: "The Payment of Bonus Act, 1965 and The Payment of Bonus Rules 1975 thereunder",
  },
  {
    id: "J",
    name: "The W.B Workmen’s House-Rent Allowance Act, 1974 & W.B Rules  1975 thereunder",
  },
  { id: "N", name: "The West Bengal Labour Welfare Fund Act, 1974" },
];

const Feedback: FC = () => {
  const [captcha, setCaptcha] = useState("");
  return (
    <>
      <section className="max-w-6xl mx-auto px-4 py-10 text-[#424242]">
        <h1 className="text-[36px] font-medium mb-2 italic">Enquiry</h1>

        <form className="bg-[#f6f5f4] p-6 space-y-6">
          {/* GRID - 3 COLUMNS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Name */}
            <div className="md:col-span-1 space-y-2">
              <Label className="flex items-center gap-1 font-light">
                Name <span className="text-red-500">*</span>
              </Label>

              <div className="flex items-center gap-3 border bg-[#ccc]">
                <User className="w-6 h-6 fill-[#512c09] ms-2" />
                <Input
                  placeholder="Enter your name"
                  required
                  className="border-0 focus-visible:ring-0 shadow-none rounded-none text-[12px] font-light"
                />
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-1 space-y-2">
              <Label className="flex items-center gap-1 font-light">
                Email <span className="text-red-500">*</span>
              </Label>

              <div className="flex items-center gap-3 border bg-[#ccc]">
                <Mail className="w-6 h-6 text-[#512c09] stroke-2 ms-2" />

                <Input
                  type="email"
                  placeholder="Enter email address"
                  required
                  className="border-0 focus-visible:ring-0 shadow-none rounded-none text-[12px] font-light"
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="md:col-span-1 space-y-2">
              <Label className="flex items-center gap-1 font-light">
                Contact Number <span className="text-red-500">*</span>
              </Label>

              <div className="flex items-center gap-3 border bg-[#ccc]">
                <Phone className="w-6 h-6 fill-[#512c09] stroke-0 ms-2" />

                <Input
                  placeholder="Enter 10 digits mobile number"
                  maxLength={10}
                  required
                  className="border-0 focus-visible:ring-0 shadow-none rounded-none text-[12px] font-light"
                />
              </div>
            </div>

            {/* District */}
            <div className="md:col-span-1 space-y-2">
              <Label className="flex items-center gap-1 font-light">
                District <span className="text-red-500">*</span>
              </Label>

              <div className="flex items-center gap-3 border bg-[#ccc]">
                <FaGlobeAmericas className="w-6 h-6 text-[#512c09] ms-2" />

                <Select>
                  <SelectTrigger className="select-no-arrow border-0 shadow-none focus:ring-0 rounded-none text-[12px] font-light bg-white w-full">
                    <SelectValue placeholder="- Select District -" />
                  </SelectTrigger>

                  <SelectContent className="p-0 max-h-80 overflow-y-auto rounded-none">
                    {districts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subdivision */}
            <div className="md:col-span-1 space-y-2">
              <Label className="flex items-center gap-1 font-light">
                Sub-Division <span className="text-red-500">*</span>
              </Label>

              <div className="flex items-center gap-3 border bg-[#ccc]">
                <SquareMinus className="w-6 h-6 text-[#512c09] ms-2" />

                <Select>
                  <SelectTrigger className="select-no-arrow border-0 shadow-none focus:ring-0 rounded-none text-[12px] font-light bg-white w-full">
                    <SelectValue placeholder="- Select -" />
                  </SelectTrigger>

                  <SelectContent className="p-0 max-h-80 overflow-y-auto rounded-none">
                    <SelectItem value="default">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Feedback Type */}
            <div>
              <Label className="font-light">
                Feedback Type <span className="text-red-500">*</span>
              </Label>
              <RadioGroup className="mt-2 flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="S"
                    id="s"
                    className="border-[#512c09] size-3"
                  />
                  <Label htmlFor="s" className="font-light">
                    Suggestion
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="C"
                    id="c"
                    className="border-[#512c09] size-3"
                  />
                  <Label htmlFor="c" className="font-light">
                    Complaint
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="O"
                    id="o"
                    className="border-[#512c09] size-3"
                  />
                  <Label htmlFor="o" className="font-light">
                    Others
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Category */}
            <div className="md:col-span-1 space-y-2">
              <Label className="flex items-center gap-1 font-light">
                Category <span className="text-red-500">*</span>
              </Label>

              <div className="flex items-center gap-3 border bg-[#ccc]">
                <SquareMenu className="w-6 h-6 text-[#512c09] ms-2" />

                <Select>
                  <SelectTrigger className="select-no-arrow border-0 shadow-none focus:ring-0 rounded-none text-[12px] font-light bg-white w-full">
                    <SelectValue placeholder="- Select -" />
                  </SelectTrigger>

                  <SelectContent className="p-0 max-h-80 overflow-y-auto rounded-none ms-6">
                    {category.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Service */}
            <div className="md:col-span-1 space-y-2">
              <Label className="flex items-center gap-1 font-light">
                Service <span className="text-red-500">*</span>
              </Label>

              <div className="flex items-center gap-3 border bg-[#ccc]">
                <SquareMenu className="w-6 h-6 text-[#512c09] ms-2" />

                <Select>
                  <SelectTrigger className="select-no-arrow border-0 shadow-none focus:ring-0 rounded-none text-[12px] font-light bg-white w-full">
                    <SelectValue placeholder="- Select -" />
                  </SelectTrigger>

                  <SelectContent className="p-0 max-h-80 overflow-y-auto rounded-none">
                    {services.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject */}
            <div className="md:col-span-1 space-y-2">
              <Label className="flex items-center gap-1 font-light">
                Subject <span className="text-red-500">*</span>
              </Label>

              <div className="flex items-center gap-3 border bg-[#ccc]">
                <Notebook className="w-6 h-6 text-[#512c09] stroke-2 ms-2" />

                <Input
                  placeholder="Topic title"
                  required
                  className="border-0 focus-visible:ring-0 shadow-none rounded-none text-[12px] font-light"
                />
              </div>
            </div>
          </div>

          {/* Comment */}
          <div className="md:col-span-1 space-y-2">
            <Label className="gap-1 font-light">
              Comment <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Write your comments here..."
              required
              rows={5}
              className="bg-white rounded-none shadow-none min-h-34 "
            />
          </div>

          {/* CAPTCHA Section */}
          <div className="flex items-center space-y-2 gap-2">
            <p className="text-gray-700 text-[14px]">
              What code is in the image? <span className="text-red-500">*</span>
              <br />
              <span className="text-[12px] text-gray-500">
                Enter the characters shown in the image.
              </span>
            </p>

            <div className="flex items-center space-x-4">
              {/* Captcha Image */}
              <img
                src={`${IMAGE_BASE}image_captcha?sid=2124404&ts=1765253107`}
                width={216}
                height={60}
                alt="Image CAPTCHA"
                className="border rounded w-[216px] h-[60px]"
              />

                    <p></p>
              {/* Input Field */}
              <Input
                id="captcha_response"
                name="captcha_response"
                placeholder="Enter captcha"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                className="w-[200px] text-[12px] font-light"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <Button type="submit" className="bg-[#7a6656] rounded-none uppercase font-light hover:bg-[#cc9900] cursor-pointer tracking-wide">Submit</Button>
            <Button type="reset" className="bg-[#7a6656] rounded-none uppercase font-light hover:bg-[#cc9900] cursor-pointer tracking-wide">
              Reset
            </Button>
          </div>
        </form>
      </section>
    </>
  );
};

export default Feedback;
