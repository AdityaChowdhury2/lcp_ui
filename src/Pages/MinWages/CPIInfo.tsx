import React from 'react'
import { useLocation } from 'react-router-dom'

interface WageRow {
    // id: number;
    type: string;
    title: string;
    month?: string | null;
    year?: string | number | null;
    monthint?: number | null;
    fileUrl?: string | null;
    synopsisUrl?: string | null;
    isNew?: boolean;
    name?: string;
    pdf?: string;
}

function CPIInfo() {
    const location = useLocation();

    const allCPI = location?.state?.allCPI;

    //console.log(allCPI);

    return (
        <div className="p-[20px]">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl italic text-gray-700 mb-4">
                    CPI
                </h1>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {allCPI.map((each: WageRow, ind:number) => (
                        <li onClick={() => {

                            if (each.fileUrl) {
                                window.open(each.fileUrl, "_blank");
                            }
                            // window.open(each.fileUrl);
                        }} style={{
                            backgroundImage: "url('/images/cpi-pdf.png')",
                            backgroundPosition: "center 25px",
                        }} className='relative W-[162px] h-[185px] py-[15px] mr-[25px] mb-[25px] border border-[#bdbdbd] text-center bg-white bg-no-repeat bg-[center_25px]'>
                            {each.isNew && (
                                <div className="absolute top-[30px] left-[90px] rotate-[-10deg] animate-blink">
                                    <span className="text-white text-[9px] font-bold px-4 shadow-md tracking-wide">
                                        NEW
                                    </span>
                                </div>
                            )}
                            <h1 className='text-[#f4382b] mt-[40px] p-0 text-[24px] font-bold uppercase'>CPI</h1>
                            <p className='text-black text-[16px] font-normal mb-[10px]'>  {each.month}
                                <br />
                                {each.year}</p>
                        </li>
                    ))

                    }
                </ul>
            </div>
        </div>
    )
}

export default CPIInfo
