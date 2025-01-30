"use client";

import { Snowfall } from "react-snowfall";

import { checkSantaTime } from "@/lib/utils/santaUtils";

export default function SnowfallProvider() {
    const show = checkSantaTime();

    return (
        show && (
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
        )
    );
}
