import express from "express";
import { FileUploadHelper } from "../../helpers/image.upload";
import { findADashboardProduct, findAllDashboardProduct, postProduct, updateProduct } from "./product.controllers";
import { verifyToken } from "../../middlewares/verify.token";
const router = express.Router();

router
  .route("/")
  .post(verifyToken, FileUploadHelper.ImageUpload.any(), postProduct)
  .patch(verifyToken, FileUploadHelper.ImageUpload.any(), updateProduct);

// get all dashboard product
router.route("/dashboard").get(verifyToken, findAllDashboardProduct);

// get a dashboard product
router.route("/dashboard/:_id").get(verifyToken, findADashboardProduct);

export const ProductRoutes = router;
