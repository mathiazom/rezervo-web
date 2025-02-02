import ChainPage from "@/app/[chain]/chainPage";
import { fetchActiveChains, fetchChain, fetchChainPageStaticProps } from "@/lib/helpers/fetchers";

interface Props {
    params: Promise<{ chain: string }>;
}

export const dynamicParams = false;

export const revalidate = 300;

export async function generateStaticParams() {
    return (await fetchActiveChains()).map((chain) => ({
        chain: chain.profile.identifier,
    }));
}

export default async function Page({ params }: Props) {
    const chain = (await params).chain;
    const props = await fetchChain(chain).then((c) => fetchChainPageStaticProps(c));
    return <ChainPage {...props} />;
}
