import { Avatar, Box, Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";

import { buildPublicBackendPath, fetchProtectedImageAsDataUrl } from "@/lib/helpers/requests";
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
    userId: string | "me";
    username: string;
    size?: number;
    previewOverride?: string | null | undefined;
    onIsAvatarAvailableChanged?: (available: boolean) => void;
}) {
    const { token } = useUser();
    const { userId: myUserId } = useMyUser();
    const realUserId = userId === "me" ? myUserId : userId;

    const [isAvatarAvailable, setIsAvatarAvailable] = useState<boolean | null>(null);

    const imgSrcSize = size <= 75 ? "small" : "medium";

    function doSetPictureAvailable(available: boolean) {
        setIsAvatarAvailable(available);
        if (onIsAvatarAvailableChanged) {
            onIsAvatarAvailableChanged(available);
        }
    }

    const avatarQuery = useQuery({
        queryKey: ["avatar", realUserId, imgSrcSize],
        queryFn: () =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            fetchProtectedImageAsDataUrl(buildPublicBackendPath(`user/${realUserId}/avatar/${imgSrcSize}`), token!),
        enabled: realUserId != null && token != null,
    });

    const imageUrl = previewOverride ?? avatarQuery.data ?? null;

    return (
        <Box
            sx={{
                width: size,
                height: size,
            }}
        >
            {isAvatarAvailable !== false ? (
                <>
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
                    {avatarQuery.isPending && <Skeleton variant={"circular"} width={size} height={size} />}
                </>
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
