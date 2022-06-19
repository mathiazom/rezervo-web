import type {NextPage} from 'next'
import React, {useState, useEffect} from "react";
import {
    Box,
    Container,
    Divider,
    Stack,
    Typography, useTheme
} from "@mui/material";
import Head from "next/head";
import Schedule from "../components/Schedule";
import Config from "../components/Config";

const Index: NextPage = () => {

    const [publicToken, setPublicToken] = useState<string | null>(null);
    const [schedule, setSchedule] = useState<any | null>(null);
    const [selectedClasses, setSelectedClasses] = useState<any[]>([]);

    async function fetchSchedule(token: string): Promise<any> {
        return await fetch("/api/schedule", {method: 'POST', body: JSON.stringify({token: token})})
            .then(res => res.json())
    }

    async function fetchPublicToken(): Promise<string> {
        return await fetch("/api/public_token").then(res => res.json()).then(json => json.token)
    }

    function addClass(_class: any) {
        setSelectedClasses((classes) => [...classes, _class])
    }

    function removeClass(_class: any) {
        setSelectedClasses((classes) => classes.filter((c) => c.id != _class.id))
    }

    useEffect(() => {
        if (publicToken != null) {
            fetchSchedule(publicToken).then(schedule => setSchedule(schedule))
        }
    }, [publicToken]);

    useEffect(() => {
        fetchPublicToken().then(token => setPublicToken(token));
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
            ) : 'Fetching schedule...'}
        </div>
    )
}

export default Index
