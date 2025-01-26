import IndexPage from "@/app/indexPage";
import { fetchActiveChains } from "@/lib/helpers/fetchers";

async function fetchChainProfiles() {
    return (await fetchActiveChains()).map((chain) => chain.profile);
}

export default async function Page() {
    const chainProfiles = await fetchChainProfiles();
    return <IndexPage chainProfiles={chainProfiles} />;
}
