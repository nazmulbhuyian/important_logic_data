import { useEffect, useState } from "react";
import { TiTick } from "react-icons/ti";
import "./updateStapper.css";
import UpdateStepOne from "./UpdateStepOne/UpdateStepOne";
import UpdateStepTwo from "./UpdateStepTwo/UpdateStepTwo";
import UpdateStepThree from "./UpdateStepThree/UpdateStepThree";

const UpdateProduct = ({ productData, refetch }) => {
  const steps = ["", "", ""];
  // console.log(productData)
  // State to manage current step
  const [currentStep, setCurrentStep] = useState(1);
  const [complete, setComplete] = useState(false);

  // store all step one data
  const [stepOneData, setStepOneData] = useState(() => {
    if (!productData) return {};

    const enrichedVariations = productData?.variations?.map((variation) => {
      const enrichedVariationData = variation?.variation_data?.map((data) => {
        // Access the attribute_values from the nested variations_attribute_id
        const attributeValues = data?.variations_attribute_id?.attribute_values;

        // Find the matching attribute value details
        const attributeDetail = attributeValues?.find(
          (attrValue) => attrValue._id === data?.variation_attribute_value_id
        );

        return {
          ...data,
          variation_attribute_value_details: attributeDetail, // Add full details here
        };
      });

      return {
        ...variation,
        variation_data: enrichedVariationData,
      };
    });

    return {
      _id: productData?._id || null,
      product_name: productData?.product_name || "",
      product_slug: productData?.product_slug || "",
      product_sku: productData?.product_sku || "",
      category_id: productData?.category_id?._id || null,
      category_name: productData?.category_id?.category_name || "",
      sub_category_id: productData?.sub_category_id?._id || null,
      sub_category_name: productData?.sub_category_id?.sub_category_name || "",
      child_category_id: productData?.child_category_id?._id || null,
      child_category_name:
        productData?.child_category_id?.child_category_name || "",
      brand_id: productData?.brand_id?._id || null,
      brand_name: productData?.brand_id?.brand_name || "",
      is_variation: productData?.is_variation || false,
      product_price: productData?.product_price || 0,
      product_discount_price: productData?.product_discount_price || 0,
      product_wholeseller_price: productData?.product_wholeseller_price || 0,
      product_wholeseller_min_quantity:
        productData?.product_wholeseller_min_quantity || 0,
      product_reseller_price: productData?.product_reseller_price || 0,
      product_buying_price: productData?.product_buying_price || 0,
      product_quantity: productData?.product_quantity || 0,
      product_alert_quantity: productData?.product_alert_quantity || 0,
      defaultVariationData: enrichedVariations,
      newVariationData: [],
      againAddNewVariation: false,
      deletedImageArray: [],
    };
  });

  // State to manage selected attributes
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  // State to manage selected attribute values
  const [selectedAttributeValues, setSelectedAttributeValues] = useState([]);
  // State to store the data prepared for submission
  const [dataToSubmit, setDataToSubmit] = useState([]); // Initialize to an empty array if undefined

  useEffect(() => {
    if (stepOneData?.newVariationData) {
      setDataToSubmit(stepOneData?.newVariationData);
    }
  }, [stepOneData?.newVariationData]);

  // store all step two data
  const [stepTwoData, setStepTwoData] = useState([]);

  useEffect(() => {
    if (productData?.specifications) {
      // Enrich specifications with details
      const enrichedSpecifications = productData.specifications.map((spec) => {
        const enrichedValues = spec.specification_values.map((value) => {
          const matchingDetail =
            spec.specification_id.specification_values.find(
              (detail) => detail._id === value.specification_value_id
            );

          return {
            ...value,
            specification_value_details: matchingDetail || null,
          };
        });

        return {
          ...spec,
          specification_values: enrichedValues,
        };
      });

      setStepTwoData(enrichedSpecifications);
    }
  }, [productData?.specifications]);

  // store all step three data
  const [stepThreeData, setStepThreeData] = useState({
    _id: productData?._id || null,
    cash_on_delivery: productData?.cash_on_delivery || false,
    delivery_cost: productData?.delivery_cost || 0,
    delivery_cost_multiply: productData?.delivery_cost_multiply || false,
    description: productData?.description || "",
    flash_sale: productData?.flash_sale || false,
    free_shipping: productData?.free_shipping || false,
    height: productData?.height || 0,
    length: productData?.length || 0,
    main_image: productData?.main_image || null,
    main_image_key: productData?.main_image_key || null,
    meta_description: productData?.meta_description || "",
    meta_title: productData?.meta_title || "",
    meta_keywords: productData?.meta_keywords || [],
    other_images: productData?.other_images || [],
    panel_owner_id: productData?.panel_owner_id?._id || null,
    product_by: productData?.product_by || "",
    product_publisher_id: productData?.product_publisher_id?._id || null,
    product_status: productData?.product_status || "",
    product_upcomming: productData?.product_upcomming || false,
    shipping_days: productData?.shipping_days || 0,
    unit: productData?.unit || "",
    weight: productData?.weight || 0,
    width: productData?.width || 0,
    product_warrenty: productData?.product_warrenty || "",
  });

  return (
    <div className="mt-6 bg-white  rounded-lg shadow-xl sm:p-6 py-6">
      <div className="flex items-center justify-center   ">
        {steps?.map((step, i) => (
          <div
            key={i}
            className={`step-item    ${currentStep === i + 1 && "active"} ${
              (i + 1 < currentStep || complete) && "complete"
            }`}
          >
            <div className="step  text-gray-700 ">
              {i + 1 < currentStep || complete ? <TiTick size={24} /> : i + 1}
            </div>
            <p className="text-gray-500 text-xs ">{step}</p>
          </div>
        ))}
      </div>
      <div className="mx-4  mt-6 sm:mt-10">
        {currentStep == 3 ? (
          <UpdateStepThree
            setCurrentStep={setCurrentStep}
            stepThreeData={stepThreeData}
            stepTwoData={stepTwoData}
            stepOneData={stepOneData}
            productData={productData}
          />
        ) : currentStep == 2 ? (
          <UpdateStepTwo
            setCurrentStep={setCurrentStep}
            setStepTwoData={setStepTwoData}
            stepTwoData={stepTwoData}
            stepOneData={stepOneData}
          />
        ) : (
          <UpdateStepOne
            stepOneData={stepOneData}
            setStepOneData={setStepOneData}
            setCurrentStep={setCurrentStep}
            selectedAttributes={selectedAttributes}
            selectedAttributeValues={selectedAttributeValues}
            setSelectedAttributes={setSelectedAttributes}
            setSelectedAttributeValues={setSelectedAttributeValues}
            setDataToSubmit={setDataToSubmit}
            dataToSubmit={dataToSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default UpdateProduct;
