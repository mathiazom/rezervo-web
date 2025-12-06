"use client";

import { Activity } from "react";
import { Snowfall } from "react-snowfall";

import { checkSantaTime } from "@/lib/utils/santaUtils";

export default function SnowfallProvider() {
    const show = checkSantaTime();

    return (
        <Activity mode={show ? "visible" : "hidden"}>
            <Snowfall
                speed={[0.5, 1.0]}
                wind={[0, 0.5]}
                style={{
                    zIndex: 2412,
                    position: "fixed",
                    width: "100vw",
                    height: "100vh",
                }}
            />
        </Activity>
    );
}
