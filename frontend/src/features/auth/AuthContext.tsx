import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { api } from "../../lib/api";
import { getToken, removeToken, setToken } from "../../lib/storage";

type User = {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    updatedAt?: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user?: User | null) => Promise<void>;
    logout: () => void;
    refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setTokenState] = useState<string | null>(getToken());
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function refreshMe() {
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
    }

    async function login(newToken: string, providedUser?: User | null) {
        setToken(newToken);
        setTokenState(newToken);

        if (providedUser) {
            setUser(providedUser);
            return;
        }

        await refreshMe();
    }

    function logout() {
        removeToken();
        setTokenState(null);
        setUser(null);
    }

    useEffect(() => {
        refreshMe();
    }, []);

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
        [user, token, isLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}