import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Collapse, Typography, IconButton, useTheme } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";

interface ExpandableTextProps {
    text: string;
    shouldCollapse?: boolean;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, shouldCollapse = true }) => {
    const [textExpanded, setTextExpanded] = useState(false);
    const [showExpanded, setShowExpanded] = useState(shouldCollapse);
    const textContainerRef = useRef<HTMLDivElement>(null);
    const defaultCollapsedSize = 85;
    const theme = useTheme();

    useEffect(() => {
        if (textContainerRef.current && shouldCollapse) {
            const actualHeight = textContainerRef.current.scrollHeight;
            const isOverflowing = actualHeight > defaultCollapsedSize + 25;
            setShowExpanded(isOverflowing);
        } else {
            setShowExpanded(false);
        }
    }, [text, shouldCollapse]);

    return (
        <Box sx={{ position: "relative", width: "100%", mt: 2, mb: showExpanded ? 4 : 0 }}>
            <Collapse
                in={textExpanded || !showExpanded}
                collapsedSize={showExpanded ? `${defaultCollapsedSize}px` : "auto"}
                sx={{ position: "relative" }}
            >
                <Typography
                    ref={textContainerRef}
                    sx={{
                        overflow: "hidden",
                        ":after":
                            showExpanded && !textExpanded && shouldCollapse
                                ? {
                                      content: '""',
                                      position: "absolute",
                                      width: "100%",
                                      height: 20, // Height of the fade effect
                                      bottom: 0,
                                      left: 0,
                                      backgroundImage: `linear-gradient(to bottom, ${theme.palette.mode === "dark" ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)"}, ${theme.palette.mode === "dark" ? "rgba(50,50,50,1)" : "rgba(255,255,255,1)"})`,
                                  }
                                : {},
                    }}
                >
                    {text}
                </Typography>
            </Collapse>
            {showExpanded && (
                <IconButton
                    sx={{
                        position: "absolute",
                        bottom: showExpanded ? "-25px" : "0px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        cursor: "pointer",
                    }}
                    onClick={(event) => {
                        event.stopPropagation(); // Prevent event bubbling to Collapse onClick
                        shouldCollapse && setTextExpanded(!textExpanded);
                        setTimeout(() => {
                            textContainerRef.current?.scrollIntoView({
                                behavior: "smooth",
                                inline: "end",
                            });
                        }, 185);
                    }}
                >
                    <ExpandMoreIcon
                        sx={{
                            transform: textExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                        }}
                    />
                </IconButton>
            )}
        </Box>
    );
};

export default ExpandableText;
