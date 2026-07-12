import { Modal } from "@mui/material";
import { useState } from "react";
import Dropzone from "react-dropzone";

import Profile from "@/components/user/profile/Profile";

const ProfileModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const [isDraggingOverBackdrop, setIsDraggingOverBackdrop] = useState(false);
    const [backdropDraggingPosition, setBackdropDraggingPosition] = useState<{ x: number; y: number } | null>(null);

    return (
        <Dropzone
            noClick={true}
            onDragEnter={() => setIsDraggingOverBackdrop(true)}
            onDragLeave={() => setIsDraggingOverBackdrop(false)}
            onDrop={() => setIsDraggingOverBackdrop(false)}
            onDragOver={(e) => setBackdropDraggingPosition({ x: e.clientX, y: e.clientY })}
        >
            {({ getRootProps }) => (
                <Modal
                    open={open}
                    onClose={onClose}
                    sx={[
                        {
                            transition: "background-color 225ms cubic-bezier(0.4, 0, 0.2, 1)",
                        },
                        isDraggingOverBackdrop
                            ? {
                                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                              }
                            : {},
                    ]}
                    {...getRootProps({ className: "modal-backdrop-dropzone" })}
                >
                    <Profile
                        isDraggingOverOutside={isDraggingOverBackdrop}
                        dragOverOutsidePosition={backdropDraggingPosition}
                    />
                </Modal>
            )}
        </Dropzone>
    );
};

export default ProfileModal;
