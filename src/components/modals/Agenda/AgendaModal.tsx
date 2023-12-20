import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import Agenda from "@/components/modals/Agenda/Agenda";
import { classConfigRecurrentId, classRecurrentId } from "@/lib/helpers/recurrentId";
import { ChainProfile, RezervoClass } from "@/types/chain";
import { ChainConfig } from "@/types/config";

const AgendaModal = ({
    open,
    setOpen,
    userConfig,
    classes,
    onInfo,
    onUpdateConfig,
    chainProfile,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    userConfig: ChainConfig | undefined;
    classes: RezervoClass[];
    onInfo: Dispatch<SetStateAction<RezervoClass | null>>;
    onUpdateConfig: (classId: string, selected: boolean) => void;
    chainProfile: ChainProfile;
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
                        onDelete={(c) => onUpdateConfig(classConfigRecurrentId(c), false)}
                        chainProfile={chainProfile}
                    />
                )}
            </>
        </Modal>
    );
};

export default AgendaModal;
