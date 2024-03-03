import { DateTime } from "luxon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { LocalizedDateTime, weekOffsetBetweenDates } from "@/lib/helpers/date";
import { RezervoClass } from "@/types/chain";

function ClassLinkingProvider({
    classes,
    setWeekOffset,
    setClassInfoClass,
}: {
    classes: RezervoClass[];
    setWeekOffset: Dispatch<SetStateAction<number>>;
    setClassInfoClass: Dispatch<SetStateAction<RezervoClass | null>>;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [checkedWeekOffset, setCheckedWeekOffset] = useState(false);

    useEffect(() => {
        const classIdParam = searchParams?.get("classId") ?? null;
        const startTimeParam = searchParams?.get("startTime") ?? null;
        if (pathname == null || classIdParam === null) {
            return;
        }
        if (!checkedWeekOffset) {
            if (startTimeParam !== null) {
                setCheckedWeekOffset(true);
                const startTimeDate = DateTime.fromISO(startTimeParam);
                setWeekOffset(weekOffsetBetweenDates(startTimeDate, LocalizedDateTime.now()));
                router.replace(`${pathname}?classId=${classIdParam}`);
                return;
            }
        } else if (startTimeParam === null) {
            const linkedClass = classes.find((_class) => _class.id === classIdParam);
            if (linkedClass) {
                setClassInfoClass(linkedClass);
                setCheckedWeekOffset(false);
                router.replace(pathname);
            }
        }
    }, [searchParams, checkedWeekOffset, classes, pathname, router, setWeekOffset, setClassInfoClass]);

    return <></>;
}
export default ClassLinkingProvider;
