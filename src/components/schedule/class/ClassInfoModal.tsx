import { Modal } from "@mui/material";

import ClassInfo from "@/components/schedule/class/ClassInfo";
import BookingPopupModal from "@/components/schedule/BookingPopupModal";
import { useClassInfo } from "@/lib/hooks/useClassInfo";
import { useClassInfoConfig } from "@/lib/hooks/useClassInfoConfig";

const ClassInfoModal = () => {
    const { classInfoClass, classInfoChainIdentifier, classInfoLoading, closeClassInfo } = useClassInfo();
    const { onUpdateConfig, bookingPopupState, setBookingPopupState } = useClassInfoConfig(
        classInfoChainIdentifier ?? "",
    );

    return (
        <>
            <Modal open={classInfoClass != null || classInfoLoading} onClose={closeClassInfo}>
                {classInfoClass && classInfoChainIdentifier ? (
                    <ClassInfo
                        chainIdentifier={classInfoChainIdentifier}
                        initialClassData={classInfoClass}
                        onUpdateConfig={onUpdateConfig}
                    />
                ) : (
                    <></>
                )}
            </Modal>
            {bookingPopupState && (
                <BookingPopupModal
                    chainIdentifier={bookingPopupState.chain}
                    onClose={() => setBookingPopupState(null)}
                    _class={bookingPopupState._class}
                    action={bookingPopupState.action}
                />
            )}
        </>
    );
};

export default ClassInfoModal;
