export const generateMtwFormIPdfTemplate = (data: any) => {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>FORM I</title>

    <style>
      @page {
        size: A4 portrait;
        margin: 0;
      }

      body {
        margin: 0;
        font-family: "Times New Roman", serif;
        font-size: 15px;
        line-height: 1.4;
      }

      /* ✅ FIXED PAGE */
      .page {
        width: 210mm;
        min-height: 297mm; /* FIXED (was height) */
        padding: 20mm 15mm 5mm 15mm;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;
      }
      .page {
        page-break-after: always;
      }

      .page:last-child {
        page-break-after: auto; /* 🚀 prevents extra blank page */
      }

      /* TABLES */
      .main-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      .left-col {
        width: 55%;
        vertical-align: top;
      }

      .right-col {
        width: 45%;
        vertical-align: top;
      }

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

      /* ✅ FIXED FOOTER */
      .footer {
        margin-top: auto;
        border-top: 1px solid #000;
        padding-top: 3px;
        text-align: right;
        font-style: italic;
      }

      @page {
        @bottom-right {
          content: "Page " counter(page) " of " counter(pages);
        }
      }

      .footer::after {
        content: "Page " counter(page);
      }
      body {
  counter-reset: page;
}

.page {
  counter-increment: page;
}
.footer::after {
  content: "Page " counter(page);
}
    </style>
  </head>

  <body>
    <!-- ================= PAGE 1 ================= -->
    <div class="page">
      <h3 style="text-align: center; font-weight: bold">FORM "I"</h3>
      <h3 style="text-align: center; font-weight: bold">(SEE RULE 4 & 8)</h3>

      <h3 style="text-align: center; margin-top: 20px">
        APPLICATION FOR REGISTRATION OF UNDERTAKING AND GRANT OF RENEWAL OF
        CERTIFICATE OF REGISTRATION
      </h3>

      <table class="main-table">
        <tr>
          <td class="left-col">1. Name of Motor Transport Undertaking :</td>
          <td class="right-col">
            ${data.establishmentName}<br />
            ${data.establishmentAddress}
          </td>
        </tr>

        <tr>
          <td class="left-col">
            2. Full Address to which communications relating to the Motor
            Transport Undertaking should be sent :
          </td>
          <td class="right-col">${data.postalAddress}</td>
        </tr>

        <tr>
          <td class="left-col">3. Nature of Motor Transport Service :</td>
          <td class="right-col">${data.natureOfWork}</td>
        </tr>

        <tr>
          <td class="left-col">4. Total Number Of Routes :</td>
          <td class="right-col">${data.totalRoutes}</td>
        </tr>

        <tr>
          <td class="left-col">5. Total Route Mileage :</td>
          <td class="right-col">${data.totalMileage}</td>
        </tr>

        <tr>
          <td class="left-col">
            6. Total Number of Motor Transport Vehicles on the last date or the
            preceeding year :
          </td>
          <td class="right-col">${data.totalVehicles}</td>
        </tr>

        <tr>
          <td class="left-col">
            7. Maximum Number of Motor Transport Workers employed on any day
            during the preceeding year :
          </td>
          <td class="right-col">${data.maxWorkers}</td>
        </tr>

        <tr>
          <td colspan="2" class="left-col">
            8. Full Name and Residential Address of the
          </td>
        </tr>

        <tr>
          <td class="left-col">
            i) Proprietor or Partners or The Motor Transport Undertaking in the
            case of firm not registered under the company act, 1956 :
          </td>
          <td class="right-col">${data.proprietorsPartners}</td>
        </tr>

        <tr>
          <td colspan="2" class="left-col">OR</td>
        </tr>

        <tr>
          <td class="left-col">
            ii) General Manager in the case of a public sector undertaking :
          </td>
          <td class="right-col">${data.generalManagers}</td>
        </tr>

        <tr>
          <td class="left-col">
            9. Full Name and Residential Address of the Directors in the case of
            company registered under Companies Act, 1956:
          </td>
          <td class="right-col">${data.directors}</td>
        </tr>

        <tr>
          <td class="left-col">
            10. Amount Fees, enclosed ( name of the bank, demand draft No., date
            and amount) :
          </td>
          <td class="right-col">₹ ${data.amount}</td>
        </tr>
      </table>

      <div class="footer"></div>
    </div>

    <!-- ================= PAGE 2 ================= -->
    <div class="page">
      <div
        style="margin-top: 40px; display: flex; justify-content: space-between"
      >
        <div>Date of application: ${data.applicationDate}</div>

        <div style="text-align: center">
          [Seal and Stamp]<br /><br />
          Signature of the Principal Employer
        </div>
      </div>

      <div class="footer"></div>
    </div>

    <!-- ================= PAGE 3 ================= -->
    <div class="page">
      <div style="margin-top: 40px">
        <p><b>Declaration by the employer</b></p>

        <p>
          (i) I hereby declare that the particulars given above are true in the
          best of my knowledge and belief.
        </p>

        <p>
          (ii) I undertake to abide by the provisions of the Building and other
          Construction Workers (Regulation of Employment and conditions of
          Service) Act,1996 and the Rules made thereunder.
        </p>
      </div>

      <div
        style="margin-top: 40px; display: flex; justify-content: space-between"
      >
        <div>Date of application: ${data.applicationDate}</div>

        <div style="text-align: center">
          [Seal and Stamp]<br /><br />
          Signature of the Principal Employer
        </div>
      </div>

      <div class="footer">Annexure</div>
    </div>
  </body>
</html>
`;
};