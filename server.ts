import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json());

  // Cashfree Credentials (should be in .env)
  const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "TEST10419273760494060879685160379401";
  const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "TEST986348421836647952613583279401";
  const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg"; // Use https://api.cashfree.com/pg for production

  // API Routes
  app.post("/api/cashfree/create-order", async (req, res) => {
    try {
      const { orderAmount, customerId, customerPhone, customerEmail, orderId } = req.body;

      const response = await axios.post(
        `${CASHFREE_BASE_URL}/orders`,
        {
          order_id: orderId || `order_${Date.now()}`,
          order_amount: orderAmount,
          order_currency: "INR",
          customer_details: {
            customer_id: customerId || "guest_user",
            customer_phone: customerPhone,
            customer_email: customerEmail || "customer@example.com",
          },
          order_meta: {
            return_url: `${req.headers.origin}/order-status?order_id={order_id}`,
          },
        },
        {
          headers: {
            "x-client-id": CASHFREE_APP_ID,
            "x-client-secret": CASHFREE_SECRET_KEY,
            "x-api-version": "2023-08-01",
            "Content-Type": "application/json",
          },
        }
      );

      res.json(response.data);
    } catch (error: any) {
      console.error("Cashfree Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || "Failed to create Cashfree order" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
