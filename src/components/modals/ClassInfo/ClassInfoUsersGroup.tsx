import { Box, Typography } from "@mui/material";
import React from "react";

import ClassUsersAvatarGroup from "@/components/schedule/class/ClassUsersAvatarGroup";
import { formatNameArray } from "@/lib/utils/arrayUtils";
import { UserNameWithIsSelf } from "@/types/config";

export default function ClassInfoUsersGroup({
    users,
    includeSelf,
    text,
    isCancelled = false,
    invisibleBadges = false,
    badgeIcon,
    loading = false,
    rippleColor,
}: {
    users: UserNameWithIsSelf[];
    includeSelf: boolean;
    text: string;
    isCancelled?: boolean;
    invisibleBadges?: boolean;
    badgeIcon?: React.ReactNode | undefined;
    loading?: boolean;
    rippleColor?: string | undefined;
}) {
    const cancelledOpacity = 0.5;

    return (
        users.length > 0 && (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: badgeIcon ? 1.5 : 1.25,
                    opacity: isCancelled ? cancelledOpacity : 1,
                }}
            >
                <ClassUsersAvatarGroup
                    users={users.map((u) => u.user_name)}
                    rippleColor={rippleColor}
                    invisibleBadges={invisibleBadges}
                    badgeIcon={badgeIcon}
                    loading={loading}
                />
                <Typography variant="body2" color={loading ? "text.disabled" : "#fff"}>
                    {loading
                        ? "henter bookingstatus ..."
                        : `${formatNameArray(
                              users.filter((u) => !u.is_self).map((u) => u.user_name),
                              4,
                              includeSelf,
                          )} ${text}`}
                </Typography>
            </Box>
        )
    );
}
