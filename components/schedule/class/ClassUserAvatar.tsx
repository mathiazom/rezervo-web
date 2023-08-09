import { Avatar, Badge } from "@mui/material";
import { hexColorHash } from "../../../utils/colorUtils";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import RippleBadge from "../../utils/RippleBadge";
import { StatusColors } from "../../../types/rezervo";
import React from "react";

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
