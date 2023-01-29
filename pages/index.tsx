import type {NextPage} from 'next'
import React, {useState, useEffect} from "react";
import {
    Box, CircularProgress,
    Container,
    Divider,
    Stack,
    Typography, useTheme
} from "@mui/material";
import Head from "next/head";
import Schedule from "../components/Schedule";
import Config from "../components/Config";
import {SitClass, SitSchedule} from "../types/sit_types";

const Index: NextPage = () => {

    const [schedule, setSchedule] = useState<SitSchedule | null>(null);
    const [selectedClasses, setSelectedClasses] = useState<SitClass[]>([]);

    async function fetchSchedule(): Promise<SitSchedule> {
        return await fetch("/api/schedule", {method: 'POST'})
            .then(res => res.json())
    }

    function addClass(_class: SitClass) {
        setSelectedClasses((classes) => [...classes, _class])
    }

    function removeClass(_class: SitClass) {
        setSelectedClasses((classes) => classes.filter((c) => c.id != _class.id))
    }

    useEffect(() => {
        fetchSchedule().then(schedule => setSchedule(schedule))
    }, []);

    const theme = useTheme()

    return (
        <div>
            {schedule ? (
                <div>
                    <Head>
                        <title>sit-rezervo-confgen</title>
                    </Head>
                    <Box height={"8vh"} display="flex" alignItems={"center"}>
                        <Typography variant="h5" component="div" py={2} pl={3}>
                            <strong style={{color: theme.palette.primary.main}}>sit-rezervo</strong> / <code>config.yaml</code>
                        </Typography>
                    </Box>
                    <Divider/>
                    <Stack
                        direction={"row"}
                        divider={<Divider orientation="vertical" flexItem/>}
                    >
                        <Container maxWidth={false} sx={{height: '91vh', overflow: 'auto'}}>
                            <Schedule schedule={schedule} addClass={addClass} removeClass={removeClass} />
                        </Container>
                        <Container sx={{paddingY: 2, height: '91vh', overflow: 'auto'}} maxWidth={"xs"}>
                            <Config classes={selectedClasses} />
                        </Container>
                    </Stack>

                </div>
            ) : (
                <Box display={"flex"} flexDirection={"column"} alignItems={"center"} width={"100%"} marginTop={20} gap={4}>
                    <CircularProgress />
                    <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
                        <Typography>Fetching schedule</Typography>
                        <Typography sx={{opacity: 0.4}}>ibooking.sit.no</Typography>
                    </Box>
                </Box>
            )
            }
        </div>
    )
}

export default Index
