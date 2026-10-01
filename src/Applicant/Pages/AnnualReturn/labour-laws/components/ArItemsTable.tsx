import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";

export interface ArColumn<T> {
  header: string;
  /** Cell renderer. */
  cell: (row: T, index: number) => React.ReactNode;
  className?: string;
}

/**
 * Reusable listing table for the repeatable "inside" forms (managers,
 * employer particulars, retrenchment, trade unions …). Built on the app's
 * shared `ui/table` primitive so it matches the rest of the portal.
 */
export function ArItemsTable<T>({
  columns,
  rows,
  onRemove,
  empty = "No records added yet.",
}: {
  columns: ArColumn<T>[];
  rows: T[];
  onRemove?: (index: number) => void;
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <Table className="text-[13px]">
        <TableHeader>
          <TableRow className="bg-slate-100">
            <TableHead className="w-12 text-center font-semibold">Sl.</TableHead>
            {columns.map((c, i) => (
              <TableHead key={i} className={`font-semibold ${c.className ?? ""}`}>
                {c.header}
              </TableHead>
            ))}
            {onRemove && (
              <TableHead className="w-24 text-center font-semibold">
                Action
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (onRemove ? 2 : 1)}
                className="py-4 text-center text-gray-500"
              >
                {empty}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, ri) => (
              <TableRow key={ri} className="align-top">
                <TableCell className="text-center">{ri + 1}</TableCell>
                {columns.map((c, ci) => (
                  <TableCell
                    key={ci}
                    className={`whitespace-normal ${c.className ?? ""}`}
                  >
                    {c.cell(row, ri)}
                  </TableCell>
                ))}
                {onRemove && (
                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() => onRemove(ri)}
                      className="rounded bg-red-500 px-3 py-1 text-[12px] font-semibold text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
