import type { components } from "@/types/api";

export type Schemas = components["schemas"];

export type WithLuxonTimes<T extends { startTime: string; endTime: string }> = Omit<T, "startTime" | "endTime"> & {
    startTime: import("luxon").DateTime;
    endTime: import("luxon").DateTime;
};
