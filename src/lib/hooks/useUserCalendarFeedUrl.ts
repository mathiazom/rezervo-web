import { useUser } from "@auth0/nextjs-auth0/client";
import useSWR from "swr";

import { fetcher } from "@/lib/utils/fetchUtils";

export function useUserCalendarFeedUrl(includePast: boolean) {
    const { user } = useUser();

    const userCalendarFeedTokenUrl = `cal-url?include_past=${includePast}`;

    const { data: url, error: urlError, isLoading } = useSWR<string>(user ? userCalendarFeedTokenUrl : null, fetcher);

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
