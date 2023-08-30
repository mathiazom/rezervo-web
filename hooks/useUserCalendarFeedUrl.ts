import useSWR from "swr";
import { fetcher } from "../utils/fetchUtils";
import { useUser } from "@auth0/nextjs-auth0/client";

export function useUserCalendarFeedUrl(includePast: boolean) {
    const { user } = useUser();

    // `document.location` is used as a dummy origin, since URL only supports absolute paths
    const userCalendarFeedTokenUrl = new URL("/api/cal-url", document.location.origin);
    userCalendarFeedTokenUrl.searchParams.set("include_past", String(includePast));

    const {
        data: url,
        error: urlError,
        isLoading,
    } = useSWR<string>(user ? userCalendarFeedTokenUrl.toString() : null, fetcher);

    return url != null && urlError == null
        ? {
              userCalendarFeedUrl: url,
              userCalendarFeedUrlError: false,
              userCalendarFeedUrlLoading: isLoading,
          }
        : {
              userCalendarFeedUrl: undefined,
              userCalendarFeedUrlLoading: isLoading,
          };
}
