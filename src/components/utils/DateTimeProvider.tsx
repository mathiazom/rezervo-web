import { Settings } from "luxon";
import { ReactNode } from "react";

function DateTimeProvider({ children }: { children: ReactNode }): ReactNode {
    Settings.defaultLocale = "no";
    Settings.defaultZone = "Europe/Oslo";
    return <>{children}</>;
}

export default DateTimeProvider;
