import cors from "cors";
import express, { Router } from "express";

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

let sammTips = {};
const healthRoute = Router();
healthRoute.get("/health", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const intervalId = setInterval(() => {
    if (sammTips) {
      res.write(`data: ${JSON.stringify(sammTips)}\n\n`);
    }
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

const testReq = Router();
testReq.post("/resVerdi", (req, res) => {
  console.log(req.body);
  sammTips = req.body;
});

app.use("/api", healthRoute);
app.use("/api", pollingRoute);
app.use("/api", testReq);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 SSE endpoint: http://localhost:${PORT}/api/health`);
});
