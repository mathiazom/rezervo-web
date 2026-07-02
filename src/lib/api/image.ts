import { apiClient } from "@/lib/api/client";

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}

export async function fetchAvatarDataUrl(userId: string, sizeName: string): Promise<string | null> {
    const { data, response } = await apiClient.GET("/user/{user_id}/avatar/{size_name}", {
        params: { path: { user_id: userId, size_name: sizeName } },
        parseAs: "blob",
    });
    if (!response.ok || !data) {
        return null;
    }
    return blobToDataUrl(data);
}
