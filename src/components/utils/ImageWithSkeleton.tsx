import { Box, Skeleton } from "@mui/material";
import { CSSProperties, useEffect, useState } from "react";

function ImageWithSkeleton({
    src,
    alt,
    width,
    height,
    style,
}: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    style?: CSSProperties;
}) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => setLoaded(false), [src]);

    return (
        <Box sx={{ position: "relative", width: width ?? "100%", height: height ?? "100%", maxWidth: "100%" }}>
            {!loaded && (
                <Skeleton variant={"rounded"} sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            )}
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                onLoad={() => setLoaded(true)}
                style={{ ...style, visibility: loaded ? "visible" : "hidden" }}
            />
        </Box>
    );
}

export default ImageWithSkeleton;
