import ApiError from "../../errors/ApiError";
import VariationModel from "../variation/variation.model";
import { IProductInterface, productSearchableField } from "./product.interface";
import ProductModel from "./product.model";

// Create A Product
export const postProductServices = async (
  data: IProductInterface
): Promise<IProductInterface | {}> => {
  const createProduct: IProductInterface | {} = await ProductModel.create(data);
  return createProduct;
};

// update A Product
export const updateProductServices = async (
  _id: any,
  data: IProductInterface
): Promise<IProductInterface | {}> => {
  const updateFindProduct: IProductInterface | {} | any =
    await ProductModel.findOne({
      _id,
    });
  if (!updateFindProduct) {
    throw new Error("Product not found");
  }
  // আপডেট করার ডেটা তৈরি করা হচ্ছে
  const updateData: any = { ...data };

  // যদি `sub_category_id` পাঠানো না হয়, তাহলে সেটি ডিলিট করা হবে
  const unsetData: any = {};
  if (!data.hasOwnProperty("sub_category_id")) {
    unsetData.sub_category_id = "";
  }
  if (!data.hasOwnProperty("child_category_id")) {
    unsetData.child_category_id = "";
  }
  if (!data.hasOwnProperty("brand_id")) {
    unsetData.brand_id = "";
  }

  const updateProduct = await ProductModel.updateOne(
    { _id: _id },
    {
      $set: updateData, // পাঠানো ফিল্ড আপডেট করা
      $unset: unsetData, // পাঠানো না হলে ফিল্ডগুলো মুছে ফেলা
    },
    { runValidators: true }
  );

  return updateProduct;
};

// Find all dashboard Product
export const findAllDashboardProductServices = async (
  limit: number,
  skip: number,
  searchTerm: any
): Promise<any> => {
  const andCondition = [];
  if (searchTerm) {
    andCondition.push({
      $or: productSearchableField.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }

  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};

  // Step 1: Find products with basic population
  const products = await ProductModel.find(whereCondition)
    .populate([
      { path: "category_id" },
      { path: "sub_category_id" },
      { path: "child_category_id" },
      { path: "brand_id" },
      { path: "product_publisher_id" },
      { path: "panel_owner_id" },
      { path: "product_updated_by" },
      { path: "specifications.specification_id", model: "specifications" },
    ])
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v")
    .lean(); // Return plain JavaScript objects for easier processing

  // Step 2: For each product, conditionally fetch variations if is_variation is true
  const productsWithVariations = await Promise.all(
    products.map(async (product) => {
      // Only fetch variations if is_variation is true
      if (product?.is_variation) {
        const variations = await VariationModel.find({
          product_id: product?._id,
        })
          .populate([
            {
              path: "variation_data.variations_attribute_id",
              model: "attributes", // Adjust to match the correct model name
            },
          ])
          .select("-__v")
          .lean();

        // Add variations to the product object
        return { ...product, variations };
      } else {
        // Return the product as is without variations
        return { ...product, variations: [] };
      }
    })
  );

  return productsWithVariations;
};

// Find a dashboard Product
export const findADashboardProductServices = async (
  _id: string
): Promise<any | null> => {
  // Step 1: Find the product by its ID and populate related fields
  const findProduct = await ProductModel.findOne({ _id })
    .populate([
      { path: "category_id" },
      { path: "sub_category_id" },
      { path: "child_category_id" },
      { path: "brand_id" },
      { path: "product_publisher_id" },
      { path: "panel_owner_id" },
      { path: "product_updated_by" },
      {
        path: "specifications.specification_id",
        model: "specifications",
      },
    ])
    .select("-__v")
    .lean(); // Use .lean() to return a plain JavaScript object

  if (!findProduct) {
    throw new ApiError(404, "Product Not Found !");
  }
  if (findProduct?.is_variation) {
    // Step 2: Find variations related to the product and populate attributes
    const variations = await VariationModel.find({ product_id: _id })
      .populate([
        {
          path: "variation_data.variations_attribute_id",
          model: "attributes", // Adjust to match your attributes model name
        },
      ])
      .select("-__v")
      .lean();

    // Step 3: Combine product data with variations
    return { ...findProduct, variations };
  }
  return { ...findProduct };
};
