type RezervoCategory = {
    name: string;
    color: string;
    keywords: string[];
};

const activityCategorization: RezervoCategory[] = [
    {
        name: "Annet",
        color: "#FFFF66",
        keywords: ["happening", "event"],
    },
    {
        name: "Tilleggstjenester",
        color: "#f4eded",
        keywords: ["barnepass", "kroppsanalyse"],
    },
    {
        name: "Vannaerobic",
        color: "#0047ab",
        keywords: ["vann"],
    },
    {
        name: "Mosjon",
        color: "#00B050",
        keywords: ["godt voksen", "mamma", "mor og barn", "senior", "baby"],
    },
    {
        name: "Dans",
        color: "#E96179",
        keywords: ["dans", "dance", "sh'bam", "zumba"],
    },
    {
        name: "Body & Mind",
        color: "#8BD4F0",
        keywords: [
            "yoga",
            "pilates",
            "smidig",
            "stretch",
            "mobilitet",
            "meditate",
            "flow",
            "yin",
            "soul",
            "breath",
            "grounding",
        ],
    },
    {
        name: "Spinning",
        color: "#4C2C7E",
        keywords: ["spin", "sykkel", "ride"],
    },
    {
        name: "Kondisjon",
        color: "#6AD3B4",
        keywords: ["step", "løp", "puls", "bodyattack", "cardio", "tredemølle", "hiit", "aerobic"],
    },
    {
        name: "Styrke & Utholdenhet",
        color: "#F8A800",
        keywords: [
            "pump",
            "styrke",
            "core",
            "sterk",
            "tabata",
            "stærk",
            "strength",
            "hardhausen",
            "slynge",
            "crosstraining",
            "bodycross",
            "mrl",
        ],
    },
];

export default function determineActivityCategory(activityName: string, isSpecial: boolean): RezervoCategory {
    if (isSpecial) return activityCategorization[0]!;

    return (
        activityCategorization.find((category) =>
            category.keywords.some((keyword) => activityName.toLowerCase().includes(keyword)),
        ) ?? activityCategorization[0]!
    );
}
