import { IMAGE_BASE } from "@/constants/constants";
import React from "react";

interface Props {
  registrationNo: string;
  registrationDate: string;
  officeName: string;
  officeAddress: string;
  establishmentDetails: string;
  natureOfWork: string;
  contractorDetails: string;
  contractorNatureOfWork: string;
  maxContractLabour: number;
  qrUrl: string;
}

export const ClraAmendedCertificate: React.FC<Props> = ({
  registrationNo,
  registrationDate,
  officeName,
  officeAddress,
  establishmentDetails,
  natureOfWork,
  contractorDetails,
  contractorNatureOfWork,
  maxContractLabour,
  qrUrl,
}) => {
  return (
    <div className="flex justify-center bg-white py-6 print:p-0">
     <div className="w-[794px] min-h-[1123px] bg-white overflow-visible">
        {/* PAGE (WHITE) */}
        {/* <div className="w-[700px] min-h-[1123px] bg-white"> */}

        {/* WATERMARK LAYER */}
        <div
          className="w-full h-full bg-repeat"
          style={{ backgroundImage: "url(`${IMAGE_BASE}text-gov-of-wb-lc.png`)" }}
        >
          <div
        className="w-full h-full px-4 pt-4"
        style={{
          backgroundImage: "url(`${IMAGE_BASE}frame-md-up2.png`)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
        }}
      >

          {/* FRAME LAYER */}
          {/* <div
            className="min-h-[976px] px-4 pt-4"
            style={{
              backgroundImage: "url(`${IMAGE_BASE}frame-md-up2.png`)",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% 100%",
            }}
          > */}
            <div className="font-times text-[#0b3f88] p-4">
              {/* HEADER */}
              <table className="w-full text-center">
                <tbody>
                  <tr>
                    <td colSpan={2}>
                      <img
                        src={`${IMAGE_BASE}pdf-gov-logo copy copy.png`}
                        alt="WB Emblem"
                        className="mx-auto w-[120px] mb-1"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="text-[20px] font-bold uppercase">
                      Government of West Bengal
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="uppercase text-[13px] font-bold text-black leading-5">
                      {officeName}
                      <br />
                      <span className="italic">{officeAddress}</span>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="pt-2 text-[18px] font-bold">
                      FORM II
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="text-[12px]">
                      [ See Rule 18(1) ]
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="text-center py-2">
                      <img
                        src={`${IMAGE_BASE}text-registration.png`}
                        className="mx-auto h-[40px]"
                        alt="Registration"
                      />
                    </td>
                  </tr>


                  <tr>
                    <td className="text-left text-[14px] italic font-bold">
                      Registration No : {registrationNo}
                    </td>
                    <td className="text-right text-[14px] italic pt-4 font-bold">
                      Date : {registrationDate}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* INTRO */}
              <p className="mt-4 text-[12px] italic leading-6">
                A Certificate of Registration containing the following particulars is
                hereby granted under sub-section (2) of Section 7 of the Contract
                Labour (Regulation & Abolition) Act, 1970 and the Rules made thereunder
                to <b>{establishmentDetails}</b>.
              </p>

              {/* DETAILS TABLE */}
              <table className="w-full border border-[#0b3f88] border-collapse mt-4 text-[11px]">
                <tbody>
                  {[
                    ["1.", "Nature of work carried on in the Establishment", natureOfWork],
                    ["2.", "Name and Address of Contractors", contractorDetails],
                    [
                      "3.",
                      "Nature of work in which contractor labour is employed",
                      contractorNatureOfWork,
                    ],
                    [
                      "4.",
                      "Maximum number of contract labour to be employed on any day",
                      maxContractLabour,
                    ],
                    [
                      "5.",
                      "Other particulars relevant to employment of contract labour",
                      "Annexure II Attached",
                    ],
                  ].map(([sl, label, value], i) => (
                    <tr key={i}>
                      <td className="border border-[#0b3f88] p-2 w-[5%]">{sl}</td>
                      <td className="border border-[#0b3f88] p-2 w-[45%]">
                        {label}
                      </td>
                      <td className="border border-[#0b3f88] p-2 w-[50%] font-bold">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* FOOTER */}
              <table className="w-full mt-6">
                <tbody>
                  <tr>
                    <td className="w-[30%]">
                      <img src={qrUrl} alt="QR" className="w-[90px]" />
                    </td>
                    <td className="text-center text-[12px] leading-5">
                      Signature and Seal
                      <br />
                      of
                      <br />
                      Registering Officer
                    </td>
                  </tr>
                </tbody>
              </table>

              <p className="text-[9px] text-black text-center mt-3 font-bold">
                **This is a system generated certificate and does not require any
                signature. For authenticity, please scan the QR Code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};


