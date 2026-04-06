import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../features/auth/AuthContext";

const queryClient = new QueryClient();

type ProvidersProps = {
    children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    );
}