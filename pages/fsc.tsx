import { fetchFscWeekSchedule } from "../lib/integration/fsc";

function FamilySportsClubPage() {
    const demo = async () => {
        console.log(await fetchFscWeekSchedule(0));
    };
    demo();
    return <p>Coming Soon 🚀</p>;
}

export default FamilySportsClubPage;
