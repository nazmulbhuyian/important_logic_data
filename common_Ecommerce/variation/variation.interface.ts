import { Types } from "mongoose";
import { attributeValuesArray, IAttributeInterface } from "../attribute/attribute.interface";
import { IProductInterface } from "../product/product.interface";

export interface variationDataArray {
    variations_attribute_id: Types.ObjectId | IAttributeInterface;
    variation_attribute_value_id: Types.ObjectId | attributeValuesArray;
}

export interface IVariationInterface {
  _id?: any;
  variation_data: variationDataArray[];
  product_id: Types.ObjectId | IProductInterface;
  variation_price: number;
  variation_discount_price?: number;
  variation_buying_price?: number;
  variation_quantity: number;
  variation_alert_quantity?: number;
  variation_reseller_price?: number;
  variation_wholeseller_price?: number;
  variation_wholeseller_min_quantity?: number;
  variation_barcode?: string;
  variation_barcode_image?: string;
  variation_image?: string;
  variation_image_key?: string;
  variation_sku?: string;
}
