import { Schema, model } from "mongoose";
import { IProductInterface } from "./product.interface";

// Product Schema
const productSchema = new Schema<IProductInterface>(
  {
    product_name: {
      required: true,
      type: String,
    },
    product_slug: {
      required: true,
      type: String,
      unique: true,
    },
    product_sku: {
      type: String,
    },
    product_status: {
      required: true,
      type: String,
      enum: ["active", "in-active"],
      default: "active",
    },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    sub_category_id: {
      type: Schema.Types.ObjectId,
      ref: "subcategories",
    },
    child_category_id: {
      type: Schema.Types.ObjectId,
      ref: "childcategories",
    },
    brand_id: {
      type: Schema.Types.ObjectId,
      ref: "brands",
    },
    specifications: [
      {
        specification_id: {
          type: Schema.Types.ObjectId,
          ref: "specifications",
        },
        specification_values: [
          {
            specification_value_id: {
              type: Schema.Types.ObjectId,
              ref: "specifications",
            },
          },
        ],
      },
    ],
    barcode: {
      type: String,
    },
    barcode_image: {
      type: String,
    },
    description: {
      type: String,
    },
    main_image: {
      type: String,
      required: true, // Assuming main image is required
    },
    main_image_key: {
      type: String,
    },
    other_images: [
      {
        other_image: {
          type: String,
        },
        other_image_key: {
          type: String,
        },
      },
    ],
    product_price: {
      type: Number,
    },
    product_buying_price: {
      type: Number,
    },
    product_discount_price: {
      type: Number,
    },
    product_quantity: {
      type: Number,
    },
    product_alert_quantity: {
      type: Number,
    },
    product_reseller_price: {
      type: Number,
    },
    product_wholeseller_price: {
      type: Number,
    },
    product_wholeseller_min_quantity: {
      type: Number,
    },
    product_upcomming: {
      type: Boolean,
      default: false, // Default value can be added
    },
    is_variation: {
      type: Boolean,
      default: false, // Default value can be added
    },
    hot_deal: {
      type: Boolean,
      default: false, // Default value can be added
    },
    cash_on_delivery: {
      type: Boolean,
      default: false, // Default value can be added
    },
    free_shipping: {
      type: Boolean,
      default: false, // Default value can be added
    },
    delivery_cost: {
      type: Number,
    },
    delivery_cost_multiply: {
      type: Boolean,
      default: false, // Default value can be added
    },
    shipping_days: {
      type: Number,
    },
    product_warrenty: {
      type: String,
    },
    weight: {
      type: String,
    },
    length: {
      type: String,
    },
    height: {
      type: String,
    },
    width: {
      type: String,
    },
    unit: {
      type: String,
    },
    meta_title: {
      type: String,
    },
    meta_description: {
      type: String,
    },
    meta_keywords: [
      {
        keyword: {
          type: String,
        },
      },
    ],
    product_publisher_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    product_updated_by: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    product_by: {
      type: String,
      enum: ["admin", "seller"],
      required: true,
    },
    panel_owner_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    product_submit_status:{
      type: String,
      default: "pending",
    }
  },
  {
    timestamps: true,
  }
);

const ProductModel = model<IProductInterface>("products", productSchema);

export default ProductModel;
