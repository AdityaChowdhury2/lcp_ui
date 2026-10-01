import React from "react";
import "./DirectorateStyle.css";
import CountBox from "@/Components/ui/CountBox";
import { Separator } from "@/Components/ui/separator";

const Directorate = () => {
  return (
    <>
      <div className="max-w-6xl mx-auto text-center mt-10">
        <span className="text-3xl text-[#b7b1b1] uppercase leading-2">
          Welcome to{" "}
        </span>
        <br />
        <strong className="text-4xl text-[#554024] font-bold uppercase leading-7">
          Labour Commissionerate
        </strong>
        <Separator className="mt-4" />
        <p className="mt-5 font-light text-[15px]">
          The Labour Commissionerate facilitates not only conflict resolution
          between the management and the trade unions in the organized
          industrial sectors but also serves the greater purpose of enhancing
          the welfare of the large and heterogenous sections of the unorganized
          working classes through the just enforcement of labour laws as well as
          through the proper implementation of the various social security
          schemes. It also fixes the minimum wages for the different scheduled
          employment in the state on the basis of the Consumer Price Index
          Number.
        </p>
        <p className="mt-3 font-light text-[15px]">
          The manifold activities of this Commissionerate are carried out
          through its head quarters in Kolkata, 68 Regional offices and 480{" "}
          <strong className="text-[#896350] font-bold">
            Labour Welfare Facilitation Centres (LWFC)
          </strong>{" "}
          throughout West Bengal.
        </p>
        <p className="mt-10 text-[22px] bg-[#C90] text-white font-normal px-3 py-2 rounded-xl">
          Migrant Workers -{" "}
          <span>
            <a
              href="https://karmasathips.wb.gov.in/"
              className="text-[#333] hover:underline hover:text-white"
            >
              Click Here to Register in Karmasathi (Parijayee Shramik)
            </a>
          </span>{" "}
          and get various assistance
        </p>

        <div className="flex flex-wrap mb-16">
          <CountBox
            end={28764}
            label="Registration/ Amendment of Principal Employer Under CLRA"
          />

          <CountBox end={20261} label="Contractor License Under CLRA" />

          <CountBox
            end={231}
            label="Registration of Principal Employer Under IMW"
          />

          <CountBox
            end={279}
            label="Registration / Renewal of Motor Transport Undertaking"
          />

          <CountBox
            end={3486}
            label="Registration of Establishment Under BOCWA"
          />

          <CountBox end={21220} label="Registered Trade Union" />
        </div>
      </div>
    </>
  );
};

export default Directorate;
