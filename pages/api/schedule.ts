import {NextApiRequest, NextApiResponse} from "next";

type Schedule = {
    days: any
}

function scheduleUrl(token: string, from: Date | null = null) {
    return 'https://ibooking.sit.no/webapp/api/Schedule/getSchedule' +
        `?token=${token}${from ? ('&from=' + from.toISOString()) : ''}` +
        '&studios=306,307,308,402,540,1132&lang=no&categories=5,6,7,8,9,10,11,12,14'
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Schedule>
) {
    const token = JSON.parse(req.body).token
    // Use two fetches to retrieve schedule for the next 7 days
    const extraFromDate = new Date()
    extraFromDate.setDate(extraFromDate.getDate() + 3)
    fetch(scheduleUrl(token))
        .then(res => res.json())
        .then(json => fetch(scheduleUrl(token, extraFromDate)).then(res => res.json())
            .then(jsonExtra => ({days: [...json.days, ...jsonExtra.days.slice(1,4)]}))
        )
        .then(totalJson => res.status(200).json(totalJson))
}