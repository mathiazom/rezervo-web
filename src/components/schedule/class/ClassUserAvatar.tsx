import { Avatar, Badge, CircularProgress, circularProgressClasses } from "@mui/material";
import React from "react";

import RippleBadge from "@/components/utils/RippleBadge";
import { hexColorHash } from "@/lib/utils/colorUtils";
import { StatusColors } from "@/types/userSessions";

export default function ClassUserAvatar({
    username,
    rippleColor,
    invisibleBadge,
    badgeIcon,
    loading = false,
}: {
    username: string;
    rippleColor?: string | undefined;
    badgeIcon?: React.ReactNode | undefined;
    invisibleBadge?: boolean;
    loading?: boolean;
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
    return badgeIcon || loading ? (
        <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
                loading ? (
                    <CircularProgress
                        variant="indeterminate"
                        disableShrink
                        sx={{
                            animationDuration: "550ms",
                            position: "absolute",
                            [`& .${circularProgressClasses.circle}`]: {
                                strokeLinecap: "round",
                            },
                            borderColor: "white",
                            backgroundColor: "white",
                            '[data-mui-color-scheme="dark"] &': {
                                borderColor: "#191919",
                                backgroundColor: "#191919",
                            },
                            borderRadius: "50%",
                            borderWidth: "0.15rem",
                            borderStyle: "solid",
                            marginTop: "-0.2rem",
                            marginLeft: "-0.2rem",
                        }}
                        size={16}
                        thickness={10}
                    />
                ) : (
                    badgeIcon
                )
            }
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
