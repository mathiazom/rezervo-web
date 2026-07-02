import { RezervoChain } from "@/types/openapi";

export function getAllLocationIds(chain: RezervoChain): string[] {
    return chain.branches.flatMap((branch) => branch.locations.map(({ identifier }) => identifier));
}

export function getDefaultLocationIds(chain: RezervoChain): string[] {
    const firstBranch = chain.branches[0];
    return firstBranch ? firstBranch.locations.map(({ identifier }) => identifier) : [];
}
