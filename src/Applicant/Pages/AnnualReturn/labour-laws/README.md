# Annual Return under various Labour Laws (Applicant)

Applicant-side UI for filing the **Annual Return under various Labour Laws**.
It is a React/TypeScript port of the legacy Drupal `annual_return` module
(`annual_return/includes/*.inc`). This is a **UI-only** implementation — no API
is wired yet; saving is stubbed and reads show placeholders.

> Not to be confused with the sibling **Trade Union** annual-return screens in
> `../` (`TradeUnionAnnualReturn*.tsx`, `ConsentOfOfficers.tsx`, …). Those are a
> separate module and are untouched by this one, which lives under
> `labour-laws/` to avoid clashes.

---

## Flow

```
Sidebar ▸ Annual Return
    ├─ Submission of Return   → /annual-return/wizard
    └─ Annual Return List     → /annual-return/list

/annual-return/wizard  ──(year + acts, via router state)──▶  /annual-return/form
/annual-return/form    ──(SAVE)──▶  /annual-return/list
```

1. **Wizard** — pick the return year and answer Yes/No for each of the 12 acts.
   Selection is passed forward through `react-router` location `state`
   (`{ year, acts }`).
2. **Common form** — one big accordion. Sections 1–11 are the common return
   fields, 12–16 are repeatable "inside" forms (rendered as nested accordions
   with add-row tables, **not** separate pages), and 17+ are the act-specific
   forms that appear only for the acts chosen in the wizard.
3. **List** — table of submitted/draft returns (reuses
   `react-data-table-component`, same styling as the admin list).

If a user opens `/annual-return/form` directly (no wizard state), they are
redirected back to the wizard.

---

## File structure

```
labour-laws/
├── README.md                       ← this file
├── arTypes.ts                      ← ACT_DEFS, ActKey, wizard state types
├── AnnualReturnLLWizard.tsx        ← step 1: year + 12 acts
├── AnnualReturnLLCommonForm.tsx    ← step 2: main accordion form (composes everything)
├── AnnualReturnLLList.tsx          ← submitted return list
└── components/
    ├── arFormPrimitives.tsx        ← ArSection/ArAccordion, TextField, SelectField,
    │                                 TextAreaField, YesNoField, SubHeading, buttons
    ├── ArItemsTable.tsx            ← reusable add/remove listing table (built on ui/table)
    ├── InnerSubForms.tsx           ← sections 12–16 (Manager, Particulars,
    │                                 Retrenchment, PF/ESI, Trade Union)
    └── ActForms.tsx                ← the 12 conditional act forms + ACT_FORM_COMPONENTS map
```

### Routes (registered in `src/App.tsx`, `applicantRoutes`)

| Path | Component |
|---|---|
| `/annual-return/list` | `AnnualReturnLLList` |
| `/annual-return/wizard` | `AnnualReturnLLWizard` |
| `/annual-return/form` | `AnnualReturnLLCommonForm` |

### Sidebar

Enabled in `src/Components/DashboardApplicant/DashboardApplicantSidebar.tsx`
via `ANNUAL_RETURN_SUBS` + `ANNUAL_RETURN_ACTIVE_PATHS`, registered in
`NESTED_MENU_SECTIONS` under the key `annual-return` so the section auto-opens
on any `/annual-return/*` route.

---

## Design / conventions

- Matches the existing app: section header bar `#1D5A89`, bordered inputs,
  the shared `@/Components/ui/accordion` and `@/Components/ui/table` primitives.
- Every field uses shared primitives from `arFormPrimitives.tsx` to keep the
  many forms consistent and terse.
- Repeatable forms keep local `useState` lists and render through
  `ArItemsTable`; nothing opens in a new page (per requirement — accordions only).
- Conditional logic is driven off the wizard `acts` selection and off in-form
  answers (e.g. Bonus "reason for non-payment" only shows when *paid to all =
  No*; PF/ESI registration fields only when *covered = Yes*).

---

## Reference → backend mapping

Traced from the legacy `db_insert(...)->fields([...])` handlers. React field
`name`s were chosen to line up with these columns so a future save endpoint can
be a near pass-through. Every table also carries `user_id, wizard_id,
current_yr, status`.

### Wizard

| Concern | Table | Key columns |
|---|---|---|
| Year + act flags | `l_annual_return_wizard_info` | `apply_for`, `class`, `clra_act, license_act, bocwa_act, ismw_act, mtw_act, minimum_wages_act, annual_return_bonus, maternity_benefit, annual_return_wages, payments_gratuity_act, interstatecontractor` |

On save it also seeds empty rows in `l_annual_return_clra`,
`l_annual_return_bocwa`, `l_annual_return_contractor`, `l_annual_return_ismw`,
`l_annual_return_mtw`.

### Common form (sections 1–11 + nature)

| Section | Table | Columns |
|---|---|---|
| 1. Establishment (read-only) | **read** `l_common_application_master` | `est_name, est_loc, est_district, est_subdivision, est_loc_e_areatype, est_name_areatype, est_loc_e_vill_ward, est_ps, est_pin_number` |
| 3–11 (counts / wages) | `l_annual_return_common_data` | `direct_emp_male/female/total/adolmale/adolfemale/adoltotal`, `contract_emp_*`, `casual_emp_*`, `minimum_wages`, `wages_paid_maximum/minimum`, `total_amount_of_wages`, `no_of_workers_retrenched/resigned/terminated`, `max_no_of_workmen_emp_directly_per_yr`, `total_days_for_direct_labour`, `total_man_days`, `avg_no_emp_industrial_premises_men/women/yp/male/female` |
| 2. Nature of Business (one row/selection) | `l_annual_return_natureofwork` | `nature_of_business` |

### Inner sub-forms (12–16)

| Sub-form | Table | Columns |
|---|---|---|
| 12. Unit Manager | `l_annual_return_unit_manager` | `full_name_unit_manager, address_principal_unit_manager, unit_manager_country/state/dist, loc_unit_manager_subdv/areatype/vill_ward/ps/pin_number, unit_manager_name_areatype` |
| 13. Employer / Contractor / PE | `l_annual_return_particulars_list` | `full_name_principal_emp, address_principal_emp, emp_country/state/dist, loc_emp_subdv/areatype/vill_ward/ps/pin_number, emp_name_areatype, emp_pan, emp_tan, emp_lin, emp_email, emp_alt_email_id, emp_mobile_no, emp_cust_id, emp_consumer_no` |
| 14. Retrenchment | `l_annual_return_retrenchment` | `worker_name, retrenchment_details` |
| 15. PF / ESI | `l_annual_return_pf_esi` | `esi, esic_reg_no, esic_reg_date, epf, epf_details` |
| 16. Trade Union | **read** `l_clra_reg_trade_union_master` | `e_trade_union_regn_no, e_trade_union_name, e_trade_union_address` |

### Conditional act forms (17+)

| Act | Table | Notable columns |
|---|---|---|
| CLRA (PE) | `l_annual_return_clra` (+`l_annual_return_contractor`) | `contractor_id, application_id, days_work_last_yr, total_no_of_days, man_days_work` |
| CLRA License | `l_annual_return_license_extended` | — |
| BOCWA | `l_annual_return_bocwa` | `total_building_workers, workers_ordinary_employed, numberofdays_workers_employed, man_days_worked, yes_no_accident, total_accidents, no_of_deaths, partial_accidents, total_man_days_lost, bocwa_permanent_address` |
| ISMW (PE) | `l_annual_return_ismw` | `est_address, no_of_days_emp_migrant_wm, no_of_mandays_emp_migrant_year` |
| MTW | `l_annual_return_mtw` | `postal_address, avg_emp_daily_adult/adol, hr_per_day_*, interval_*, exempted_*, no_of_wks_*` (leave/discharge/dismiss breakdowns) |
| Minimum Wages | `l_annual_return_minimum_wages` | `name_of_est, name_of_mg_if_any, address, dist_code/subdivision/areatype/vill_ward/ps/pin, no_of_days_worked_during_yr, no_of_mandays_worked_during_yr, balance_fine_fund_in_hand` |
| Payment of Bonus | `l_annual_return_payment_of_bonus` | `total_number_emp, total_amount_payable_bonus, settlement, settlement_remarks, percentage_bonus, total_amount_bonus, date_payment_made, whether_bonus_paid, none_payment, remark` |
| Payment of Wages | `l_annual_return_payment_wages` | wide — `total_number_emp, section_basic_wages_*, section_da_*, deduction_*, fines*, disbursement*, amount_realized, case_realized, balance` (adult/adolescent × 200/400 splits) |
| Gratuity | `l_annual_return_payments_gratuity` (+ `_propriety_undertaking`, `_stock_company`) | `no_persons_emp, max_number_person, number_covered_act, type_organisation, articles_details, seasonal, date_opening` |
| Maternity Benefit | `l_annual_return_maternity_benefit` (+ `_payment_details`) | `date_opening, closing_date, medical_officer_name, qualification_medical_officer, resident_establishment, hospital_est, beds_provided, lady_doctor_qualifaction, qualified_midwife, creche_provided, women_temporarily/permanently_employed, claims_for_meternity_benefit_paid, claims_..._rejected` |
| Beedi | `l_annual_return_minimum_wages` (shared) | — |

---

## API (NestJS — `lcp_api/src/annual-return-ll`)

All routes are JWT-guarded (`AuthGuard('jwt')`, `req.user.userId`).

| Method | Route | Purpose |
|---|---|---|
| POST | `/annual-return-ll/wizard` | Save year + act flags → returns encrypted `wizardId` |
| GET | `/annual-return-ll/establishment` | Establishment details + operating trade unions |
| GET | `/annual-return-ll/list` | Applicant's submitted / draft returns |
| POST | `/annual-return-ll/submit` | Save common return + sub-forms + selected act forms (transaction) |

The frontend service is `annualReturnLLApi.ts` (axios instance that attaches the
bearer token). Field `name`s across the forms are aligned to the DB columns, so
the submit payload is a whitelist pass-through on the server. The common-section
local names are mapped to columns in `AnnualReturnLLCommonForm.buildCommonPayload`.

Prisma models were added to `lcp_api/prisma/schema.prisma` (value columns typed
`String?` for compatibility with the string form payload). **Run
`npx prisma generate` and reconcile the DB manually — no `db push`/`pull`/`migrate`
was run.** Restart the API dev server after generate so the client reloads.

## Known gaps / TODO

- **Plantation Labour Act** has a UI form but **no persistence table / Prisma
  model** — no `db_insert` exists in `plantation_*_annual_return_form.inc` or
  the `.module`. The server whitelist skips it. Define a table + model to wire.
- **Draft load** — the form always starts blank; there is no
  `GET /form/:wizardId` to rehydrate a saved draft yet.
- Wide legacy tables (**Payment of Wages**, **MTW**, **Maternity Benefit**) are
  modelled/wired as a representative subset, not every column.
- Column **types** in the new Prisma models are `String?` placeholders; tighten
  them (Int/Float/Date) during manual DB reconciliation if desired.
- Several tables (**Payment of Wages**, **MTW**) have many more columns than the
  UI currently surfaces (adult/adolescent × threshold breakdowns). Forms cover
  the primary fields; expand to full column parity if an exhaustive return is
  required.
- Cascading address selects (country → state → district → subdivision → …) are
  plain text/simple selects here because they depend on the location APIs used
  elsewhere in the app. Swap to the shared cascading-select pattern when wiring.

---

## Legacy source references

| React file | Legacy include |
|---|---|
| `AnnualReturnLLWizard.tsx` | `wizard_form.inc` |
| `AnnualReturnLLCommonForm.tsx` | `common_app_annual_ret_form.inc` |
| `AnnualReturnLLList.tsx` | `annual_return_list.inc` |
| `InnerSubForms.tsx` | `unit_manager_form.inc`, `get_employer_wise_particular_list_form.inc`, `retrenchment_form.inc`, `unit_pf_esi_form.inc`, `trade_union_list_all_form.inc` |
| `ActForms.tsx` | `clra_annual_return_form.inc`, `clra_license_annual_return_form.inc`, `bocwa_annual_return_form.inc`, `ismw_annual_return_form.inc`, `mtw_annual_return_form.inc`, `minimum_wages_annual_return_form.inc`, `payment_of_bonus.inc`, `payment_of_wages.inc`, `payments_gratuity.inc`, `maternity_benefit.inc`, `plantation_*_annual_return_form.inc` |
