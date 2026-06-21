import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "../controllers/product.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/", createProduct);

router.post("/upload", upload.single("file"), uploadProductImage);

router.get("/", getProducts);

router.get("/:id", getProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

export default router;
