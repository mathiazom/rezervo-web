import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import Agenda from "@/components/modals/Agenda/Agenda";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/integrations/common";
import { IntegrationConfig, RezervoClass } from "@/types/rezervo";

const AgendaModal = ({
    open,
    setOpen,
    userConfig,
    classes,
    selectedClassIds,
    onInfo,
    onSelectedChanged,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    userConfig: IntegrationConfig | undefined;
    classes: RezervoClass[];
    selectedClassIds: string[] | null;
    onInfo: Dispatch<SetStateAction<RezervoClass | null>>;
    onSelectedChanged: (classId: string, selected: boolean) => void;
}) => {
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <>
                {userConfig?.classes && (
                    <Agenda
                        agendaClasses={userConfig.classes.map((c) => ({
                            config: c,
                            _class: classes.find((sc) => classRecurrentId(sc) === classConfigRecurrentId(c)),
                            markedForDeletion:
                                selectedClassIds != null && !selectedClassIds.includes(classConfigRecurrentId(c)),
                        }))}
                        onInfo={onInfo}
                        onSetToDelete={(c, toDelete) => onSelectedChanged(classConfigRecurrentId(c), !toDelete)}
                    />
                )}
            </>
        </Modal>
    );
};

export default AgendaModal;
