import { Check } from "@mui/icons-material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, Checkbox, FormControlLabel, FormGroup, FormLabel, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";

import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import { useUserCalendarFeedUrl } from "../../../hooks/useUserCalendarFeedUrl";

export default function CalendarFeed() {
    const [includePastClasses, setIncludePastClasses] = useState(true);

    const { userCalendarFeedUrl, userCalendarFeedUrlLoading } = useUserCalendarFeedUrl(includePastClasses);
    const userCalendarFeedUrlError = userCalendarFeedUrl == null && !userCalendarFeedUrlLoading;

    const [isCopiedToClipboard, isSupported, copyToClipboard] = useCopyToClipboard(userCalendarFeedUrl || "", {
        successDuration: 3000,
    });

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
            }}
        >
            <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <CalendarMonthRoundedIcon fontSize={"small"} />
                <Typography variant="overline" component="h2">
                    Kalender
                </Typography>
            </Box>
            <FormGroup sx={{ gap: "0.75rem" }}>
                <FormLabel>
                    <TextField
                        type="text"
                        label="URL"
                        error={userCalendarFeedUrlError}
                        value={
                            userCalendarFeedUrlLoading
                                ? "⏳    Laster ..."
                                : !userCalendarFeedUrlError
                                ? userCalendarFeedUrl
                                : "❌    Klarte ikke å hente URL"
                        }
                        disabled={userCalendarFeedUrlLoading || userCalendarFeedUrlError}
                        sx={{ width: "100%" }}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end" sx={{ margin: "0 auto" }}>
                                    {!isSupported || userCalendarFeedUrlError ? (
                                        <IconButton
                                            disabled={true}
                                            sx={{
                                                root: {
                                                    "&.Mui-disabled": {
                                                        pointerEvents: "auto",
                                                    },
                                                },
                                            }}
                                        >
                                            <ContentCopyIcon />
                                        </IconButton>
                                    ) : (
                                        <Tooltip title={isCopiedToClipboard ? "Kopiert" : "Kopier URL"}>
                                            <IconButton
                                                role={"button"}
                                                onClick={() => copyToClipboard(userCalendarFeedUrl || "")}
                                                sx={{
                                                    root: {
                                                        "&.Mui-disabled": {
                                                            pointerEvents: "auto",
                                                        },
                                                    },
                                                }}
                                            >
                                                {isCopiedToClipboard ? (
                                                    <Check color={"primary"} />
                                                ) : (
                                                    <ContentCopyIcon />
                                                )}
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </InputAdornment>
                            ),
                        }}
                    />
                </FormLabel>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={includePastClasses}
                            disabled={userCalendarFeedUrl == null}
                            onChange={(e) => setIncludePastClasses(e.target.checked)}
                            name="includePastClasses"
                        />
                    }
                    label="Inkluder gjennomførte timer"
                    componentsProps={{
                        typography: {
                            sx: {
                                userSelect: "none",
                            },
                        },
                    }}
                />
            </FormGroup>
        </Box>
    );
}
