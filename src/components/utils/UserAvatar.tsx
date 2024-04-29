import { Avatar, Box } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";

import { buildPublicBackendPath } from "@/lib/helpers/requests";
import { avatarColor } from "@/lib/utils/colorUtils";
import { useMyUserId } from "@/stores/userStore";

export function UserAvatar({
    userId,
    username,
    size = 32,
    previewOverride,
    onIsAvatarAvailableChanged,
}: {
    userId: string | "me";
    username: string;
    size?: number;
    previewOverride?: string | null | undefined;
    onIsAvatarAvailableChanged?: (available: boolean) => void;
}) {
    const myUserId = useMyUserId((state) => state.userId);
    const realUserId = userId === "me" ? myUserId : userId;

    const [isAvatarAvailable, setIsAvatarAvailable] = useState<boolean | null>(null);

    const imgSrcSize = size <= 75 ? "small" : "medium";

    function doSetPictureAvailable(available: boolean) {
        setIsAvatarAvailable(available);
        if (onIsAvatarAvailableChanged) {
            onIsAvatarAvailableChanged(available);
        }
    }

    return (
        <Avatar
            sx={{
                width: size,
                height: size,
            }}
        >
            <Image
                src={previewOverride ?? buildPublicBackendPath(`user/${realUserId}/avatar/${imgSrcSize}`) ?? ""}
                alt={username}
                width={size}
                height={size}
                onError={() => doSetPictureAvailable(false)}
                onLoad={() => doSetPictureAvailable(true)}
                style={{
                    objectFit: "cover",
                }}
                unoptimized={true} // ensures fresh avatars
            />
            {isAvatarAvailable === false && (
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        backgroundColor: avatarColor(username),
                        '[data-mui-color-scheme="dark"] &': {
                            backgroundColor: avatarColor(username, true),
                        },
                    }}
                >
                    {username[0]}
                </Box>
            )}
        </Avatar>
    );
}
