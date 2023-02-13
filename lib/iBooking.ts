import {GROUP_BOOKING_URL} from "../config/config";

function scheduleUrl(token: string, from: Date | null = null) {
    return 'https://ibooking.sit.no/webapp/api/Schedule/getSchedule' +
        `?token=${token}${from ? ('&from=' + from.toISOString()) : ''}` +
        '&studios=306,307,308,402,540,1132&lang=no&categories=5,6,7,8,9,10,11,12,14'
}


function fetchPublicToken() {
    return fetch(GROUP_BOOKING_URL)
        .then((res) => res.text())
        .then(text => text.replace(/[\n\r]/g, '').replace(/\s+/g, " "))
        .then(soup => {
            const matches = soup.match(/<!\[CDATA\[.*?iBookingPreload\(.*?token:.*?"(.+?)".*?]]>/)
            return (matches && matches.length > 1) ? matches[1] : '';
        })
}

export async function fetchSchedule() {
    const token = await fetchPublicToken()
    // Use two fetches to retrieve schedule for the next 8 days
    const firstBatchResponse = await fetch(scheduleUrl(token))
    if (!firstBatchResponse.ok) {
        throw new Error(`Failed to fetch first schedule batch, received status ${firstBatchResponse.status}`)
    }
    const firstBatch = await firstBatchResponse.json()
    const secondBatchStartDate = new Date()
    secondBatchStartDate.setDate(secondBatchStartDate.getDate() + 4)
    const secondBatchResponse = await fetch(scheduleUrl(token, secondBatchStartDate))
    if (!secondBatchResponse.ok) {
        throw new Error(`Failed to fetch second schedule batch, received status ${secondBatchResponse.status}`)
    }
    const secondBatch = await secondBatchResponse.json()
    return {days: [...firstBatch.days, ...secondBatch.days]}
}
