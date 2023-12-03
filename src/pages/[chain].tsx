import type { GetStaticPaths, NextPage } from "next";
import React, { useEffect } from "react";

import Chain from "@/components/Chain";
import activeChains from "@/lib/activeChains";
import { fetchChainPageStaticProps } from "@/lib/helpers/fetchers";
import { storeSelectedChain } from "@/lib/helpers/storage";
import { deserializeSchedule } from "@/lib/serialization/deserializers";
import { ChainPageParams, RezervoChain } from "@/types/chain";
import { ChainPageProps } from "@/types/serialization";

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: Object.keys(activeChains).map((chain) => ({
            params: {
                chain,
            },
        })),
        fallback: false,
    };
};

export async function getStaticProps({ params }: { params: ChainPageParams }): Promise<{
    revalidate: number;
    props: ChainPageProps;
}> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await fetchChainPageStaticProps(activeChains[params.chain] as RezervoChain<any>);
}

const ChainPage: NextPage<ChainPageProps> = ({ chainProfile, initialSchedule, classPopularityIndex, error }) => {
    useEffect(() => {
        storeSelectedChain(chainProfile.identifier);
    }, [chainProfile.identifier]);

    return (
        <Chain
            initialSchedule={deserializeSchedule(initialSchedule)}
            classPopularityIndex={classPopularityIndex}
            chainProfile={chainProfile}
            error={error}
        />
    );
};

export default ChainPage;
