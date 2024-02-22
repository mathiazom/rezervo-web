import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { Avatar, Badge, CircularProgress, circularProgressClasses, useTheme } from "@mui/material";
import React from "react";

import RippleBadge from "@/components/utils/RippleBadge";
import { hexColorHash } from "@/lib/utils/colorUtils";
import { StatusColors } from "@/types/userSessions";

export default function ClassUserAvatar({
    username,
    rippleColor,
    invisibleBadge,
    alert = false,
    loading = false,
}: {
    username: string;
    rippleColor?: string | undefined;
    alert?: boolean;
    invisibleBadge?: boolean;
    loading?: boolean;
}) {
    const theme = useTheme();
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
    return alert || loading ? (
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
                    alert && (
                        <ErrorRoundedIcon
                            fontSize={"small"}
                            color={"error"}
                            sx={{
                                backgroundColor: theme.palette.background.default,
                                borderRadius: "50%",
                                fontSize: "1.1rem",
                                marginTop: "-0.2rem",
                                marginLeft: "-0.2rem",
                            }}
                        />
                    )
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
