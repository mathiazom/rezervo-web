import { AccessTimeRounded, CategoryRounded, PlaceRounded } from "@mui/icons-material";
import { Box, Button, Dialog, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { blue, pink, purple } from "@mui/material/colors";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { DialogHeader } from "next/dist/client/components/react-dev-overlay/internal/components/Dialog";
import React, { Dispatch, SetStateAction, useState } from "react";
import SwipeableViews from "react-swipeable-views";

import CategoryFilters from "@/components/modals/CategoryFilters";
import ExcludeClassTimeFilters from "@/components/modals/ExcludeClassTimeFilters";
import LocationFilters from "@/components/modals/LocationFilters";
import { ActivityCategory, ExcludeClassTimeFilter, RezervoChain } from "@/types/chain";

function a11yProps(index: number) {
    return {
        id: `schedule-filters-tab-${index}`,
        "aria-controls": `schedule-filters-tabpanel-${index}`,
    };
}

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 1 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

export const LOCATIONS_COLOR = blue;

export const CATEGORIES_COLOR = pink;

export const EXCLUDE_CLASS_TIME_COLOR = purple;

const tabColors = [LOCATIONS_COLOR[500], CATEGORIES_COLOR[500], EXCLUDE_CLASS_TIME_COLOR[500]];

export default function ScheduleFiltersDialog({
    open,
    setOpen,
    chain,
    selectedLocationIds,
    setSelectedLocationIds,
    allCategories,
    selectedCategories,
    setSelectedCategories,
    excludeClassTimeFilters,
    setExcludeClassTimeFilters,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    chain: RezervoChain;
    selectedLocationIds: string[];
    setSelectedLocationIds: Dispatch<SetStateAction<string[]>>;
    allCategories: ActivityCategory[];
    selectedCategories: string[];
    setSelectedCategories: Dispatch<SetStateAction<string[]>>;
    excludeClassTimeFilters: ExcludeClassTimeFilter[];
    setExcludeClassTimeFilters: Dispatch<SetStateAction<ExcludeClassTimeFilter[]>>;
}) {
    const theme = useTheme();
    const [tab, setTab] = useState(0);

    const handleDialogClose = () => {
        setOpen(false);
    };

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const handleChangeIndex = (index: number) => {
        setTab(index);
    };

    const currentTabColor = tabColors[tab];

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose}
            maxWidth={"xs"}
            fullWidth={true}
            PaperProps={{
                sx: {
                    height: "100%",
                    backgroundColor: "white",
                    '[data-color-scheme="dark"] &': {
                        backgroundColor: "#111",
                        backgroundImage: "none",
                    },
                },
            }}
        >
            <DialogHeader>
                <Tabs
                    value={tab}
                    onChange={handleChange}
                    indicatorColor={"primary"}
                    textColor="inherit"
                    variant="fullWidth"
                    aria-label="schedule-filters-tabs"
                    TabIndicatorProps={{
                        style: {
                            backgroundColor: currentTabColor,
                        },
                    }}
                >
                    <Tab
                        label={"Sentre"}
                        icon={<PlaceRounded fontSize={"small"} />}
                        iconPosition={"start"}
                        sx={[
                            {
                                minHeight: "3rem",
                            },
                            tab == 0
                                ? {
                                      color: LOCATIONS_COLOR[500],
                                  }
                                : {
                                      color: null,
                                  },
                        ]}
                        {...a11yProps(0)}
                    />
                    <Tab
                        label={"Kategorier"}
                        icon={<CategoryRounded fontSize={"small"} />}
                        iconPosition={"start"}
                        sx={[
                            {
                                minHeight: "3rem",
                            },
                            tab == 1
                                ? {
                                      color: CATEGORIES_COLOR[500],
                                  }
                                : {
                                      color: null,
                                  },
                        ]}
                        {...a11yProps(1)}
                    />
                    <Tab
                        label={"Tidsrom"}
                        icon={<AccessTimeRounded fontSize={"small"} />}
                        iconPosition={"start"}
                        sx={[
                            {
                                minHeight: "3rem",
                            },
                            tab == 2
                                ? {
                                      color: EXCLUDE_CLASS_TIME_COLOR[500],
                                  }
                                : {
                                      color: null,
                                  },
                        ]}
                        {...a11yProps(2)}
                    />
                </Tabs>
            </DialogHeader>
            <DialogContent sx={{ padding: 0, margin: 0 }}>
                <SwipeableViews index={tab} onChangeIndex={handleChangeIndex}>
                    <TabPanel value={tab} index={0} dir={theme.direction}>
                        <LocationFilters
                            chain={chain}
                            selectedLocationIds={selectedLocationIds}
                            setSelectedLocationIds={setSelectedLocationIds}
                        />
                    </TabPanel>
                    <TabPanel value={tab} index={1} dir={theme.direction}>
                        <CategoryFilters
                            chain={chain}
                            allCategories={allCategories}
                            selectedCategories={selectedCategories}
                            setSelectedCategories={setSelectedCategories}
                        />
                    </TabPanel>
                    <TabPanel value={tab} index={2} dir={theme.direction}>
                        <ExcludeClassTimeFilters
                            excludeClassTimeFilters={excludeClassTimeFilters}
                            setExcludeClassTimeFilters={setExcludeClassTimeFilters}
                        />
                    </TabPanel>
                </SwipeableViews>
            </DialogContent>
            <DialogActions>
                <Button color={"inherit"} onClick={() => handleDialogClose()}>
                    Lukk
                </Button>
            </DialogActions>
        </Dialog>
    );
}
