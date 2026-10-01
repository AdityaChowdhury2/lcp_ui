// src/types.ts
export interface DetailData {
    // fields used in the modal (and demo table)
    registrationNumber: string;
    registrationDate: string; // e.g. "03/02/2015" or ISO - choose consistent format
    establishmentName: string;
    establishmentAddress: string;
    principalEmployerName: string;
    principalEmployerAddress: string;
    maxContractLabours: number;
    fees: number;
    status: "valid" | "invalid";
}
