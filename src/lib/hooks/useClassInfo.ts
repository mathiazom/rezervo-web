import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CLASS_ID_QUERY_PARAM } from "@/lib/consts";
import { RezervoClass } from "@/types/openapi";

const routeApi = getRouteApi("/$chain");

export function useClassInfo(classes: RezervoClass[]) {
    const { [CLASS_ID_QUERY_PARAM]: showClassId } = routeApi.useSearch();
    const navigate = routeApi.useNavigate();

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

    const setClassInfoClass = (_class: RezervoClass | null) => {
        void navigate({
            search: (prev) => {
                return _class
                    ? { ...prev, [CLASS_ID_QUERY_PARAM]: _class.id }
                    : { ...prev, [CLASS_ID_QUERY_PARAM]: undefined };
            },
            replace: true,
        });
        setClassInfoClassState(_class);
    };

    return { classInfoClass, setClassInfoClass };
}
