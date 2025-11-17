// terminal command: node generateModule.js moduleName

const fs = require("fs");
const path = require("path");

const MODULES_DIR = path.join(__dirname, "app/website");

const generateModule = (moduleName) => {
  if (!moduleName) {
    console.error("Please provide a module name!");
    process.exit(1);
  }

  const modulePath = path.join(MODULES_DIR, moduleName);

  if (fs.existsSync(modulePath)) {
    console.error(`Module '${moduleName}' already exists!`);
    process.exit(1);
  }

  fs.mkdirSync(modulePath, { recursive: true });

  const Cap = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const C = Cap(moduleName);

  // -----------------------------
  // FILE CONTENTS
  // -----------------------------
  const files = {
    // ========== MODEL ==========
    model: `
import { Schema, model } from "mongoose";
import { I${C} } from "./${moduleName}.interface";

const ${moduleName}Schema = new Schema<I${C}>(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const ${C}Model = model<I${C}>("${moduleName}s", ${moduleName}Schema);
export default ${C}Model;
    `,

    // ========== INTERFACE ==========
    interface: `
export interface I${C} {
  _id?: string;
  name: string;
}

export const ${moduleName}SearchableFields = ["name"];
    `,

    // ========== SERVICE ==========
    service: `
import ${C}Model from "./${moduleName}.model";
import { I${C}, ${moduleName}SearchableFields } from "./${moduleName}.interface";

// Create
export const post${C}Service = async (data: I${C}) => {
  return await ${C}Model.create(data);
};

// Dashboard list with pagination + search
export const findDashboard${C}Service = async (limit: number, skip: number, searchTerm: any) => {
  const andCondition = [];
  if (searchTerm) {
    andCondition.push({
      $or: ${moduleName}SearchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" }
      }))
    });
  }
  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
  return ${C}Model.find(whereCondition)
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");
};

// All list
export const findAll${C}Service = async () => {
  return ${C}Model.find().sort({ _id: -1 }).select("-__v");
};

// Single
export const findSingle${C}Service = async (id: string) => {
  return ${C}Model.findById(id);
};

// Update
export const update${C}Service = async (data: I${C}, id: string) => {
  return ${C}Model.updateOne({ _id: id }, data, { runValidators: true });
};

// Delete
export const delete${C}Service = async (id: string) => {
  return ${C}Model.deleteOne({ _id: id });
};
    `,

    // ========== CONTROLLER ==========
    controller: `
import { RequestHandler } from "express";
import { NextFunction, Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import * as fs from "fs";

import {
  post${C}Service,
  findDashboard${C}Service,
  findAll${C}Service,
  findSingle${C}Service,
  update${C}Service,
  delete${C}Service
} from "./${moduleName}.service";
import { I${C} } from "./${moduleName}.interface";
import ${C}Model from "./${moduleName}.model";
import { FileUploadHelper } from "../../../helpers/image.upload";

// Create
export const post${C}: RequestHandler = async (req, res, next) => {
  try {
    const result = await post${C}Service(req.body);
    if (!result) throw new ApiError(400, "${C} Add Failed!");
    return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "${C} Added Successfully!" });
  } catch (error) { next(error); }
};

// Add Image
export const post${C}Image: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.files && "anik_image" in req.files && req.body) {
      const requestData = req.body;
      const findValid: any = await ${C}Model.exists({ name: requestData?.name });
      if (findValid) { fs.unlinkSync(req.files.anik_image[0].path); throw new ApiError(400, "${C} Name Previously Added !"); }

      let image, image_key;
      const AnikImage = req.files["anik_image"][0];
      const uploadRes = await FileUploadHelper.uploadToSpaces(AnikImage);
      image = uploadRes?.Location;
      image_key = uploadRes?.Key;

      const data = { ...requestData, anik_image: image, anik_image_key: image_key };
      const result: I${C} | {} = await post${C}Service(data);
      if (result) return sendResponse<I${C}>(res, { statusCode: httpStatus.OK, success: true, message: "${C} Added Successfully !" });
      else throw new ApiError(400, "${C} Add Failed !");
    } else throw new ApiError(400, "Image Upload Failed");
  } catch (error) { next(error); }
};

// Dashboard list
export const getDashboard${C}: RequestHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, searchTerm } = req.query;
    const p = Number(page), l = Number(limit), skip = (p-1)*l;
    const result = await findDashboard${C}Service(l, skip, searchTerm);
    return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "${C} Found Successfully!", data: result });
  } catch(error) { next(error); }
};

// All list
export const getAll${C}: RequestHandler = async (req, res, next) => {
  try {
    const result = await findAll${C}Service();
    return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "${C} Found Successfully!", data: result });
  } catch(error) { next(error); }
};

// Single
export const getSingle${C}: RequestHandler = async (req, res, next) => {
  try {
    const result = await findSingle${C}Service(req.params.id);
    return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "${C} Retrieved Successfully!", data: result });
  } catch(error) { next(error); }
};

// Update
export const update${C}: RequestHandler = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await update${C}Service(data, data?._id);
    if (result?.modifiedCount > 0) return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "${C} Updated Successfully!" });
    else throw new ApiError(400, "${C} Update Failed!");
  } catch(error) { next(error); }
};

// Delete
export const delete${C}: RequestHandler = async (req, res, next) => {
  try {
    const result = await delete${C}Service(req.body._id);
    if(result?.deletedCount > 0) return sendResponse(res, { statusCode: httpStatus.OK, success: true, message: "${C} Deleted Successfully!" });
    else throw new ApiError(400, "${C} Delete Failed!");
  } catch(error) { next(error); }
};
    `,

    // ========== ZOD VALIDATION ==========
    validation: `
import { z } from "zod";

const create${C}Zod = z.object({
  body: z.object({ name: z.string().min(1, "Name is required") })
});

const update${C}Zod = z.object({
  body: z.object({
    _id: z.string().min(1),
    name: z.string().optional()
  })
});

export const ${moduleName}Validations = { create${C}Zod, update${C}Zod };
    `,

    // ========== ROUTES ==========
    routes: `
import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import { verifyToken } from "../../../middlewares/verify.token";
import { FileUploadHelper } from "../../../helpers/image.upload";

import {
  post${C},
  getDashboard${C},
  getAll${C},
  getSingle${C},
  update${C},
  delete${C},
  post${C}Image
} from "./${moduleName}.controller";

import { ${moduleName}Validations } from "./${moduleName}.validation";

const router = express.Router();

router.route("/")
  .get(getAll${C})
  .post(post${C})
  .patch(update${C})
  .delete(delete${C});

router.route("/dashboard")
  .get(verifyToken("${moduleName}_show"), getDashboard${C})
  .post(
    verifyToken("${moduleName}_post"),
    FileUploadHelper.ImageUpload.fields([{ name: "${moduleName}_image", maxCount: 1 }]),
    validateRequest(${moduleName}Validations.create${C}Zod),
    post${C}Image
  );

router.route("/:id").get(getSingle${C});

export const ${C}Routes = router;
    `,
  };

  // Write files
  Object.entries(files).forEach(([key, content]) => {
    const filePath = path.join(modulePath, `${moduleName}.${key}.ts`);
    fs.writeFileSync(filePath, content.trim());
    console.log(`Created: ${filePath}`);
  });

  console.log(`Module '${moduleName}' created successfully!`);
};

const [, , moduleName] = process.argv;
generateModule(moduleName);
