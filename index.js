import router from "./routes/index.js";
import appServer from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const { server, express, app } = appServer


app.use(express.json({limit: '10mb' }));
app.use(express.urlencoded({extended: true, limit: '50mb',}));
app.use(router);

app.use((req,res, next)=>{
  res.status(404).send("Page Not Found!")
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Internal Server Error');
})

server.listen(process.env.PORT || 5000, ()=>{
  console.log("\n Up and running \n")
})

export default app;