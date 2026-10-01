/** Flatten renewal/preview response for amendment apply view mappers. */
export function normalizeRenewalPreviewForApply(
  preview: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!preview || typeof preview !== "object") return null;

  const applyContent = preview.applyContent;
  if (applyContent && typeof applyContent === "object") {
    const flat = applyContent as Record<string, unknown>;
    return {
      ...flat,
      activity_tag_flag: flat.activity_tag_flag ?? preview.applicationFlag,
      activity_tag_application_status:
        flat.activity_tag_application_status ?? preview.applicationStatus,
      license_renewal_amnd_id:
        flat.license_renewal_amnd_id ??
        preview.renewalApplicationId ??
        preview.paymentApplicationId,
    };
  }

  const est = (preview.establishment ?? {}) as Record<string, unknown>;
  const con = (preview.contractor ?? {}) as Record<string, unknown>;
  const lic = (preview.license ?? {}) as Record<string, unknown>;
  const wages = (preview.wages ?? {}) as Record<string, unknown>;
  const leaves = (preview.leaves ?? {}) as Record<string, unknown>;
  const other = (preview.other ?? {}) as Record<string, unknown>;
  const docs = (preview.documents ?? {}) as Record<string, unknown>;

  /** Preview documents are `{ fileId, filename, uri, mime }`; the view wants the uri. */
  const docUrl = (value: unknown) =>
    value && typeof value === "object"
      ? (value as { uri?: unknown }).uri
      : value;

  return {
    ...preview,
    est_name: est.name,
    est_type: est.businessType,
    loc_e_name: est.location,
    loc_e_dist: est.district,
    loc_e_subdivision: est.subdivision,
    loc_e_gp_ward: est.gpWard,
    loc_e_ps: est.policeStation,
    loc_e_pin_number: est.pin,
    pe_registration_no: est.registrationNumber,
    pe_registration_date: est.registrationDate,
    pe_name: est.principalEmployerName,
    pe_address: est.principalEmployerAddress,
    contractor_license_no: lic.licenseNumber,
    backlog_license_no: lic.backlogLicenseNumber,
    backlog_license_date: lic.backlogLicenseDate,
    license_date: lic.licenseDate,
    next_renweal_date: lic.validUpto,
    contractor_max_no_of_labours_on_any_day: lic.maxLabours,
    name_of_contractor: con.name,
    father_contarctor_name: con.fatherName,
    dob_contractor: con.dob,
    age_contractor: con.age,
    category_of_contractor: con.category,
    address_of_contractor: con.address,
    contractor_dist: con.district,
    contractor_subdivision: con.subdivision,
    contractor_gp_ward: con.gpWard,
    contractor_ps: con.policeStation,
    contractor_pin: con.pin,
    name_of_manager: con.managerName,
    address_of_manager: con.managerAddress,
    contractor_manager_dist: con.managerDistrict,
    contractor_manager_subdivision: con.managerSubdivision,
    contractor_managerr_gp_ward: con.managerGpWard,
    contractor_manager_ps: con.managerPoliceStation,
    manager_pin: con.managerPin,
    worksite_address_line: con.worksiteAddress,
    worksite_dist: con.worksiteDistrict,
    worksite_subdivision: con.worksiteSubdivision,
    work_site_gp_ward: con.worksiteGpWard,
    worksite_ps: con.worksitePoliceStation,
    worksite_pin: con.worksitePin,
    nature_of_work: con.natureOfWork,
    category_designation: con.categoryDesignation,
    est_date_of_work_of_each_labour_from_date: con.workFromDate,
    est_date_of_work_of_each_labour_to_date: con.workToDate,
    duration_of_the_proposed_contract_work: con.duration,
    unskilled_rate_wages: wages.unskilledRateWages,
    semiskilled_rate_wages: wages.semiskilledRateWages,
    skilled_rate_wages: wages.skilledRateWages,
    highlyskilled_rate_wages: wages.highlyskilledRateWages,
    hours_work: wages.hoursWork,
    spred_over: wages.spredOver,
    overtime: wages.overtime,
    overtime_wages: wages.overtimeWages,
    weekly_holiday: leaves.weeklyHolidays,
    no_holiday: leaves.noHoliday,
    holiday_wages: leaves.holidayWages,
    annual_leave_no: leaves.annualLeaveNo,
    casual_leave_no: leaves.casualLeaveNo,
    sick_leave_no: leaves.sickLeaveNo,
    maternity_leave_no: leaves.maternityLeaveNo,
    earned_leave_no: leaves.earnedLeaveNo,
    other_leave_no: leaves.otherLeaveNo,
    special_benifites: other.specialBenefits,
    state_insurance: other.stateInsurance,
    miscellaneous_provisions: other.miscellaneousProvisions,
    details_contractor_convicted: other.contractorConvicted,
    details_contractor_revoking: other.contractorRevoking,
    work_order_file_url: docUrl(docs.workOrder),
    other_file_url: docUrl(docs.other),
    frm_v_file_url: docUrl(docs.formV),
    residential_file_url: docUrl(docs.residential),
    activity_tag_flag: preview.applicationFlag,
    activity_tag_application_status: preview.applicationStatus,
    license_renewal_amnd_id: preview.renewalApplicationId ?? preview.paymentApplicationId,
  };
}
