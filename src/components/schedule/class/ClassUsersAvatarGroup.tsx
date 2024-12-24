import { AvatarGroup } from "@mui/material";
import React from "react";

import ClassUserAvatar from "@/components/schedule/class/ClassUserAvatar";
import { UserNameWithIsSelf } from "@/types/config";

const AVATAR_SIZE = 24;

export default function ClassUsersAvatarGroup({
    users,
    rippleColor,
    badgeIcon,
    loading = false,
    invisibleBadges = false,
}: {
    users: UserNameWithIsSelf[];
    rippleColor?: string | undefined;
    badgeIcon?: React.ReactNode | undefined;
    loading?: boolean;
    invisibleBadges?: boolean;
}) {
    return (
        <AvatarGroup
            max={4}
            sx={{
                ml: 1,
                justifyContent: "start",
                "& .MuiAvatar-root": {
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    fontSize: 12,
                    borderColor: "white",
                    '[data-color-scheme="dark"] &': {
                        borderColor: "#191919",
                    },
                },
            }}
        >
            {users.map(({ userId, userName }) => (
                <ClassUserAvatar
                    key={userId}
                    userId={userId}
                    username={userName}
                    size={AVATAR_SIZE}
                    rippleColor={rippleColor}
                    invisibleBadge={invisibleBadges}
                    badgeIcon={badgeIcon}
                    loading={loading}
                />
            ))}
        </AvatarGroup>
    );
}
