import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import Agenda from "@/components/modals/Agenda/Agenda";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { RezervoClass } from "@/types/chain";
import { ChainConfig } from "@/types/config";

const AgendaModal = ({
    open,
    setOpen,
    userConfig,
    classes,
    onInfo,
    updateConfigClass,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    userConfig: ChainConfig | undefined;
    classes: RezervoClass[];
    onInfo: Dispatch<SetStateAction<RezervoClass | null>>;
    updateConfigClass: (classId: string, selected: boolean) => void;
}) => {
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <>
                {userConfig?.classes && (
                    <Agenda
                        agendaClasses={userConfig.classes.map((c) => ({
                            config: c,
                            _class: classes.find((sc) => classRecurrentId(sc) === classConfigRecurrentId(c)),
                        }))}
                        onInfo={onInfo}
                        onDelete={(c) => updateConfigClass(classConfigRecurrentId(c), false)}
                    />
                )}
            </>
        </Modal>
    );
};

export default AgendaModal;
