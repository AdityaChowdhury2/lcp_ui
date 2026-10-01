export const generateBocwaFormIPdfTemplate = (data: any) => {
    return `
    <!doctype html>
    <html>
    <head>
    <meta charset="UTF-8" />
    <title>FORM I</title>

    <style>
    @page { size: A4 portrait; margin: 0; }

    body {
    margin: 0;
    font-family: "Times New Roman", serif;
    font-size: 15px;
    line-height: 1.6;
    }

    .page {
    width: 210mm;
    height: 297mm;
    padding: 25mm 20mm 30mm 20mm;
    box-sizing: border-box;
    position: relative;
    }

    .main-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    }

    .left-col { width: 55%; vertical-align: top; }
    .right-col { width: 45%; vertical-align: top; }

    .annex-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 14px;
    }

    .annex-table th,
    .annex-table td {
    border: 1px solid #000;
    padding: 6px;
    vertical-align: top;
    }

    .footer {
    position: absolute;
    bottom: 15mm;
    left: 20mm;
    right: 20mm;
    border-top: 1px solid #000;
    padding-top: 3px;
    text-align: right;
    font-style: italic;
    }
    </style>
    </head>

    <body>

    <!-- ================= PAGE 1 ================= -->
    <div class="page">

    <h3 style="text-align:center;">FORM "I"</h3>
    <p style="text-align:center; font-size:14px; font-style: italic;">
    [See rule 23(1)]
    </p>

    <h3 style="text-align:center; margin-top:20px;">
    Application for Registration of Establishments Employing Building Workers
    </h3>

    <table class="main-table">

    <tr>
    <td class="left-col">
    1. Name and location of the Establishment where 
    <br/> building or other construction work is to be carried on
    </td>
    <td class="right-col">
    ${data.establishmentName}<br/>
    ${data.establishmentAddress}
    </td>
    </tr>

    <tr>
    <td class="left-col">
    2. Postal Address of the establishment
    </td>
    <td class="right-col">${data.postalAddress}</td>
    </tr>

    <tr>
    <td class="left-col">
    3. Full name and permanent address of the 
    <br/> Establishment if any
    </td>
    <td class="right-col">
    ${data.establishmentName}<br/>
    ${data.permanentAddress}
    </td>
    </tr>

    <tr>
    <td class="left-col">
    4. Full name and address of the Manager or person responsible for the supervision and control of the Establishment
    </td>
    <td class="right-col">
    ${data.managerName}<br/>
    ${data.managerAddress}
    </td>
    </tr>

    <tr>
    <td class="left-col">
    5. Nature of building or other construction work 
    <br/> carried/is to be carried on in the Establishment
    </td>
    <td class="right-col">${data.natureOfWork}</td>
    </tr>

    <tr>
    <td class="left-col">
    6. Maximum number of building workers to be 
    <br/> employed on any day
    </td>
    <td class="right-col">${data.maxDirectWorkers}</td>
    </tr>

    <tr>
    <td class="left-col">
    7. Establishment date of commencement of building or other construction work
    </td>
    <td class="right-col">${data.estDateComm}</td>
    </tr>

    <tr>
    <td class="left-col">
    8. Establishment date of completion of building or other construction work
    </td>
    <td class="right-col">${data.estDateComp}</td>
    </tr>

    <tr>
    <td class="left-col">
    9. Particulars of demand draft, enclosed ( name of the bank, demand draft No., date and amount) :
    </td>
    <td class="right-col">₹ ${data.amount}</td>
    </tr>

    </table>


    <div class="footer">1 of X</div>
    </div>


    <!-- ================= PAGE BREAK ================= -->
    <div style="page-break-before: always;"></div>

    <!-- ================= ANNEXURE ================= -->
    <div class="page">

    <div style="margin-top:40px;">
    <p>
    Declaration by the employer
    </p>

    <p>
    (i) I hereby declare that the particulars given above are true in the best of my knowledge and belief.
    </p>

    <p>
    (ii) I undertake to abide by the provisions of the Building and other Construction Workers (Regulation of Employment and conditions of Service) Act,1996 and the Rules made thereunder.
    </p>

    </div>

    <div style="margin-top:40px; display:flex; justify-content:space-between;">
    <div>Date of receipt of application: ${data.applicationDate}</div>
    <div style="text-align:center;">
    Signature of the Principal Employer <br/><br/><br/>
    Seal and Stamp <br/><br/><br/>
    </div>
    </div>

    <div>
        Office of the Registering Officer appointed under the Building and Other Construction workers
(Regulation of Employment and Conditions of Service) Act,1996 and Rules made thereunder.
    </div>

    <div class="footer">2 of X</div>
    </div>

    </body>
    </html>
    `;
};