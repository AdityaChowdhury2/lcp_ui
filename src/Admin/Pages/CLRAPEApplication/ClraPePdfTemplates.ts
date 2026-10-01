import { IMAGE_BASE } from '@/constants/constants';

export const generateFormIPdfTemplate = (data: any) => {
    const tradeUnions = Array.isArray(data?.tradeUnions) ? data.tradeUnions : [];
    const hasTradeUnions = tradeUnions.length > 0;
    const contractors = Array.isArray(data?.contractors) ? data.contractors : [];

    // Reused declaration + signature block (bottom of the form and each annexure).
    const signatureBlock = `
<div class="declaration">
I hereby declare that the particulars given above are true to the best of my knowledge and belief.
</div>

<div class="sign-row">
<div>Date of application: ${data.applicationDate}</div>
<div class="sign-right">
[Seal and Stamp]<br/><br/>
Signature of the Principal Employer
</div>
</div>`;

    const annexureIPage = hasTradeUnions ? `
<!-- ================= ANNEXURE I (TRADE UNIONS) ================= -->
<section class="page-break">

<div class="annex-title">ANNEXURE I</div>
<div class="annex-sub">TRADE UNIONS</div>

<table class="annex-table">
<tr>
<th style="width:8%">No.</th>
<th style="width:18%">Registration Number</th>
<th style="width:49%">Trade Union Name</th>
<th style="width:25%">Address</th>
</tr>

${tradeUnions.map((tu: any, index: number) => `
<tr>
<td>${index + 1}</td>
<td>${tu.regnNo ?? ""}</td>
<td>${tu.name ?? ""}</td>
<td>${tu.address ?? ""}</td>
</tr>
`).join("")}

</table>

${signatureBlock}
</section>
` : "";

    return `
<!doctype html>
<html>
<head>
<meta charset="UTF-8" />
<title>FORM I</title>

<style>
@page { size: A4 portrait; }

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: "Times New Roman", serif;
  font-size: 14px;
  line-height: 1.5;
  color: #000;
}

.doc-title { text-align: center; font-size: 18px; font-weight: bold; margin: 0 0 4px; }
.doc-sub { text-align: center; font-size: 13px; font-style: italic; margin: 0 0 14px; }
.doc-heading { text-align: center; font-size: 16px; font-weight: bold; margin: 0 0 16px; }

table.main-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

table.main-table td {
  padding: 5px 6px;
  vertical-align: top;
}

table.main-table .left-col { width: 55%; }
table.main-table .right-col { width: 45%; }

/* Keep each label/value row intact when the form flows onto a second page. */
table.main-table tr { page-break-inside: avoid; break-inside: avoid; }

.section-heading td { padding-top: 16px; }

table.annex-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13px;
}

table.annex-table th,
table.annex-table td {
  border: 1px solid #000;
  padding: 6px;
  vertical-align: top;
  overflow-wrap: anywhere;
  word-break: break-word;
}

table.annex-table tr { page-break-inside: avoid; break-inside: avoid; }

.annex-title { text-align: center; font-size: 17px; font-weight: bold; margin: 0 0 4px; }
.annex-sub { text-align: center; font-size: 14px; font-weight: bold; margin: 0 0 16px; }

.declaration { margin-top: 26px; }

.sign-row {
  margin-top: 34px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sign-right { text-align: center; }

/* Force annexures onto a fresh page without fixed-height containers. */
.page-break { page-break-before: always; }
</style>
</head>

<body>

<!-- ================= FORM I ================= -->
<div class="doc-title">FORM "I"</div>
<div class="doc-sub">
Prescribed under Rule 17(1) and 18(2) of the West Bengal Contract Labour
(Regulation &amp; Abolition) Rules
</div>
<div class="doc-heading">
Application for Registration of Establishments Employing Contract Labour
</div>

<table class="main-table">

<tr>
<td class="left-col">1. Name and location of the establishment</td>
<td class="right-col">
${data.establishmentName}<br/>
${data.establishmentAddress}
</td>
</tr>

<tr>
<td class="left-col">2. Postal Address of the establishment</td>
<td class="right-col">${data.postalAddress}</td>
</tr>

<tr>
<td class="left-col">
3. Full name and address of the Principal Employer <br/>
[furnish father ́s name in the case of individuals]
</td>
<td class="right-col">
${data.principalEmployerName}<br/>
${data.principalEmployerAddress}
</td>
</tr>

<tr>
<td class="left-col">
4. Full name and address of the Manager or
person responsible for the supervision and
control of the establishment
</td>
<td class="right-col">
${data.managerName}<br/>
${data.managerAddress}
</td>
</tr>

<tr>
<td class="left-col">5. Nature of work carried on in the establishment</td>
<td class="right-col">${data.natureOfWork}</td>
</tr>

<tr>
<td class="left-col">(a) Maximum number of workmen employed directly
on any day in the establishment</td>
<td class="right-col">${data.maxDirectWorkers}</td>
</tr>

<tr>
<td class="left-col">(b) Number of workmen engaged as permanent/
regular workmen</td>
<td class="right-col">${data.permanentWorkers}</td>
</tr>

<tr>
<td class="left-col">(c) Number of workmen engaged as temporary/
regular workmen</td>
<td class="right-col">${data.temporaryWorkers}</td>
</tr>

<tr>
<td class="left-col">(d) Whether the workmen employed/intended to be
employment by the contractor perform the same or
similar kind of work as the workmen employed
directly by the Principal Employer (if yes, please give
here information as detailed below:)</td>
<td class="right-col">${data.sameWork}</td>
</tr>

<tr>
<td class="left-col">i. a complete job description of the contractor labour</td>
<td class="right-col">${data.jobDescription}</td>
</tr>

<tr>
<td class="left-col">ii. wage rates and other cash benefits paid/to be paid</td>
<td class="right-col">${data.wageBenefits}</td>
</tr>

<tr>
<td class="left-col">iii. category/designation/nomenclature of the job</td>
<td class="right-col">${data.categoryDesignation}</td>
</tr>

<tr>
<td class="left-col">(e) The name and addresses of the Trade Unions
operating in the establishment</td>
<td class="right-col">${hasTradeUnions ? "Annexure I Attached" : "NIL"}</td>
</tr>

<tr>
<td class="left-col">(f) Settlement or award or judgement or minimum
wages (if any applicable in the establishment)</td>
<td class="right-col">NIL</td>
</tr>

<tr class="section-heading">
<td class="left-col">6. Particulars of Contractors and Contract Labour</td>
<td class="right-col">Maximum Contract Labour: ${data.maxContractLabour}</td>
</tr>

<tr>
<td class="left-col">(a) Name and address of the Contractor</td>
<td class="right-col">Annexure II Attached</td>
</tr>

<tr>
<td class="left-col">(b) Nature of Work in which contract labour is
employed or is to be employed</td>
<td class="right-col">Annexure II Attached</td>
</tr>

<tr>
<td class="left-col">(c) Maximum number of contractor labour to be
employed on any day through each contractor</td>
<td class="right-col">${data?.maxContractLabour}</td>
</tr>

<tr>
<td class="left-col">(d) Estimated date of employment of each contract
work under each contractor</td>
<td class="right-col">Annexure II Attached</td>
</tr>

<tr class="section-heading">
<td class="left-col">
7. Particulars of treasury receipt enclosed <br/>
(Name of the Treasury, Amount and date)
</td>
<td class="right-col">
₹ ${data.treasuryAmount}<br/>
[Note: Fees as per CL(R&amp;A) has been already been
submitted] <br/>
Registration No: ${data.registrationNo}<br/>
Date of Issue: ${data.registrationDate}
</td>
</tr>

</table>

${signatureBlock}

${annexureIPage}

<!-- ================= ANNEXURE II (CONTRACTORS) ================= -->
<section class="page-break">

<div class="annex-title">ANNEXURE II</div>
<div class="annex-sub">CONTRACTORS</div>

<table class="annex-table">
<tr>
<th style="width:10%">SL.NO</th>
<th style="width:30%">NAME &amp; ADDRESS</th>
<th style="width:20%">NATURE OF WORK</th>
<th style="width:15%">MAX. NO.</th>
<th style="width:25%">PERIOD</th>
</tr>

${contractors.map((c: any, index: number) => `
<tr>
<td>${index + 1}</td>
<td>${c.name}<br/>${c.address}</td>
<td>${c.nature}</td>
<td>${c.maxLabour}</td>
<td>
FROM: ${c.from}<br/>
TO: ${c.to}
</td>
</tr>
`).join("")}

</table>

${signatureBlock}
</section>

</body>
</html>
`;
};


// Unused currently
export const generateCLRARegCertPdfTemplate = (data: {
    registrationNumber: any,
    natureOfWorkEstablishment: any,
    contractorName: any,
    contractorAddress: any,
    maxNoOfContractLabour: any,
    maxNoOfWorkmenEmployed: any,
    noOfWorkmenPermanent: any,
    noOfWorkmenTemporary: any,
    similarKindOfWork: any,
    jobDescription: any,
    wageRatesOtherBenefits: any,
    categoryDesignation: any,
    date: any,
}, qrBase64: string) => {
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
        </style>
    </head>

    <body>
        <!-- ================= PAGE 1 ================= -->
        <div
        style="
            width: 210mm;
            height: 297mm;
            position: relative;
            font-family: &quot;Times New Roman&quot;, serif;
            page-break-after: always;
        "
        >
        <!-- INNER FRAME -->
        <div
            style="
            position: absolute;
            top: 10mm;
            left: 10mm;
            right: 10mm;
            bottom: 10mm;
            overflow: hidden;
            "
        >
            <!-- Decorative Border -->
            <img
            src="${IMAGE_BASE}frame-md-up2.png"
            style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            "
            />

            <!-- Watermark (YOUR METHOD KEPT EXACTLY) -->
            <!-- Watermark -->
            <div
            style="position: absolute; top: 0; left: 0; height: 35px; z-index: 5 "
            >
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
            <div
            style="
                position: absolute;
                top: 12mm;
                left: 12mm;
                right: 12mm;
                bottom: 12mm;
                z-index: 3;
                font-size: 12.5px;
            "
            >
            <!-- Emblem -->
            <div style="text-align: center">
                <img src="${IMAGE_BASE}emblemofindia.png" style="width: 24mm" />
            </div>

            <!-- Header -->
            <div
                style="
                text-align: center;
                font-weight: bold;
                margin-top: 2mm;
                font-size: 22px;
                color: #1f3f8f;
                "
            >
                GOVERNMENT OF WEST BENGAL
            </div>

            <div
                style="
                text-align: center;
                font-weight: bold;
                font-size: 16px;
                margin-top: 2mm;
                color: #535353;
                "
            >
                OFFICE OF THE JOINT LABOUR COMMISSIONER
            </div>

            <div
                style="
                text-align: center;
                font-weight: bold;
                font-size: 16px;
                color: #535353;
                "
            >
                BARRACKPORE
            </div>

            <div
                style="
                text-align: center;
                font-size: 12px;
                margin-top: 2mm;
                margin-bottom: 2mm;
                color: #1f3f8f;
                font-size: 16px;
                font-weight: bold;
                "
            >
                183, Old Calcutta Road, 3rd Floor, P.O. - Talpukur, Barrackpore,
                North 24 Parganas, Kolkata - 700123
            </div>

            <div style="text-align: center; font-weight: bold;font-size: 16px; color: #1f3f8f">
                FORM - II
            </div>

            <div style="text-align: center; font-size: 12px; color: #1f3f8f">
                [ See Rule 18(1) ]
            </div>

            <div style="text-align: center; margin-top: 4mm">
                <img src="${IMAGE_BASE}text-registration.png" style="width: 35mm" />
            </div>

            <!-- Registration Info -->
            <div style="margin-top: 2mm; color: #1f3f8f">
                <b>Registration No. :</b> ${data?.registrationNumber}
                <span style="float: right"><b>Date :</b> ${data?.date}</span>
            </div>

            <div
                style="
                clear: both;
                margin-top: 4mm;
                text-align: justify;
                color: #1f3f8f;
                font-weight: bold;
                font-style: italic;
                "
            >
                A Certificate of Registration containing the following particulars
                is hereby granted under sub-section (2) of Section 7 of the Contract
                Labour (Regulation & Abolition) Act, 1970 and the Rules made
                thereunder.
            </div>

            <!-- TABLE -->
            <table
                style="
                width: 100%;
                border-collapse: collapse;
                margin-top: 6mm;
                color: #1f3f8f;
                "
            >
                <tr>
                <td
                    style="
                    width: 50%;
                    border: 1px solid #1f3f8f;
                    padding: 3.5mm;
                    font-style: italic;
                    "
                >
                    <b>1. Nature of work carried on in the Establishment</b>
                </td>
                <td
                    style="
                    width: 50%;
                    border: 1px solid #1f3f8f;
                    padding: 3.5mm;
                    font-weight: bold;
                    "
                >
                    ${data?.natureOfWorkEstablishment}
                </td>
                </tr>

                <tr>
                <td
                    style="
                    border: 1px solid #1f3f8f;
                    padding: 3.5mm;
                    font-style: italic;
                    "
                >
                    <b>2. Name and Addresses of Contractors</b>
                </td>
                <td
                    style="
                    border: 1px solid #1f3f8f;
                    padding: 3.5mm;
                    font-weight: bold;
                    "
                >
                    ${data?.contractorName}<br />
                    ${data?.contractorAddress}<br />
                    Ward-1, Barrackpore Cantt. Board<br />
                    Municipality,<br />
                    Barrackpore, PS - Barrackpore,<br />
                    North 24 Parganas, PIN-700120, West Bengal<br />
                    Work Period:22-01-2026 To 31-12-2035
                </td>
                </tr>

                <tr>
                <td
                    style="
                    border: 1px solid #1f3f8f;
                    padding: 3.5mm;
                    font-style: italic;
                    "
                >
                    <b>3. Nature of work in which contractor labour is employed</b>
                </td>
                <td
                    style="
                    border: 1px solid #1f3f8f;
                    padding: 3.5mm;
                    font-weight: bold;
                    "
                >
                    MAN POWER SUPPLY
                </td>
                </tr>

                <tr>
                <td
                    style="
                    border: 1px solid #1f3f8f;
                    padding: 3.5mm;
                    font-style: italic;
                    "
                >
                    <b>4. Maximum number of contract labour</b>
                </td>
                <td
                    style="
                    border: 1px solid #1f3f8f;
                    padding: 3.5mm;
                    font-weight: bold;
                    "
                >
                    ${data?.maxNoOfContractLabour}
                </td>
                </tr>

                <tr>
                <td
                    style="
                    border: 1px solid #1f3f8f;
                    padding: 3.5mm;
                    font-style: italic;
                    "
                >
                    <b>5. Other particulars</b>
                </td>
                <td
                    style="
                    border: 1px solid #1f3f8f;
                    padding: 3.5mm;
                    font-weight: bold;
                    "
                >
                    Annexure II Attached
                </td>
                </tr>
            </table>

            <!-- Bottom -->
            <div style="position: relative; height: 35mm">
                <img
                src="${qrBase64}"
                style="position: absolute; left: 0; bottom: 0; width: 25mm"
                />

                <div
                style="
                    position: absolute;
                    right: 0;
                    bottom: 12mm;
                    text-align: right;
                    color: #1f3f8f;
                    font-weight: 700;
                "
                >
                Signature and Seal<br />
                of<br />
                Registering Officer
                </div>
            </div>

            <!-- Footer -->
            <div
                style="
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                text-align: center;
                font-size: 11px;
                "
            >
                **This is system generated certificate and does not require any
                signature. For authenticity, please scan the QR Code.
            </div>
            </div>
        </div>

        <!-- Page 1 Number -->
        <div style="position: absolute; bottom: 5mm; left: 20mm; right: 20mm">
            <div style="text-align: right; font-style: italic">1 of 2</div>
            <div style="border-top: 1px solid #000; margin-top: 3px"></div>
        </div>
        </div>

        <!-- ================= PAGE 2 ================= -->
        <div
        style="
            width: 210mm;
            height: 297mm;
            position: relative;
            font-family: &quot;Times New Roman&quot;, serif;
            page-break-before: always;
        "
        >
        <div
            style="
            position: absolute;
            top: 25mm;
            left: 20mm;
            right: 20mm;
            color: #000;
            "
        >
            <!-- Title -->
            <div
            style="
                text-align: center;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 6mm;
            "
            >
            ANNEXURE II
            </div>

            <div
            style="
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 8mm;
            "
            >
            5. Other particulars relevant to the Employment of Contract Labour
            </div>

            <!-- TABLE -->
            <table style="width: 100%; border-collapse: collapse; font-size: 14px">
            <tr>
                <td
                style="
                    width: 8%;
                    border: 1px solid #000;
                    padding: 6px;
                    font-style: italic;
                "
                >
                (a)
                </td>
                <td
                style="
                    width: 52%;
                    border: 1px solid #000;
                    padding: 6px;
                    font-style: italic;
                "
                >
                Maximum number of workmen employed directly on any day in the
                Establishment
                </td>
                <td style="width: 40%; border: 1px solid #000; padding: 6px">${data?.maxNoOfWorkmenEmployed}</td>
            </tr>

            <tr>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                (b)
                </td>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                Number of workmen engaged as permanent / regular workmen
                </td>
                <td style="border: 1px solid #000; padding: 6px">${data?.noOfWorkmenPermanent}</td>
            </tr>

            <tr>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                (c)
                </td>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                Number of workmen engaged as temporary / regular workmen
                </td>
                <td style="border: 1px solid #000; padding: 6px">${data?.noOfWorkmenTemporary}</td>
            </tr>

            <tr>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                (d)
                </td>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                Whether the workmen employed/ intended to be employment by the
                contractor perform the same or similar kind of work as the workmen
                employed directly by the Principal Employer (if yes , please give
                here information as detailed below)
                </td>
                <td style="border: 1px solid #000; padding: 6px">${data?.similarKindOfWork}</td>
            </tr>

            <tr>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                (e)
                </td>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                A complete job description of the contract labour
                </td>
                <td style="border: 1px solid #000; padding: 6px">
                ${data?.jobDescription}
                </td>
            </tr>

            <tr>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                (f)
                </td>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                Wage rates and other benefits paid / to be paid
                </td>
                <td style="border: 1px solid #000; padding: 6px">
                ${data?.wageRatesOtherBenefits}
                </td>
            </tr>

            <tr>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                (g)
                </td>
                <td
                style="border: 1px solid #000; padding: 6px; font-style: italic"
                >
                Category / designation/ nomenclature of the job
                </td>
                <td style="border: 1px solid #000; padding: 6px">
                ${data?.categoryDesignation}
                </td>
            </tr>
            </table>

            <!-- Signature -->
            <div
            style="
                margin-top: 40mm;
                text-align: right;
                color: #1f3f8f;
                font-size: 16px;
            "
            >
            Signature and Seal of<br />
            Registering Officer
            </div>
        </div>

        <!-- Page Number -->
        <div style="position: absolute; bottom: 5mm; left: 20mm; right: 20mm">
            <div style="text-align: right; font-style: italic">2 of 2</div>
            <div style="border-top: 1px solid #000; margin-top: 3px"></div>
        </div>
        </div>
    </body>
    </html>
  `;
};
