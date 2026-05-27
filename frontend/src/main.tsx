import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Providers } from "./app/providers";
import { NotificationProvider } from "./features/notifications/NotificationProvider";
import { ThemeProvider } from "./features/theme/ThemeProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Providers>
            <NotificationProvider>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </NotificationProvider>
        </Providers>
    </React.StrictMode>
);