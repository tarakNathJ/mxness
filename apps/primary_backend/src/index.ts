import init_express_server from "./app.js"
import {config} from "dotenv"

config()

const server = new init_express_server()
server.start_server(Number(process.env.PORT  || 3000))