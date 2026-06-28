import { useQuery } from "@tanstack/react-query";

import { useUser } from "@/lib/hooks/useUser";
import { authedFetcher, FetchError } from "@/lib/utils/fetchUtils";

function calendarFeedUrlWithToken(token: string, includePast: boolean) {
    const calendarFeedUrl = new URL(`${process.env["NEXT_PUBLIC_CONFIG_HOST"]}/cal`);
    calendarFeedUrl.searchParams.set("include_past", includePast.toString());
    calendarFeedUrl.searchParams.set("token", token);
    return calendarFeedUrl.toString();
}

export function useUserCalendarFeedUrl(includePast: boolean) {
    const { isAuthenticated, token } = useUser();

    const {
        data: calendarToken,
        error: urlError,
        isLoading,
    } = useQuery<string, FetchError>({
        queryKey: ["cal-token"],
        queryFn: () => authedFetcher(token ?? "")<string>("cal-token"),
        enabled: isAuthenticated,
    });

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
