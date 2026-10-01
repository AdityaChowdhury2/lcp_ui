import * as yup from "yup";

export const clraAmendmentSchema = yup.object({

    /* Establishment */
    e_name: yup.string().required("Establishment name required"),
    est_type: yup.string().required(),
    loc_e_name: yup.string().required(),
    loc_e_dist: yup.string().required(),
    loc_e_subdivision: yup.string().required(),
    loc_e_areatype: yup.string().required(),
    name_areatype: yup.string().required(),
    loc_e_vill_ward: yup.string().required(),
    loc_e_ps: yup.string().required(),
    loc_e_pin_number: yup.string().length(6),

    /* Postal */
    e_postal_address: yup.string().required(),
    e_postal_dist: yup.string().required(),
    e_postal_subdivision: yup.string().required(),
    e_postal_areatype: yup.string().required(),
    e_postal_name_areatype: yup.string().required(),
    e_postal_vill_ward: yup.string().required(),
    e_postal_ps: yup.string().required(),
    e_postal_pin_number: yup.string().length(6),

    /* Principal Employer */
    full_name_principal_emp: yup.string().required(),
    gender_pe: yup.string().required(),
    address_principal_emp: yup.string().required(),
    emp_country: yup.string().required(),
    emp_state: yup.string().required(),
    emp_dist: yup.string().required(),
    loc_emp_subdv: yup.string().required(),
    loc_emp_areatype: yup.string().required(),
    emp_name_areatype: yup.string().required(),
    loc_emp_vill_ward: yup.string().required(),
    loc_emp_ps: yup.string().required(),
    loc_emp_pin_number: yup.string().length(6),

    /* Manager */
    full_name_manager: yup.string().required(),
    address_manager: yup.string().required(),
    manager_country: yup.string().required(),
    manager_state: yup.string().required(),
    manager_dist: yup.string().required(),
    loc_manager_subdv: yup.string().required(),
    loc_manager_areatype: yup.string().required(),
    manager_name_areatype: yup.string().required(),
    loc_manager_vill_ward: yup.string().required(),
    loc_manager_ps: yup.string().required(),
    loc_manager_pin_number: yup.string().length(6),

    /* Work */
    max_num_wrkmen: yup.number().required(),
    e_num_of_workmen_per_or_reg: yup.number().required(),
    e_num_of_workmen_temp_or_reg: yup.number().required(),
    workmen_if_same_similar_kind_of_work: yup.string().required(),
    con_lab_job_desc: yup.string().required(),
    con_lab_wage_rate_other_benefits: yup.string().required(),
    con_lab_cat_desig_nom: yup.string().required(),
    e_settlement_award_judgement_min_wage: yup.string().required(),
    e_any_day_max_num_of_workmen: yup.number().required(),

    /* Nature */
    e_nature_of_work: yup.array().of(yup.number()).min(1),
    other_nature_of_work_value: yup.string().nullable(),

    /* Documents (filenames only) */
    trade_license_file: yup.string().nullable(),
    article_of_assoc_file: yup.string().nullable(),
    memorandum_of_cert_file: yup.string().nullable(),
    partnership_deed_file: yup.string().nullable(),
    factory_license_file: yup.string().nullable(),

});
