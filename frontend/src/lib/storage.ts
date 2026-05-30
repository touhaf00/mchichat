const LEGACY_TOKEN_KEY = "mchichat_token";

export function clearLegacyToken() {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
}