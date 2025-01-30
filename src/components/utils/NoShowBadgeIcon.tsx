import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import { useTheme } from "@mui/material";

export function NoShowBadgeIcon() {
    const theme = useTheme();
    return (
        <GavelRoundedIcon
            fontSize={"small"}
            color={"error"}
            sx={{
                backgroundColor: theme.palette.background.default,
                borderRadius: "50%",
                border: "0.1rem solid red",
                fontSize: "1.1rem",
                padding: "0.15rem",
                marginTop: "-0.2rem",
                marginLeft: "-0.2rem",
            }}
        />
    );
}
