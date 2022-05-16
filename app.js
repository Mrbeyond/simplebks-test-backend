import express from "express";
import { createServer } from "http";
import cors from "cors";
const app = express();
const server = createServer(app);
const corsParams = {
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessfulStatus": 204
}

app.use(cors({corsParams}));

export default {
  app,
  server,
  express
}
