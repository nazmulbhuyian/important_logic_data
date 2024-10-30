import { Types } from "mongoose";
import { ICategoryInterface } from "../category/category.interface";
import { ISubCategoryInterface } from "../sub_category/sub_category.interface";
import { IChildCategoryInterface } from "../child_category/child_category.interface";
import { IBrandInterface } from "../brand/brand.interface";
import {
  ISpecificationInterface,
  specificationValuesArray,
} from "../specification/specification.interface";
import { IUserInterface } from "../userReg/user.interface";

interface specification_valuesArray {
  specification_value_id?: Types.ObjectId | specificationValuesArray;
}

export interface specificationsArray {
  specification_id?: Types.ObjectId | ISpecificationInterface;
  specification_values?: specification_valuesArray[];
}

export interface otherimagesArray {
  other_image?: string;
  other_image_key?: string;
}

export interface metakeywordssArray {
  keyword?: string;
}

export interface IProductInterface {
  _id?: any;
  product_name: string;
  product_slug: string;
  product_sku?: string;
  product_status: "active" | "in-active";
  category_id: Types.ObjectId | ICategoryInterface;
  sub_category_id?: Types.ObjectId | ISubCategoryInterface;
  child_category_id?: Types.ObjectId | IChildCategoryInterface;
  brand_id?: Types.ObjectId | IBrandInterface;
  specifications?: specificationsArray[];
  barcode?: string;
  barcode_image?: string;
  description: string;
  main_image: string;
  main_image_key?: string;
  other_images?: otherimagesArray[];
  product_price?: number;
  product_buying_price?: number;
  product_discount_price?: number;
  product_quantity?: number;
  product_alert_quantity?: number;
  product_reseller_price?: number;
  product_wholeseller_price?: number;
  product_wholeseller_min_quantity?: number;
  product_upcomming?: true | false;
  is_variation?: true | false;
  hot_deal?: true | false;
  cash_on_delivery?: true | false;
  free_shipping?: true | false;
  delivery_cost?: number;
  delivery_cost_multiply?: true | false;
  shipping_days?: number;
  product_warrenty?: string;
  weight?: string;
  length?: string;
  height?: string;
  width?: string;
  unit?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: metakeywordssArray[];
  product_publisher_id: Types.ObjectId | IUserInterface;
  product_updated_by?: Types.ObjectId | IUserInterface;
  product_by?: 'admin' | 'seller';
  panel_owner_id?: Types.ObjectId | IUserInterface;
  product_submit_status?: string;
}

export const productSearchableField = [
  "product_name",
  "product_slug",
  "product_status",
  "description",
  "weight",
  "length",
  "height",
  "width",
  "unit",
  "meta_title",
  "meta_description",
  "meta_keywords",
];
