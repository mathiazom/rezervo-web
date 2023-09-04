import { Box, Container, Paper, Typography, useTheme } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

function IntegrationBox({ integrationAcronym }: { integrationAcronym: string }) {
    return (
        <Link href={`/${integrationAcronym}`}>
            <Container
                sx={{
                    padding: "1rem",
                    margin: "1rem",
                    cursor: "pointer",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                        transform: "scale(1.1)",
                    },
                    width: "10rem",
                    height: "5rem",
                }}
                component={Paper}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        position: "relative",
                        height: "100%",
                    }}
                >
                    <Image src={`/${integrationAcronym}.svg`} alt={`${integrationAcronym}-rezervo`} layout={"fill"} />
                </Box>
            </Container>
        </Link>
    );
}

const IntegrationOverview = () => {
    const theme = useTheme();

    return (
        <Container
            sx={{
                display: "flex",
                height: "100vh",
                alignItems: "center",
                flexDirection: "column",
                pt: "2rem",
            }}
        >
            <Typography sx={{ fontSize: "2rem", marginTop: "1rem" }} variant={"h1"}>
                <strong style={{ color: theme.palette.primary.main }}>rezervo</strong>
            </Typography>
            <Typography sx={{ fontSize: "1rem", marginTop: "1rem" }} variant="subtitle1">
                Velg ditt treningssenter
            </Typography>
            <Box sx={{ display: "flex", width: "100%", flexWrap: "wrap", justifyContent: "center" }}>
                <IntegrationBox integrationAcronym={"sit"} />
                <IntegrationBox integrationAcronym={"fsc"} />
            </Box>
        </Container>
    );
};
export default IntegrationOverview;
