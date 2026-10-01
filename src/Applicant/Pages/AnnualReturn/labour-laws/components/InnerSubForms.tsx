import React, { useEffect, useState } from "react";
import {
  ArSection,
  SubHeading,
  TextField,
  TextAreaField,
  YesNoField,
  arBtn,
} from "./arFormPrimitives";
import { ArItemsTable } from "./ArItemsTable";
import { AddressCascade, AddressFieldNames } from "./AddressCascade";

/**
 * The repeatable "inside" forms of the common annual return. In the legacy
 * app each opened in a new tab ("Click Here"); here they are inline accordion
 * sections where the applicant adds rows into a reusable table.
 *
 * Field `name`s match the DB columns so the submit payload is a pass-through.
 * Each form syncs its state up to the parent via `onChange`.
 */

/** Cascading-address field maps aligned to the backend column whitelists. */
const MANAGER_ADDRESS_NAMES: AddressFieldNames = {
  district: "unit_manager_dist",
  subdivision: "loc_unit_manager_subdv",
  policeStation: "loc_unit_manager_ps",
  addressLine: "address_principal_unit_manager",
  pin: "loc_unit_manager_pin_number",
};

const EMPLOYER_ADDRESS_NAMES: AddressFieldNames = {
  district: "emp_dist",
  subdivision: "loc_emp_subdv",
  policeStation: "loc_emp_ps",
  addressLine: "address_principal_emp",
  pin: "loc_emp_pin_number",
};

function useRowState<T extends Record<string, string>>(
  blank: T,
  onChange?: (rows: T[]) => void,
) {
  const [rows, setRows] = useState<T[]>([]);
  const [draft, setDraft] = useState<T>(blank);

  useEffect(() => {
    onChange?.(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const set = (name: string, value: string) =>
    setDraft((d) => ({ ...d, [name]: value }));
  const add = () => {
    setRows((r) => [...r, draft]);
    setDraft(blank);
  };
  const remove = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  return { rows, draft, set, add, remove };
}

/* ---------------- 12. Unit Manager ---------------- */
type ManagerRow = Record<string, string>;
export function ManagerSubForm({
  value,
  index,
  onChange,
}: {
  value: string;
  index: number;
  onChange?: (rows: ManagerRow[]) => void;
}) {
  const { rows, draft, set, add, remove } = useRowState<ManagerRow>(
    {
      full_name_unit_manager: "",
      address_principal_unit_manager: "",
      unit_manager_dist: "",
      loc_unit_manager_subdv: "",
      loc_unit_manager_ps: "",
      loc_unit_manager_pin_number: "",
    },
    onChange,
  );
  return (
    <ArSection
      value={value}
      index={index}
      title="Name and Address of the Manager / In charge of the unit"
      required
      helpItems={["Add at least one Unit Manager.", "All fields are mandatory."]}
    >
      <SubHeading>Add Unit Manager</SubHeading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TextField label="Name of the Unit Manager" name="full_name_unit_manager" value={draft.full_name_unit_manager} onChange={set} required className="md:col-span-3" />
        <AddressCascade names={MANAGER_ADDRESS_NAMES} values={draft} onChange={set} required />
      </div>
      <div className="mt-3">
        <button type="button" className={arBtn} onClick={add}>+ Add Manager</button>
      </div>
      <div className="mt-4">
        <ArItemsTable<ManagerRow>
          rows={rows}
          onRemove={remove}
          columns={[
            { header: "Name", cell: (r) => r.full_name_unit_manager },
            { header: "Address", cell: (r) => r.address_principal_unit_manager },
            { header: "District", cell: (r) => r.unit_manager_dist_label || r.unit_manager_dist },
            { header: "Police Station", cell: (r) => r.loc_unit_manager_ps_label || r.loc_unit_manager_ps },
            { header: "Pin", cell: (r) => r.loc_unit_manager_pin_number },
          ]}
        />
      </div>
    </ArSection>
  );
}

/* ---------------- 13. Employer / Contractor / PE particulars ---------------- */
type EmployerRow = Record<string, string>;
export function EmployerParticularsSubForm({
  value,
  index,
  onChange,
}: {
  value: string;
  index: number;
  onChange?: (rows: EmployerRow[]) => void;
}) {
  const { rows, draft, set, add, remove } = useRowState<EmployerRow>(
    {
      full_name_principal_emp: "",
      address_principal_emp: "",
      emp_dist: "",
      loc_emp_subdv: "",
      loc_emp_ps: "",
      loc_emp_pin_number: "",
      emp_pan: "",
      emp_tan: "",
      emp_lin: "",
      emp_email: "",
      emp_mobile_no: "",
    },
    onChange,
  );
  return (
    <ArSection
      value={value}
      index={index}
      title="Name, Address and Particulars of the employer / contractor / Principal Employer"
      required
      helpItems={["Add at least one employer / contractor / principal employer."]}
    >
      <SubHeading>Add Employer / Contractor / Principal Employer</SubHeading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TextField label="Name of the employer / contractor / PE" name="full_name_principal_emp" value={draft.full_name_principal_emp} onChange={set} required className="md:col-span-3" />
        <AddressCascade names={EMPLOYER_ADDRESS_NAMES} values={draft} onChange={set} required />
        <TextField label="PAN" name="emp_pan" value={draft.emp_pan} onChange={set} />
        <TextField label="TAN" name="emp_tan" value={draft.emp_tan} onChange={set} />
        <TextField label="LIN" name="emp_lin" value={draft.emp_lin} onChange={set} />
        <TextField label="Email Id" name="emp_email" value={draft.emp_email} onChange={set} type="email" />
        <TextField label="Mobile no." name="emp_mobile_no" value={draft.emp_mobile_no} onChange={set} type="tel" />
      </div>
      <div className="mt-3">
        <button type="button" className={arBtn} onClick={add}>+ Add Particular</button>
      </div>
      <div className="mt-4">
        <ArItemsTable<EmployerRow>
          rows={rows}
          onRemove={remove}
          columns={[
            { header: "Name", cell: (r) => r.full_name_principal_emp },
            { header: "Address", cell: (r) => r.address_principal_emp },
            { header: "PAN", cell: (r) => r.emp_pan },
            { header: "Email", cell: (r) => r.emp_email },
            { header: "Mobile", cell: (r) => r.emp_mobile_no },
          ]}
        />
      </div>
    </ArSection>
  );
}

/* ---------------- 14. Retrenchment compensation ---------------- */
type RetrenchRow = Record<string, string>;
export function RetrenchmentSubForm({
  value,
  index,
  onChange,
}: {
  value: string;
  index: number;
  onChange?: (rows: RetrenchRow[]) => void;
}) {
  const { rows, draft, set, add, remove } = useRowState<RetrenchRow>(
    { worker_name: "", retrenchment_details: "" },
    onChange,
  );
  return (
    <ArSection
      value={value}
      index={index}
      title="Retrenchment compensation and terminal benefits paid"
      required
      helpItems={["Add at least one retrenchment / terminal benefit record."]}
    >
      <SubHeading>Add Retrenchment / Terminal Benefit</SubHeading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField label="Name of the Worker" name="worker_name" value={draft.worker_name} onChange={set} required />
        <TextAreaField label="Details of Terminal Benefits" name="retrenchment_details" value={draft.retrenchment_details} onChange={set} required />
      </div>
      <div className="mt-3">
        <button type="button" className={arBtn} onClick={add}>+ Add Record</button>
      </div>
      <div className="mt-4">
        <ArItemsTable<RetrenchRow>
          rows={rows}
          onRemove={remove}
          columns={[
            { header: "Name of the Worker", cell: (r) => r.worker_name },
            { header: "Details of Terminal Benefits", cell: (r) => r.retrenchment_details },
          ]}
        />
      </div>
    </ArSection>
  );
}

/* ---------------- 15. Whether the Unit covered under (PF / ESI) ---------------- */
export function PfEsiSubForm({
  value,
  index,
  onChange,
}: {
  value: string;
  index: number;
  onChange?: (data: Record<string, string>) => void;
}) {
  const [data, setData] = useState<Record<string, string>>({
    esi: "",
    esic_reg_no: "",
    esic_reg_date: "",
    epf: "",
    epf_details: "",
  });
  useEffect(() => {
    onChange?.(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const set = (name: string, v: string) => setData((d) => ({ ...d, [name]: v }));
  return (
    <ArSection
      value={value}
      index={index}
      title="Whether the Unit covered under ESI / EPF"
      required
      helpItems={["Answer for both ESIC and EPF coverage."]}
    >
      <SubHeading>A. ESI</SubHeading>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <YesNoField label="Is the unit covered under ESIC?" name="esi" value={data.esi} onChange={set} />
        {data.esi === "1" && (
          <>
            <TextField label="ESIC Registration No." name="esic_reg_no" value={data.esic_reg_no} onChange={set} />
            <TextField label="ESIC Registration Date" name="esic_reg_date" value={data.esic_reg_date} onChange={set} type="date" />
          </>
        )}
      </div>
      <div className="mt-4">
        <SubHeading>B. P/F</SubHeading>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <YesNoField label="Is the unit covered under EPF?" name="epf" value={data.epf} onChange={set} />
          {data.epf === "1" && (
            <TextField label="EPF details / Registration No." name="epf_details" value={data.epf_details} onChange={set} className="md:col-span-2" />
          )}
        </div>
      </div>
    </ArSection>
  );
}

/* ---------------- 16. Operating Trade Unions (read-only, auto-fetched) ---------------- */
export function TradeUnionSubForm({
  value,
  index,
  tradeUnions,
}: {
  value: string;
  index: number;
  tradeUnions: { regNo: string; name: string; address: string }[];
}) {
  return (
    <></>
    // <ArSection
    //   value={value}
    //   index={index}
    //   title="Name and Registration No of the operating Trade Union"
    //   helpItems={["Auto-fetched from your registered trade unions."]}
    // >
    //   <ArItemsTable
    //     rows={tradeUnions}
    //     empty="No operating trade unions found for your establishment."
    //     columns={[
    //       { header: "Registration Number", cell: (r) => r.regNo },
    //       { header: "Name", cell: (r) => r.name },
    //       { header: "Address", cell: (r) => r.address },
    //     ]}
    //   />
    // </ArSection>
  );
}
