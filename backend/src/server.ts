import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { initSocket } from "./lib/socket";

const server = http.createServer(app);

initSocket(server);

server.listen(env.PORT, () => {
    console.log(`Mchichat API running on http://localhost:${env.PORT}`);
});