import { PersonRounded } from "@mui/icons-material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import Button from "@mui/material/Button";
import React, { useState } from "react";
import Dropzone from "react-dropzone";

import AvatarMutateAlert from "@/components/modals/Profile/AvatarMutateAlert";
import EditAvatarDialog from "@/components/modals/Profile/EditAvatarDialog";
import ProfileAvatar from "@/components/modals/Profile/ProfileAvatar";
import ConfirmationDialog from "@/components/utils/ConfirmationDialog";
import { ALLOWED_AVATAR_FILE_TYPES } from "@/lib/consts";
import { destroy, put } from "@/lib/helpers/requests";
import { usePositionFromBounds } from "@/lib/hooks/usePositionFromBounds";
import { useUser } from "@/lib/hooks/useUser";
import { useMyAvatar } from "@/stores/userStore";
import { Position } from "@/types/math";

export enum AvatarMutateError {
    INVALID_IMAGE = "invalid_image",
    TOO_LARGE = "too_large",
    UNKNOWN = "unknown",
}

function Profile({
    isDraggingOverOutside,
    dragOverOutsidePosition,
}: {
    isDraggingOverOutside: boolean;
    dragOverOutsidePosition: Position | null;
}) {
    const theme = useTheme();

    const { token, user, logOut } = useUser();

    const updateMyAvatarLastModified = useMyAvatar((state) => state.updateLastModifiedTimestamp);

    const [editAvatarDialogOpen, setEditAvatarDialogOpen] = useState(false);
    const [confirmDeleteAvatarDialogOpen, setConfirmDeleteAvatarDialogOpen] = useState(false);

    const [isAvatarAvailable, setIsAvatarAvailable] = useState<boolean | null>(null);
    const [isAvatarUpdating, setIsAvatarUpdating] = useState(false);
    const [avatarPreviewDataURL, setAvatarPreviewDataURL] = useState<string | undefined>();
    const [avatarMutateError, setAvatarMutateError] = useState<AvatarMutateError | null>(null);
    const [showAvatarMutateError, setShowAvatarMutateError] = useState(false);

    const [isDraggingOverAvatarDropzone, setIsDraggingOverAvatarDropzone] = useState(false);
    const [isDraggingOverDialog, setIsDraggingOverDialog] = useState(false);
    const [dragOverDialogPosition, setDragOverDialogPosition] = useState<Position | null>(null);
    const isDraggingOver = isDraggingOverOutside || isDraggingOverDialog || isDraggingOverAvatarDropzone;

    function onAvatarMutateError(error: AvatarMutateError) {
        setAvatarMutateError(error);
        setShowAvatarMutateError(true);
    }

    async function onAvatarUploadFromInput(event: React.ChangeEvent<HTMLInputElement>) {
        await onAvatarUpload(event.target.files);
        // reset to allow subsequent file uploads
        event.target.value = "";
    }

    function onAvatarUpload(files: FileList | File[] | null) {
        if (files == null || files.length === 0) {
            onAvatarMutateError(AvatarMutateError.INVALID_IMAGE);
            return;
        }
        const file = files[0];
        if (file == undefined) {
            onAvatarMutateError(AvatarMutateError.INVALID_IMAGE);
            return;
        }
        return uploadAvatarFile(file);
    }

    async function uploadAvatarFile(file: File) {
        if (token == null) return; // TODO: error handling
        setShowAvatarMutateError(false);
        setIsAvatarUpdating(true);
        setEditAvatarDialogOpen(false);
        setAvatarPreviewDataURL(URL.createObjectURL(file));
        const formData = new FormData();
        formData.append("file", file);
        const res = await put("user/me/avatar", {
            body: formData,
            withContentType: "NO_CONTENT_TYPE",
            mode: "client",
            accessToken: token,
        });
        if (res.ok) {
            updateMyAvatarLastModified();
        } else if (res.status === 413) {
            onAvatarMutateError(AvatarMutateError.TOO_LARGE);
        } else if (res.status === 415) {
            onAvatarMutateError(AvatarMutateError.INVALID_IMAGE);
        } else {
            onAvatarMutateError(AvatarMutateError.UNKNOWN);
        }
        setIsAvatarUpdating(false);
    }

    function deleteAvatar() {
        if (token == null) return; // TODO: error handling
        destroy("user/me/avatar", { mode: "client", accessToken: token })
            .then((res) => {
                if (!res.ok) {
                    onAvatarMutateError(AvatarMutateError.UNKNOWN);
                    return;
                }
                setShowAvatarMutateError(false);
                setAvatarPreviewDataURL(undefined);
                setIsAvatarAvailable(false);
                updateMyAvatarLastModified();
            })
            .finally(() => {
                setEditAvatarDialogOpen(false);
            });
    }

    const {
        boundsRef: dropzoneBoundsRef,
        position: avatarDropzonePosition,
        recalculate: recalculateDropzonePosition,
    } = usePositionFromBounds();

    return (
        <Dropzone
            noClick={true}
            onDragEnter={() => setIsDraggingOverDialog(true)}
            onDragLeave={() => setIsDraggingOverDialog(false)}
            onDrop={() => setIsDraggingOverDialog(false)}
            onDragOver={(e) => {
                recalculateDropzonePosition();
                setDragOverDialogPosition({ x: e.clientX, y: e.clientY });
            }}
        >
            {({ getRootProps: getDialogRootProps }) => (
                <Box
                    {...getDialogRootProps()}
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "90%",
                        maxHeight: "80%",
                        overflowY: "auto",
                        maxWidth: 420,
                        minHeight: 300,
                        transform: "translate(-50%, -50%)",
                        borderRadius: "0.25em",
                        boxShadow: 24,
                        p: 4,
                        backgroundColor: "white",
                        '[data-mui-color-scheme="dark"] &': {
                            backgroundColor: "#111",
                        },
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            paddingBottom: 2,
                        }}
                    >
                        <PersonRounded />
                        <Typography variant="h6" component="h2">
                            Profil
                        </Typography>
                    </Box>
                    <AvatarMutateAlert
                        visible={showAvatarMutateError}
                        error={avatarMutateError}
                        onClosed={() => setAvatarMutateError(null)}
                    />
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginY: "1.5rem" }}>
                        <Box ref={dropzoneBoundsRef} sx={{ margin: "0 auto" }}>
                            <Dropzone
                                multiple={false}
                                noClick={true}
                                useFsAccessApi={false}
                                onDrop={(acceptedFiles) => {
                                    setIsDraggingOverAvatarDropzone(false);
                                    onAvatarUpload(acceptedFiles);
                                }}
                                onDragEnter={() => setIsDraggingOverAvatarDropzone(true)}
                                onDragLeave={() => setIsDraggingOverAvatarDropzone(false)}
                                accept={{ [ALLOWED_AVATAR_FILE_TYPES]: [] }}
                            >
                                {({ getRootProps: getDropzoneRootProps, getInputProps: getDropzoneInputProps }) => (
                                    <Box
                                        {...getDropzoneRootProps()}
                                        sx={[
                                            {
                                                display: "flex",
                                                gap: "1rem",
                                                margin: "0 auto",
                                                "& .MuiAvatar-root": {
                                                    fontSize: 42,
                                                },
                                            },
                                            isDraggingOver
                                                ? {
                                                      position: "relative",
                                                      zIndex: theme.zIndex.tooltip,
                                                  }
                                                : {},
                                        ]}
                                    >
                                        <ProfileAvatar
                                            username={user?.name ?? ""}
                                            previewDataURL={avatarPreviewDataURL ?? null}
                                            isAvailable={isAvatarAvailable}
                                            isUpdating={isAvatarUpdating}
                                            isDraggingOverOutside={isDraggingOverOutside || isDraggingOverDialog}
                                            isDraggingOverAvatarDropzone={isDraggingOverAvatarDropzone}
                                            dragOverOutsidePosition={
                                                isDraggingOverDialog ? dragOverDialogPosition : dragOverOutsidePosition
                                            }
                                            onIsAvailableChanged={(available) => setIsAvatarAvailable(available)}
                                            onEdit={() => setEditAvatarDialogOpen(true)}
                                            onUploadFromInput={onAvatarUploadFromInput}
                                            dropzonePosition={avatarDropzonePosition}
                                            dropzoneInputProps={getDropzoneInputProps()}
                                        />
                                    </Box>
                                )}
                            </Dropzone>
                        </Box>
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    textAlign: "center",
                                }}
                            >
                                {user?.name}
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    textAlign: "center",
                                    color: "text.secondary",
                                    fontSize: 14,
                                }}
                            >
                                {user?.email}
                            </Typography>
                        </Box>
                        <Box
                            sx={[
                                {
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    background: "black",
                                    transition: "opacity 225ms cubic-bezier(0.4, 0, 0.2, 1)",
                                    pointerEvents: "none",
                                },
                                isDraggingOver
                                    ? {
                                          opacity: 0.5,
                                      }
                                    : {
                                          opacity: 0,
                                      },
                            ]}
                        />
                        <Stack
                            sx={{
                                alignItems: "center",
                                mt: 2,
                            }}
                        >
                            <Button
                                variant={"outlined"}
                                color={"error"}
                                startIcon={<LogoutRoundedIcon />}
                                onClick={() => logOut()}
                            >
                                Logg ut
                            </Button>
                        </Stack>
                    </Box>
                    <EditAvatarDialog
                        open={editAvatarDialogOpen}
                        onClose={() => setEditAvatarDialogOpen(false)}
                        onAvatarUploadFromInput={onAvatarUploadFromInput}
                        onDeleteAvatar={() => setConfirmDeleteAvatarDialogOpen(true)}
                    />
                    <ConfirmationDialog
                        open={confirmDeleteAvatarDialogOpen}
                        title={"Slette bilde?"}
                        description={
                            <>
                                <Typography>Er du sikker på at du vil slette profilbildet ditt?</Typography>
                                <br />
                                <Typography>Dette kan ikke angres!</Typography>
                            </>
                        }
                        confirmText={"Slett"}
                        onCancel={() => setConfirmDeleteAvatarDialogOpen(false)}
                        onConfirm={() => {
                            setConfirmDeleteAvatarDialogOpen(false);
                            deleteAvatar();
                        }}
                    />
                </Box>
            )}
        </Dropzone>
    );
}

export default Profile;
