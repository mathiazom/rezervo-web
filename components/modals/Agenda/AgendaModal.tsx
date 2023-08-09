import { Modal } from "@mui/material";
import { classConfigRecurrentId, sitClassRecurrentId } from "../../../lib/iBooking";
import React, { Dispatch, SetStateAction } from "react";
import Agenda from "./Agenda";
import { UserConfig } from "../../../types/rezervoTypes";
import { SitClass } from "../../../types/integration/sit";

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
    userConfig: UserConfig | undefined;
    classes: SitClass[];
    selectedClassIds: string[] | null;
    onInfo: Dispatch<SetStateAction<SitClass | null>>;
    // eslint-disable-next-line no-unused-vars
    onSelectedChanged: (classId: string, selected: boolean) => void;
}) => {
    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <>
                {userConfig?.classes && (
                    <Agenda
                        agendaClasses={userConfig.classes.map((c) => ({
                            config: c,
                            sitClass: classes.find((sc) => sitClassRecurrentId(sc) === classConfigRecurrentId(c)),
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
