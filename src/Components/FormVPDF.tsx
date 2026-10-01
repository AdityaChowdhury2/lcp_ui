import { getAuthToken } from '../utils/auth'
import { ACTS, API_BASE, IMAGE_BASE, STATUS_IMAGE_MAP } from "@/constants/constants";
import { encryptionDecryptionFun } from '@/utils/encryption';
import { QRCodeCanvas } from 'qrcode.react';
import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom';

interface Establishment {
    name?: string;
    addressLine?: string;
    village?: string;
    blockMunicipality?: string;
    subdivision?: string;
    district?: string;
    policeStation?: string;
    pinCode?: string;
    state?: string;
    displayAddress?: string;
}

interface SignatureBlock {
    date: string;
    principalEmployerName: string;
    registrationNumber: string;
}
interface FormVDataType {
    contractorNameUpper: string;
    establishment: Establishment;
    contractor?: Establishment;
    serialNumber: string;
    place: string;
    signatureBlock: SignatureBlock;
    maxNoOfContractLabour: string;
    natureOfWork: string;
    qrCodeBase64: string
}

function FormVPDF() {
    const location = useLocation()
    const hasPrinted = useRef(false)
    
    const [formvData, setFormvData] = useState<FormVDataType | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const appId = location.state?.appId;
    const serialNo = location.state?.formVSerialNo;
    const encryptedSerial = encryptionDecryptionFun("encrypt", serialNo?.toString()) ?? "";

    const formatAddress = (address = "") => {
        const parts = address.split(",").map(p => p.trim());

        return [
            parts[0],
            parts.slice(1, 3).join(", "),
            parts.slice(3, 5).join(", "),
            parts.slice(5).join(", "),
        ].filter(Boolean);
    };

    useEffect(() => {
        const getFormVData = async () => {
            // const res = await fetch(`${API_BASE}certificate/form-v-page?serialNoEnc=${isClraAct ? encodeURIComponent(encClraActId) : isBocwaAct ? encodeURIComponent(encBocwaActId) : ""}&applicationIdEnc=${encodeURIComponent(appId)}`
            const res = await fetch(`${API_BASE}certificate/form-v-page?serialNoEnc=${encodeURIComponent(encryptedSerial)}&applicationIdEnc=${encodeURIComponent(appId)}`
                , {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                        "Content-Type": "application/json",
                    }
                })

            const result = await res.json()
            console.log(result);

            // The server refuses Form V for non-issued applications and for
            // contractors that already hold one; show why instead of printing blank.
            if (!res.ok) {
                setLoadError(
                    (Array.isArray(result?.message) ? result.message[0] : result?.message) ||
                    "Form V is not available for this contractor."
                );
                return;
            }

            setFormvData(result)
            setIsDataLoaded(true);
        }
        getFormVData()
    }, [])

    const splittedDisplayAddress = formvData?.establishment?.displayAddress?.split(",")
    const first = formvData?.establishment?.displayAddress?.split(",")[0]?.trim();
    const isNumber = /^\d+$/.test(first || "");

    useEffect(() => {
        if (isDataLoaded && !hasPrinted.current) {
            hasPrinted.current = true;

            setTimeout(() => {
                window.print();
            }, 300);
        }
    }, [isDataLoaded]);

    if (loadError) {
        return (
            <div className="max-w-3xl mx-auto p-6 text-[14px] leading-6 bg-white text-black">
                <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {loadError}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto p-6 text-[14px] leading-6 bg-white text-black">

            <div className="text-center">
                <h2 className="font-bold text-2xl">FORM V</h2>
                <p>[ See Rule 21(2) ]</p>
                <p className="mt-6 text-lg">
                    Form of Certificate by Principal Employer
                </p>
            </div>

            <div className="mb-6">
                <p className='text-center'>
                    <span className="font-semibold">Serial number :</span> {formvData?.serialNumber}
                </p>
            </div>

            <div className="mb-4 text-justify">
                <p>
                    Certified that I have engaged the applicant{" "}
                    <span className="font-semibold">
                        {formvData?.contractorNameUpper}, {' '}
                        {formvData?.contractor?.addressLine ?? 'N/A'}, {' '}
                        {formvData?.contractor?.village ?? 'N/A'}, {' '}
                        {formvData?.contractor?.blockMunicipality ?? 'N/A'}, {' '}
                        {formvData?.contractor?.subdivision ?? 'N/A'}, {' '}
                        Dist - {formvData?.contractor?.district ?? 'N/A'}, {' '}
                        P.S - {formvData?.contractor?.policeStation ?? 'N/A'}, {' '}
                        PIN - {formvData?.contractor?.pinCode ?? 'N/A'}, {' '}
                        {formvData?.contractor?.state ?? 'N/A'}
                    </span>{" "}
                    as a contractor in my establishment. I undertake to be bound by all the
                    provisions of the Contract Labour (Regulation & Abolition) Act, 1970, and
                    the West Bengal Contract Labour (Regulation and Abolition) Rules, 1972, in
                    so far as the provisions are applicable to me in respect of the employment
                    of contract labour by the applicant in my establishment.
                </p>
            </div>

            <div className="flex justify-between mt-[15%]">
                <div>
                    <p>Place : {formvData?.place}</p>
                    <p>Date : {formvData?.signatureBlock?.date}</p>
                </div>

                <div className="text-right">
                    <p>{formvData?.signatureBlock?.principalEmployerName}</p>
                    <p className="">Signature of Principal Employer</p>
                    <p className="font-bold">{formvData?.signatureBlock?.registrationNumber}</p>
                </div>
            </div>

            {/* <div className="mt-4 font-semibold">
               
            </div> */}

            {/* Establishment Section */}
            <div className="mt-8 flex items-center justify-evenly">
                <div className='w-[50%]'>
                    {/* <img src={`${IMAGE_BASE}qr.png`} className='h-[120px]' alt="" /> */}
                    {/* <QRCodeCanvas
                        value={qrCode ?? ""}
                        size={90}
                        level="H"
                        className="p-1 bg-white cursor-pointer"
                        onClick={() => {
                            if (qrCode) {
                                window.open(qrCode, "_blank");
                            }
                        }}
                    />
                    <img
                        src={formvData?.qrCodeBase64}
                        alt="QR Code"
                        className="h-[120px] cursor-pointer"
                        onClick={async () => {
                            const decodedUrl = await decodeQR(formvData?.qrCodeBase64 || "");

                            if (decodedUrl) {
                                window.open(decodedUrl, "_blank");
                            } else {
                                alert("Invalid QR Code");
                            }
                        }}
                    /> */}
                    {/* <div
                        onClick={() => qrCode && window.open(qrCode, "_blank")}
                        className="cursor-pointer inline-block"
                    >
                        <QRCodeCanvas
                            value={qrCode ?? ""}
                            size={90}
                            level="H"
                            className="p-1 bg-white"
                        />
                    </div> */}
                    <img
                        src={formvData?.qrCodeBase64}
                        alt="QR Code"
                        className="h-[120px]"
                    />
                </div>
                <div className="mt-6">
                    <p className="font-bold uppercase">
                        NAME AND ADDRESS OF ESTABLISHMENT
                    </p>

                    <div className="mt-2">
                        <p className="">{formvData?.establishment?.name}</p>
                        <p>{formvData?.establishment?.addressLine}</p>
                        <p>{formvData?.establishment?.village} , {formvData?.establishment?.blockMunicipality}</p>
                        <p>{formvData?.establishment?.subdivision} , PS - {formvData?.establishment?.policeStation},</p>
                        <p>{formvData?.establishment?.district}, PIN-{formvData?.establishment?.pinCode}, {formvData?.establishment?.state}</p>
                    </div>
                </div>
            </div>

            {/* Extra Info */}
            <div className="mt-[20%]">
                <p>
                    <span className="text-sm">
                        Maximum Number of Contractor Labour to be Employed:
                    </span>{" "}
                    {formvData?.maxNoOfContractLabour}
                </p>

                <p className="mt-2">
                    <span className="">Nature of Work : {formvData?.natureOfWork}</span>
                </p>
            </div>

        </div>
    )
}

export default FormVPDF