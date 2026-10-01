import React, { useEffect, useState } from "react";
import { API_BASE } from "@/constants/constants";
import { getAuthToken } from "@/utils/auth";
import { fieldLabel, fieldInput, Req } from "./arFormPrimitives";

/**
 * Reusable cascading address block for the labour-law annual returns.
 * The applicant picks District → Sub-division → Police Station and then keys in
 * the street address + PIN. Region lists come from the shared masters APIs
 * (`district`, `subdivision/:d`, `policestation/:d`) already used across the app.
 *
 * The block is field-name driven so the same widget maps onto each backend
 * schema (establishment, unit manager, employer particulars). It renders a set
 * of grid cells (no wrapper) so the parent grid controls the columns; the
 * street address spans the full row. Alongside each selected code it also emits
 * a `<name>_label` field so summary tables can show readable names — those extra
 * keys are ignored by the server column whitelist.
 */

type Option = { value: string; label: string };

const normalizeList = (res: any): any[] => (Array.isArray(res) ? res : res?.data ?? []);
const authHeaders = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export interface AddressFieldNames {
  district: string;
  subdivision: string;
  policeStation: string;
  addressLine: string;
  pin: string;
}

interface AddressCascadeProps {
  names: AddressFieldNames;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  required?: boolean;
}

export function AddressCascade({ names, values, onChange, required }: AddressCascadeProps) {
  const [districts, setDistricts] = useState<Option[]>([]);
  const [subdivisions, setSubdivisions] = useState<Option[]>([]);
  const [policeStations, setPoliceStations] = useState<Option[]>([]);

  const district = values[names.district] ?? "";
  const subdivision = values[names.subdivision] ?? "";
  const policeStation = values[names.policeStation] ?? "";

  // Load districts once.
  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}district`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((res) => {
        if (!active) return;
        setDistricts(
          normalizeList(res).map((x: any) => ({
            value: String(x.district_code),
            label: x.district_name,
          }))
        );
      })
      .catch(() => active && setDistricts([]));
    return () => {
      active = false;
    };
  }, []);

  // Load sub-divisions + police stations whenever the district changes.
  useEffect(() => {
    if (!district) {
      setSubdivisions([]);
      setPoliceStations([]);
      return;
    }
    let active = true;
    Promise.all([
      fetch(`${API_BASE}subdivision/${district}`, { headers: authHeaders() }).then((r) => r.json()),
      fetch(`${API_BASE}policestation/${district}`, { headers: authHeaders() }).then((r) => r.json()),
    ])
      .then(([subRes, psRes]) => {
        if (!active) return;
        setSubdivisions(
          normalizeList(subRes).map((x: any) => ({
            value: String(x.sub_div_code),
            label: x.sub_div_name,
          }))
        );
        setPoliceStations(
          normalizeList(psRes).map((x: any) => ({
            value: String(x.police_station_code),
            label: x.name_of_police_station,
          }))
        );
      })
      .catch(() => {
        if (!active) return;
        setSubdivisions([]);
        setPoliceStations([]);
      });
    return () => {
      active = false;
    };
  }, [district]);

  const labelOf = (opts: Option[], v: string) => opts.find((o) => o.value === v)?.label ?? "";

  /** Write both the code and its readable label. */
  const setField = (name: string, value: string, label: string) => {
    onChange(name, value);
    onChange(`${name}_label`, label);
  };

  return (
    <>
      <div>
        <label className={fieldLabel}>
          District{required && <Req />}
        </label>
        <select
          className={fieldInput}
          value={district}
          onChange={(e) => {
            const v = e.target.value;
            setField(names.district, v, labelOf(districts, v));
            // District changed → dependent selections are no longer valid.
            setField(names.subdivision, "", "");
            setField(names.policeStation, "", "");
          }}
        >
          <option value="">- Select District -</option>
          {districts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={fieldLabel}>
          Sub-division{required && <Req />}
        </label>
        <select
          className={fieldInput}
          value={subdivision}
          disabled={!district}
          onChange={(e) => {
            const v = e.target.value;
            setField(names.subdivision, v, labelOf(subdivisions, v));
          }}
        >
          <option value="">- Select Sub-division -</option>
          {subdivisions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={fieldLabel}>
          Police Station{required && <Req />}
        </label>
        <select
          className={fieldInput}
          value={policeStation}
          disabled={!subdivision}
          onChange={(e) => {
            const v = e.target.value;
            setField(names.policeStation, v, labelOf(policeStations, v));
          }}
        >
          <option value="">- Select Police Station -</option>
          {policeStations.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={fieldLabel}>
          PIN Code{required && <Req />}
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={values[names.pin] ?? ""}
          disabled={!policeStation}
          placeholder="6-digit PIN"
          onChange={(e) => onChange(names.pin, e.target.value.replace(/\D/g, "").slice(0, 6))}
          className={fieldInput}
        />
      </div>

      <div className="md:col-span-full">
        <label className={fieldLabel}>
          Address (House / Street / Locality){required && <Req />}
        </label>
        <textarea
          rows={2}
          value={values[names.addressLine] ?? ""}
          disabled={!policeStation}
          placeholder="Enter the street address"
          onChange={(e) => onChange(names.addressLine, e.target.value)}
          className={fieldInput}
        />
      </div>
    </>
  );
}
