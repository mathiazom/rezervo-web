import { Modal } from "@mui/material";

import ClassInfo from "@/components/modals/ClassInfo/ClassInfo";
import { classRecurrentId } from "@/lib/helpers/recurrentId";
import { ChainIdentifier, RezervoClass } from "@/types/chain";
import { ClassPopularity, ClassPopularityIndex } from "@/types/popularity";

const ClassInfoModal = ({
    chain,
    classInfoClass,
    classPopularityIndex,
    onUpdateConfig,
    onClose,
}: {
    chain: ChainIdentifier;
    classInfoClass: RezervoClass | null;
    classPopularityIndex: ClassPopularityIndex;
    onUpdateConfig: (classId: string, selected: boolean) => void;
    onClose: () => void;
}) => {
    return (
        <Modal open={classInfoClass != null} onClose={() => onClose()}>
            <>
                {classInfoClass && (
                    <ClassInfo
                        chain={chain}
                        initialClassData={classInfoClass}
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
