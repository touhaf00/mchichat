import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Providers } from "./app/providers";
import { NotificationProvider } from "./features/notifications/NotificationProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Providers>
            <NotificationProvider>
                <App />
            </NotificationProvider>
        </Providers>
    </React.StrictMode>
);