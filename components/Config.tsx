import { Alert, Box, useTheme } from "@mui/material";
import React, { useMemo } from "react";
import { SitClass } from "../types/sitTypes";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import coldarkDark from "react-syntax-highlighter/dist/cjs/styles/prism/coldark-dark";
import coldarkCold from "react-syntax-highlighter/dist/cjs/styles/prism/coldark-cold";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

SyntaxHighlighter.registerLanguage("json", json);

type ConfigPayload = {
    classes: {
        activity: number;
        display_name: string;
        weekday: number;
        studio: number;
        time: {
            hour: number;
            minute: number;
        };
    }[];
};

const Config = ({
    classes,
    selectedClassIds,
}: {
    classes: SitClass[];
    selectedClassIds: string[];
}) => {
    const theme = useTheme();

    // Pre-generate all class config strings
    const allClassesConfigs = useMemo(() => {
        function timeForClass(_class: SitClass) {
            const date = new Date(_class.from);
            return {
                hour: date.getHours(),
                minute: date.getMinutes(),
            };
        }

        return classes.map((c) => ({
            id: c.id.toString(),
            config: {
                activity: c.activityId,
                display_name: c.name,
                weekday: c.weekday ?? -1,
                studio: c.studio.id,
                time: timeForClass(c),
            },
        }));
    }, [classes]);

    const selectedClassesConfig: ConfigPayload = {
        classes: allClassesConfigs
            .filter(({ id }) => selectedClassIds.includes(id))
            .map(({ config }) => config),
    };
    const selectedClassesConfigString = JSON.stringify(
        selectedClassesConfig,
        null,
        2
    );

    const [isCopiedToClipboard, copyToClipboard] = useCopyToClipboard(
        selectedClassesConfigString,
        { successDuration: 2000 }
    );

    return (
        <>
            {selectedClassIds && selectedClassIds.length > 0 ? (
                <>
                    <Box
                        sx={{
                            position: "relative",
                            ":hover .config-copy-icon": {
                                opacity: 1,
                            },
                        }}
                    >
                        <IconButton
                            onClick={() =>
                                copyToClipboard(selectedClassesConfigString)
                            }
                            aria-label={"Copy config"}
                            className={"config-copy-icon"}
                            sx={{
                                aspectRatio: "1 / 1",
                                position: "absolute",
                                top: 8,
                                right: 8,
                                opacity: { xs: 1, md: 0 },
                                transition: "opacity 200ms ease",
                            }}
                        >
                            {isCopiedToClipboard ? (
                                <CheckCircle />
                            ) : (
                                <ContentCopyIcon />
                            )}
                        </IconButton>
                        <SyntaxHighlighter
                            language={"json"}
                            style={
                                theme.palette.mode === "dark"
                                    ? coldarkDark
                                    : coldarkCold
                            }
                            customStyle={{ borderRadius: "4px" }}
                        >
                            {selectedClassesConfigString}
                        </SyntaxHighlighter>
                    </Box>
                </>
            ) : (
                <Box sx={{ marginTop: "0.5rem" }}>
                    <Alert severity="info" sx={{ borderRadius: "4px" }}>
                        Select classes to the left to generate your{" "}
                        <code>config.yaml</code>
                    </Alert>
                </Box>
            )}
        </>
    );
};

export default Config;
