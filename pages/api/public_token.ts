import {NextApiRequest, NextApiResponse} from "next";

type PublicToken = {
    token: string
}

const GROUP_BOOKING_URL = "https://www.sit.no/trening/gruppe"

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<PublicToken>
) {
    fetch(GROUP_BOOKING_URL)
        .then((res) => res.text())
        .then(text => text.replace(/[\n\r]/g, '').replace(/\s+/g," "))
        .then(soup => {
            const matches = soup.match(/<!\[CDATA\[.*?iBookingPreload\(.*?token:.*?"(.+?)".*?]]>/)
            const token = (matches && matches.length > 1) ? matches[1] : ''
            res.status(200).json({token: token})
        })
}