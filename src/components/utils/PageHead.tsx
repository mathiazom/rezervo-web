import { useTheme } from "@mui/material";
import Head from "next/head";
import React from "react";

const PageHead = ({ title }: { title: string }) => {
    const theme = useTheme();

    return (
        <Head>
            <title>{title}</title>
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link rel="manifest" href="/manifest.json" />
            <link rel="mask-icon" href="/safari-pinned-tab.svg" color={theme.palette.primary.main} />
            <meta name="msapplication-config" content="none" />
            <meta name="msapplication-tap-highlight" content="no" />
            <meta name="msapplication-TileColor" content={theme.palette.primary.main} />
            <meta name="theme-color" content={theme.palette.background.default} />
            <meta name="application-name" content="rezervo" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="rezervo" />
            <meta name="description" content="Automatisk booking av gruppetimer" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content="rezervo" />
            <meta property="og:description" content="Automatisk booking av gruppetimer" />
            <meta property="og:site_name" content="rezervo" />
            <meta property="og:url" content="https://rezervo.no" />
            <meta property="og:image" content="https://rezervo.no/apple-touch-icon.png" />
        </Head>
    );
};

export default PageHead;
