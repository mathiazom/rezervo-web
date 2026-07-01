import { getRouteApi } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { RezervoClass } from "@/types/chain";

const routeApi = getRouteApi("/$chain");

export function useClassInfo(classes: RezervoClass[]) {
    const { c: showClassId } = routeApi.useSearch();
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
                return _class ? { ...prev, c: _class.id } : { ...prev, c: undefined };
            },
            replace: true,
        });
        setClassInfoClassState(_class);
    };

    return { classInfoClass, setClassInfoClass };
}
