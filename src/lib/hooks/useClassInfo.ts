import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CLASS_ID_QUERY_PARAM } from "@/lib/consts";
import { RezervoClass } from "@/types/chain";

export function useClassInfo(showClassId: string | undefined, classes: RezervoClass[]) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [classInfoClass, setClassInfoClassState] = useState<RezervoClass | null>(null);

    useEffect(() => {
        if (!showClassId) {
            setClassInfoClassState(null);
            return;
        }
        const linkedClass = classes.find((_class) => _class.id === showClassId);
        if (linkedClass !== undefined) {
            setClassInfoClassState(linkedClass);
        }
    }, [showClassId, classes]);

    const setClassInfoClass = (c: RezervoClass | null) => {
        const newSearchParams = new URLSearchParams(searchParams);
        if (c !== null) newSearchParams.set(CLASS_ID_QUERY_PARAM, c.id);
        else newSearchParams.delete(CLASS_ID_QUERY_PARAM);
        router.replace((pathname + "?" + newSearchParams.toString()) as Route);
        setClassInfoClassState(c);
    };

    return { classInfoClass, setClassInfoClass };
}
