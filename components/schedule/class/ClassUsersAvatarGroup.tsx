import { AvatarGroup } from "@mui/material";
import ClassUserAvatar from "components/schedule/class/ClassUserAvatar";
import React from "react";

export default function ClassUsersAvatarGroup({
    users,
    rippleColor,
    alert = false,
    invisibleBadges = false,
}: {
    users: string[];
    rippleColor?: string | undefined;
    alert?: boolean;
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
                    borderColor: "white",
                    '[data-mui-color-scheme="dark"] &': {
                        borderColor: "#191919",
                    },
                },
            }}
        >
            {users.map((username) => (
                <ClassUserAvatar
                    key={username}
                    username={username}
                    rippleColor={rippleColor}
                    invisibleBadge={invisibleBadges}
                    alert={alert}
                />
            ))}
        </AvatarGroup>
    );
}
