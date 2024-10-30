import { Schema, model } from "mongoose";
import { IVariationInterface } from "./variation.interface";

// Variation Schema
const variationSchema = new Schema<IVariationInterface>(
  {
    variation_data: [
      {
        variations_attribute_id: {
          type: Schema.Types.ObjectId,
          ref: "attributes", // Ensure this references the correct model
          required: true,
        },
        variation_attribute_value_id: {
          type: Schema.Types.ObjectId,
          ref: "attributes", // Ensure this references the correct model
          required: true,
        },
      },
    ],
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "products", // Ensure this references the correct model
      required: true,
    },
    variation_price: {
      type: Number,
      required: true,
    },
    variation_discount_price: {
      type: Number,
    },
    variation_buying_price: {
      type: Number,
    },
    variation_quantity: {
      type: Number,
      required: true,
    },
    variation_alert_quantity: {
      type: Number,
    },
    variation_reseller_price: {
      type: Number,
    },
    variation_wholeseller_price: {
      type: Number,
    },
    variation_wholeseller_min_quantity: {
      type: Number,
    },
    variation_barcode: {
      type: String,
    },
    variation_barcode_image: {
      type: String,
    },
    variation_image: {
      type: String,
    },
    variation_image_key: {
      type: String,
    },
    variation_sku: {
      type: String
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const VariationModel = model<IVariationInterface>("variations", variationSchema);

export default VariationModel;
