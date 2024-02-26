import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

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

    const classIdParam = searchParams?.get("classId");
    const weekOffsetParam = searchParams?.get("weekOffset");

    if (!checkedWeekOffset && classIdParam !== null && weekOffsetParam !== null) {
        setCheckedWeekOffset(true);
        setWeekOffset(Number(weekOffsetParam));
        router.replace(`${pathname}?classId=${classIdParam}`);
    }

    if (checkedWeekOffset && weekOffsetParam === null) {
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
