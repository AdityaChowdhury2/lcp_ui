import React from "react";

const SectionHeader = ({ title }: { title: string }) => (
  <div className="bg-[#6b4f1d] text-white font-semibold text-sm md:text-base text-center px-4 py-2 border border-[#5a4217]">
    {title}
  </div>
);

const SubHeader = ({ title }: { title: string }) => (
  <div className="bg-[#4a5c6a] text-white font-medium text-sm text-center px-4 py-2 border-x border-b border-gray-400">
    {title}
  </div>
);

const TableWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full overflow-x-auto">
    <table className="w-full min-w-[600px] border-collapse text-[13px]">
      <tbody>{children}</tbody>
    </table>
  </div>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <tr className="hover:bg-blue-100 transition duration-200 ease-in-out">
    <td className="w-[40%] bg-gray-100 border border-gray-400 px-3 py-2 font-medium align-top break-words">
      {label}
    </td>
    <td className="w-[60%] border border-gray-400 px-3 py-2 align-top break-words whitespace-pre-line">
      {value}
    </td>
  </tr>
);

const ApplicationPreview: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Main Government Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm mb-3">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 px-6 py-4 tracking-wide">
          APPLICATION PREVIEW
        </h1>
      </div>

      <div className="">
        <div className=" mx-auto bg-white border  shadow-sm py-6">
          {/* Main Title */}
          <div className="bg-[#e6dfd2] text-center font-semibold text-lg md:text-xl py-3">
            Registration for Inter-State Migrant Workmen Application Preview
          </div>

          <div className="p-4 space-y-6">
            {/* 1 */}
            <div>
              <SectionHeader title="1. Name and Location of the Establishment" />
              <TableWrapper>
                <Row label="Establishment Name" value="TEST SUCHINTA" />
                <Row label="Establishment Type" value="Micro" />
                <Row
                  label="Address of the Establishment"
                  value={`Fartabad,belala,Garia
Ward-1, Jhargram Municipality,
Jhargram, PS - Jhargram,
Jhargram, PIN - 700086`}
                />
              </TableWrapper>
            </div>

            {/* 2 */}
            <div>
              <SectionHeader title="2. Postal Address of the Establishment" />
              <TableWrapper>
                <Row
                  label="Postal Address"
                  value={`Fartabad,belala,Garia
Ward-1, Jhargram Municipality,
Jhargram, PS - Jhargram,
Jhargram, PIN - 700086`}
                />
              </TableWrapper>
            </div>

            {/* 3 */}
            <div>
              <SectionHeader title="3. Full Name and Address of the Principal Employer" />
              <TableWrapper>
                <Row
                  label="Name of the Principal Employer"
                  value="Lopamudra Jana"
                />
                <Row label="Gender" value="Male" />
                <Row
                  label="Father/Husband name of the Principal Employer"
                  value="asd"
                />
                <Row
                  label="Address of the Principal Employer"
                  value={`Fartabad,belala,Garia
Ward-1, Jhargram Municipality,
Jhargram, PS - Jhargram,
Jhargram, PIN - 700086, West Bengal`}
                />
              </TableWrapper>
            </div>

            {/* 4 */}
            <div>
              <SectionHeader title="4. Name and Address of the Directors/Partners" />
              <SubHeader title="1. Director" />
              <TableWrapper>
                <Row label="Name of the Director" value="aASas (Director)" />
                <Row
                  label="Address of the Director"
                  value={`Fartabad,belala,Garia
Ward-1, Jhargram Municipality,
Jhargram, PS - Jhargram,
Jhargram, PIN - 700084, West Bengal`}
                />
              </TableWrapper>
            </div>

            {/* 5 */}
            <div>
              <SectionHeader title="5. Manager / Responsible Person" />
              <div className="border border-gray-400 text-sm text-center py-3 bg-gray-50 hover:bg-blue-100 transition">
                No Managers Added
              </div>
            </div>

            {/* 6 */}
            <div>
              <SectionHeader title="6. Registration Details (Contract Labour Act, 1970)" />
              <TableWrapper>
                <Row label="Registration Number" value="rqeweqwe123" />
                <Row label="Date of Registration" value="04th Aug, 2025" />
              </TableWrapper>
            </div>

            {/* 7 */}
            <div>
              <SectionHeader title="7. Nature of Work" />
              <TableWrapper>
                <Row label="Nature of Work" value="Qwer" />
              </TableWrapper>
            </div>

            {/* 8 */}
            <div>
              <SectionHeader title="8. Maximum Migrant Workmen per Day" />
              <TableWrapper>
                <Row label="Maximum number of migrant workmen" value="123" />
              </TableWrapper>
            </div>

            {/* 9 */}
            <div>
              <SectionHeader title="9. Particulars of Contractors and Migrant Workmen" />
              <SubHeader title="1. Contractor" />
              <TableWrapper>
                <Row
                  label="Name of the Contractor"
                  value="Lopamudra Jana (New Contractor)"
                />
                <Row label="Email of the Contractor" value="123@qwe.com" />
                <Row
                  label="Address of the Contractor"
                  value={`Fartabad,belala,Garia
Ward-1, Jhargram Municipality,
Jhargram, PS - Jhargram,
Jhargram, PIN - 700086, West Bengal`}
                />
                <Row label="Nature of Work" value="-" />
                <Row label="Maximum Workmen per Day" value="123" />
                <Row label="Work Start Date" value="04th Feb, 2025" />
                <Row label="Work End Date" value="31st Aug, 2025" />
              </TableWrapper>
            </div>

            {/* 10 */}
            <div>
              <SectionHeader title="10. Documents Uploaded" />
              <TableWrapper>
                <Row label="Trade License" value="No Document Uploaded" />
                <Row
                  label="Articles of Association / Partnership Deed"
                  value="No Document Uploaded"
                />
                <Row label="Factory License" value="No Document Uploaded" />
                <Row
                  label="Certificate from Other State Authorities"
                  value="No Document Uploaded"
                />
                <Row
                  label="Supporting Documents"
                  value="No Document Uploaded"
                />
              </TableWrapper>
            </div>

            {/* Button */}
            <div className="flex justify-end py-4">
              <button className="bg-blue-600 hover:bg-blue-700 transition duration-200 text-white text-sm px-5 py-2 rounded shadow-md">
                VIEW & PRINT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPreview;
