import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../components/ui/ProtectedRoute";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage";
import DashboardPage from "../pages/DashboardPage";
import SalonPage from "../pages/SalonPage";
import NotFoundPage from "../pages/NotFoundPage";
import FriendsPage from "../pages/FriendsPage.tsx";
import PrivateMessagesPage from "../pages/PrivateMessagesPage";
import FeedPage from "../pages/FeedPage";
import ProfileSettingsPage from "../pages/ProfileSettingsPage";
import AdminPage from "../pages/AdminPage";
import { AdminRoute } from "../components/ui/AdminRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        errorElement: <NotFoundPage />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "register",
                element: <RegisterPage />,
            },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: "admin",
                        element: (
                            <AdminRoute>
                                <AdminPage />
                            </AdminRoute>
                        ),
                    },
                    {
                        path: "/profile/settings",
                        element: <ProfileSettingsPage />,
                    },
                    {
                        path: "profile",
                        element: <ProfilePage />,
                    },
                    {
                        path: "profile/:username",
                        element: <ProfilePage />,
                    },
                    {
                        path: "dashboard",
                        element: <DashboardPage />,
                    },
                    {
                        path: "salons/:id",
                        element: <SalonPage />,
                    },
                    {
                        path: "friends",
                        element: <FriendsPage />,
                    },
                    {
                        path: "messages",
                        element: <PrivateMessagesPage />,
                    },
                    {
                        path: "feed",
                        element: <FeedPage />,
                    },
                ],
            },
        ],
    },
]);