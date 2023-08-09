import { Modal } from "@mui/material";
import ClassInfo from "./ClassInfo";
import { sitClassRecurrentId } from "../../../lib/integration/sit";
import { AllConfigsIndex, ClassPopularity, ClassPopularityIndex } from "../../../types/rezervo";
import React, { Dispatch, SetStateAction } from "react";
import { SitClass } from "../../../types/integration/sit";

const ClassInfoModal = ({
    classInfoClass,
    setClassInfoClass,
    classPopularityIndex,
    allConfigsIndex,
}: {
    classInfoClass: SitClass | null;
    setClassInfoClass: Dispatch<SetStateAction<SitClass | null>>;
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
                            classPopularityIndex[sitClassRecurrentId(classInfoClass)] ?? ClassPopularity.Unknown
                        }
                        configUsers={allConfigsIndex ? allConfigsIndex[sitClassRecurrentId(classInfoClass)] ?? [] : []}
                    />
                )}
            </>
        </Modal>
    );
};

export default ClassInfoModal;
