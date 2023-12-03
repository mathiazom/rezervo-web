import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import ClassInfo from "@/components/modals/ClassInfo/ClassInfo";
import { ChainIdentifier } from "@/lib/activeChains";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { RezervoClass } from "@/types/chain";
import { AllConfigsIndex } from "@/types/config";
import { ClassPopularity, ClassPopularityIndex } from "@/types/popularity";

const ClassInfoModal = ({
    chain,
    classInfoClass,
    setClassInfoClass,
    classPopularityIndex,
    allConfigsIndex,
}: {
    chain: ChainIdentifier;
    classInfoClass: RezervoClass | null;
    setClassInfoClass: Dispatch<SetStateAction<RezervoClass | null>>;
    classPopularityIndex: ClassPopularityIndex;
    allConfigsIndex: AllConfigsIndex | undefined;
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
                        configUsers={allConfigsIndex ? allConfigsIndex[classRecurrentId(classInfoClass)] ?? [] : []}
                    />
                )}
            </>
        </Modal>
    );
};

export default ClassInfoModal;
