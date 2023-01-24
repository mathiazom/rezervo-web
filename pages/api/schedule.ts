import {NextApiRequest, NextApiResponse} from "next";
import {GROUP_BOOKING_URL} from "../../config/config";

type Schedule = {
    days: any
}

function scheduleUrl(token: string, from: Date | null = null) {
    return 'https://ibooking.sit.no/webapp/api/Schedule/getSchedule' +
        `?token=${token}${from ? ('&from=' + from.toISOString()) : ''}` +
        '&studios=306,307,308,402,540,1132&lang=no&categories=5,6,7,8,9,10,11,12,14'
}


function fetchPublicToken() {
    return fetch(GROUP_BOOKING_URL)
        .then((res) => res.text())
        .then(text => text.replace(/[\n\r]/g, '').replace(/\s+/g," "))
        .then(soup => {
            const matches = soup.match(/<!\[CDATA\[.*?iBookingPreload\(.*?token:.*?"(.+?)".*?]]>/)
            return (matches && matches.length > 1) ? matches[1] : '';
        })
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Schedule>
) {
    const token = await fetchPublicToken()
    // Use two fetches to retrieve schedule for the next 8 days
    const extraFromDate = new Date()
    extraFromDate.setDate(extraFromDate.getDate() + 4)
    fetch(scheduleUrl(token))
        .then(res => res.json())
        .then(json => fetch(scheduleUrl(token, extraFromDate)).then(res => res.json())
            .then(jsonExtra => ({days: [...json.days, ...jsonExtra.days]}))
        )
        .then(totalJson => res.status(200).json(totalJson))
}
