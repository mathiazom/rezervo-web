import { AddPhotoAlternateRounded, DoubleArrowRounded, EditRounded, UploadRounded } from "@mui/icons-material";
import { Avatar, Badge, Box, CircularProgress, circularProgressClasses, Typography } from "@mui/material";
import { blue, orange } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import React from "react";
import { DropzoneInputProps } from "react-dropzone";

import { UserAvatar } from "@/components/utils/UserAvatar";
import { VisuallyHiddenInput } from "@/components/utils/VisuallyHiddenInput";
import { rotationAnimation } from "@/lib/helpers/animations";
import { Position } from "@/types/math";

function ProfileAvatar({
    username,
    previewDataURL,
    isAvailable,
    isUpdating,
    isDraggingOverOutside,
    isDraggingOverAvatarDropzone,
    dragOverOutsidePosition,
    onIsAvailableChanged,
    onEdit,
    onUploadFromInput,
    dropzonePosition,
    dropzoneInputProps,
}: {
    username: string;
    previewDataURL: string | null;
    isAvailable: boolean | null;
    isUpdating: boolean;
    isDraggingOverOutside: boolean;
    isDraggingOverAvatarDropzone: boolean;
    dragOverOutsidePosition: Position | null;
    onIsAvailableChanged: (available: boolean) => void;
    onEdit: () => void;
    onUploadFromInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
    dropzonePosition: Position | null;
    dropzoneInputProps: DropzoneInputProps;
}) {
    const dragAngleRadiansToDropzone =
        dropzonePosition && dragOverOutsidePosition
            ? Math.atan2(dragOverOutsidePosition.y - dropzonePosition.y, dragOverOutsidePosition.x - dropzonePosition.x)
            : null;

    const isDraggingOver = isDraggingOverAvatarDropzone || isDraggingOverOutside;

    const showDragArrowHint = isDraggingOver && dragOverOutsidePosition != null && dropzonePosition != null;

    const dragDistanceToAvatarDropzone =
        dropzonePosition && dragOverOutsidePosition
            ? Math.sqrt(
                  (dragOverOutsidePosition.x - dropzonePosition.x) ** 2 +
                      (dragOverOutsidePosition.y - dropzonePosition.y) ** 2,
              )
            : null;

    const dropzoneArrowOffsetPercent =
        50 * (dragDistanceToAvatarDropzone ? Math.min(dragDistanceToAvatarDropzone + 100, 400) / 400 : 1);

    return (
        <Badge
            invisible={isAvailable === null || isDraggingOver}
            overlap={"circular"}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
                <Box>
                    {isUpdating ? (
                        <CircularProgress
                            variant="indeterminate"
                            disableShrink
                            sx={{
                                animationDuration: "550ms",
                                position: "absolute",
                                [`& .${circularProgressClasses.circle}`]: {
                                    strokeLinecap: "round",
                                },
                                marginTop: "-1rem",
                                marginLeft: "-1rem",
                                color: blue[500],
                                borderColor: "white",
                                backgroundColor: "white",
                                '[data-color-scheme="dark"] &': {
                                    borderColor: "#191919",
                                    backgroundColor: "#191919",
                                },
                                borderRadius: "50%",
                                borderWidth: "0.3rem",
                                borderStyle: "solid",
                            }}
                            size={28}
                            thickness={8}
                        />
                    ) : isAvailable ? (
                        <IconButton
                            onClick={() => onEdit()}
                            sx={{
                                marginTop: "-0.2rem",
                                marginLeft: "-0.2rem",
                            }}
                        >
                            <EditRounded
                                sx={{
                                    backgroundColor: blue[500],
                                    color: "white",
                                    borderColor: "white",
                                    '[data-color-scheme="dark"] &': {
                                        borderColor: "#191919",
                                        color: "#191919",
                                    },
                                    borderRadius: "50%",
                                    borderWidth: "0.15rem",
                                    borderStyle: "solid",
                                    padding: "0.35rem",
                                    fontSize: 32,
                                }}
                            />
                        </IconButton>
                    ) : (
                        <IconButton
                            component={"label"}
                            sx={{
                                marginTop: "-0.2rem",
                                marginLeft: "-0.2rem",
                            }}
                        >
                            <AddPhotoAlternateRounded
                                sx={{
                                    backgroundColor: blue[500],
                                    color: "white",
                                    borderColor: "white",
                                    '[data-color-scheme="dark"] &': {
                                        borderColor: "#191919",
                                        color: "#191919",
                                    },
                                    borderRadius: "50%",
                                    borderWidth: "0.15rem",
                                    borderStyle: "solid",
                                    padding: "0.35rem",
                                    fontSize: 42,
                                }}
                            />
                            <VisuallyHiddenInput {...dropzoneInputProps} type={"file"} onChange={onUploadFromInput} />
                        </IconButton>
                    )}
                </Box>
            }
        >
            {isDraggingOverAvatarDropzone ? (
                <Avatar
                    sx={{
                        position: "relative",
                        backgroundColor: blue[500],
                        width: 120,
                        height: 120,
                    }}
                >
                    <Box
                        sx={[
                            {
                                flexDirection: "column",
                                alignItems: "center",
                            },
                            isUpdating
                                ? {
                                      display: "none",
                                  }
                                : {
                                      display: "flex",
                                  },
                        ]}
                    >
                        <UploadRounded sx={{ fontSize: 42 }} />
                        <Typography
                            sx={{
                                textAlign: "center",
                                fontSize: 14,
                                color: "white",

                                '[data-color-scheme="dark"] &': {
                                    color: "#191919",
                                },
                            }}
                        >
                            Slipp for å <br />
                            laste opp
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            borderRadius: "50%",
                            position: "absolute",
                            outlineStyle: "dashed",
                            outlineOffset: "-0.3rem",
                            width: 120,
                            height: 120,
                            animation: `${rotationAnimation} 8s linear infinite`,
                        }}
                    />
                </Avatar>
            ) : isDraggingOver ? (
                <Avatar
                    sx={{
                        position: "relative",
                        backgroundColor: orange[500],
                        width: 120,
                        height: 120,
                    }}
                >
                    {showDragArrowHint ? (
                        <Box
                            sx={[
                                dragAngleRadiansToDropzone
                                    ? {
                                          rotate: `${dragAngleRadiansToDropzone}rad`,
                                      }
                                    : {
                                          rotate: 0,
                                      },
                            ]}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    transform: `translateX(${dropzoneArrowOffsetPercent}%)`,
                                }}
                            >
                                <DoubleArrowRounded
                                    sx={{
                                        fontSize: 58,
                                        rotate: `${Math.PI}rad`,
                                    }}
                                />
                            </Box>
                        </Box>
                    ) : (
                        <UploadRounded sx={{ fontSize: 64 }} />
                    )}
                    <Box
                        sx={[
                            {
                                borderRadius: "50%",
                                position: "absolute",
                                outlineStyle: "dashed",
                                outlineOffset: "-0.3rem",
                                width: 120,
                                height: 120,
                            },
                            dragAngleRadiansToDropzone
                                ? {
                                      rotate: `${dragAngleRadiansToDropzone}rad`,
                                  }
                                : {
                                      rotate: 0,
                                  },
                            showDragArrowHint
                                ? {}
                                : {
                                      animation: `${rotationAnimation} 8s linear infinite`,
                                  },
                        ]}
                    />
                </Avatar>
            ) : (
                <Box
                    sx={[
                        isUpdating
                            ? {
                                  "& .MuiAvatar-root *": {
                                      filter: "blur(1px) grayscale(100%)",
                                  },
                              }
                            : {
                                  "& .MuiAvatar-root *": {
                                      filter: "none",
                                  },
                              },
                    ]}
                >
                    <UserAvatar
                        userId={"me"}
                        username={username}
                        size={120}
                        previewOverride={isUpdating ? previewDataURL : null}
                        onIsAvatarAvailableChanged={onIsAvailableChanged}
                    />
                </Box>
            )}
        </Badge>
    );
}

export default ProfileAvatar;
