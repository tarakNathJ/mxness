import express  from "express"
import { config } from "dotenv"
import cors from "cors"
import bodyParser from "body-parser"
import route from "./routes/index.route.js"
config()
class init_express_server {
    private app: express.Application = express();
   
    constructor(){
        this.app.use(express.json())
        this.app.use(cors( {origin: "*"} ))  
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({extended: true}));
        this.app.use("/api",route)
    }
    public start_server(PORT:number){
        this.app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    }
}
export default init_express_server;
