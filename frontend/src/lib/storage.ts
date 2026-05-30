const LEGACY_TOKEN_KEY = "mchichat_token";
const SESSION_ACCESS_TOKEN_KEY = "mchichat_session_access_token";

export function clearLegacyToken() {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function setSessionAccessToken(token: string | null) {
    if (token) {
        sessionStorage.setItem(SESSION_ACCESS_TOKEN_KEY, token);
    } else {
        sessionStorage.removeItem(SESSION_ACCESS_TOKEN_KEY);
    }
}

export function getSessionAccessToken() {
    return sessionStorage.getItem(SESSION_ACCESS_TOKEN_KEY);
}