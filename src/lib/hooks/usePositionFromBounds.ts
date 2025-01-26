import { useEffect, useRef, useState } from "react";

import { Position } from "@/types/math";

export function usePositionFromBounds() {
    const boundsRef = useRef<HTMLDivElement>(undefined);
    const [position, setPosition] = useState<Position | null>(null);

    function recalculate() {
        const boundsElement = boundsRef.current;
        if (boundsElement == undefined) return;
        const rect = boundsElement.getBoundingClientRect();
        setPosition({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
    }

    useEffect(() => {
        window.addEventListener("resize", recalculate);
    }, []);

    useEffect(() => {
        recalculate();
    }, [boundsRef]);

    return {
        boundsRef,
        position,
        recalculate,
    };
}
