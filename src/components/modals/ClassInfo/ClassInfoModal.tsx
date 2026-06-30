import { Modal } from "@mui/material";

import ClassInfo from "@/components/modals/ClassInfo/ClassInfo";
import { ChainIdentifier, RezervoClass } from "@/types/chain";

const ClassInfoModal = ({
    chain,
    classInfoClass,
    onUpdateConfig,
    onClose,
}: {
    chain: ChainIdentifier;
    classInfoClass: RezervoClass | null;
    onUpdateConfig: (classId: string, selected: boolean) => void;
    onClose: () => void;
}) => {
    return (
        <Modal open={classInfoClass != null} onClose={() => onClose()}>
            {classInfoClass ? (
                <ClassInfo chain={chain} initialClassData={classInfoClass} onUpdateConfig={onUpdateConfig} />
            ) : (
                <></>
            )}
        </Modal>
    );
};

export default ClassInfoModal;
