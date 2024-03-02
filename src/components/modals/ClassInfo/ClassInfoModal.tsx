import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import ClassInfo from "@/components/modals/ClassInfo/ClassInfo";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { ChainIdentifier, RezervoClass } from "@/types/chain";
import { ClassPopularity, ClassPopularityIndex } from "@/types/popularity";

const ClassInfoModal = ({
    chain,
    classInfoClass,
    setClassInfoClass,
    classPopularityIndex,
    onUpdateConfig,
}: {
    chain: ChainIdentifier;
    classInfoClass: RezervoClass | null;
    setClassInfoClass: Dispatch<SetStateAction<RezervoClass | null>>;
    classPopularityIndex: ClassPopularityIndex;
    onUpdateConfig: (classId: string, selected: boolean) => void;
}) => {
    return (
        <Modal open={classInfoClass != null} onClose={() => setClassInfoClass(null)}>
            <>
                {classInfoClass && (
                    <ClassInfo
                        chain={chain}
                        _class={classInfoClass}
                        classPopularity={
                            classPopularityIndex[classRecurrentId(classInfoClass)] ?? ClassPopularity.Unknown
                        }
                        onUpdateConfig={onUpdateConfig}
                    />
                )}
            </>
        </Modal>
    );
};

export default ClassInfoModal;
