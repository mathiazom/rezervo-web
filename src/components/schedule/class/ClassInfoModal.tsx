import { Modal } from "@mui/material";

import ClassInfo from "@/components/schedule/class/ClassInfo";
import { RezervoClass } from "@/types/openapi";

const ClassInfoModal = ({
    classInfoClass,
    onUpdateConfig,
    onClose,
}: {
    classInfoClass: RezervoClass | null;
    onUpdateConfig: (classId: string, selected: boolean) => void;
    onClose: () => void;
}) => {
    return (
        <Modal open={classInfoClass != null} onClose={() => onClose()}>
            {classInfoClass ? <ClassInfo initialClassData={classInfoClass} onUpdateConfig={onUpdateConfig} /> : <></>}
        </Modal>
    );
};

export default ClassInfoModal;
