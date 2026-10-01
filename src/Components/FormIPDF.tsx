import { ACTS, API_BASE, IMAGE_BASE, STATUS_IMAGE_MAP } from "@/constants/constants";
import { getAuthToken } from "../utils/auth"
// import { getAuthToken, getUserName } from "../../utils/auth";
import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom';

interface formIDataType {
    applicantAddress: string
    subdivision: string
    applicantName: string
    submissionDate: string
    serviceDueDate: string
}

const FormIPDF = () => {
    const [formIData, setFormIData] = useState<formIDataType>()
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const hasPrinted = useRef(false)

    const location = useLocation()

    const appId = location.state?.appId;
    const encClraActId = location.state?.encClraActId;
    const isClraAct = location.state?.isClraAct;
    const encBocwaActId = location.state?.encBocwaActId;
    const isBocwaAct = location.state?.isBocwaAct;

    useEffect(() => {
        const getFormIData = async () => {
            const res = await fetch(`${API_BASE}certificate/service-acknowledgement?actIdEnc=${isClraAct ? encodeURIComponent(encClraActId) : isBocwaAct ? encodeURIComponent(encBocwaActId) : ""}&applicationIdEnc=${encodeURIComponent(appId)}`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    "Content-Type": "application/json",
                }
            })

            const result = await res.json()
            console.log(result);
            setFormIData(result)
            setIsDataLoaded(true);
        }
        getFormIData()
    }, [])

    useEffect(() => {
        if (isDataLoaded && isImageLoaded && !hasPrinted.current) {
            hasPrinted.current = true;

            setTimeout(() => {
                window.print();
            }, 300);
        }
    }, [isDataLoaded, isImageLoaded]);

    const formatAddress = (address = "") => {
        const parts = address.split(",").map(p => p.trim());

        return [
            parts[0],
            parts.slice(1, 3).join(", "),
            parts.slice(3, 5).join(", "),
            parts.slice(5).join(", "),
        ].filter(Boolean);
    };

    return (
        <div className="max-w-3xl mx-auto p-6 text-[14px] text-black leading-6 bg-white">
            <div className="text-center flex flex-col items-center mb-4">
                <img src={`${IMAGE_BASE}West-Bengal-Emblem.jpg`} onLoad={() => setIsImageLoaded(true)} className='h-[120px]' alt="" />
                <p className="font-semibold text-3xl">Form I</p>
                <p>[see rule 4]</p>
                <p className="">
                    (West Bengal Right to Public Service Act, 2013)
                </p>
                <h2 className="font-bold text-[16px] mt-1">ACKNOWLEDGEMENT</h2>
            </div>


            <div className="mb-4">
                <p><span className="font-semibold">From,</span></p>
                <p>The Assistant Labour Commissioner,</p>
                <p>{formIData?.subdivision}, West Bengal</p>
            </div>


            <div className="mb-4">
                <p><span className="font-semibold">To,</span></p>
                <p>{formIData?.applicantName}</p>
                {/* <p>Fartabad, beltala, garia</p>
                <p>Ward-17, Jhargram Municipality,</p>
                <p>Jhargram, PS - Jhargram,</p>
                <p>Jhargram, PIN-700086, West Bengal</p> */}
                {/* {formIData?.applicantAddress
                    ?.split(/<br\s*\/?>/gi)
                    .map((line, i) => (
                        <p key={i}>{line}</p>
                    ))} */}
                {/* {formIData?.applicantAddress
                    ?.replace(/<br\s*\/?>/gi, "\n")   // convert <br/> → \n
                    .split(/\n+/)                     // split by newline
                    .map((line, index) => (
                        <p key={index} className="m-0">
                            {line.trim()}
                        </p>
                    ))} */}
                {formatAddress(formIData?.applicantAddress).map((line, i) => (
                    <p key={i}>{line}</p>
                ))}
            </div>

            <div className="">
                <p>
                    <span className="font-semibold">Sub.- </span>
                    The West Bengal Right to Public Services Act, 2013 – Acknowledgement of application.
                </p>
            </div>


            <div className="mb-3">
                <p>
                    <span className="font-semibold">Ref.- </span>
                    Your application dated <span className="font-bold">{formIData?.submissionDate}</span>
                </p>
            </div>


            <div className="mb-4">
                <p>
                    I hereby acknowledge your application cited. Due date of service to be provided is
                    <span className="font-semibold"> {formIData?.serviceDueDate}</span>.
                </p>
            </div>


            <div className="mb-2 text-center font-semibold">OR</div>

            <div className="mb-2">
                <p>The following defects in the application may be rectified, urgently:</p>
                <p>(Specify defects, if any)</p>
            </div>

            {/* Defects */}
            <div className="mb-6 pl-4">
                <p>(1) ................ NIL ................</p>
                <p>(2) ................ NIL ................</p>
            </div>

            <div className="flex justify-between mt-8">
                <div>
                    <p> <span className="font-semibold">Place: </span>{formIData?.subdivision}</p>
                    <p> <span className="font-semibold">Date: </span>{formIData?.submissionDate}</p>
                </div>

                <div className="flex flex-col justify-center items-center flex-col">
                    <p>Yours faithfully,</p>
                    <p className="">Designated Officer / Authorised Officer</p>
                    <p className="mt-[-6px]">(Office Seal)</p>
                </div>
            </div>

            {/* Note */}
            <div className="mt-[30%] text-xs text-center">
                This acknowledgement being a system generated and therefore does not require any signature.
            </div>

        </div>
    )
}

export default FormIPDF
