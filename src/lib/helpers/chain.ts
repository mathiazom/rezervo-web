import { LocationId } from "@/types/brand";
import { RezervoChain } from "@/types/openapi";

export function getAllLocationIds(chain: RezervoChain): LocationId[] {
    return chain.branches.flatMap((branch) => branch.locations.map(({ identifier }) => identifier));
}

export function getDefaultLocationIds(chain: RezervoChain): LocationId[] {
    const firstBranch = chain.branches[0];
    return firstBranch ? firstBranch.locations.map(({ identifier }) => identifier) : [];
}
