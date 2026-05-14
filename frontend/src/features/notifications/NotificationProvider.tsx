import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type NotificationCounts = {
    friends: number;
    salonsBySalonId: Record<string, number>;
    messagesByConversationId: Record<string, number>;
    salonMembershipRequests: number;
};

type Toast = {
    id: string;
    message: string;
};

type NotificationContextValue = {
    counts: NotificationCounts;
    totalSalons: number;
    totalMessages: number;
    showToast: (message: string) => void;

    incrementFriends: () => void;
    incrementSalon: (salonId: string) => void;
    incrementMessage: (conversationId: string) => void;

    resetFriends: () => void;
    resetSalon: (salonId: string) => void;
    resetConversation: (conversationId: string) => void;

    incrementSalonMembershipRequests: () => void;
    resetSalonMembershipRequests: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [counts, setCounts] = useState<NotificationCounts>({
        friends: 0,
        salonsBySalonId: {},
        messagesByConversationId: {},
        salonMembershipRequests: 0,
    });

    const totalSalons = useMemo(() => {
        return Object.values(counts.salonsBySalonId).reduce(
            (total, count) => total + count,
            0
        );
    }, [counts.salonsBySalonId]);

    const totalMessages = useMemo(() => {
        return Object.values(counts.messagesByConversationId).reduce(
            (total, count) => total + count,
            0
        );
    }, [counts.messagesByConversationId]);

    const showToast = useCallback((message: string) => {
        const id = crypto.randomUUID();

        setToasts((current) => [...current, { id, message }]);

        window.setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3500);
    }, []);

    const incrementFriends = useCallback(() => {
        setCounts((current) => ({
            ...current,
            friends: current.friends + 1,
        }));
    }, []);

    const incrementSalon = useCallback((salonId: string) => {
        setCounts((current) => ({
            ...current,
            salonsBySalonId: {
                ...current.salonsBySalonId,
                [salonId]: (current.salonsBySalonId[salonId] || 0) + 1,
            },
        }));
    }, []);

    const incrementMessage = useCallback((conversationId: string) => {
        setCounts((current) => ({
            ...current,
            messagesByConversationId: {
                ...current.messagesByConversationId,
                [conversationId]:
                (current.messagesByConversationId[conversationId] || 0) + 1,
            },
        }));
    }, []);

    const resetFriends = useCallback(() => {
        setCounts((current) => ({
            ...current,
            friends: 0,
        }));
    }, []);

    const resetSalon = useCallback((salonId: string) => {
        setCounts((current) => {
            const nextSalons = { ...current.salonsBySalonId };
            delete nextSalons[salonId];

            return {
                ...current,
                salonsBySalonId: nextSalons,
            };
        });
    }, []);

    const resetConversation = useCallback((conversationId: string) => {
        setCounts((current) => {
            const nextMessages = { ...current.messagesByConversationId };
            delete nextMessages[conversationId];

            return {
                ...current,
                messagesByConversationId: nextMessages,
            };
        });
    }, []);

    const incrementSalonMembershipRequests = useCallback(() => {
        setCounts((current) => ({
            ...current,
            salonMembershipRequests: current.salonMembershipRequests + 1,
        }));
    }, []);

    const resetSalonMembershipRequests = useCallback(() => {
        setCounts((current) => ({
            ...current,
            salonMembershipRequests: 0,
        }));
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                counts,
                totalSalons,
                totalMessages,
                showToast,
                incrementFriends,
                incrementSalon,
                incrementMessage,
                resetFriends,
                resetSalon,
                resetConversation,
                incrementSalonMembershipRequests,
                resetSalonMembershipRequests,
            }}
        >
            {children}

            <div className="fixed right-4 top-4 z-[9999] space-y-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="rounded-xl border border-white/10 bg-neutral-900 px-5 py-4 text-sm text-white shadow-2xl"
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error("useNotifications doit être utilisé dans NotificationProvider");
    }

    return context;
}
