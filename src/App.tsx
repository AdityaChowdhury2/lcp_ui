import React, { Suspense, useEffect, lazy } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// import { RequireAuth } from "./routing/RequireAuth";
import { RequireRole } from "./routing/RequireRole";
import {
  APPLICANT_ROLES,
  CONTRACTOR_RENEWAL_FORM_VI_VIEWER_ROLES,
  CTU_ROLES,
  OFFICER_ROLES,
} from "./routing/roleGroups";

import DashboardApplicantLayout from "./Components/DashboardApplicantLayout";
import DashboardLayout from "./Components/DashboardLayout";
import ForgotPassword from "./Components/LoginComponents/ForgotPassword";
import ResetPassword from "./Components/LoginComponents/ResetPassword";
import MainLayout from "./Components/MainLayout";

import Home from "./Pages/Home/Home";
import ApplicantLogin from "./Pages/Login/ApplicantLogin";

import ApplicantRegister from "./Pages/Register/ApplicantRegister";

import ContactUs from "./Pages/ContactUs/ContactUs";
import ContactUsDetails from "./Pages/ContactUs/ContactUsDetails";
import RLODetails from "./Pages/ContactUs/RLODetails";
import DashboardApplicant from "./Pages/Dashboard/DashboardApplicant";
import DashboardHome from "./Pages/Dashboard/DashboardHome";
import EServices from "./Pages/EServices/EServices";
import BocwCess from "./Pages/BocwCess/BocwCess";
import BocwCessAdmin from "./Pages/BocwCess/BocwCessAdmin";
import Feedback from "./Pages/Feedback";
import FindUserDetails from "./Pages/FindUserDetails/FindUserDetails";
import Forbidden from "./Pages/Forbidden";
import HrmsLogin from "./Pages/Login/HrmsLogin";
import MobileOtpLogin from "./Pages/Login/MobileOtpLogin";
import SliLogin from "./Pages/Login/SliLogin";
import SliAdmissionFormPublic from "./Applicant/Pages/SliAdmission/SliAdmissionFormPublic";
import RTI from "./Pages/RTI";
import SSY from "./Pages/Schemes/SSY";
import Tender from "./Pages/Tender";
import AddNewOfficer from "./Pages/UserList/AddNewOfficer";
import ALCList from "./Pages/UserList/ALCList";
import DLCList from "./Pages/UserList/DLCList";
import InspectionUser from "./Pages/UserList/InspectionUser";
import InspectorList from "./Pages/UserList/InspectorList";
import McdlscckcoList from "./Pages/UserList/McdlscckcoList";
import ServicesWiseUser from "./Pages/UserList/ServicesWiseUser";

import LcAnalyticalReport from "./Admin/Pages/AdministrativeReports/LcAnalyticalReport";
import LcAnalyticPaymentReport from "./Admin/Pages/AdministrativeReports/LcAnalyticPaymentReport";
import LcCourtCaseReport from "./Admin/Pages/AdministrativeReports/LcCourtCaseReport";
import LCReportProformaOne from "./Admin/Pages/AdministrativeReports/LcReportProformaOne";
import LCReportProformaThree from "./Admin/Pages/AdministrativeReports/LcReportProformaThree";
import AnnualReturnList from "./Admin/Pages/AnnualReturnList/AnnualReturnList";
import ApplicantProfile from "./Admin/Pages/ApplicantProfile/ApplicantProfile";
import MyProfile from "./Applicant/Pages/MyProfile/MyProfile";
import BlockDetailsRLO from "./Admin/Pages/BlockDetailsRLO/BlockDetailsRLO";
import AlcReceivedApplicationsBOCWA from "./Admin/Pages/BOCWAApplication/AlcReceivedApplicationsBOCWA";
import AlcReceivedApplicationsBOCWAAmendment from "./Admin/Pages/BOCWAApplication/AlcReceivedApplicationsBOCWAAmendment";
import BOCWAApplicationsList from "./Admin/Pages/BOCWAApplicationsList/BOCWAApplicationsList";
import LegacyBocwaList from "./Admin/Pages/BOCWAEstRegistration/LegacyBocwaList";
import CentralTradeUnionList from "./Admin/Pages/CentralStateTradeUnion/CentralTradeUnionList";
import CentralTradeUnionListView from "./Admin/Pages/CentralStateTradeUnion/CentralTradeUnionListView";
import RegistrationCentralStateTradeUnion from "./Admin/Pages/CentralStateTradeUnion/RegistrationCentralStateTradeUnion";
import ChangePassword from "./Admin/Pages/ChangePassword/ChangePassword";
import { ClraAmendedCertificatePdf } from "./Admin/Pages/ClraAmendedCertificatePdf";
import AlcViewAmendLicense from "./Admin/Pages/CLRALicenseApplication/AlcViewAmendLicense";
import AlcViewLicense from "./Admin/Pages/CLRALicenseApplication/AlcViewLicense";
import AlcViewLicenseRenewal from "./Admin/Pages/CLRALicenseApplication/AlcViewLicenseRenewal";
import AmmendmentLicenseCLRA from "./Admin/Pages/CLRALicenseApplication/AmmendmentLicenseCLRA";
import RenewalLicenseCLRA from "./Admin/Pages/CLRALicenseApplication/RenewalLicenseCLRA";
import ViewPEDetails from "./Admin/Pages/CLRALicenseApplication/ViewPEDetails";
import CLRALicenseList from "./Admin/Pages/CLRALicenseList/CLRALicenseList";
import AlcViewAmendedApplication from "./Admin/Pages/CLRAPEApplication/AlcViewAmendedApplications";
import AlcVisibleApplications from "./Admin/Pages/CLRAPEApplication/AlcVisibleApplications";
import ClraRegCertificate from "./Admin/Pages/CLRAPEApplication/ClraRegCertificate";
import CLRAPERegistrationList from "./Admin/Pages/CLRAPERegistrationList/CLRAPERegistrationList";
import OfflineCLRAApplications from "./Admin/Pages/CLRAregistration/OfflineCLRAApplications";
import DigitallySignProcess from "./Admin/Pages/DigitallySignProcess/DigitallySignProcess";
import AllOfficeEmployeeList from "./Admin/Pages/EmployeeDetails/AllOfficeEmployeeList";
import { default as AllRetiredEmployeeList, default as PageNotFound } from "./Admin/Pages/EmployeeDetails/AllRetiredEmployeeList";
import FAWLOIManagement from "./Admin/Pages/FawloiManagement/FawloiManagement";
import AlcCaseAction from "./Admin/Pages/InspectionManagement/AlcCaseAction";
import AlcInspectionCasesList from "./Admin/Pages/InspectionManagement/AlcInspectionCasesList";
import ClosureVerification from "./Admin/Pages/InspectionManagement/ClosureVerification";
import CourtCaseFileList from "./Admin/Pages/InspectionManagement/CourtCaseFileList";
import InspectionList from "./Admin/Pages/InspectionManagement/InspectionList";
import InspectionNote from "./Admin/Pages/InspectionManagement/InspectionNote";
import InspectionNotePrint from "./Admin/Pages/InspectionManagement/InspectionNotePrint";
import InspectionOrderList from "./Admin/Pages/InspectionManagement/InspectionOrderList";
import InspectionOrderListForAlc from "./Admin/Pages/InspectionManagement/InspectionOrderListForAlc";
import InspectionSubmissionList from "./Admin/Pages/InspectionManagement/InspectionSubmissionList";
import InspectionTabs from "./Admin/Pages/InspectionManagement/InspectionTabs";
import InspectorInspectionList from "./Admin/Pages/InspectionManagement/InspectorInspectionList";
import LateOffFileList from "./Admin/Pages/InspectionManagement/LateOffFileList";
import NewInspection from "./Admin/Pages/InspectionManagement/NewInspection";
import ScheduleInspectionCIS from "./Admin/Pages/InspectionManagement/ScheduleInspectionCIS";
import ScheduledInspectionList from "./Admin/Pages/InspectionManagement/ScheduledInspectionList";
import ScheduledInspectionDetails from "./Admin/Pages/InspectionManagement/ScheduledInspectionDetails";
import InspectorScheduledInspectionList from "./Admin/Pages/InspectionManagement/InspectorScheduledInspectionList";
import InspectorScheduledInspectionNote from "./Admin/Pages/InspectionManagement/InspectorScheduledInspectionNote";
import ScheduleInspectionGP from "./Admin/Pages/InspectionManagement/ScheduleInspectionGP";
import ShowCauseFileList from "./Admin/Pages/InspectionManagement/ShowCauseFileList";
import InspectorDetails from "./Admin/Pages/InspectorDetails/InspectorDetails";
import EmploymentList from "./Admin/Pages/ISMWLicenseApplication/EmploymentList";
import RecruitmentList from "./Admin/Pages/ISMWLicenseApplication/RecruitmentList";
import DirectorPartnerViewDetails from "./Admin/Pages/ISMWREGApplication/DirectorPartnerViewDetails";
import ISMWApplicationsView from "./Admin/Pages/ISMWREGApplication/ISMWApplicationsView";
import AlcApplicationDetailsMTW from "./Admin/Pages/MTWApplication/AlcApplicationsDetailsMTW";
import AlcMtwRenewalDetails from "./Admin/Pages/MTWApplication/AlcMtwRenewalDetails";
import AddNewPEData from "./Admin/Pages/OldOfflineData/AddNewPEData";
import EditData from "./Admin/Pages/OldOfflineData/EditData";
import PEList from "./Admin/Pages/OldOfflineData/PEList";
import PaymentVerification from "./Admin/Pages/PaymentStatus/PaymentVerification";
import PaymentVerificationStatus from "./Admin/Pages/PaymentStatus/PaymentVerificationStatus";
import VerificationStatusAfterPayment from "./Admin/Pages/PaymentStatus/VerificationStatusAfterPayment";
import InspectorRandomization from "./Admin/Pages/Randomization/InspectorRandomization";
import RandomizationPreviousList from "./Admin/Pages/Randomization/RandomizationPreviousList";
import UploadSignedOrder from "./Admin/Pages/Randomization/UploadSignedOrder";
import InspectionScheduleOrderList from "./Admin/Pages/RandomizationOrders/InspectionScheduleOrderList";
import SelfCertification from "./Admin/Pages/SelfCertification/SelfCertification";
import SelfCertificationViewDetails from "./Admin/Pages/SelfCertification/SelfCertificationViewDetails";
import SliAdminDashboard from "./Admin/Pages/SliAdmission/SliAdminDashboard";
import SliAdminApplicationList from "./Admin/Pages/SliAdmission/SliAdminApplicationList";
import SliAdminApplicationView from "./Admin/Pages/SliAdmission/SliAdminApplicationView";
import ActionOnReturn from "./Admin/Pages/TradeUnion/ActionOnReturn";
import AddEditTradeUnion from "./Admin/Pages/TradeUnion/AddEditTradeUnion";
import AnnualReturnViewAction from "./Admin/Pages/TradeUnion/AnnualReturnViewAction";
import AnnualReturn from "./Admin/Pages/TradeUnion/AnnualReturn";
import AnnualReturnByRegNo from "./Admin/Pages/TradeUnion/AnnualReturnByRegNo";
import MastersList from "./Admin/Pages/TradeUnion/MastersList";
import TradeUnionEnquiry from "./Admin/Pages/TradeUnion/TradeUnionEnquiry";
import TradeUnionEnquiryView from "./Admin/Pages/TradeUnion/TradeUnionEnquiryView";
import ViewTradeUnion from "./Admin/Pages/TradeUnion/ViewTradeUnion";
import TradeUnionBRegister from "./Admin/Pages/TradeUnion/TradeUnionBRegister";
import UpdateInfo from "./Admin/Pages/UpdateInfo/UpdateInfo";
import UpdateProfile from "./Admin/Pages/UpdateProfile/UpdateProfile";
import UserFeedback from "./Admin/Pages/UserFeedback/UserFeedback";
import AmendmentRegCertificateCLRA from "./Applicant/Pages/CLRAPE/AmendmentRegCertificateCLRA";
import OfficeAddressUpdate from "./Pages/Dashboard/OfficeAddressUpdate";

import AnnualListSecurities from "./Applicant/Pages/AnnualReturn/ListSecurities";
import AnnualReturnPoliticalFundIncome from "./Applicant/Pages/AnnualReturn/PoliticalFundAccount";
import AnnualReturnPreview from "./Applicant/Pages/AnnualReturn/AnnualReturnPreview";
import AnnualReturnProfitLoss from "./Applicant/Pages/AnnualReturn/GeneralFundAccount";
import ConsentOfOfficers from "./Applicant/Pages/AnnualReturn/ConsentOfOfficers/index";
import FederationElection from "./Applicant/Pages/AnnualReturn/ElectedMember";
import AnnualReturnLLCommonForm from "./Applicant/Pages/AnnualReturn/labour-laws/AnnualReturnLLCommonForm";
import AnnualReturnLLList from "./Applicant/Pages/AnnualReturn/labour-laws/AnnualReturnLLList";
import AnnualReturnLLWizard from "./Applicant/Pages/AnnualReturn/labour-laws/AnnualReturnLLWizard";
import OfficersAppointed from "./Applicant/Pages/AnnualReturn/OfficersAppointed/index";
import OfficersRelinquishingOffice from "./Applicant/Pages/AnnualReturn/OfficersRelinquishingOffice/index";
import RectifyData from "./Applicant/Pages/AnnualReturn/RectifyData";
import ScheduleIIILiabilities from "./Applicant/Pages/AnnualReturn/ScheduleIIILiabilities/index";
import TradeUnionAnnualReturn from "./Applicant/Pages/AnnualReturn/TradeUnionAnnualReturn";
import TradeUnionAnnualReturnForm from "./Applicant/Pages/AnnualReturn/TradeUnionAnnualReturnForm";
import ClraRegAddContractor from "./Applicant/Pages/ClraRegDashboard/ClraRegAddContractor";
import ClraRegVerify from "./Applicant/Pages/ClraRegDashboard/ClraRegVerify";
import ClraRegVerifyContractorAdded from "./Applicant/Pages/ClraRegDashboard/ClraRegVerifyContractorAdded";
import ClraRegViewApplicationContractorAdded from "./Applicant/Pages/ClraRegDashboard/ClraRegViewApplicationContractorAdded";
import ClraRegViewContractInfo from "./Applicant/Pages/ClraRegDashboard/ClraRegViewContractInfo";
import ClraRegViewContractInfoContractorAdded from "./Applicant/Pages/ClraRegDashboard/ClraRegViewContractInfoContractorAdded";
import ClraRegViewTUApplication from "./Applicant/Pages/ClraRegDashboard/ClraRegViewTUApplication";
import ClraRegViewTUApplicationContractorAdded from "./Applicant/Pages/ClraRegDashboard/ClraRegViewTUApplicationContractorAdded";
import NewRegistrationISMW from "./Applicant/Pages/ISMW/NewRegistrationISMW";
import ApplicationPreview from "./Applicant/Pages/ISMWLicense/ApplicationPreview";
import DocumentsSection from "./Applicant/Pages/ISMWLicense/DocumentsSection";
import EmploymentApplication from "./Applicant/Pages/ISMWLicense/EmploymentApplication";
import EmploymentLicenseFlow from "./Applicant/Pages/ISMWLicense/EmploymentLicenseFlow";
import EmploymentLicenseList from "./Applicant/Pages/ISMWLicense/EmploymentLicenseList";
import NewLicenseISMW from "./Applicant/Pages/ISMWLicense/NewLicenseISMW";
import OwnersDetails from "./Applicant/Pages/ISMWLicense/OwnersDetails";
import RecruitmentContractorInfo from "./Applicant/Pages/ISMWLicense/RecruitmentContractorInfo";
import RecruitementLicenseList from "./Applicant/Pages/ISMWLicense/RecruitmentLicenseList";
import WorkmenDetails from "./Applicant/Pages/ISMWLicense/WorkmenDetails";
import ApplyRenewalMTW from "./Applicant/Pages/MTW/ApplyRenewalMTW";
import NewRegistrationMTW from "./Applicant/Pages/MTW/NewRegistrationMTW";
import RegisterRecordRepositoryCafLogin from "./Applicant/Pages/RegisterRecordRepository/RegisterRecordRepositoryCafLogin";
import SelfCertificationAddPerson from "./Applicant/Pages/SelfCertification/SelfCertificationAddPerson";
import SelfCertificationList from "./Applicant/Pages/SelfCertification/SelfCertificationList";
import SliAdmissionList from "./Applicant/Pages/SliAdmission/SliAdmissionList";
import SliAdmissionForm from "./Applicant/Pages/SliAdmission/SliAdmissionForm";
import SelfCertificationOthers from "./Applicant/Pages/SelfCertification/SelfCertificationOthers";
import SelfCertificationPaymentDetails from "./Applicant/Pages/SelfCertification/SelfCertificationPaymentDetails";
import SelfCertificationPerticulars from "./Applicant/Pages/SelfCertification/SelfCertificationPerticulars";
import SelfCertificationSelectService from "./Applicant/Pages/SelfCertification/SelfCertificationSelectService";
import SelfCertificationUploadSignedApplication from "./Applicant/Pages/SelfCertification/SelfCertificationUploadSignedApplication";
import SelfCertificationWorkerDetails from "./Applicant/Pages/SelfCertification/SelfCertificationWorkerDetails";

import CSReports from "./Admin/Pages/AdministrativeReports/CsDashboardReport";
import RTPSReport from "./Admin/Pages/AdministrativeReports/RtpsReport";
import UpdateProfileALCDLC from "./Admin/Pages/UpdateProfile/UpdateProfileALCDLC";
import FormIUpload from "./Applicant/Components/FormIUpload";
import AmendmentRegCertificateBOCWA from "./Applicant/Pages/BOCWA/AmendmentRegCertificateBOCWA";
import ContractorDetailsView from "./Applicant/Pages/CLRAPE/contractor-management/ContractorDetailsView";
import ContractorForm from "./Applicant/Pages/CLRAPE/contractor-management/ContractorForm";
import EpaymentsPreview from "./Applicant/Pages/CLRAPE/EpaymentsPreview";
import AmendmentPreviewLegacyRedirect from "./Applicant/Pages/ContractorLicense/Amendment/AmendmentPreviewLegacyRedirect";
import CheckForAmendmentLegacyRedirect from "./Applicant/Pages/ContractorLicense/Amendment/CheckForAmendmentLegacyRedirect";
import ClraLicenseRenewalFormVI from "./Applicant/Pages/ContractorLicense/ClraLicenseRenewalFormVI";
import ContractorFormV from "./Applicant/Pages/ContractorLicense/ContractorFormV";
import LicenseMoreDetails from "./Applicant/Pages/ContractorLicense/LicenseMoreDetails";
import RemarksListPage from "./Applicant/Pages/ContractorLicense/RemarksList";
import ApplicantRemarksHistory from "./Pages/Dashboard/ApplicantRemarksHistory";
import RenewalDetailsMTW from "./Applicant/Pages/MTW/RenewalDetailsMTW";
import ViewDetailsPageMTW from "./Applicant/Pages/MTW/ViewDetailsPageMTW";
import ScrollToTop from "./common/ScrollToTop";
import FormIPDF from "./Components/FormIPDF";
import FormVPDF from "./Components/FormVPDF";
import FormVIPDF from "./Components/FormVIPDF";
import DistrictReport from "./Components/HomeComponents/Eodb/ApplicationStatusDistric";
import EodbDashboard from "./Components/HomeComponents/Eodb/Eodb-dashboard";
import EODBNotice from "./Components/HomeComponents/Eodb/EODBNotice";
import FeeBreakdown from "./Components/HomeComponents/Eodb/PrincipalEmpRegCLRA";
import ReportEODB from "./Components/HomeComponents/Eodb/ReportEODB";
import ActsRules from "./Pages/ActsRules";
import BudgetPage from "./Pages/Budget";
import Dashboard from "./Pages/Dashboard/Dashboard";
import GeneralTimeline from "./Pages/genralTimeline";
import ImpNotification from "./Pages/important-notification";
import InspectionChecklist from "./Pages/Inspection_checklist";
import CPIInfo from "./Pages/MinWages/CPIInfo";
import MinWagesAct from "./Pages/MinWages/MinWagesAct";
import NonScheduledEmployment from "./Pages/MinWages/NonScheduledEmploymentList";
import ScheduledEmployment from "./Pages/MinWages/ScheduledEmployment";
import ScheduledEmploymentSynopsis from "./Pages/MinWages/ScheduledEmploymentSynopsis";
import SynopsisMinWages from "./Pages/MinWages/SynopsisMinWages";
import TradeUnionRegister from "./Pages/Register/TradeUnionRegister";
import InspectorView from "./Pages/UserList/InspectorView";
import ExternalAuthentication from "./ShareModules/ExternalAuthentication/ExternalAuthentication";
import ComingSoon from "./ShareModules/Loaders/ComingSoon";
import DataMigration from "./ShareModules/Loaders/DataMigration";
import NotFound from "./ShareModules/Loaders/NotFound";
import UnderDevelopment from "./ShareModules/Loaders/UnderDevelopment";

import AmendmentLicenseDetails from "./Applicant/Pages/ContractorLicense/Amendment/AmendLicenseDetails";
import AmendmentLicenseReSubmit from "./Applicant/Pages/ContractorLicense/Amendment/AmendLicenseReSubmit";
// import ClraAmendDetails from "./Applicant/Pages/ContractorLicense/Amendment/ClraAmendDetails";
import CentralInspectionList from "./Admin/Pages/InspectionManagement/CentralInspectionList";
import CourtCasePage from "./Admin/Pages/InspectionManagement/CourtCasePage";
import CourtCaseProceedingPage from "./Admin/Pages/InspectionManagement/CourtCaseProceedingPage";
import InspectorOrderList from "./Admin/Pages/InspectionManagement/InspectorOrderList";
import PrintInspectionNote from "./Admin/Pages/InspectionManagement/PrintInspectionNote";
import ShowCausePage from "./Admin/Pages/InspectionManagement/ShowCausePage";
import UploadNotePage from "./Admin/Pages/InspectionManagement/UploadNotePage";
import VerifyShowCausePage from "./Admin/Pages/InspectionManagement/VerifyShowCausePage";
import ViewInspectionReport from "./Admin/Pages/InspectionManagement/ViewInspectionReport";
import SelfCertificationAddDirectorPartner from "./Applicant/Pages/SelfCertification/SelfCertificationAddDirectorPartner";
import SelfCertificationOwnershipList from "./Applicant/Pages/SelfCertification/SelfCertificationOwnershipList";

const ApplicationListCLRA = lazy(
  () => import("./Admin/Pages/CLRAPEApplication/ApplicationListCLRA"),
);
const DLCInspections = lazy(
  () => import("./Admin/Pages/DLCInspections/DLCInspections"),
);
const DLCInspectionDetails = lazy(
  () => import("./Admin/Pages/DLCInspections/DLCInspectionDetails"),
);
const DLCInspectionInquiry = lazy(
  () => import("./Admin/Pages/DLCInspections/DLCInspectionInquiry"),
);
const ContractorLicenseCertificate = lazy(
  () =>
    import(
      "./Admin/Pages/ContractorLicenseCertificate/ContractorLicenseCertificate"
    ),
);
const ApplicationListISMW = lazy(
  () => import("./Admin/Pages/ISMWREGApplication/ApplicationListISMW"),
);
const ApplicationListBOCWA = lazy(
  () => import("./Admin/Pages/BOCWAApplication/ApplicationListBOCWA"),
);
const LicenseListCLRA = lazy(
  () => import("./Admin/Pages/CLRALicenseApplication/LicenseListCLRA"),
);
const MTWApplicationNewReg = lazy(
  () => import("./Admin/Pages/MTWApplication/MTWApplicationNewReg"),
);
const MTWApplicationRenewal = lazy(
  () => import("./Admin/Pages/MTWApplication/MTWApplicationRenewal"),
);
const AdminReportsDashboard = lazy(
  () => import("./Admin/Pages/AdministrativeReports/AdminReportsDashboard"),
);
const LcReportProformaOneDownload = lazy(
  () =>
    import("./Admin/Pages/AdministrativeReports/LcReportProformaOneDownload"),
);
const RegisterRecordRepository = lazy(
  () =>
    import("./Admin/Pages/RegisterRecordRepository/RegisterRecordRepository"),
);
const CLRABacklog = lazy(() => import("./Applicant/Pages/CLRAPE/CLRABacklog"));
const CLRABacklogRegType = lazy(
  () => import("./Applicant/Pages/CLRAPE/CLRABacklogRegType"),
);
const ViewOldBocwaDetails = lazy(
  () => import("./Admin/Pages/BOCWAEstRegistration/ViewOldBocwaDetails"),
);
const BOCWAAmendmentForm = lazy(
  () => import("./Applicant/Pages/BOCWA/BOCWAAmendmentForm"),
);
const BOCWAApplicationPreview = lazy(
  () => import("./Applicant/Pages/BOCWA/BOCWAApplicationPreview"),
);
const BOCWARemarkDetails = lazy(
  () => import("./Applicant/Pages/BOCWA/BOCWARemarkDetails"),
);
const ApplyBOCWA = lazy(() => import("./Applicant/Pages/BOCWA/ApplyBOCWA"));
const ApplicationDetailsAmendment = lazy(
  () => import("./Applicant/Pages/CLRAPE/ApplicationDetailsAmendment"),
);
const ViewDetailsPageCLRAPEAmendment = lazy(
  () => import("./Applicant/Pages/CLRAPE/ViewDetailsPageCLRAPEAmendment"),
);
const AmmendmentCLRAPE = lazy(
  () => import("./Applicant/Pages/CLRAPE/AmmendmentCLRAPE"),
);
const ApplyNewLicense = lazy(
  () => import("./Applicant/Pages/ContractorLicense/ApplyNewLicense"),
);
const ApplyAmdRenewLicense = lazy(
  () => import("./Applicant/Pages/ContractorLicense/ApplyAmdRenewLicense"),
);
// const ClraLicenseRenewal = lazy(() => import("./Applicant/Pages/ContractorLicense/ClraLicenseRenewal"));
const ClraLicenseRenewalApply = lazy(
  () => import("./Applicant/Pages/ContractorLicense/ClraLicenseRenewalApply"),
);
const ClraLicenseRenewalUploadFormVii = lazy(
  () =>
    import("./Applicant/Pages/ContractorLicense/ClraLicenseRenewalUploadFormVii"),
);
const ContractorLicenseRemarks = lazy(
  () => import("./Applicant/Pages/ContractorLicense/ContractorLicenseRemarks"),
);
const ClraLicenseAmendmentSelectFields = lazy(
  () =>
    import("./Applicant/Pages/ContractorLicense/Amendment/ClraLicenseAmendmentSelectFields"),
);
const ClraLicenseAmendmentApply = lazy(
  () =>
    import("./Applicant/Pages/ContractorLicense/Amendment/ClraLicenseAmendmentApply"),
);
const ClraLicenseAmendmentWorksite = lazy(
  () =>
    import("./Applicant/Pages/ContractorLicense/Amendment/ClraLicenseAmendmentWorksite"),
);
const ClraLicenseAmendmentContractor = lazy(
  () =>
    import("./Applicant/Pages/ContractorLicense/Amendment/ClraLicenseAmendmentContractor"),
);
const ClraLicenseAmendmentManager = lazy(
  () =>
    import("./Applicant/Pages/ContractorLicense/Amendment/ClraLicenseAmendmentManager"),
);
const ParticularInfo = lazy(
  () => import("./Applicant/Pages/ContractorLicense/Amendment/ParticularInfo"),
);
const ClraLicenseAmendmentConditionsBenefits = lazy(
  () =>
    import("./Applicant/Pages/ContractorLicense/Amendment/ClraLicenseAmendmentConditionsBenefits"),
);
const ClraLicenseAmendmentComplianceHistory = lazy(
  () =>
    import("./Applicant/Pages/ContractorLicense/Amendment/ClraLicenseAmendmentComplianceHistory"),
);
const ClraLicenseAmendmentCategory = lazy(
  () =>
    import("./Applicant/Pages/ContractorLicense/Amendment/ClraLicenseAmendmentCategory"),
);
const ClraLicenseAmendmentUploadSignedForm = lazy(
  () =>
    import("./Applicant/Pages/ContractorLicense/Amendment/ClraLicenseAmendmentUploadSignedForm"),
);
const ListofLicense = lazy(
  () => import("./Applicant/Pages/ContractorLicense/ListofLicense"),
);
const CTUAnnualReturnList = lazy(
  () => import("./Admin/Pages/CentralTradeUnion/CTUAnnualReturnList"),
);
const LicenseRenewalFormCL = lazy(
  () => import("./Applicant/Pages/ContractorLicense/LicenseRenewalFormCL"),
);
const ContractorLicenseDetails = lazy(
  () => import("./Applicant/Pages/ContractorLicense/ContractorLicenseDetails"),
);

type AppRoute = {
  path: string;
  element: React.ReactNode;
};

const publicRoutes: AppRoute[] = [
  { path: "/", element: <Home /> },
  { path: "/applicant-login", element: <ApplicantLogin /> },
  { path: "/otplogin", element: <MobileOtpLogin /> },
  { path: "/sli-admission/apply-public", element: <SliAdmissionFormPublic /> },
  { path: "/employee-login", element: <HrmsLogin /> },
  { path: "/applicant-register", element: <ApplicantRegister /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/find-user-details", element: <FindUserDetails /> },
  { path: "/acts-rules", element: <ActsRules /> },
  { path: "/right-to-information", element: <RTI /> },
  { path: "/inspection-checklist", element: <InspectionChecklist /> },
  { path: "/important-notification", element: <ImpNotification /> },
  { path: "/general-timelines", element: <GeneralTimeline /> },
  { path: "/tender", element: <Tender /> },
  { path: "/budget", element: <BudgetPage /> },
  { path: "/samajik-suraksha-yojana", element: <SSY /> },
  { path: "/contactinfo", element: <ContactUs /> },
  {
    path: "/labour-commissionerate-contact-details",
    element: <ContactUsDetails />,
  },
  { path: "/rlo-details", element: <RLODetails /> },
  { path: "/feedback", element: <Feedback /> },
  { path: "/e-services", element: <EServices /> },
  { path: "/bocwcess", element: <BocwCess /> },
  {
    path: "/bocwcess/admin",
    element: (
      <RequireRole allowedRoles={[28]}>
        <BocwCessAdmin />
      </RequireRole>
    ),
  },
  { path: "/forbidden", element: <Forbidden /> },
  { path: "/min-wages-act", element: <MinWagesAct /> },
  { path: "/cpi-information", element: <CPIInfo /> },
  { path: "/synopsys", element: <SynopsisMinWages /> },
  // Debasish work on 24-06-2026
  { path: "/report-eodb", element: <ReportEODB /> },
  { path: "/eodb-dashboard", element: <EodbDashboard /> },
  { path: "/eodb-notice", element: <EODBNotice /> },
  { path: "/clrareport", element: <DistrictReport /> },
  { path: "/eodb-fee-breakdown", element: <FeeBreakdown /> },
  { path: "/external-authentication", element: <ExternalAuthentication /> },
  { path: "/trade-union/register", element: <TradeUnionRegister /> },
  // Public "View & Download Inspection Note" — search + read-only preview
  { path: "/view-inspection-report", element: <ViewInspectionReport /> },
  { path: "/view-inspection-report/preview", element: <UploadNotePage /> },
];

const officerRoutes: AppRoute[] = [
  { path: "/dashboard", element: <DashboardHome /> },
  { path: "/banglar-bhumi", element: <DLCInspections /> },
  { path: "/banglar-bhumi/details/:id", element: <DLCInspectionDetails /> },
  { path: "/banglar-bhumi/inquiry", element: <DLCInspectionInquiry /> },
  {
    path: "/contractor-license-certificate",
    element: (
      <RequireRole allowedRoles={[12]}>
        <ContractorLicenseCertificate />
      </RequireRole>
    ),
  },
  { path: "/trade-union-dashboard", element: <Dashboard /> },
  { path: "/custom_user/edit", element: <UpdateProfile /> },
  { path: "/office-address", element: <OfficeAddressUpdate /> },
  { path: "/user-list/dlc", element: <DLCList /> }, // DLC User List
  { path: "/user-list/dlc/:dlcId/alc", element: <ALCList /> }, // ALC List under DLC
  { path: "/user-list/alc", element: <ALCList /> }, // ALC User List
  {
    path: "/user-list/alc/:alcUserId/inspectors", // Inspector List Under ALC
    element: <InspectorList />,
  },
  { path: "/user-list/mcdlscckco", element: <McdlscckcoList /> },
  { path: "/user-list/inspector", element: <InspectorList /> },
  { path: "/view-profile", element: <InspectorView /> },
  { path: "/applications", element: <InspectorView /> },
  { path: "/officer/add-modify-emp", element: <AddNewOfficer /> },
  { path: "/service-wise-user", element: <ServicesWiseUser /> },
  { path: "/inspection-report/ins-user-list", element: <InspectionUser /> },
  { path: "/rlo_block_details", element: <BlockDetailsRLO /> },
  { path: "/rlo_insp_details", element: <InspectorDetails /> },
  { path: "/receivedapplications/clra", element: <ApplicationListCLRA /> },
  { path: "/applications/clra", element: <CLRAPERegistrationList /> },
  { path: "/official/list-license", element: <CLRALicenseList /> },
  { path: "/official/list-of-bocwa", element: <BOCWAApplicationsList /> },
  { path: "/receivedapplications/ismw", element: <ApplicationListISMW /> },
  {
    path: "/alc-visible-applications/:applicationId/:applicantUserId",
    element: <AlcVisibleApplications />,
  },
  {
    path: "/alc-view-amended-application/:applicationId/:applicantUserId",
    element: <AlcViewAmendedApplication />,
  },
  {
    path: "/alc_receivedapplications_bocwa/:applicationId/:applicantUserId",
    element: <AlcReceivedApplicationsBOCWA />,
  },

  {
    path: "/alc_receivedapplications_bocwa_amendment/:applicationId/:applicantUserId",
    element: <AlcReceivedApplicationsBOCWAAmendment />,
  },
  {
    path: "/ismwapplications-view/:applicationId/:applicantUserId",
    element: <ISMWApplicationsView />,
  },
  {
    path: "/view-details/directorpartner-info/:applicationId/:personType",
    element: <DirectorPartnerViewDetails />,
  },
  {
    path: "/alc-application-details-mtw/:applicationId/:applicantUserId",
    element: <AlcApplicationDetailsMTW />,
  },
  {
    path: "/alc-mtw-renewal-details/:applicationId/:applicantUserId",
    element: <AlcMtwRenewalDetails />,
  },
  { path: "/alc-received-license", element: <LicenseListCLRA /> },
  {
    path: "/alc-view-license/:applicationId/:applicantUserId",
    element: <AlcViewLicense />,
  },
  { path: "/alc-received-renewal-details", element: <RenewalLicenseCLRA /> },
  {
    path: "/alc-view-contractor-license-renewal",
    element: <AlcViewLicenseRenewal />,
  },
  {
    path: "/alc-received-ammendment-license",
    element: <AmmendmentLicenseCLRA />,
  },
  {
    path: "/alc-view-ammend-license",
    element: <AlcViewAmendLicense />,
  },
  {
    path: "/amendment_license_renewal/view_pe_details/:applicationId/:applicantUserId",
    element: <ViewPEDetails />,
  },
  { path: "/ismwlicense-list/employment", element: <EmploymentList /> },
  {
    // ALC read-only view of a submitted employment application (officer-side).
    path: "/ismwlicense-list/employment-details/*",
    element: <ApplicationPreview readOnly />,
  },
  { path: "/ismwlicense-list/recruitment", element: <RecruitmentList /> },
  { path: "/receivedapplications/bocwa", element: <ApplicationListBOCWA /> },
  {
    path: "/received-self-certification-application",
    element: <SelfCertification />,
  },
  {
    path: "/self-certification-application-view/:applicationId/:applicantUserId",
    element: <SelfCertificationViewDetails />,
  },
  {
    path: "/sli-admin/dashboard",
    element: <SliAdminDashboard />,
  },
  {
    path: "/sli-admin/applications",
    element: <SliAdminApplicationList />,
  },
  {
    path: "/sli-admin/application-view/:id",
    element: <SliAdminApplicationView />,
  },
  {
    path: "/receivedapplications/mtw/newreg",
    element: <MTWApplicationNewReg />,
  },
  {
    path: "/receivedapplications/mtw/renewal",
    element: <MTWApplicationRenewal />,
  },
  { path: "/view-applicant-profile", element: <ApplicantProfile /> },
  { path: "/digitally-sign-process", element: <DigitallySignProcess /> },
  { path: "/insvariousreport", element: <AdminReportsDashboard /> },
  {
    path: "/lcreport/proforma-one-xls-download",
    element: <LcReportProformaOneDownload />,
  },
  { path: "/lcreport/proforma-one", element: <LCReportProformaOne /> },
  { path: "/lcreport/proformathree", element: <LCReportProformaThree /> },
  { path: "/office/rtps-reports", element: <RTPSReport /> },
  { path: "/courtcasereport", element: <LcCourtCaseReport /> },
  { path: "/office/analytic-report", element: <LcAnalyticalReport /> },
  {
    path: "/office/analytic-payment-report",
    element: <LcAnalyticPaymentReport />,
  },
  { path: "/office/cs-reports", element: <CSReports /> },
  { path: "/register-record", element: <RegisterRecordRepository /> },
  { path: "/alcrandomization", element: <ScheduleInspectionGP /> },
  {
    path: "/central-inspection/scheduled-inspection",
    element: (
      <RequireRole allowedRoles={[4, 12]}>
        <ScheduledInspectionList />
      </RequireRole>
    ),
  },
  {
    path: "/central-inspection/scheduled-inspection/:id",
    element: (
      <RequireRole allowedRoles={[4, 12]}>
        <ScheduledInspectionDetails />
      </RequireRole>
    ),
  },
  {
    path: "/central-inspection/inspector/scheduled-inspection",
    element: (
      <RequireRole allowedRoles={[7]}>
        <InspectorScheduledInspectionList />
      </RequireRole>
    ),
  },
  {
    path: "/central-inspection/inspector/scheduled-inspection/:id",
    element: (
      <RequireRole allowedRoles={[7]}>
        <InspectorScheduledInspectionNote />
      </RequireRole>
    ),
  },
  {
    path: "/risk-wise-randomization-list/central-incpection",
    element: <ScheduleInspectionCIS />,
  },
  { path: "/alc-previous-list", element: <InspectionOrderList /> },
  { path: "/inspectionprint", element: <InspectionNotePrint /> },
  { path: "/fawloi-notice/list", element: <FAWLOIManagement /> },
  { path: "/annual-return-alc", element: <AnnualReturnList /> },
  { path: "/mailbox/user-feedback/list", element: <UserFeedback /> },
  { path: "/mailbox/pe-list", element: <PEList /> },
  { path: "/officer-list", element: <AllOfficeEmployeeList /> },
  { path: "/retired-employee-list", element: <PageNotFound /> },
  { path: "/epayments-info/verification", element: <PaymentVerification /> },
  {
    path: "/epayments/doubleverification",
    element: <PaymentVerificationStatus />,
  },
  {
    path: "/epayments/deptpayverfn",
    element: <VerificationStatusAfterPayment />,
  },

  {
    path: "/trade-union-master-list/add-trade-union",
    element: <AddEditTradeUnion />,
  },
  {
    path: "/trade-union-master-list/edit-trade-union/:id",
    element: <AddEditTradeUnion />,
  },
  {
    path: "/trade-union-master-list/view-trade-union/:id",
    element: <ViewTradeUnion />,
  },
  {
    path: "/trade-union/b-register/:id",
    element: <TradeUnionBRegister />,
  },
  {
    path: "/trade_union/b-register/:id",
    element: <TradeUnionBRegister />,
  },
  { path: "/trade-union-master-list", element: <MastersList /> },
  { path: "/trade-union-annual-return-list", element: <AnnualReturn /> },
  { path: "/trade-union-return-reg-id", element: <AnnualReturnByRegNo /> },

  { path: "/user-by-return-list", element: <ActionOnReturn /> },
  {
    path: "/trade-union/tu-fed-final-pdf-admin-end",
    element: <AnnualReturnViewAction mode="admin" />,
  },
  { path: "/change-password", element: <ChangePassword /> },
  {
    path: "/update-profile",
    element: <UpdateProfileALCDLC />,
  },
  { path: "/contact-information", element: <UpdateInfo /> },
  { path: "/tu-enquiry-list", element: <TradeUnionEnquiry /> },
  { path: "/trade-union-enquiry-view", element: <TradeUnionEnquiryView /> },
  {
    path: "/central-trade-union-registration",
    element: (
      <RequireRole allowedRoles={[11]}>
        <RegistrationCentralStateTradeUnion />
      </RequireRole>
    ),
  },
  { path: "/central-trade-union-list", element: <CentralTradeUnionList /> },
  {
    path: "/central-trade-union-list-view/:enId",
    element: <CentralTradeUnionListView />,
  },
  { path: "clra-backlog-details", element: <PEList /> },
  { path: "edit-data", element: <EditData /> },
  { path: "add_backlog_pe_data", element: <AddNewPEData /> },
  { path: "/retired-officer-list", element: <AllRetiredEmployeeList /> },
  {
    path: "/alc-and-dlc-inspection-order-list",
    element: <InspectionScheduleOrderList />,
  },
  { path: "/inspector-randomization", element: <InspectorRandomization /> },
  { path: "/inspection-list", element: <InspectorOrderList /> },
  { path: "/central-inspection-list", element: <CentralInspectionList /> },
  { path: "/print-inspection-note", element: <PrintInspectionNote /> },
  { path: "/inspection-list/final-submit", element: <UploadNotePage /> },
  { path: "/inspection-list/show-cause/:fileNo", element: <ShowCausePage /> },
  { path: "/inspection-list/verify-show-cause/:fileNo", element: <VerifyShowCausePage /> },
  { path: "/inspection-list/court-case/:fileNo", element: <CourtCasePage /> },
  { path: "/inspection-list/court-case-proceeding/:fileNo", element: <CourtCaseProceedingPage /> },
  {
    path: "/randomization-previous-list",
    element: <RandomizationPreviousList />,
  },
  { path: "/upload-previous-order", element: <UploadSignedOrder /> },
  {
    path: "/inspection-submission-list",
    element: <InspectionOrderListForAlc />,
  },
  {
    path: "/inspection-submission-list/:orderId",
    element: <InspectionSubmissionList />,
  },
  {
    path: "/alc-orders-list",
    element: <AlcInspectionCasesList />,
  },
  {
    path: "/inspector-inspection-list",
    element: <InspectorInspectionList />,
  },
  {
    path: "/alc-orders-list/:caseId",
    element: <AlcCaseAction />,
  },
  {
    path: "/official/clra-old-applications",
    element: <OfflineCLRAApplications />,
  },
  { path: "/official/old-list-of-bocwa", element: <LegacyBocwaList /> },
  {
    path: "/official/view-old-list-of-bocwa",
    element: <ViewOldBocwaDetails />,
  },

  // Minimum Wages Module Routes
  {
    path: "/min-wages/scheduled-employment/:month/:year",
    element: <ScheduledEmploymentSynopsis />,
  },
  {
    path: "/min-wages/scheduled-employment",
    element: <ScheduledEmployment />,
  },
  {
    path: "/min-wages/non-scheduled-employment",
    element: <NonScheduledEmployment />,
  },
  { path: "/closure-verification/:id", element: <ClosureVerification /> },
];

const applicantRoutes: AppRoute[] = [
  { path: "/applicant-dashboard", element: <DashboardApplicant /> },

  // <--------------------------------- Annual Return (various Labour Laws) --------------------------------->
  { path: "/annual-return/list", element: <AnnualReturnLLList /> },
  { path: "/annual-return/wizard", element: <AnnualReturnLLWizard /> },
  { path: "/annual-return/form", element: <AnnualReturnLLCommonForm /> },

  // Applicant self-service profile (l_common_application_master). The officer-side
  // read-only view of an applicant stays on /view-applicant-profile.
  { path: "/my-profile", element: <MyProfile /> },
  { path: "/change-password-applicant", element: <ChangePassword /> },

  { path: "/clra_backlog", element: <CLRABacklog /> },
  // Disabled for now as it is not needed
  // {
  //   path: "/clra_backlog/clra_registration_type",
  //   element: <CLRABacklogRegType />,
  // },

  // <--------------------------------- Contractor License Routes --------------------------------->
  { path: "/check_fromv_no", element: <ApplyNewLicense /> },

  // <------ Contractor License Renewal Routes ------>
  { path: "/renewal/old_renewal", element: <ApplyAmdRenewLicense /> },
  {
    path: "/contractor-license/details/:id",
    element: <ContractorLicenseDetails />,
  },
  { path: "/contractor-license/renewal", element: <LicenseRenewalFormCL /> },
  {
    path: "/contractor-license/renewal/apply",
    element: <ClraLicenseRenewalApply />,
  },
  {
    path: "/contractor-license/renewal/upload-form-vii",
    element: <ClraLicenseRenewalUploadFormVii />,
  },

  // <------ Contractor License Amendment Routes ------>
  // {
  //   path: "/contractor-license/amendment/select-fields/:formVSerialNo",
  //   element: <ClraLicenseAmendmentSelectFields />,
  // },
  {
    path: "/contractor-license/amendment/select-fields",
    element: <ClraLicenseAmendmentSelectFields />,
  },
  {
    path: "/contractor-license/amendment/apply",
    element: <ClraLicenseAmendmentApply />,
  },
  {
    path: "/contractor-license/amendment/details",
    element: <AmendmentLicenseDetails />,
  },
  {
    path: "/contractor-license/amendment/re-submit",
    element: <AmendmentLicenseReSubmit />,
  },
  {
    path: "/contractor-license/amendment/apply/worksite",
    element: <ClraLicenseAmendmentWorksite />,
  },
  {
    path: "/contractor-license/amendment/apply/contractor",
    element: <ClraLicenseAmendmentContractor />,
  },
  {
    path: "/contractor-license/amendment/apply/manager",
    element: <ClraLicenseAmendmentManager />,
  },
  {
    path: "/contractor-license/amendment/particular-info",
    element: <ParticularInfo />,
  },
  {
    path: "/contractor-license/amendment/apply/conditions-benefits",
    element: <ClraLicenseAmendmentConditionsBenefits />,
  },
  {
    path: "/contractor-license/amendment/apply/compliance-history",
    element: <ClraLicenseAmendmentComplianceHistory />,
  },
  {
    path: "/contractor-license/amendment/apply/category",
    element: <ClraLicenseAmendmentCategory />,
  },
  {
    path: "/contractor-license/amendment/upload-signed-form",
    element: <ClraLicenseAmendmentUploadSignedForm />,
  },
  {
    path: "/view-contractors-form-v",
    element: <ContractorFormV />,
  },
  {
    path: "/view-remarks/:encActId/:encAppId",
    element: <ApplicantRemarksHistory />,
  },
  {
    path: "/contractor-license/remarks",
    element: <ContractorLicenseRemarks />,
  },
  { path: "/license-renewal-amendment-list", element: <ListofLicense /> },
  { path: "/license-more-details", element: <LicenseMoreDetails /> },
  { path: "/applicant/license-renewal/", element: <LicenseRenewalFormCL /> },
  {
    path: "/amendment_license_renewal/check_for_amendment/:encryptedSerial",
    element: <CheckForAmendmentLegacyRedirect />,
  },
  /** No `:encryptedSerial` segment — legacy bare URLs; redirect sends users to the amendment hub. */
  {
    path: "/amendment_license_renewal/check_for_amendment",
    element: <CheckForAmendmentLegacyRedirect />,
  },
  {
    path: "/amendment_license_renewal/amendment-perview/:encryptedSerial/:encryptedAmendmentId",
    element: <AmendmentPreviewLegacyRedirect />,
  },
  /** Legacy `apply_amendment/...` — use list + `/contractor-license/amendment/...` (session + encrypted URL). */
  {
    path: "/amendment_license_renewal/apply_amendment",
    element: <Navigate to="/license-renewal-amendment-list" replace />,
  },
  {
    path: "/amendment_license_renewal/apply_amendment/*",
    element: <Navigate to="/license-renewal-amendment-list" replace />,
  },
  { path: "/view-licenseremark", element: <RemarksListPage /> },
  // <------------------------------------- MTW Registration ------------------------------------->
  { path: "/mtw-registration", element: <NewRegistrationMTW /> },
  { path: "/mtw-reg-checking", element: <ApplyRenewalMTW /> },

  // <------------------------------------- ISMW Registration ------------------------------------->
  { path: "/ismw_establishment_location", element: <NewRegistrationISMW /> },
  { path: "/ismw-license-location", element: <NewLicenseISMW /> },
  {
    // Single-path Employment (In West Bengal) flow: the FORM-VI, application,
    // owners, workmen, documents and preview steps are rendered as state-driven
    // tabs under this one route instead of changing the URL per step.
    path: "/establishment-details/*",
    element: <EmploymentLicenseFlow />,
  },
  {
    path: "/contractor-info/*",
    element: <RecruitmentContractorInfo />,
  },
  {
    path: "/ismw-license-recruitment/contractor-info/*",
    element: <RecruitmentContractorInfo />,
  },
  {
    path: "/ismw-license/employment-application/*",
    element: <EmploymentApplication />,
  },
  {
    path: "/ismw-license/ownership-info/*",
    element: <OwnersDetails />,
  },
  {
    path: "/ismw-license/workmen-info/*",
    element: <WorkmenDetails />,
  },
  {
    path: "/ismw-license/documents-upload/*",
    element: <DocumentsSection />,
  },
  {
    path: "/ismw-license/employment-preview/*",
    element: <ApplicationPreview />,
  },
  {
    // Read-only "View Details" of a submitted employment application.
    path: "/ismw-license/employment-details/*",
    element: <ApplicationPreview readOnly />,
  },
  { path: "/ismw-employment_license-list", element: <EmploymentLicenseList /> },
  {
    path: "/ismw_recruitement_license-list",
    element: <RecruitementLicenseList />,
  },

  // <---------------------------------- Anual Return Trade Union ---------------------------------->
  { path: "/trade-union/trade_union", element: <TradeUnionAnnualReturnForm /> },
  {
    path: "/trade-union/trade-federation-annual-return-form",
    element: <TradeUnionAnnualReturn />,
  },
  {
    path: "/trade-union/schedule3/liabilities-and-assets",
    element: <ScheduleIIILiabilities />,
  },
  { path: "/trade-union/annual-upload-documents", element: <RectifyData /> },
  {
    path: "/trade-union/annual-list-securities",
    element: <AnnualListSecurities />,
  },
  {
    path: "/trade-union/general-fund-account",
    element: <AnnualReturnProfitLoss />,
  },
  {
    path: "/trade-union/political-fund-account",
    element: <AnnualReturnPoliticalFundIncome />,
  },
  {
    path: "/trade-union/annual-retern-officers-reliquising",
    element: <OfficersRelinquishingOffice />,
  },
  {
    path: "/trade-union/annual-retern-officers-appointed",
    element: <OfficersAppointed />,
  },
  {
    path: "/trade-union/annual-return-consent-officers",
    element: <ConsentOfOfficers />,
  },
  {
    path: "/trade-union/annual-return-preview",
    element: <AnnualReturnPreview />,
  },
  { path: "/trade-union/federation-election", element: <FederationElection /> },
  // <---------------------------------- Anual Return Trade Union ---------------------------------->

  // BOCWA Applicant routes
  { path: "/bocwa-amendment", element: <AmendmentRegCertificateBOCWA /> },
  { path: "/apply-bocwa", element: <ApplyBOCWA /> },
  {
    path: "/amendment-bocwa/bocwa-amendment-submit",
    element: <BOCWAAmendmentForm />,
  },
  { path: "/bocwa-application-view", element: <BOCWAApplicationPreview /> },
  { path: "/view-remark", element: <BOCWARemarkDetails /> },

  {
    path: "/register-record-repository-form",
    element: <RegisterRecordRepositoryCafLogin />,
  },
  {
    path: "/self-certification-application/list",
    element: <SelfCertificationList />,
  },
  {
    path: "/sli-admission/list",
    element: <SliAdmissionList />,
  },
  {
    path: "/sli-admission/apply",
    element: <SliAdmissionForm />,
  },
  {
    path: "/self-certification-application/particulars",
    element: <SelfCertificationPerticulars />,
  },
  {
    path: "/self-certification-application/others",
    element: <SelfCertificationOthers />,
  },
  {
    path: "/self-certification-application/select-service",
    element: <SelfCertificationSelectService />,
  },
  {
    path: "/self-certification-application/payment-details/:encActId/:applicationId",
    element: <SelfCertificationPaymentDetails />,
  },
  {
    path: "/self-certification-application/upload-signed-application/:encId",
    element: <SelfCertificationUploadSignedApplication />,
  },
  {
    path: "/applicant-profile-update/worker_details",
    element: <SelfCertificationWorkerDetails />,
  },
  {
    path: "/add-person",
    element: <SelfCertificationAddPerson />,
  },
  {
    path: "/ownership-list",
    element: <SelfCertificationOwnershipList />,
  },
  {
    path: "/add-directorpartner",
    element: <SelfCertificationAddDirectorPartner />,
  },

  // CLRA Registration and Applicant Routes
  { path: "/clra-amendment", element: <AmendmentRegCertificateCLRA /> },
  { path: "/apply-clra-reg-amendment", element: <AmmendmentCLRAPE /> },
  {
    path: "/clra-reg-amendment/view-clra-application/:applicationId",
    element: <ApplicationDetailsAmendment />,
  },
  {
    path: "/clra-reg-amendment/view-clra-application",
    element: <ApplicationDetailsAmendment />,
  },
  {
    path: "/clra-reg-amendment/view-details",
    element: <ViewDetailsPageCLRAPEAmendment />,
  },
  {
    path: "/clra-reg-amendment/view-trade-union-application",
    element: <ClraRegViewTUApplication />,
  },
  {
    path: "/clra-reg-amendment/clra-contractor-info",
    element: <ClraRegViewContractInfo />,
  },
  { path: "/clra-reg-amendment/verify", element: <ClraRegVerify /> },
  { path: "/add-contractor-form", element: <ContractorForm /> },
  { path: "/edit-contractor-form/:id", element: <ContractorForm /> },
  { path: "/view-contractor-details/:id", element: <ContractorDetailsView /> },

  { path: "/add-contractor", element: <ClraRegAddContractor /> },
  {
    path: "/view-clra-application-details/view-clra-application",
    element: <ClraRegViewApplicationContractorAdded />,
  },
  {
    path: "/view-clra-application-details/clra-contractor-info",
    element: <ClraRegViewContractInfoContractorAdded />,
  },
  {
    path: "/view-clra-application-details/view-trade-union-application",
    element: <ClraRegViewTUApplicationContractorAdded />,
  },
  {
    path: "/view-clra-application-details/verify",
    element: <ClraRegVerifyContractorAdded />,
  },
  { path: "/clra-amended/:ref", element: <ClraAmendedCertificatePdf /> },

  // download_pdf_formV
  // view-contractors-form-v/:applicationId

  // MTW Registration and Renewal Routes
  { path: "/mtw-renewal", element: <RenewalDetailsMTW /> },
  { path: "/mtw/view-details", element: <ViewDetailsPageMTW /> },

  // GRIPS payment preview (Pay Now)
  { path: "/epayments-preview", element: <EpaymentsPreview /> },

  // RLO details (parametrized under applicant layout)
  { path: "/rlo-details/:areaName/:encryptedId", element: <RLODetails /> },

  // Form - I Upload Page
  {
    path: "/upload_signed_application_form/:enApplicationId/:enActId/:identificationNo",
    element: <FormIUpload />,
  },
  { path: "/applicant/view-inspection-report", element: <ViewInspectionReport /> },
  { path: "/applicant/view-inspection-report/preview", element: <UploadNotePage /> },
];

/** Central Trade Union admin (role 22) — must use `CTU_ROLES` layout so `RequireRole` allows access */
const ctuRoutes: AppRoute[] = [
  {
    path: "/central-trade-union-annual-return-list",
    element: <CTUAnnualReturnList />,
  },
  {
    path: "/trade-union/tu-fed-final-pdf-central-admin-end",
    element: <AnnualReturnViewAction mode="ctu" />,
  },
];

const App = () => {
  useEffect(() => {
    const handleWheel = () => {
      if (
        document.activeElement instanceof HTMLInputElement &&
        document.activeElement.type === "number"
      ) {
        document.activeElement.blur();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <>
      {/* <Router basename="/lc"> */}
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public site layout stays unprotected */}
          <Route element={<MainLayout />}>
            {publicRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>

          {/* SLI admission login: standalone page, opened in a new tab, no site nav */}
          <Route path="/sli-login" element={<SliLogin />} />

          {/* Officer-only certificate view without dashboard chrome */}
          <Route path="/form-I-pdf" element={<FormIPDF />} />
          <Route path="/form-V-pdf" element={<FormVPDF />} />
          <Route path="/form-VI-pdf" element={<FormVIPDF />} />

          {/* Extra Pages For the Website  */}
          <Route path="/page-not-found" element={<NotFound />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/under-development" element={<UnderDevelopment />} />
          <Route path="/data-migration" element={<DataMigration />} />

          {/* Applicant FORM-VI (renewal certificate): full viewport, no dashboard layout */}
          <Route
            path="/contractor-license/renewal/form-vi/:renewalIdEnc/:licenseIdEnc/:serialNoEnc/:flag"
            element={
              <RequireRole
                allowedRoles={CONTRACTOR_RENEWAL_FORM_VI_VIEWER_ROLES}
              >
                <ClraLicenseRenewalFormVI />
              </RequireRole>
            }
          />

          <Route
            path="/clra-reg-cert/:applicationId/:applicantUserId"
            element={<ClraRegCertificate />}
          />

          {/* RequireAuth is not used yet, but you can add it for shared pages */}
          {/* <Route
          path="/my-shared-page"
          element={
            <RequireAuth>
              <MySharedPage />
            </RequireAuth>
          }
        /> */}

          {/* Officer/Admin dashboard layout (protected) */}
          <Route
            element={
              <RequireRole allowedRoles={OFFICER_ROLES}>
                <Suspense fallback={<div>Loading dashboard...</div>}>
                  <DashboardLayout />
                </Suspense>
              </RequireRole>
            }
          >
            {officerRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}

            {/* Dipanjan */}
            {/* PARENT ROUTE (Tabs Wrapper) */}
            <Route path="/inspection" element={<InspectionTabs />}>
              <Route path="list" element={<InspectionList />} />
              <Route path="show-cause" element={<LateOffFileList />} />
              <Route path="courtcase" element={<CourtCaseFileList />} />
              <Route path="showcause-list" element={<ShowCauseFileList />} />

              {/* Optional placeholders */}
              <Route path="new" element={<NewInspection />} />
              <Route path="note" element={<InspectionNote />} />
            </Route>
          </Route>

          {/* Applicant dashboard layout (protected for APPLICANT only) */}
          <Route
            element={
              <RequireRole allowedRoles={APPLICANT_ROLES}>
                <Suspense fallback={<div>Loading dashboard...</div>}>
                  <DashboardApplicantLayout />
                </Suspense>
              </RequireRole>
            }
          >
            {applicantRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}

            {/* <Route path="/clra-amendment-certificate" element={<ClraAmendedCertificate
            registrationNo="THT10/CLR/00047"
            registrationDate="5th Dec, 2019"
            officeName="Office of the Assistant Labour Commissioner"
            // officeExtra=""
            officeAddress="Tehatta, Nadia"
            establishmentDetails="ABC Construction, Tehatta, Nadia – 741160"
            natureOfWork="Civil Works, Construction & Maintenance"
            contractorDetails="Annexure I Attached"
            contractorNatureOfWork="Annexure I Attached"
            maxContractLabour={120}
            qrUrl="/api/qr?ref=123"

          />} /> */}
          </Route>

          {/* Central Trade Union admin (role 22) */}
          <Route
            element={
              <RequireRole allowedRoles={CTU_ROLES}>
                <Suspense fallback={<div>Loading dashboard...</div>}>
                  <DashboardApplicantLayout />
                </Suspense>
              </RequireRole>
            }
          >
            {ctuRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>

          {/* Catch-all Route for 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default App;
