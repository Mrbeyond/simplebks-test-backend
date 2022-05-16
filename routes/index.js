"use strict";

import Task from "./../controller/Task.js";
import app from "./../app.js";
import middleware from "./../middleware/auth.js";

const { authenticateToken }= middleware;
const { express } = app;
const router = express.Router();

router.post("/authenticate", Task.authenticate);
router.get("/order_items", authenticateToken, Task.getOrders);
router.get("/order_items/:id", authenticateToken, Task.getSingleOrder);
router.delete("/order_items/:id", authenticateToken, Task.deleteOrder);
router.put("/account", authenticateToken, Task.updateSeller);


export default router