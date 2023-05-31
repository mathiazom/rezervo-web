import { Avatar, AvatarGroup } from "@mui/material";
import RippleBadge from "./RippleBadge";
import { hexColorHash } from "../utils/colorUtils";
import React from "react";
import { StatusColors } from "../types/rezervoTypes";

export const UsersAvatarGroup = ({
    users,
    badgeColor,
    invisibleBadges = false,
}: {
    users: string[];
    badgeColor?: string | undefined;
    invisibleBadges?: boolean;
}) => {
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
            {users.map((user_name) => (
                <RippleBadge
                    key={user_name}
                    invisible={invisibleBadges || badgeColor == undefined}
                    overlap="circular"
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                    }}
                    variant={"dot"}
                    rippleColor={badgeColor ?? StatusColors.UNKNOWN}
                >
                    <Avatar
                        alt={user_name}
                        sx={{
                            backgroundColor: hexColorHash(user_name),
                        }}
                    >
                        {user_name[0]}
                    </Avatar>
                </RippleBadge>
            ))}
        </AvatarGroup>
    );
};
