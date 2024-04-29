import { Badge, CircularProgress, circularProgressClasses } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import React from "react";

import RippleBadge from "@/components/utils/RippleBadge";
import { UserAvatar } from "@/components/utils/UserAvatar";
import { useMyUser } from "@/stores/userStore";
import { StatusColors } from "@/types/userSessions";

export default function ClassUserAvatar({
    userId,
    username,
    size,
    rippleColor,
    invisibleBadge,
    badgeIcon,
    loading = false,
    withSelfPrefix = true,
}: {
    userId: string;
    username: string;
    size?: number | undefined;
    rippleColor?: string | undefined;
    badgeIcon?: React.ReactNode | undefined;
    invisibleBadge?: boolean;
    loading?: boolean;
    withSelfPrefix?: boolean;
}) {
    const myUserId = useMyUser((state) => state.userId);
    const avatar = <UserAvatar userId={userId} username={username} {...(size ? { size: size } : {})} />;

    return (
        <Tooltip title={`${username}${withSelfPrefix && myUserId === userId ? " (deg)" : ""}`}>
            {badgeIcon || loading ? (
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
                    key={userId}
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
            )}
        </Tooltip>
    );
}
