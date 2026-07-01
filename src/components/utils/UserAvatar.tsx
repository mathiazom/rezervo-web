import { Avatar, Box, Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { fetchAvatarDataUrl } from "@/lib/api/image";
import { useMyUser } from "@/lib/hooks/useMyUser";
import { useUser } from "@/lib/hooks/useUser";
import { avatarColor } from "@/lib/utils/colorUtils";

export function UserAvatar({
    userId,
    username,
    size = 32,
    previewOverride,
    onIsAvatarAvailableChanged,
}: {
    userId: string;
    username: string;
    size?: number;
    previewOverride?: string | null | undefined;
    onIsAvatarAvailableChanged?: (available: boolean) => void;
}) {
    const { isAuthenticated } = useUser();
    const { userId: myUserId } = useMyUser();
    const realUserId = userId === "me" ? myUserId : userId;

    const imgSrcSize = size <= 75 ? "small" : "medium";

    const queryEnabled = realUserId != null && isAuthenticated;

    const avatarQuery = useQuery({
        queryKey: ["avatar", realUserId, imgSrcSize],
        queryFn: () => fetchAvatarDataUrl(realUserId!, imgSrcSize),
        enabled: queryEnabled,
    });

    const imageUrl = previewOverride ?? avatarQuery.data ?? null;

    const [isImageBroken, setIsImageBroken] = useState(false);
    useEffect(() => setIsImageBroken(false), [imageUrl]);

    const showImage = imageUrl != null && !isImageBroken;
    const isResolving =
        !showImage && isAuthenticated && (!queryEnabled || !(avatarQuery.isSuccess || avatarQuery.isError));
    const isAvailable = showImage ? true : isResolving ? null : false;

    useEffect(() => {
        if (isAvailable != null) {
            onIsAvatarAvailableChanged?.(isAvailable);
        }
    }, [isAvailable, onIsAvatarAvailableChanged]);

    return (
        <Box
            sx={{
                width: size,
                height: size,
            }}
        >
            {showImage ? (
                <img
                    src={imageUrl}
                    alt={username}
                    width={size}
                    height={size}
                    onError={() => setIsImageBroken(true)}
                    style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
            ) : isResolving ? (
                <Skeleton variant={"circular"} width={size} height={size} />
            ) : (
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
            )}
        </Box>
    );
}
