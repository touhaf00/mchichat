import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ProtectedRoute } from "../components/ui/ProtectedRoute";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import SalonPage from "../pages/SalonPage";
import NotFoundPage from "../pages/NotFoundPage";

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
                        path: "dashboard",
                        element: <DashboardPage />,
                    },
                    {
                        path: "profile",
                        element: <ProfilePage />,
                    },
                    {
                        path: "salons/:id",
                        element: <SalonPage />,
                    },
                ],
            },
        ],
    },
]);