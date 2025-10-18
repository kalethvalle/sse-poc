import cors from "cors";
import express, { Router } from "express";

const app = express();
app.use(cors());
app.use(express.static("public"));

const healthRoute = Router();

healthRoute.get("/health", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const intervalId = setInterval(() => {
    res.write(`data: Server ${new Date().toISOString()}\n\n`);
  }, 2000);

  req.on("close", () => {
    clearInterval(intervalId);
    console.log("Se cerro la conexion");
  });
});

app.use("/api", healthRoute);

app.listen(8080, () => {
  console.log("http://localhost:8080");
  console.log("http://localhost:8080/api/health");
});
