import { IMAGE_BASE } from "@/constants/constants";
import React from "react";
const bgImage = `${IMAGE_BASE}report_bg.png`;

export interface ContactCard {
  title: string;
  address: string;
  contact: string;
  email: string;
}

export const contactCards: ContactCard[] = [
  {
    title: "OFFICE OF THE LABOUR COMMISSIONERATE",
    address: "11th Floor, New Secretariat Building, 1,K.S.Roy Road, Kolkata – 700001",
    contact: "(033)-2248-8150",
    email: "labourcommissionerwb[dot]wb[at]gmail[dot]com"
  },
  {
    title: "OFFICE OF THE LABOUR COMMISSIONERATE (ESTABLISHMENT SECTION)",
    address: "11th Floor, New Secretariat Building, 1,K.S.Roy Road, Kolkata – 700001",
    contact: "N/A",
    email: "labourcommissionerwb[dot]est[at]gmail[dot]com"
  },
  {
    title: "OFFICE OF THE LABOUR COMMISSIONERATE (TRADE UNION SECTION)",
    address: "11th Floor, New Secretariat Building, 1,K.S.Roy Road, Kolkata – 700001",
    contact: "N/A",
    email: "tradeunionwb[at]gmail[dot]com"
  },
  {
    title: "OFFICE OF THE LABOUR COMMISSIONERATE (ACCOUNTS SECTION)",
    address: "11th Floor, New Secretariat Building, 1,K.S.Roy Road, Kolkata – 700001",
    contact: "N/A",
    email: "labourcommissionerwb[dot]acct[at]gmail[dot]com"
  },
  {
    title: "OFFICE OF THE LABOUR COMMISSIONERATE (JUTE CELL)",
    address: "11th Floor, New Secretariat Building, 1,K.S.Roy Road, Kolkata – 700001",
    contact: "N/A",
    email: "juteindustrywb[at]gmail[dot]com"
  },
  {
    title: "OFFICE OF THE LABOUR COMMISSIONERATE (FAWLOI CELL)",
    address: "11th Floor, New Secretariat Building, 1,K.S.Roy Road, Kolkata – 700001",
    contact: "N/A",
    email: "fawloiwb[at]gmail[dot]com"
  },

  // ➤ Continue adding until all 14 cards are added.
];


const ContactUsDetails: React.FC = () => {
  return (
    <div className="w-full px-50 py-10">
      <h1 className="text-4xl font-semibold mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {contactCards.map((card: ContactCard, index: number) => (
          <div
            key={index}
            className="shadow-lg rounded-md p-6 text-center"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "320px",
            }}
          >
            <h2 className="font-bold text-lg mb-4 leading-tight">
              {card.title}
            </h2>

            <p className="text-sm mb-2"><strong>Address:</strong> {card.address}</p>
            <p className="text-sm mb-2"><strong>Contact No.:</strong> {card.contact}</p>
            <p className="text-sm"><strong>Email:</strong> {card.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactUsDetails;
