import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import { useTheme } from "@mui/material";

export function PlannedNotBookedBadgeIcon() {
    const theme = useTheme();
    return (
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
    );
}
