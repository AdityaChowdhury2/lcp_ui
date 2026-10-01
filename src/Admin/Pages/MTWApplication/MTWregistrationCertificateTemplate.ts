import { IMAGE_BASE } from '@/constants/constants';

export const generateMTWregistrationCertificateTemplate = (data: any) => {
    return `
    <!doctype html>
<html>

<head>
    <meta charset="UTF-8" />
    <title>Registration Certificate</title>

    <style>
        @page {
            size: A4;
            margin: 0;
        }

        html,
        body {
            margin: 0;
            padding: 0;
        }

        @media print {
            body {
                margin: 0;
            }
        }

        .pageNumber {
            text-align: right;
            font-style: italic;
            font-size: 12px;
            font-weight: bolder;
        }

        .footerNote {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 14px;
            font-weight: bolder;
            margin-top: 12mm;
        }
    </style>
</head>

<body>
    <!-- ================= PAGE 1 ================= -->
    <div style="
            width: 210mm;
            height: 297mm;
            position: relative;
            font-family: &quot;Times New Roman&quot;, serif;
            page-break-after: always;
        ">
        <!-- INNER FRAME -->
        <div style="
            position: absolute;
            top: 10mm;
            left: 10mm;
            right: 10mm;
            bottom: 10mm;
            overflow: hidden;
            ">
            <!-- Decorative Border -->
            <img src="${IMAGE_BASE}frame-md-up2.png" style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            " />

            <!-- Watermark (YOUR METHOD KEPT EXACTLY) -->
            <!-- Watermark -->
            <div style="position: absolute; top: 0; left: 0; height: 35px; z-index: 5 ">
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
                <img src="${IMAGE_BASE}bg-gov-wb.png" style="height: 35px; opacity: 0.9" />
            </div>

            <!-- CONTENT -->
            <div style="
                position: absolute;
                top: 12mm;
                left: 12mm;
                right: 12mm;
                bottom: 12mm;
                z-index: 3;
                font-size: 12.5px;
            ">
                <!-- Emblem -->
                <div style="text-align: center">
                    <img src="${IMAGE_BASE}emblemofindia.png" style="width: 24mm" />
                </div>

                <!-- Header -->
                <div style="
                text-align: center;
                font-weight: bold;
                margin-top: 2mm;
                font-size: 22px;
                color: #1f3f8f;
                ">
                    GOVERNMENT OF WEST BENGAL
                </div>

                <div style="
                text-align: center;
                font-weight: bold;
                font-size: 16px;
                margin-top: 4mm;
                color: #535353;
                ">
                    OFFICE OF THE LABOUR COMMISSIONER EL & MW SECTION
                </div>

                <div style="
                text-align: center;
                font-weight: bold;
                font-size: 16px;
                color: #535353;
                ">
                    KOLKATA
                </div>

                <div style="
                text-align: center;
                font-size: 12px;
                margin-top: 4mm;
                margin-bottom: 8mm;
                color: #1f3f8f;
                font-size: 16px;
                font-weight: bold;
                font-style:italic;
                ">
                    6, Church Lane, 3rd Floor, Kolkata-700001 Telefax: (033) 2248-5721/(033) 2262-7827 Email:
                    dlcelmw@gmail.com
                </div>

                <div style="text-align: center; font-weight: bold;font-size: 16px; color: #1f3f8f">
                    FORM - II
                </div>

                <div style="text-align: center; font-size: 12px; color: #1f3f8f">
                    [ See Rule 5 ]
                </div>

                <div style="
                text-align: center;
                font-weight: bolder;
                font-size: 14px;
                margin-top: 8mm;
                color: #535353;
                ">
                    CERTIFICATE OF REGISTRATION TO WORK A MOTOR TRANSPORT UNDERTAKING
                </div>

                <!-- Registration and Date Info -->
                <div style="margin-top: 4mm; color: #1f3f8f; font-weight:bolder;font-style:italic;font-size:16px;">
                    <!-- <b>Registration No. :</b> ${data?.registrationNumber} -->
                    <b>Registration No. :</b> KOL01/MTW/000054
                    <!-- <span style="float: right"><b>Date :</b> ${data?.date}</span> -->
                    <span style="float: right"><b>Date:</b> 12th Feb, 2024</span>
                </div>

                <!-- Serial No and Fees Info -->
                <div style="margin-top: 2mm; color: #1f3f8f;font-weight:bolder;font-style:italic;font-size:16px;">
                    <!-- <b>Serial No. :</b> ${data?.registrationNumber} -->
                    <b>Serial No. :</b> C/171001/2024/54
                    <!-- <span style="float: right"><b>Fees :</b> ${data?.date}</span> -->
                    <span style="float: right"><b>Fees:</b> ₹ 10</span>
                </div>

                <div style="
                clear: both;
                margin-top: 15mm;
                text-align: justify;
                color: #1f3f8f;
                font-style: italic;
                font-size: 14px;
                line-height: 20px;
                ">
                    Certificate of Registration is hereby granted to <strong>M/s VOLER CAR PRIVATE LIMITED</strong>, to
                    operate motor transport undertaking employing not more than <strong>4</strong> person(s) on any one
                    day during the
                    year subject to the provisions of the Motor Transport Workers Act, 1961, and the Rules, made
                    thereunder
                </div>

                <div style="
                clear: both;
                margin-top: 10mm;
                text-align: justify;
                color: #1f3f8f;
                font-style: italic;
                font-size: 14px;
                line-height: 20px;
                ">
                    The Certificate of Registration shall remain in force till the 31st day of December 2026.
                </div>

                <!-- Bottom -->
                <div style="position: relative; height: 35mm">
                    <img src="${IMAGE_BASE}qr.png"
                        style="position: absolute; left: 0; bottom: -50px; width: 25mm" />

                    <div style="
                    position: absolute;
                    right: 0;
                    bottom: -13mm;
                    text-align: right;
                    color: #1f3f8f;
                    font-weight: 500;
                    font-size: 16px;
                ">
                        Chief Inspector/Inspectors
                    </div>
                </div>

                <!-- Footer -->
                <!-- <div style="
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 13px;
                font-weight: bolder;
                ">
                    **This is system generated certificate and does not require any
                    signature. For authenticity, please scan the QR Code.
                </div> -->

                <div class="footerNote">

                    <div>**This is system generated certificate and does not require any signature.</div>

                    <div>For authenticity, please scan the QR Code.</div>

                </div>
            </div>
        </div>

        <!-- Page 1 Number -->
        <!-- <div style="position: absolute; bottom: 5mm; left: 20mm; right: 20mm">
            <div style="text-align: right; font-style: italic">1 of 2</div>
            <div style="border-top: 1px solid #000; margin-top: 3px"></div>
        </div> -->

        <!-- PAGE NUMBER -->
        <div style="position:absolute;bottom:4mm;left:20mm;right:20mm">
            <div style="border-top:1px solid #000;margin-top:3px"></div>
            <div class="pageNumber">1 of 1</div>
        </div>
    </div>

</body>

</html>
`;
};