import { Avatar, Box, Skeleton } from "@mui/material";
import Image from "next/image";
import { Activity, useEffect, useState } from "react";

import { buildPublicBackendPath, fetchProtectedImageAsDataUrl } from "@/lib/helpers/requests";
import { useUser } from "@/lib/hooks/useUser";
import { avatarColor } from "@/lib/utils/colorUtils";
import { useMyUser } from "@/stores/userStore";

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
    const { token } = useUser();
    const myUserId = useMyUser((state) => state.userId);
    const realUserId = userId === "me" ? myUserId : userId;

    const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
    const [isAvatarAvailable, setIsAvatarAvailable] = useState<boolean | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const imgSrcSize = size <= 75 ? "small" : "medium";

    function doSetPictureAvailable(available: boolean) {
        setIsAvatarAvailable(available);
        if (onIsAvatarAvailableChanged) {
            onIsAvatarAvailableChanged(available);
        }
    }

    useEffect(() => {
        if (realUserId == null || token == null) return;
        fetchProtectedImageAsDataUrl(buildPublicBackendPath(`user/${realUserId}/avatar/${imgSrcSize}`), token).then(
            (url) => {
                setAvatarUrl(url);
                setIsLoadingAvatar(false);
            },
        );
    }, [realUserId, imgSrcSize, token]);

    const imageUrl = previewOverride ?? avatarUrl;

    return (
        <Box
            sx={{
                width: size,
                height: size,
            }}
        >
            <Activity mode={isAvatarAvailable ? "visible" : "hidden"}>
                {imageUrl && (
                    <Image
                        src={imageUrl}
                        alt={username}
                        width={size}
                        height={size}
                        onError={() => doSetPictureAvailable(false)}
                        onLoad={() => doSetPictureAvailable(true)}
                        style={{
                            borderRadius: "50%",
                            objectFit: "cover",
                        }}
                        unoptimized={true} // ensures fresh avatars
                    />
                )}
                {isLoadingAvatar && <Skeleton variant={"circular"} width={size} height={size} />}
            </Activity>
            <Activity mode={isAvatarAvailable === false ? "visible" : "hidden"}>
                <Avatar
                    sx={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: avatarColor(username),
                        "@media (prefers-color-scheme: dark)": {
                            backgroundColor: avatarColor(username, true),
                        },
                    }}
                >
                    {username[0]}
                </Avatar>
            </Activity>
        </Box>
    );
}
