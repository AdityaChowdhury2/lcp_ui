import React from "react";

interface Contractor {
  id: number;
  slNo: number;
  name: string;
  address: string;
  natureOfWork: string;
  maxLabour: number;
  fromDate: string;
  toDate: string;
  isNewlyAdded?: boolean;
}

interface Props {
  contractors: Contractor[];
}

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export const ClraAnnexureI: React.FC<Props> = ({ contractors }) => {
  const pages = chunkArray(contractors, 10); // ✅ 10 per page

  return (
    <>
      {pages.map((page, pageIndex) => (
        <div
          key={pageIndex}
          className="flex justify-center bg-white py-6 print:py-0"
          style={{ pageBreakAfter: "always" }} // ✅ CRITICAL
        >
          {/* A4 PAGE */}
          <div
            className="bg-white px-10 py-8 font-serif text-black"
            style={{ width: "794px"}}
          >
            {/* TITLE */}
            <div className="text-center mb-6">
              <div className="text-[18px] font-bold underline">
                ANNEXURE I
              </div>
              <div className="text-[14px] font-bold mt-1">
                CONTRACTORS
              </div>
            </div>

            {/* TABLE */}
            <table className="w-full border border-black border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="border border-black p-2 w-[6%] text-left">Sl.No.</th>
                  <th className="border border-black p-2 w-[36%] text-left">NAME & ADDRESS</th>
                  <th className="border border-black p-2 w-[22%] text-left">NATURE OF WORK</th>
                  <th className="border border-black p-2 w-[12%] text-center">CONTRACT LABOUR</th>
                  <th className="border border-black p-2 w-[24%] text-left">WORK PERIOD</th>
                </tr>
              </thead>

              <tbody>
                {page.map((c) => (
                  <tr key={c.id}>
                    <td className="border border-black p-2 align-top">
                      {c.slNo}
                      {c.isNewlyAdded && (
                        <span className="text-red-600 font-bold">*</span>
                      )}
                    </td>

                    <td className="border border-black p-2 align-top">
                      <b className="uppercase">{c.name}</b>
                      <br />
                      <span className="text-[11px] italic">{c.address}</span>
                    </td>

                    <td className="border border-black p-2 align-top italic">
                      {c.natureOfWork}
                    </td>

                    <td className="border border-black p-2 text-center align-top">
                      {c.maxLabour}
                    </td>

                    <td className="border border-black p-2 text-[11px] align-top">
                      <b>FROM:</b> {c.fromDate}
                      <br /><br />
                      <b>TO:</b> {c.toDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* SIGNATURE ONLY ON LAST PAGE (OPTIONAL) */}
            {pageIndex === pages.length - 1 && (
              <div className="mt-20 text-right text-[12px]">
                Signature and Seal<br />
                of<br />
                Registering Officer
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );
};
