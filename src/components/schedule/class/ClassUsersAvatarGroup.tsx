import { AvatarGroup } from "@mui/material";
import React from "react";

import ClassUserAvatar from "@/components/schedule/class/ClassUserAvatar";

export default function ClassUsersAvatarGroup({
    users,
    rippleColor,
    badgeIcon,
    loading = false,
    invisibleBadges = false,
}: {
    users: string[];
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
                    width: 24,
                    height: 24,
                    fontSize: 12,
                    border: "none",
                },
            }}
        >
            {users.map((username) => (
                <ClassUserAvatar
                    key={username}
                    username={username}
                    rippleColor={rippleColor}
                    invisibleBadge={invisibleBadges}
                    badgeIcon={badgeIcon}
                    loading={loading}
                />
            ))}
        </AvatarGroup>
    );
}
