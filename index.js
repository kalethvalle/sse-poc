import cors from "cors";
import express, { Router } from "express";

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

let sammTips = null;
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
      sammTips = null;
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
  res.status(200).json({ message: "finalizado" });
});

testReq.post("/verdi/sendMessage", async (req, res) => {
  const { context } = req.body;
  try {
    console.log("llego a verdi");
    const urlBot =
      "https://web.furycloud.io/api/proxy/verdi_flows/webhook-test/9c4f0ea5-bf8b-400a-a24e-d82a76b9ec0a";
    const response = await fetch(urlBot, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ context }), // Convertimos el objeto a JSON
    });
    res.status(200).json({ data: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "error enviando consulta LLM" });
  }
});

app.use("/api", healthRoute);
app.use("/api", pollingRoute);
app.use("/api", testReq);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 SSE endpoint: http://localhost:${PORT}/api/health`);
});
