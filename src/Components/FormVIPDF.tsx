import { getAuthToken } from '../utils/auth'
import { API_BASE } from "@/constants/constants";
import { encryptionDecryptionFun } from '@/utils/encryption';
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
interface FormVIDataType {
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

function FormVIPDF() {
    const location = useLocation()
    const hasPrinted = useRef(false)
    
    const [formviData, setFormviData] = useState<FormVIDataType | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const appId = location.state?.appId;
    const serialNo = location.state?.formVSerialNo;
    const encryptedSerial = encryptionDecryptionFun("encrypt", serialNo?.toString()) ?? "";

    useEffect(() => {
        const getFormVIData = async () => {
            const res = await fetch(`${API_BASE}certificate/form-vi-page?serialNoEnc=${encodeURIComponent(encryptedSerial)}&applicationIdEnc=${encodeURIComponent(appId)}`
                , {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                        "Content-Type": "application/json",
                    }
                })

            const result = await res.json()
            console.log(result);
            setFormviData(result)
            setIsDataLoaded(true);
        }
        getFormVIData()
    }, [])

    useEffect(() => {
        if (isDataLoaded && !hasPrinted.current) {
            hasPrinted.current = true;

            setTimeout(() => {
                window.print();
            }, 300);
        }
    }, [isDataLoaded]);

    return (
        <div className="max-w-3xl mx-auto p-6 text-[14px] leading-6 bg-white text-black">

            <div className="text-center">
                <h2 className="font-bold text-2xl">FORM VI</h2>
                <p>[ See Rule 6(3) ]</p>
                <p className="mt-6 text-lg font-bold">
                    Form for Certificate by Principal Employer
                </p>
            </div>

            <div className="mb-6">
                <p className='text-center'>
                    <span className="font-semibold">Serial number :</span> 00{formviData?.serialNumber}
                </p>
            </div>

            <div className="mb-4 text-justify">
                <p>
                    Certified that I have engaged the applicant{" "}
                    <span className="font-semibold">
                        {formviData?.contractorNameUpper}, {' '}
                        {formviData?.contractor?.addressLine ?? 'N/A'}, {' '}
                        {formviData?.contractor?.village ?? 'N/A'}, {' '}
                        {formviData?.contractor?.blockMunicipality ?? 'N/A'}, {' '}
                        {formviData?.contractor?.subdivision ?? 'N/A'}, {' '}
                        Dist - {formviData?.contractor?.district ?? 'N/A'}, {' '}
                        P.S - {formviData?.contractor?.policeStation ?? 'N/A'}, {' '}
                        PIN - {formviData?.contractor?.pinCode ?? 'N/A'}, {' '}
                        {formviData?.contractor?.state ?? 'N/A'}
                    </span>{" "}
                    as a contractor in my establishment. I undertake to be bound by all the
                    provisions of the Inter-State Migrant Workmen (Regulation of Employment and Conditions of Service) Act, 1979, and
                    the West Bengal Inter-State Migrant Workmen (Regulation of Employment and Conditions of Service) Rules, 1981, in
                    so far as the provisions are applicable to me in respect of the employment
                    of migrant workmen by the applicant in my establishment.
                </p>
            </div>

            <div className="flex justify-between mt-[15%]">
                <div>
                    <p>Place : {formviData?.place}</p>
                    <p>Date : {formviData?.signatureBlock?.date}</p>
                </div>

                <div className="text-right">
                    <p className="uppercase">{formviData?.signatureBlock?.principalEmployerName}</p>
                    <p className="">Signature of Principal Employer</p>
                    <p className="font-bold">{formviData?.signatureBlock?.registrationNumber}</p>
                </div>
            </div>

            {/* Establishment Section */}
            <div className="mt-8 flex items-center justify-evenly">
                <div className='w-[50%]'>
                    <img
                        src={formviData?.qrCodeBase64}
                        alt="QR Code"
                        className="h-[120px]"
                    />
                </div>
                <div className="mt-6">
                    <p className="font-bold uppercase">
                        NAME AND ADDRESS OF ESTABLISHMENT
                    </p>

                    <div className="mt-2 text-xs">
                        <p className="font-bold">{formviData?.establishment?.name}</p>
                        <p>{formviData?.establishment?.addressLine}</p>
                        <p>{formviData?.establishment?.village} , {formviData?.establishment?.blockMunicipality}</p>
                        <p>{formviData?.establishment?.subdivision} , PS - {formviData?.establishment?.policeStation},</p>
                        <p>{formviData?.establishment?.district}, PIN-{formviData?.establishment?.pinCode}, {formviData?.establishment?.state}</p>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default FormVIPDF;
