export type User = {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    role: string;
    createdAt: string;
    updatedAt?: string;
};

export type AuthContextType = {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user?: User | null) => Promise<void>;
    logout: () => void;
    refreshMe: () => Promise<void>;
};