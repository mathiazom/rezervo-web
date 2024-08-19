import { unstable_noStore as noStore } from "next/cache";

export function requireServerEnv(env: string): string {
    noStore();
    const value = global.process.env[env];
    if (!value) {
        throw new Error(`Missing environment variable: ${env}`);
    }
    return value;
}
