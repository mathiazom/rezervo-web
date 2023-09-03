import { getInitColorSchemeScript } from "@mui/material";
import Document, { Head, Html, Main, NextScript } from "next/document";
import React from "react";

class MyDocument extends Document {
    override render() {
        return (
            <Html>
                <Head>
                    <link
                        rel="stylesheet"
                        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
                    />
                </Head>
                <body>
                    {getInitColorSchemeScript()}
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
