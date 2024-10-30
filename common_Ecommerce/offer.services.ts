import { Types } from "mongoose";
import { productSearchableField } from "../product/product.interface";
import ProductModel from "../product/product.model";
import { IOfferInterface, offerSearchableField } from "./offer.interface";
import OfferModel from "./offer.model";

// Create A Offer
export const postOfferServices = async (
  data: IOfferInterface
): Promise<IOfferInterface | {}> => {
  const createOffer: IOfferInterface | {} = await OfferModel.create(data);
  return createOffer;
};

// Find Offer
export const findAllOfferServices = async (): Promise<
  IOfferInterface[] | []
> => {
  const today = new Date();
  const todayStr = today.toISOString().substring(0, 10);

  const findOffer: IOfferInterface[] | [] = await OfferModel.find({
    offer_status: "active",
    offer_start_date: { $lte: todayStr },
    offer_end_date: { $gte: todayStr },
  })
    .populate({
      path: "offer_products.offer_product_id",
      model: "products",
      populate: {
        path: "product_brand_id",
        model: "brands",
      },
    })
    .sort({ _id: -1 })
    .select("-__v");
  return findOffer;
};

// Find A Offer
export const findAOfferServices = async (
  _id: string
): Promise<IOfferInterface | {}> => {
  const findOffer: IOfferInterface | {} | any = await OfferModel.findOne({
    $and: [{ offer_status: "active" }, { _id: _id }],
  })
    .populate({
      path: "offer_products.offer_product_id",
      model: "products",
      populate: {
        path: "product_brand_id",
        model: "brands",
      },
    })
    .sort({ _id: -1 })
    .select("-__v");
  return findOffer;
};

// Find product for add offer
export const findProductToAddOfferServices = async (
  limit: number,
  skip: number,
  searchTerm: any,
  panel_owner_id: string
): Promise<any[] | null> => {
  const panelOwnerIdCondition = Types.ObjectId.isValid(panel_owner_id)
    ? { panel_owner_id: new Types.ObjectId(panel_owner_id) }
    : { panel_owner_id };

  const andCondition: any[] = [
    panelOwnerIdCondition,
    { product_status: "active" },
  ];

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

  const findProduct = await ProductModel.aggregate([
    { $match: { $and: andCondition } },
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "category_info",
      },
    },
    { $unwind: "$category_info" },
    {
      $lookup: {
        from: "subcategories",
        localField: "sub_category_id",
        foreignField: "_id",
        as: "subcategory_info",
      },
    },
    {
      $unwind: {
        path: "$subcategory_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "childcategories",
        localField: "child_category_id",
        foreignField: "_id",
        as: "childcategory_info",
      },
    },
    {
      $unwind: {
        path: "$childcategory_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "category_info.category_status": "active",
        $and: [
          {
            $or: [
              { "subcategory_info.sub_category_status": "active" },
              { subcategory_info: { $exists: false } },
            ],
          },
          {
            $or: [
              { "childcategory_info.child_category_status": "active" },
              { childcategory_info: { $exists: false } },
            ],
          },
        ],
      },
    },
    // Join with VariationModel if is_variation is true
    {
      $lookup: {
        from: "variations",
        let: { productId: "$_id", isVariation: "$is_variation" },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ["$product_id", "$$productId"] }, { $eq: ["$$isVariation", true] }] } } },
          // Populate each variation_data entry
          {
            $lookup: {
              from: "attributes",
              let: { attributeId: "$variation_data.variations_attribute_id" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$attributeId"] } } },
                { $project: { _id: 1, attribute_name: 1 } },
              ],
              as: "variation_attributes",
            },
          },
          // Populate each variation_attribute_value_id within attribute_values array
          {
            $lookup: {
              from: "attributes",
              let: { attributeValueIds: "$variation_data.variation_attribute_value_id" },
              pipeline: [
                { $unwind: "$attribute_values" },
                { $match: { $expr: { $in: ["$attribute_values._id", "$$attributeValueIds"] } } },
                { $project: { "attribute_values.attribute_value_name": 1, "attribute_values._id": 1 } },
              ],
              as: "variation_attribute_values",
            },
          },
        ],
        as: "variation_details",
      },
    },
    { $sort: { _id: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        __v: 0,
        "category_info.__v": 0,
        "subcategory_info.__v": 0,
        "variation_details.__v": 0,
        "variation_details.variation_data.variations_attribute_id": 0,
        "variation_details.variation_data.variation_attribute_value_id": 0,
      },
    },
  ]);

  return findProduct;
};

// find all dashboard offer
export const findAllDashboardOfferServices = async (
  limit: number,
  skip: number,
  searchTerm: any
): Promise<IOfferInterface[] | []> => {
  const andCondition = [];
  if (searchTerm) {
    andCondition.push({
      $or: offerSearchableField.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: "i",
        },
      })),
    });
  }
  const whereCondition = andCondition.length > 0 ? { $and: andCondition } : {};
  const findOffer: IOfferInterface[] | [] = await OfferModel.find(
    whereCondition
  )
    .populate({
      path: "offer_products.offer_product_id",
      model: "products",
      populate: {
        path: "product_brand_id",
        model: "brands",
      },
    })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v");
  return findOffer;
};

// Update a Offer
export const updateOfferServices = async (
  data: IOfferInterface,
  _id: string
): Promise<IOfferInterface | any> => {
  const updateOfferInfo: IOfferInterface | null = await OfferModel.findOne({
    _id: _id,
  });
  if (!updateOfferInfo) {
    return {};
  }
  const Offer = await OfferModel.updateOne({ _id: _id }, data, {
    runValidators: true,
  });
  return Offer;
};

// Delete a Offer
export const deleteOfferServices = async (
  _id: string
): Promise<IOfferInterface | any> => {
  const Offer = await OfferModel.deleteOne(
    { _id: _id },
    {
      runValidators: true,
    }
  );
  return Offer;
};
