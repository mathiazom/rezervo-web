import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { Avatar, Badge } from "@mui/material";
import React from "react";

import RippleBadge from "@/components/utils/RippleBadge";
import { hexColorHash } from "@/lib/utils/colorUtils";
import { StatusColors } from "@/types/userSessions";

export default function ClassUserAvatar({
    username,
    rippleColor,
    invisibleBadge,
    alert = false,
}: {
    username: string;
    rippleColor?: string | undefined;
    alert?: boolean;
    invisibleBadge?: boolean;
}) {
    const avatar = (
        <Avatar
            alt={username}
            sx={{
                backgroundColor: hexColorHash(username),
            }}
        >
            {username[0]}
        </Avatar>
    );
    return alert ? (
        <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={<ErrorRoundedIcon fontSize={"small"} color={"error"} />}
        >
            {avatar}
        </Badge>
    ) : (
        <RippleBadge
            key={username}
            invisible={invisibleBadge || rippleColor == undefined}
            overlap="circular"
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            variant={"dot"}
            rippleColor={rippleColor ?? StatusColors.UNKNOWN}
        >
            {avatar}
        </RippleBadge>
    );
}
