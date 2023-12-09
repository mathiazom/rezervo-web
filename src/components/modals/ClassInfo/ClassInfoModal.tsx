import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import ClassInfo from "@/components/modals/ClassInfo/ClassInfo";
import { ChainIdentifier } from "@/lib/activeChains";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { RezervoClass } from "@/types/chain";
import { ClassPopularity, ClassPopularityIndex } from "@/types/popularity";

const ClassInfoModal = ({
    chain,
    classInfoClass,
    setClassInfoClass,
    classPopularityIndex,
    updateConfigClass,
}: {
    chain: ChainIdentifier;
    classInfoClass: RezervoClass | null;
    setClassInfoClass: Dispatch<SetStateAction<RezervoClass | null>>;
    classPopularityIndex: ClassPopularityIndex;
    updateConfigClass: (classId: string, selected: boolean) => void;
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
                        updateConfigClass={updateConfigClass}
                    />
                )}
            </>
        </Modal>
    );
};

export default ClassInfoModal;
