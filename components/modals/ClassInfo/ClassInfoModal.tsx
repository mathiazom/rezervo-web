import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction } from "react";

import { classRecurrentId } from "../../../lib/integration/common";
import { AllConfigsIndex, ClassPopularity, ClassPopularityIndex, RezervoClass } from "../../../types/rezervo";
import ClassInfo from "./ClassInfo";

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
