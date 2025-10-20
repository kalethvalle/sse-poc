import cors from "cors";
import express, { Router } from "express";

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const healthRoute = Router();
healthRoute.get("/health", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const intervalId = setInterval(() => {
    res.write(`data: Server ${new Date().toISOString()}\n\n`);
  }, 1000);

  req.on("close", () => {
    clearInterval(intervalId);
    console.log("Se cerro la conexion");
  });
});

let message = {
  text: "",
  status: "process",
};
const pollingRoute = Router();
pollingRoute.post("/polling", (req, res) => {
  message.text = req.body.message;
  setTimeout(() => {
    message.status = "done";
  }, 30000);
  res.status(200).json({ data: "message sent succesfully" });
});

pollingRoute.get("/polling", (req, res) => {
  res.status(200).json({ message });
});

app.use("/api", healthRoute);
app.use("/api", pollingRoute);

app.listen(8080, () => {
  console.log("http://localhost:8080");
  console.log("http://localhost:8080/api/health");
});
