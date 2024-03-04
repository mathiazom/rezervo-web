import { Modal } from "@mui/material";
import React, { Dispatch, SetStateAction, useState } from "react";
import Dropzone from "react-dropzone";

import Profile from "@/components/modals/Profile/Profile";

const ProfileModal = ({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) => {
    const [isDraggingOverBackdrop, setIsDraggingOverBackdrop] = useState(false);
    const [backdropDraggingPosition, setBackdropDraggingPosition] = useState<{ x: number; y: number } | null>(null);

    return (
        <Dropzone
            onDragEnter={() => setIsDraggingOverBackdrop(true)}
            onDragLeave={() => setIsDraggingOverBackdrop(false)}
            onDrop={() => setIsDraggingOverBackdrop(false)}
            onDragOver={(e) => setBackdropDraggingPosition({ x: e.clientX, y: e.clientY })}
        >
            {({ getRootProps }) => (
                <Modal
                    open={open}
                    onClose={() => setOpen(false)}
                    sx={{
                        transition: "background-color 225ms cubic-bezier(0.4, 0, 0.2, 1)",
                        ...(isDraggingOverBackdrop
                            ? {
                                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                              }
                            : {}),
                    }}
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
