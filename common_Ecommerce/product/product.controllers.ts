import {
  NextFunction,
  request,
  Request,
  RequestHandler,
  Response,
} from "express";
import { FileUploadHelper } from "../../helpers/image.upload";
import sendResponse from "../../shared/sendResponse";
import ApiError from "../../errors/ApiError";
import ProductModel from "./product.model";
import { IProductInterface } from "./product.interface";
import {
  findADashboardProductServices,
  findAllDashboardProductServices,
  postProductServices,
  updateProductServices,
} from "./product.services";
import QRCode from "qrcode";
import VariationModel from "../variation/variation.model";
import { IVariationInterface } from "../variation/variation.interface";
import httpStatus from "http-status";
import { Types } from "mongoose";

const generateQRCode = async () => {
  let isUnique = false;
  let uniqueBarcode;

  while (!isUnique) {
    // Generate a random alphanumeric string of length 8
    uniqueBarcode = Array.from({ length: 8 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
        Math.floor(Math.random() * 62)
      )
    ).join("");

    // Check if the generated barcode is unique in the database
    const existingOrder = await ProductModel.findOne({
      barcode: uniqueBarcode,
    });

    // If no existing order found, mark the barcode as unique
    if (!existingOrder) {
      isUnique = true;
    }
  }

  return uniqueBarcode;
};

// Helper function to generate a random string
function generateRandomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Function to generate a unique slug
async function generateUniqueSlug(productName: string): Promise<string> {
  const sanitizedProductName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let uniqueSlug = `${sanitizedProductName}-${generateRandomString(5)}`;
  let slugExists = await ProductModel.findOne({ product_slug: uniqueSlug });

  while (slugExists) {
    uniqueSlug = `${sanitizedProductName}-${generateRandomString(5)}`;
    slugExists = await ProductModel.findOne({ product_slug: uniqueSlug });
  }

  return uniqueSlug;
}

// Post multiple images with product data
export const postProduct: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.files || req.body) {
      const requestData = req.body;

      const files = req.files as Express.Multer.File[];

      // Array to store main_image data
      let main_image;
      let main_image_key;

      // Handle main image
      const mainImage = files.find((file) => file.fieldname === "main_image");
      if (mainImage) {
        const main_image_upload = await FileUploadHelper.uploadToSpaces(
          mainImage
        );
        main_image = main_image_upload?.Location;
        main_image_key = main_image_upload?.Key;
      } else {
        console.log("Main image file is not available.");
      }

      // Array to store other_images URLs and keys
      const other_images = [];

      // Handle other_images
      const otherImageFiles = files.filter((file) =>
        file.fieldname.startsWith("other_images")
      );
      for (const file of otherImageFiles) {
        const imageUpload = await FileUploadHelper.uploadToSpaces(file);
        other_images.push({
          other_image: imageUpload.Location,
          other_image_key: imageUpload.Key,
        });
      }

      // Generate a unique slug for the product
      const product_slug = await generateUniqueSlug(requestData.product_name);
      requestData.product_slug = product_slug;
      requestData.is_variation = requestData.showProductVariation;

      let barcode: any;

      if (requestData.showProductVariation == "false") {
        barcode = await generateQRCode();
        requestData.barcode = barcode;
        requestData.barcode_image = await QRCode.toDataURL(barcode);
      }

      // Create product object
      const productData: IProductInterface = {
        product_name: requestData.product_name,
        product_slug: requestData.product_slug,
        product_sku: requestData.product_sku,
        product_status: requestData.product_status as "active" | "in-active",
        category_id: requestData.category_id,
        sub_category_id: requestData.sub_category_id
          ? requestData.sub_category_id
          : undefined,
        child_category_id: requestData.child_category_id
          ? requestData.child_category_id
          : undefined,
        brand_id: requestData.brand_id ? requestData.brand_id : undefined,
        specifications:
          requestData.specifications?.map(
            (spec: { specification_id: any; specification_values: any }) => ({
              specification_id: spec.specification_id,
              specification_values:
                spec.specification_values?.map(
                  (value: { specification_value_id: any }) => ({
                    specification_value_id: value.specification_value_id
                      ? value.specification_value_id
                      : undefined,
                  })
                ) ?? [],
            })
          ) ?? [],
        barcode: requestData.barcode ?? "",
        barcode_image: requestData.barcode_image ?? "",
        description: requestData.description ?? "",
        main_image: main_image as string,
        main_image_key: main_image_key,
        other_images: other_images ?? [],
        product_price:
          requestData.product_price && parseFloat(requestData.product_price),
        product_buying_price:
          requestData.product_buying_price &&
          parseFloat(requestData.product_buying_price),
        product_discount_price:
          requestData.product_discount_price &&
          parseFloat(requestData.product_discount_price),
        product_quantity:
          requestData.product_quantity &&
          parseInt(requestData.product_quantity),
        product_alert_quantity:
          requestData.product_alert_quantity &&
          parseInt(requestData.product_alert_quantity),
        product_reseller_price:
          requestData.product_reseller_price &&
          parseFloat(requestData.product_reseller_price),
        product_wholeseller_price:
          requestData.product_wholeseller_price &&
          parseFloat(requestData.product_wholeseller_price),
        product_wholeseller_min_quantity:
          requestData.product_wholeseller_min_quantity &&
          parseInt(requestData.product_wholeseller_min_quantity),
        product_upcomming: requestData.product_upcomming === "true",
        is_variation: requestData.is_variation === "true",
        hot_deal: requestData.hot_deal === "true",
        cash_on_delivery: requestData.cash_on_delivery === "true",
        free_shipping: requestData.free_shipping === "true",
        delivery_cost:
          requestData.delivery_cost && parseFloat(requestData.delivery_cost),
        delivery_cost_multiply: requestData.delivery_cost_multiply === "true",
        shipping_days:
          requestData.shipping_days && parseInt(requestData.shipping_days),
        product_warrenty: requestData.product_warrenty ?? "",
        weight: requestData.weight ?? "",
        length: requestData.length ?? "",
        height: requestData.height ?? "",
        width: requestData.width ?? "",
        unit: requestData.unit ?? "",
        meta_title: requestData.meta_title ?? "",
        meta_description: requestData.meta_description ?? "",
        meta_keywords:
          typeof requestData.meta_keywords === "string"
            ? JSON.parse(requestData.meta_keywords)
            : requestData.meta_keywords || [],
        product_publisher_id: requestData.product_publisher_id,
        product_by: requestData.product_by as "admin" | "seller",
        panel_owner_id: requestData.panel_owner_id,
      };
      // console.log(JSON.stringify(productData, null, 2));

      // Save product in the database
      const newProduct: any = await postProductServices(productData);

      if (requestData.showProductVariation == "true") {
        const variation_details = req.body.variation_details;
        // Process variation_details images
        const updatedVariation_details = [];
        for (let index = 0; index < variation_details.length; index++) {
          let product = variation_details[index];
          product.product_id = newProduct?._id.toString();
          const matchingFiles = files.filter(
            (file) =>
              file.fieldname === `variation_details[${index}][variation_image]`
          );

          for (const file of matchingFiles) {
            let v_barcode: any;
            const imageUpload = await FileUploadHelper.uploadToSpaces(file);
            product.variation_image = imageUpload.Location;
            product.variation_image_key = imageUpload.Key;
            v_barcode = await generateQRCode();
            product.variation_barcode = v_barcode;
            product.variation_barcode_image = await QRCode.toDataURL(
              product.variation_barcode
            );
          }

          updatedVariation_details.push(product);
        }

        const successVariationUpload: any = [];
        // Loop through each state in the array
        for (const variationDetails of updatedVariation_details) {
          // Parse `variation_data` to ensure it's an array of objects
          if (typeof variationDetails.variation_data === "string") {
            variationDetails.variation_data = JSON.parse(
              variationDetails.variation_data
            );
          }
          // Call the service to save the state with merged data
          const result: IVariationInterface | {} = await VariationModel.create(
            variationDetails
          );

          if (result) {
            successVariationUpload.push(result);
          }
        }
        if (successVariationUpload.length > 0) {
          return sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Product created successfully!",
          });
        }
      }

      return sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product created successfully!",
      });
    } else {
      throw new ApiError(400, "Image Upload Failed");
    }
  } catch (error) {
    next(error);
  }
};

// update product data
export const updateProduct: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.files || req.body) {
      const requestData = req.body;

      const files = req.files as Express.Multer.File[];

      // Array to store main_image data
      let main_image;
      let main_image_key;

      // Handle main image
      const mainImage = files.find((file) => file.fieldname === "main_image");
      if (mainImage) {
        const main_image_upload = await FileUploadHelper.uploadToSpaces(
          mainImage
        );
        main_image = main_image_upload?.Location;
        main_image_key = main_image_upload?.Key;
      } else {
        main_image = requestData?.main_image;
        main_image_key = requestData?.main_image_key;
      }

      // Array to store other_images URLs and keys
      const other_images = [];

      // Handle other_images
      const otherImageFiles = files.filter((file) =>
        file.fieldname.startsWith("other_images")
      );
      for (const file of otherImageFiles) {
        const imageUpload = await FileUploadHelper.uploadToSpaces(file);
        other_images.push({
          other_image: imageUpload.Location,
          other_image_key: imageUpload.Key,
        });
      }

      if (requestData?.other_default_images) {
        // Assuming requestData?.other_default_images is defined as shown
        const otherImages = requestData?.other_default_images;

        // Combine `other_image` and `other_image_key` into objects, filtering out `undefined` values
        const formattedImages = otherImages.other_image
          .map((image: any, index: any) => {
            const key = otherImages.other_image_key[index];
            // Skip if either `image` or `key` is `undefined`
            if (image === "undefined" || key === "undefined") return null;

            return { other_image: image, other_image_key: key };
          })
          .filter(Boolean); // Remove any null values from the array
        other_images.push(...formattedImages);
      }

      // Generate a unique slug for the product
      const product_slug = await generateUniqueSlug(requestData.product_name);
      requestData.product_slug = product_slug;
      requestData.is_variation = requestData.is_variation;

      // Create product object
      const productData: any = {
        product_name: requestData.product_name,
        product_slug: requestData.product_slug,
        product_sku: requestData.product_sku,
        product_status: requestData.product_status as "active" | "in-active",
        category_id: requestData.category_id,
        sub_category_id: requestData.sub_category_id
          ? requestData.sub_category_id
          : undefined,
        child_category_id: requestData.child_category_id
          ? requestData.child_category_id
          : undefined,
        brand_id: requestData.brand_id ? requestData.brand_id : undefined,
        specifications:
          requestData.specifications?.map(
            (spec: { specification_id: any; specification_values: any }) => ({
              specification_id: spec.specification_id,
              specification_values:
                spec.specification_values?.map(
                  (value: { specification_value_id: any }) => ({
                    specification_value_id: value.specification_value_id
                      ? value.specification_value_id
                      : undefined,
                  })
                ) ?? [],
            })
          ) ?? [],
        description: requestData.description ?? "",
        main_image: main_image as string,
        main_image_key: main_image_key,
        other_images: other_images ?? [],
        product_price:
          requestData.product_price && parseFloat(requestData.product_price),
        product_buying_price:
          requestData.product_buying_price &&
          parseFloat(requestData.product_buying_price),
        product_discount_price:
          requestData.product_discount_price &&
          parseFloat(requestData.product_discount_price),
        product_quantity:
          requestData.product_quantity &&
          parseInt(requestData.product_quantity),
        product_alert_quantity:
          requestData.product_alert_quantity &&
          parseInt(requestData.product_alert_quantity),
        product_reseller_price:
          requestData.product_reseller_price &&
          parseFloat(requestData.product_reseller_price),
        product_wholeseller_price:
          requestData.product_wholeseller_price &&
          parseFloat(requestData.product_wholeseller_price),
        product_wholeseller_min_quantity:
          requestData.product_wholeseller_min_quantity &&
          parseInt(requestData.product_wholeseller_min_quantity),
        product_upcomming: requestData.product_upcomming === "true",
        is_variation: requestData.is_variation === "true",
        hot_deal: requestData.hot_deal === "true",
        cash_on_delivery: requestData.cash_on_delivery === "true",
        free_shipping: requestData.free_shipping === "true",
        delivery_cost:
          requestData.delivery_cost && parseFloat(requestData.delivery_cost),
        delivery_cost_multiply: requestData.delivery_cost_multiply === "true",
        shipping_days:
          requestData.shipping_days && parseInt(requestData.shipping_days),
        product_warrenty: requestData.product_warrenty ?? "",
        weight: requestData.weight ?? "",
        length: requestData.length ?? "",
        height: requestData.height ?? "",
        width: requestData.width ?? "",
        unit: requestData.unit ?? "",
        meta_title: requestData.meta_title ?? "",
        meta_description: requestData.meta_description ?? "",
        meta_keywords:
          typeof requestData.meta_keywords === "string"
            ? JSON.parse(requestData.meta_keywords)
            : requestData.meta_keywords || [],
        product_updated_by: requestData.product_updated_by,
        _id: requestData?._id,
      };

      // console.log(JSON.stringify(productData, null, 2));
      // console.log(JSON.stringify(requestData, null, 2));

      // Save product in the database
      const newProduct: any = await updateProductServices(
        requestData?._id,
        productData
      );

      // if (
      //   requestData.is_variation == "true" &&
      //   requestData?.againAddNewVariation == "true"
      // ) {
      //   await VariationModel.deleteMany({ product_id: requestData?._id });
      //   const variation_details = req.body.variation_details;
      //   const updatedVariation_details = [];
      //   for (let index = 0; index < variation_details.length; index++) {
      //     let product = variation_details[index];
      //     product.product_id = requestData?._id;
      //     const matchingFiles = files.filter(
      //       (file) =>
      //         file.fieldname === `variation_details[${index}][variation_image]`
      //     );

      //     for (const file of matchingFiles) {
      //       let v_barcode: any;
      //       const imageUpload = await FileUploadHelper.uploadToSpaces(file);
      //       product.variation_image = imageUpload.Location;
      //       product.variation_image_key = imageUpload.Key;
      //       v_barcode = await generateQRCode();
      //       product.variation_barcode = v_barcode;
      //       product.variation_barcode_image = await QRCode.toDataURL(
      //         product.variation_barcode
      //       );
      //     }

      //     updatedVariation_details.push(product);
      //   }

      //   const successVariationUpload: any = [];
      //   // Loop through each state in the array
      //   for (const variationDetails of updatedVariation_details) {
      //     // Parse `variation_data` to ensure it's an array of objects
      //     if (typeof variationDetails.variation_data === "string") {
      //       variationDetails.variation_data = JSON.parse(
      //         variationDetails.variation_data
      //       );
      //     }
      //     if(variationDetails?._id){
      //       delete variationDetails._id
      //     }
      //     // Call the service to save the state with merged data
      //     const result: IVariationInterface | {} = await VariationModel.create(
      //       variationDetails
      //     );

      //     if (result) {
      //       successVariationUpload.push(result);
      //     }
      //   }
      //   if (successVariationUpload.length > 0) {
      //     return sendResponse(res, {
      //       statusCode: 200,
      //       success: true,
      //       message: "Product created successfully!",
      //     });
      //   }
      // }
      //  else
      if (newProduct) {
        if (
          requestData.is_variation == "true" &&
          requestData?.againAddNewVariation == "false"
        ) {
          const variation_details = req.body.variation_details;
          const updatedVariation_details = [];
          for (let index = 0; index < variation_details.length; index++) {
            let product = variation_details[index];
            product.product_id = requestData?._id;
            const matchingFiles = files.filter(
              (file) =>
                file.fieldname ===
                `variation_details[${index}][variation_image]`
            );

            for (const file of matchingFiles) {
              const imageUpload = await FileUploadHelper.uploadToSpaces(file);
              product.variation_image = imageUpload.Location;
              product.variation_image_key = imageUpload.Key;
            }

            updatedVariation_details.push(product);
          }

          const successVariationUpload: any = [];
          // Loop through each state in the array
          for (const variationDetails of updatedVariation_details) {
            // Parse `variation_data` to ensure it's an array of objects
            if (typeof variationDetails.variation_data === "string") {
              variationDetails.variation_data = JSON.parse(
                variationDetails.variation_data
              );
            }
            // Call the service to save the state with merged data
            const result: IVariationInterface | {} | any =
              await VariationModel.updateOne(
                { _id: variationDetails._id },
                variationDetails,
                { runValidators: true }
              );

            if (result) {
              successVariationUpload.push(result);
            }
          }
          if (successVariationUpload.length > 0) {
            return sendResponse(res, {
              statusCode: 200,
              success: true,
              message: "Product created successfully!",
            });
          }
        }

        return sendResponse(res, {
          statusCode: 200,
          success: true,
          message: "Product created successfully!",
        });
      }
    } else {
      throw new ApiError(400, "Image Upload Failed");
    }
  } catch (error) {
    next(error);
  }
};

// Find All dashboard Product
export const findAllDashboardProduct: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<IProductInterface | any> => {
  try {
    const { page = 1, limit = 10, searchTerm } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;
    const result: IProductInterface[] | any =
      await findAllDashboardProductServices(limitNumber, skip, searchTerm);
    const total = await ProductModel.countDocuments();
    return sendResponse<IProductInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product Found Successfully !",
      data: result,
      totalData: total,
    });
  } catch (error: any) {
    next(error);
  }
};

// Find A dashboard Product
export const findADashboardProduct: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<IProductInterface | any> => {
  try {
    const _id = req.params._id;
    const result: IProductInterface[] | any =
      await findADashboardProductServices(_id);
    const total = await ProductModel.countDocuments();
    return sendResponse<IProductInterface>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Product Found Successfully !",
      data: result,
      totalData: total,
    });
  } catch (error: any) {
    next(error);
  }
};
