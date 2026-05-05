import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { api } from "../../lib/api";
import { getToken, removeToken, setToken } from "../../lib/storage";
import { AuthContext } from "./auth.context.ts";
import type { User } from "./auth.types";


type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setTokenState] = useState<string | null>(getToken());
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshMe = useCallback(async () => {
        const savedToken = getToken();

        if (!savedToken) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.get("/auth/me");
            setUser(response.data.user);
        } catch {
            removeToken();
            setTokenState(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (newToken: string, providedUser?: User | null) => {
        setToken(newToken);
        setTokenState(newToken);

        if (providedUser) {
            setUser(providedUser);
            return;
        }

        await refreshMe();
    },[refreshMe]);

    const logout = useCallback(() => {
        removeToken();
        setTokenState(null);
        setUser(null);
    }, []);

    useEffect(() => {
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
