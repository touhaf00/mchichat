import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { initSocket } from "./lib/socket";

const server = http.createServer(app);

initSocket(server);

server.listen(Number(env.PORT), "0.0.0.0", () => {
    console.log(`Mchichat API running on port ${env.PORT}`);
});