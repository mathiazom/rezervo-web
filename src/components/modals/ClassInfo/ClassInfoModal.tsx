import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import ClassInfo from "@/components/modals/ClassInfo/ClassInfo";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { AllConfigsIndex } from "@/types/config";
import { RezervoClass } from "@/types/integration";
import { ClassPopularity, ClassPopularityIndex } from "@/types/popularity";

const ClassInfoModal = ({
    classInfoClass,
    setClassInfoClass,
    classPopularityIndex,
    allConfigsIndex,
}: {
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
