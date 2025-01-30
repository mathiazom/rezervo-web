import { Box, Typography } from "@mui/material";

import ClassUsersAvatarGroup from "@/components/schedule/class/ClassUsersAvatarGroup";
import { formatNameArray, userNameWithIsSelfComparator } from "@/lib/utils/arrayUtils";
import { UserNameWithIsSelf } from "@/types/config";

export default function ClassInfoUsersGroup({
    users,
    text,
    isCancelled = false,
    invisibleBadges = false,
    badgeIcon,
    loading = false,
    rippleColor,
}: {
    users: UserNameWithIsSelf[];
    text: string;
    isCancelled?: boolean;
    invisibleBadges?: boolean;
    badgeIcon?: React.ReactNode | undefined;
    loading?: boolean;
    rippleColor?: string | undefined;
}) {
    const cancelledOpacity = 0.5;

    const sortedUsers = users.sort(userNameWithIsSelfComparator);

    return (
        users.length > 0 && (
            <Box
                sx={[
                    {
                        display: "flex",
                        alignItems: "center",
                        mt: 1.5,
                    },
                    badgeIcon
                        ? {
                              gap: 1.5,
                          }
                        : {
                              gap: 1.25,
                          },
                    isCancelled
                        ? {
                              opacity: cancelledOpacity,
                          }
                        : {
                              opacity: 1,
                          },
                ]}
            >
                <ClassUsersAvatarGroup
                    users={sortedUsers}
                    rippleColor={rippleColor}
                    invisibleBadges={invisibleBadges}
                    badgeIcon={badgeIcon}
                    loading={loading}
                />
                <Typography variant="body2" color={loading ? "text.disabled" : "text.secondary"}>
                    {loading
                        ? "henter bookingstatus ..."
                        : `${formatNameArray(
                              sortedUsers.filter((u) => !u.isSelf).map((u) => u.userName),
                              4,
                              sortedUsers.some((u) => u.isSelf),
                          )} ${text}`}
                </Typography>
            </Box>
        )
    );
}
