
export function getServerURL() {
    if(process.env.STATE === 'production') {
        return process.env.URL_PRODUCTION
    } else {
        return process.env.URL_DEVELOPMENT
    }
}