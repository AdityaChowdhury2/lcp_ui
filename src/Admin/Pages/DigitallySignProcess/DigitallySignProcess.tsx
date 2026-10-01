import React, { ReactElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DigitallySignProcess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[250px] mb-15">
            <h1 className="text-2xl font-semibold">How to digitally sign your documents using USB Token</h1>

            <div className="bg-white hover:bg-sky-100 p-2 rounded-md grid gap-2 my-4">
                <p>
                    Step-1. Plug in the USB Token into your System which is provided by the Service Provider.
                </p>

                <p>
                    Step-2.Install the Driver of that USB Token , which is either in the device or download it online from the Service Providers Portal.
                </p>

                <p>
                    Step-3. Verify the Validity and Credentials of the Certificate by Viewing Contents under Internet Options of IE ( Internet Explorer).
                </p>

                <p>
                    Step-4. The Certificate should be listed under the CERTIFICATES section . View the Validity , etc of the certificate once.
                </p>

                <p>
                    Step-5. The above process from Step 1-4 is a One time job only.
                </p>

                <p>
                    Step-6. Now download the PDF File from the Portal , which may be any Form, Certificate, etc which you intend to Digitally Sign.
                </p>

                <p>
                    Step-7. Save the PDF File in a desired folder in any destination of your Hard Drive.
                </p>

                <p>
                    Step-8. You should have Adobe Reader 11 or Adobe Reader DC in your system which is freely downloadable from https://get.adobe.com/reader/.
                </p>

                <p>
                    Step-9. Install the software into your system.
                </p>

                <p>
                    Step-10. Now open the PDF Document using Adobe Reader DC or Adobe 11.
                </p>

                <p>
                    Step-11. Go to the Tools option and click on to the Digitally Sign Button.
                </p>

                <p>
                    Step-12. Mark the Area with your mouse where you want to Digitally Sign.
                </p>

                <p>
                    Step-13. Your Certificate details shall be shown immediately.
                </p>

                <p>
                    Step-14. Enter your Private Key password provided by the Service Provider.
                </p>

                <p>
                    Step-15. Check on to the “Lock Document after Signing” Option.
                </p>

                <p>
                    Step-16. You have successfully signed the PDF document.
                </p>

                <p>
                    Step-17. Now save this pdf and rename it by adding a _signed and store in the same folder earlier created.
                </p>
            </div>

            <button className="text-orange-500 hover:text-orange-700" onClick={() => {}}>
                Click here to Download & Print
            </button>


            
        </div>
    )

}

export default DigitallySignProcess;