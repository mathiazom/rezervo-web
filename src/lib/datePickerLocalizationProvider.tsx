"use client";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { ReactNode } from "react";

export default function DatePickerLocalizationProvider({ children }: { children: ReactNode }) {
    return (
        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="nb-NO">
            {children}
        </LocalizationProvider>
    );
}
