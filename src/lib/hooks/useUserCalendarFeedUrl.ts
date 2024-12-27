import useSWR from "swr";

import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher } from "@/lib/utils/fetchUtils";

function calendarFeedUrlWithToken(token: string, includePast: boolean) {
    const calendarFeedUrl = new URL(`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/cal`);
    calendarFeedUrl.searchParams.set("include_past", includePast.toString());
    calendarFeedUrl.searchParams.set("token", token);
    return calendarFeedUrl.toString();
}

export function useUserCalendarFeedUrl(includePast: boolean) {
    const { isAuthenticated, token } = useUser();

    const userCalendarFeedToken = `cal-token`;

    const {
        data: calendarToken,
        error: urlError,
        isLoading,
    } = useSWR<string>(isAuthenticated ? userCalendarFeedToken : null, authedFetcher(token ?? ""));

    return calendarToken != undefined && urlError == null
        ? {
              userCalendarFeedUrl: calendarFeedUrlWithToken(calendarToken, includePast),
              userCalendarFeedUrlError: false,
              userCalendarFeedUrlLoading: isLoading,
          }
        : {
              userCalendarFeedUrl: undefined,
              userCalendarFeedUrlLoading: isLoading,
          };
}
