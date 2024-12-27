import { Badge, styled } from "@mui/material";

const RippleBadge = styled(Badge, {
    shouldForwardProp: (prop) => prop !== "rippleColor",
})(({ rippleColor }: { rippleColor: string }) => ({
    "& .MuiBadge-badge": {
        zIndex: 0,
        backgroundColor: rippleColor,
        color: rippleColor,
        boxShadow: "0 0 0 2px white",
        '[data-mui-color-scheme="dark"] &': {
            boxShadow: "0 0 0 2px #191919",
        },
        "&::after": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            animation: "ripple 3s infinite ease-in-out",
            border: "1px solid currentColor",
            content: '""',
        },
    },
    "@keyframes ripple": {
        "0%": {
            transform: "scale(.8)",
            opacity: 1,
        },
        "100%": {
            transform: "scale(2.4)",
            opacity: 0,
        },
    },
}));

export default RippleBadge;
