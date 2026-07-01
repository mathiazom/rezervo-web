import { $api } from "@/lib/api/client";
import { useUser } from "@/lib/hooks/useUser";

function calendarFeedUrlWithToken(token: string, includePast: boolean) {
    const calendarFeedUrl = new URL(`${import.meta.env.VITE_CONFIG_HOST}/cal`);
    calendarFeedUrl.searchParams.set("include_past", includePast.toString());
    calendarFeedUrl.searchParams.set("token", token);
    return calendarFeedUrl.toString();
}

export function useUserCalendarFeedUrl(includePast: boolean) {
    const { isAuthenticated } = useUser();

    const {
        data: calendarToken,
        error: urlError,
        isLoading,
    } = $api.useQuery("get", "/cal-token", {}, { enabled: isAuthenticated });

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
