// command দাও Terminal a:
// node generate-module.js category

const fs = require("fs");
const path = require("path");

const MODULES_DIR = path.join(__dirname, "app/modules");

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

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const capitalizedModule = capitalize(moduleName);

  // Files to generate
  const files = {
    model: `
import mongoose from 'mongoose';

const ${moduleName}Schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const ${capitalizedModule} = mongoose.model('${capitalizedModule}', ${moduleName}Schema);
    `,

    service: `
import { ${capitalizedModule} } from './${moduleName}.model';

const createIntoDb = async (data) => {
  const result = await ${capitalizedModule}.create(data);
  return result;
};

const getListFromDb = async () => {
  const result = await ${capitalizedModule}.find().sort({ createdAt: -1 });
  return result;
};

const getByIdFromDb = async (id) => {
  const result = await ${capitalizedModule}.findById(id);
  if (!result) throw new Error('${capitalizedModule} not found');
  return result;
};

const updateIntoDb = async (id, data) => {
  const result = await ${capitalizedModule}.findByIdAndUpdate(id, data, { new: true });
  return result;
};

const deleteItemFromDb = async (id) => {
  const result = await ${capitalizedModule}.findByIdAndDelete(id);
  return result;
};

export const ${moduleName}Service = {
  createIntoDb,
  getListFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteItemFromDb,
};
    `,

    controller: `
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ${moduleName}Service } from './${moduleName}.service';

const create${capitalizedModule} = catchAsync(async (req, res) => {
  const result = await ${moduleName}Service.createIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: '${capitalizedModule} created successfully',
    data: result,
  });
});

const get${capitalizedModule}List = catchAsync(async (req, res) => {
  const result = await ${moduleName}Service.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: '${capitalizedModule} list retrieved successfully',
    data: result,
  });
});

const get${capitalizedModule}ById = catchAsync(async (req, res) => {
  const result = await ${moduleName}Service.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: '${capitalizedModule} details retrieved successfully',
    data: result,
  });
});

const update${capitalizedModule} = catchAsync(async (req, res) => {
  const result = await ${moduleName}Service.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: '${capitalizedModule} updated successfully',
    data: result,
  });
});

const delete${capitalizedModule} = catchAsync(async (req, res) => {
  const result = await ${moduleName}Service.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: '${capitalizedModule} deleted successfully',
    data: result,
  });
});

export const ${moduleName}Controller = {
  create${capitalizedModule},
  get${capitalizedModule}List,
  get${capitalizedModule}ById,
  update${capitalizedModule},
  delete${capitalizedModule},
};
    `,

    validation: `
import Joi from 'joi';

const createSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
});

export const ${moduleName}Validation = {
  createSchema,
  updateSchema,
};
    `,

    routes: `
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ${moduleName}Controller } from './${moduleName}.controller';
import { ${moduleName}Validation } from './${moduleName}.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(${moduleName}Validation.createSchema),
  ${moduleName}Controller.create${capitalizedModule}
);

router.get('/', ${moduleName}Controller.get${capitalizedModule}List);

router.get('/:id', ${moduleName}Controller.get${capitalizedModule}ById);

router.put(
  '/:id',
  validateRequest(${moduleName}Validation.updateSchema),
  ${moduleName}Controller.update${capitalizedModule}
);

router.delete('/:id', ${moduleName}Controller.delete${capitalizedModule});

export const ${moduleName}Routes = router;
    `,
  };

  // Create files
  for (const [key, content] of Object.entries(files)) {
    const filePath = path.join(modulePath, `${moduleName}.${key}.ts`);
    fs.writeFileSync(filePath, content.trim());
    console.log(`Created: ${filePath}`);
  }

  console.log(`Module '${moduleName}' created successfully!`);
};

const [, , moduleName] = process.argv;
generateModule(moduleName);
