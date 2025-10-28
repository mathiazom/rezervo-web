import { useEffect, useState } from "react";

export function useCopyToClipboard(
    text: string,
    options?: { successDuration?: number },
): [boolean, boolean, (text: string) => Promise<boolean>] {
    const [isCopied, setIsCopied] = useState(false);
    const successDuration = options && options.successDuration;

    useEffect(() => {
        if (isCopied && successDuration) {
            const id = setTimeout(() => {
                setIsCopied(false);
            }, successDuration);

            return () => {
                clearTimeout(id);
            };
        }
        return;
    }, [isCopied, successDuration]);

    useEffect(() => {
        // TODO: setState should not be called directly an in a useEffect
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsCopied(false);
    }, [text]);

    return [
        isCopied,
        !!navigator?.clipboard,
        async (text) => {
            if (!navigator?.clipboard) {
                console.warn("Clipboard not supported");
                return false;
            }

            // Try to save to clipboard then save it in the state if worked
            try {
                await navigator.clipboard.writeText(text);
                setIsCopied(true);
                return true;
            } catch (error) {
                console.warn("Copy failed", error);
                setIsCopied(false);
                return false;
            }
        },
    ];
}
