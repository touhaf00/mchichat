import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { api, setAccessToken } from "../../lib/api";
import { clearLegacyToken } from "../../lib/storage";
import { AuthContext } from "./auth.context.ts";
import type { User } from "./auth.types";

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setTokenState] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const applyAuth = useCallback(
        (newToken: string | null, providedUser?: User | null) => {
            setAccessToken(newToken);
            setTokenState(newToken);

            if (providedUser !== undefined) {
                setUser(providedUser);
            }
        },
        []
    );

    const refreshMe = useCallback(async () => {
        try {
            const refreshResponse = await api.post("/auth/refresh");
            const refreshedToken = refreshResponse.data.accessToken as string;

            setAccessToken(refreshedToken);
            setTokenState(refreshedToken);

            const meResponse = await api.get("/auth/me");
            setUser(meResponse.data.user);
        } catch {
            setAccessToken(null);
            setTokenState(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(
        async (newToken: string, providedUser?: User | null) => {
            clearLegacyToken();

            applyAuth(newToken, providedUser ?? undefined);

            if (!providedUser) {
                await refreshMe();
            }
        },
        [applyAuth, refreshMe]
    );

    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            // Même si le backend ne répond pas, on nettoie côté front.
        } finally {
            clearLegacyToken();
            setAccessToken(null);
            setTokenState(null);
            setUser(null);
        }
    }, []);

    useEffect(() => {
        clearLegacyToken();
        void refreshMe();
    }, [refreshMe]);

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: !!token && !!user,
            isLoading,
            login,
            logout,
            refreshMe,
        }),
        [user, token, isLoading, login, logout, refreshMe]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}