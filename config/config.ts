const dev = process.env.NODE_ENV !== 'production';
export const apiUrl = dev ? 'http://localhost:3000' : 'https://sit.biku.be';
export const GROUP_BOOKING_URL = "https://www.sit.no/trening/gruppe"
