import { DateTime } from "luxon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

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

    const classIdParam = searchParams?.get("classId") ?? null;
    const startTimeParam = searchParams?.get("startTime") ?? null;

    if (!checkedWeekOffset && classIdParam !== null && startTimeParam !== null) {
        setCheckedWeekOffset(true);
        const startTimeDate = DateTime.fromISO(startTimeParam);
        setWeekOffset(weekOffsetBetweenDates(startTimeDate, LocalizedDateTime.now()));
        router.replace(`${pathname}?classId=${classIdParam}`);
    }

    if (checkedWeekOffset && startTimeParam === null) {
        setCheckedWeekOffset(false);
        const linkedClass = classes.find((_class) => _class.id === classIdParam);
        if (linkedClass) {
            setClassInfoClass(linkedClass);
        }
        router.replace(`${pathname}`);
    }

    return <></>;
}
export default ClassLinkingProvider;
