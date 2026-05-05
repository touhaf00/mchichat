export type User = {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
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
