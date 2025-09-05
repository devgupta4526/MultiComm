import express from 'express';
import cors from "cors";
import { errorMiddleware } from "@packages/error_handler/errorhandler.middleware";
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import swaggerUi from "swagger-ui-express";

const swaggerDocument = require("./swagger-output.json");

const app = express();


app.use(cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API' });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/doc-json",(req,res)=>{
   res.json(swaggerDocument);
});

//routes 
app.use('/api',authRouter);

app.use(errorMiddleware)

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
    console.log(`Auth Service is running at http://localhost:${port}/api`);
    console.log(`Swagger Docs available at http://localhost:${port}/doc`);
});

server.on("error", (err) => {
    console.log("Server Error", err);
});