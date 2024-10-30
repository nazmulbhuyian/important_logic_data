import { useState, useRef, useContext } from "react";
import { useForm } from "react-hook-form";
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";
import { MdCancel } from "react-icons/md";
import { RiImageAddLine } from "react-icons/ri";
import { PiImagesThin } from "react-icons/pi";

import { toast } from "react-toastify";
import Select from "react-select";
import { BASE_URL } from "../../../../utils/baseURL";
import { AuthContext } from "../../../../context/AuthProvider";
import { LoaderOverlay } from "../../../common/loader/LoderOverley";

const UpdateStepThree = ({
  setCurrentStep,
  stepThreeData,
  stepOneData,
  stepTwoData,
  productData,
}) => {
  const { user, loading } = useContext(AuthContext);
  const [saveAndPublish, setSaveAndPublish] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const [description, setDescription] = useState(stepThreeData?.description);
  const [product_upcomming, setProductUpcomming] = useState(
    stepThreeData?.product_upcomming || true
  );
  const [hot_deal, setProductHotDeal] = useState(
    stepThreeData?.hot_deal || true
  );
  const [free_shipping, setProductFreeShipping] = useState(
    stepThreeData?.free_shipping || false
  );
  const [delivery_cost_multiply, setProductDeliveryCostMultiply] = useState(
    stepThreeData?.delivery_cost_multiply || false
  );
  const [cash_on_delivery, setProductCashOnDelivery] = useState(
    stepThreeData?.cash_on_delivery || true
  );
  const fileInputRef = useRef(null);
  const [imagePreviews, setImagePreviews] = useState(
    stepThreeData?.other_images || []
  );

  const [thumbnailPreview, setThumbnailPreview] = useState(
    stepThreeData?.main_image
  );
  const watchImages = watch("other_images");

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
      setValue("main_image", file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailPreview(null);
    setValue("main_image", null);
  };
  // Handle file input change to show image preview
  // const handleImageChange = (event) => {
  //   const files = event.target.files;
  //   if (files.length) {
  //     const previews = Array.from(files).map((file) =>
  //       URL.createObjectURL(file)
  //     );
  //     setImagePreviews([...imagePreviews, { other_image: previews }]);

  //     // Create an array of objects in the desired format
  //     const newImages = Array.from(files).map((file) => ({
  //       other_image: file, // You can use URL.createObjectURL(file) if you need to use the image preview
  //     }));

  //     // Get current files from watchImages
  //     const currentFiles = watchImages ? Array.from(watchImages) : [];

  //     // Combine current files and new images
  //     const updatedFiles = [...currentFiles, ...newImages];

  //     // Set the updated files to form values
  //     setValue("other_images", updatedFiles);

  //     // Reset the file input
  //     event.target.value = null;
  //   }
  // };

  const handleImageChange = (event) => {
    const files = event.target.files;
    if (files.length) {
      const previews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setImagePreviews([...imagePreviews, ...previews]);

      const currentFiles = watchImages ? Array.from(watchImages) : [];
      setValue("other_images", [...currentFiles, ...files]);
      event.target.value = null;
    }
  };

  // Remove selected image preview
  const removeImage = (index) => {
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1); // Remove the image preview

    setImagePreviews(updatedPreviews);

    const updatedFiles = Array.from(watchImages);
    updatedFiles.splice(index, 1); // Remove the file itself
    setValue("other_images", updatedFiles.length ? updatedFiles : null); // Update the input field or reset
  };

  //   set keyword
  const [keywords, setKeywords] = useState(stepThreeData?.meta_keywords || []);
  const [inputKeyword, setInputKeyword] = useState("");

  //   add keyword
  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newKeyword = inputKeyword.trim();
      if (newKeyword !== "") {
        setKeywords([...keywords, { keyword: newKeyword }]);
        setInputKeyword(""); // Clear the input field
      }
    }
  };
  // remove keyword
  const removeKeyword = (keywordToRemove) => {
    const updatedKeywords = keywords.filter(
      (keyword) => keyword?.keyword !== keywordToRemove
    );
    setKeywords(updatedKeywords);
  };
  //handle keyword
  const handleKeywordChange = (e) => {
    setInputKeyword(e.target.value);
  };

  const handleDataPost = async (data) => {
    if (saveAndPublish == true) {
      if (!description) {
        toast.error("Description is required", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return;
      }
      if (!data?.main_image && !thumbnailPreview) {
        toast.error("Main image is required", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return;
      }

      if (!data?.delivery_cost && delivery_cost_multiply == true) {
        toast.error("Delivery cost is required", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return;
      }

      const formData = new FormData();
      formData.append("_id", productData?._id);
      formData.append("product_status", "active");
      formData.append("product_by", "admin");
      formData.append("product_publisher_id", user?._id);
      formData.append(
        "panel_owner_id",
        user?.panel_owner_id ? user?.panel_owner_id : user?._id
      );

      Object.entries(data).forEach(([key, value]) => {
        if (key === "main_image" || key === "other_images") {
          return;
        }

        // Append other data normally
        formData.append(key, value);
      });

      // Separate logic for handling "main_image" and "other_images" if needed
      if (data?.main_image) {
        formData.append("main_image", data?.main_image);
      } else {
        formData.append("main_image", thumbnailPreview);
      }

      if (data?.other_images && data?.other_images.length > 0) {
        data.other_images.forEach((file, index) => {
          formData.append(`other_images[${index}]`, file);
        });
      }
      if (imagePreviews.length > 0) {
        imagePreviews.forEach((file, index) => {
          formData.append(
            `other_default_images[other_image][${index}]`,
            file?.other_image
          );
          formData.append(
            `other_default_images[other_image_key][${index}]`,
            file?.other_image_key
          );
        });
      }

      formData.append("meta_keywords", JSON.stringify(keywords));
      formData.append("description", description);
      formData.append("product_upcomming", product_upcomming);
      formData.append("hot_deal", hot_deal);
      formData.append("free_shipping", free_shipping);
      formData.append("delivery_cost_multiply", delivery_cost_multiply);
      formData.append("cash_on_delivery", cash_on_delivery);
      // Append specifications
      if (stepTwoData?.specifications?.length > 0) {
        stepTwoData.specifications.forEach((spec, index) => {
          if (spec.specification_values.length) {
            // Append the main specification ID
            formData.append(
              `specifications[${index}][specification_id]`,
              spec._id
            );

            // Append each specification value's ID
            spec.specification_values.forEach((value, valueIndex) => {
              formData.append(
                `specifications[${index}][specification_values][${valueIndex}][specification_value_id]`,
                value._id
              );
            });
          }
        });
      }

      Object.entries(stepOneData).forEach(([key, value]) => {
        if (
          (key === "newVariationData" || key === "defaultVariationData") &&
          Array.isArray(value)
        ) {
          value.forEach((product, index) => {
            formData.append(`variation_details[${index}][_id]`, product._id);
            formData.append(
              `variation_details[${index}][variation_price]`,
              product.variation_price
            );
            formData.append(
              `variation_details[${index}][variation_discount_price]`,
              product.variation_discount_price
            );
            formData.append(
              `variation_details[${index}][variation_quantity]`,
              product.variation_quantity
            );
            formData.append(
              `variation_details[${index}][variation_buying_price]`,
              product.variation_buying_price
            );
            formData.append(
              `variation_details[${index}][variation_reseller_price]`,
              product.variation_reseller_price
            );
            formData.append(
              `variation_details[${index}][variation_wholeseller_price]`,
              product.variation_wholeseller_price
            );
            formData.append(
              `variation_details[${index}][variation_wholeseller_min_quantity]`,
              product.variation_wholeseller_min_quantity
            );
            formData.append(
              `variation_details[${index}][variation_alert_quantity]`,
              product.variation_alert_quantity
            );
            formData.append(
              `variation_details[${index}][variation_sku]`,
              product.variation_sku
            );

            // If the product has an variation_image, append the variation_image file
            if (product.variation_image) {
              formData.append(
                `variation_details[${index}][variation_image]`,
                product.variation_image
              );
            }

            // Append variation_data (as a JSON string)
            formData.append(
              `variation_details[${index}][variation_data]`,
              JSON.stringify(product.variation_data)
            );
          });
        } else {
          formData.append(key, value);
        }
      });

      const response = await fetch(
        `${BASE_URL}/product?role_type=product_update`,
        {
          method: "PATCH",
          credentials: "include",
          body: formData,
        }
      );
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Product created successfully",
          {
            autoClose: 1000,
          }
        );
        // refetch()
        // setLoading(false)
        // setSubCategoryCreateModal(false)
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        // setLoading(false)
      }
    } else {
      if (!description) {
        toast.error("Description is required", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return;
      }
      if (!data?.main_image && !thumbnailPreview) {
        toast.error("Main image is required", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return;
      }

      if (!data?.delivery_cost && delivery_cost_multiply == true) {
        toast.error("Delivery cost is required", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return;
      }

      const formData = new FormData();
      formData.append("_id", productData?._id);
      formData.append("product_status", "in-active");
      formData.append("product_by", "admin");
      formData.append("product_updated_by", user?._id);

      Object.entries(data).forEach(([key, value]) => {
        if (key === "main_image" || key === "other_images") {
          return;
        }

        // Append other data normally
        formData.append(key, value);
      });

      // Separate logic for handling "main_image" and "other_images" if needed
      if (data?.main_image) {
        formData.append("main_image", data?.main_image);
      } else {
        formData.append("main_image", thumbnailPreview);
      }

      if (data?.other_images && data?.other_images.length > 0) {
        data.other_images.forEach((file, index) => {
          formData.append(`other_images[${index}]`, file);
        });
      }
      if (imagePreviews.length > 0) {
        imagePreviews.forEach((file, index) => {
          formData.append(
            `other_default_images[other_image][${index}]`,
            file?.other_image
          );
          formData.append(
            `other_default_images[other_image_key][${index}]`,
            file?.other_image_key
          );
        });
      }

      formData.append("meta_keywords", JSON.stringify(keywords));
      formData.append("description", description);
      formData.append("product_upcomming", product_upcomming);
      formData.append("hot_deal", hot_deal);
      formData.append("free_shipping", free_shipping);
      formData.append("delivery_cost_multiply", delivery_cost_multiply);
      formData.append("cash_on_delivery", cash_on_delivery);
      // Append specifications
      if (stepTwoData?.specifications?.length > 0) {
        stepTwoData.specifications.forEach((spec, index) => {
          if (spec.specification_values.length) {
            // Append the main specification ID
            formData.append(
              `specifications[${index}][specification_id]`,
              spec._id
            );

            // Append each specification value's ID
            spec.specification_values.forEach((value, valueIndex) => {
              formData.append(
                `specifications[${index}][specification_values][${valueIndex}][specification_value_id]`,
                value._id
              );
            });
          }
        });
      }

      Object.entries(stepOneData).forEach(([key, value]) => {
        if (
          (key === "newVariationData" || key === "defaultVariationData") &&
          Array.isArray(value)
        ) {
          value.forEach((product, index) => {
            formData.append(`variation_details[${index}][_id]`, product._id);
            formData.append(
              `variation_details[${index}][variation_price]`,
              product.variation_price
            );
            formData.append(
              `variation_details[${index}][variation_discount_price]`,
              product.variation_discount_price
            );
            formData.append(
              `variation_details[${index}][variation_quantity]`,
              product.variation_quantity
            );
            formData.append(
              `variation_details[${index}][variation_buying_price]`,
              product.variation_buying_price
            );
            formData.append(
              `variation_details[${index}][variation_reseller_price]`,
              product.variation_reseller_price
            );
            formData.append(
              `variation_details[${index}][variation_wholeseller_price]`,
              product.variation_wholeseller_price
            );
            formData.append(
              `variation_details[${index}][variation_wholeseller_min_quantity]`,
              product.variation_wholeseller_min_quantity
            );
            formData.append(
              `variation_details[${index}][variation_alert_quantity]`,
              product.variation_alert_quantity
            );
            formData.append(
              `variation_details[${index}][variation_sku]`,
              product.variation_sku
            );

            // If the product has an variation_image, append the variation_image file
            if (product.variation_image) {
              formData.append(
                `variation_details[${index}][variation_image]`,
                product.variation_image
              );
            }

            // Append variation_data (as a JSON string)
            formData.append(
              `variation_details[${index}][variation_data]`,
              JSON.stringify(product.variation_data)
            );
          });
        } else {
          formData.append(key, value);
        }
      });

      const response = await fetch(
        `${BASE_URL}/product?role_type=product_update`,
        {
          method: "PATCH",
          credentials: "include",
          body: formData,
        }
      );
      const result = await response.json();
      if (result?.statusCode === 200 && result?.success === true) {
        toast.success(
          result?.message ? result?.message : "Product created successfully",
          {
            autoClose: 1000,
          }
        );
        // refetch()
        // setLoading(false)
        // setSubCategoryCreateModal(false)
      } else {
        toast.error(result?.message || "Something went wrong", {
          autoClose: 1000,
        });
        // setLoading(false)
      }
    }
  };

  if (loading) {
    return <LoaderOverlay />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit(handleDataPost)} className="mt-3 space-y-8">
        {/* Product Description Section */}
        <section className=" shadow-md bg-gray-50 rounded-lg p-4 sm:p-8 md:p-12">
          <h1 className="sm:text-3xl text-xl mb-6 font-semibold text-textColor">
            Product Other Information
          </h1>

          {/* Product Description */}
          <div className="mt-4">
            <label
              htmlFor="product_description"
              className="font-medium text-gray-800"
            >
              Product Description
            </label>
            <ReactQuill
              className="mt-2"
              id="product_description"
              theme="snow"
              value={description}
              onChange={setDescription}
              placeholder="Enter Product Description"
            />
          </div>
          {/* Thumbnail Upload */}
          <div className="my-6">
            <h2 className="text-lg text-gray-700 font-semibold">
              Thumbnail Image
            </h2>
            <div className="border-dashed border my-3 bg-white border-blue-400 rounded-lg  text-center">
              {thumbnailPreview ? (
                <div className="relative inline-block my-2 ">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className="w-48 h-48 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full "
                    onClick={removeThumbnail}
                  >
                    <MdCancel size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer p-6">
                  <RiImageAddLine className="text-7xl text-gray-400" />

                  <span className="text-gray-500">Upload Thumbnail</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register("main_image", {
                      required: "Thumbnail image is required",
                      validate: {
                        isImage: (file) =>
                          file &&
                          [
                            "image/jpeg",
                            "image/png",
                            "image/webp",
                            "image/gif",
                          ].includes(file.type)
                            ? true
                            : "Only image files are allowed",
                      },
                    })}
                    onChange={handleThumbnailChange}
                  />
                  <p className="text-gray-400 text-sm">
                    Upload Product Thumbnil Image (JPG, PNG, WEBP)
                  </p>
                </label>
              )}
              {errors.main_image && (
                <p className="text-red-600 text-xs">
                  {errors.main_image.message}
                </p>
              )}
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="my-10">
            <h2 className="text-lg text-gray-700 mb-4 font-semibold">
              Aditional Images
            </h2>
            {imagePreviews?.length > 0 ? (
              <>
                <div className="border-dashed border-2 border-blue-400 rounded-lg p-4 text-center">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {/* Display Image Previews */}
                    {imagePreviews?.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview?.other_image || preview}
                          alt={`preview-${index}`}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <MdCancel />
                        </button>
                      </div>
                    ))}

                    {/* Image Upload Box */}
                    <label
                      htmlFor="image_upload"
                      className="w-24 h-24 flex items-center justify-center cursor-pointer bg-white border-dashed border border-blue-400 text-gray-500 rounded-md"
                    >
                      <span className="text-2xl font-semibold">+</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="image_upload"
                        multiple
                        accept="image/*"
                        className="hidden"
                        {...register("other_images", {
                          validate: {
                            isImage: (files) =>
                              Array.from(files).every((file) =>
                                [
                                  "image/jpg",
                                  "image/jpeg",
                                  "image/png",
                                  "image/webp",
                                  "image/gif",
                                  "image/JPG",
                                  "image/JPEG",
                                  "image/PNG",
                                  "image/WEBP",
                                  "image/GIF",
                                ].includes(file.type)
                              ) || "Only image files are allowed",
                          },
                        })}
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Upload 300×300 pixel images in PNG, JPG, or WebP format (max
                    1 MB)
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className=" text-center">
                  <div className="flex flex-wrap gap-4 justify-center my-3">
                    {/* Display Image Previews */}
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative  border shadow">
                        <img
                          src={preview?.other_image || preview}
                          alt={`preview-${index}`}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full"
                          onClick={() => removeImage(index)}
                        >
                          <MdCancel />
                        </button>
                      </div>
                    ))}

                    {/* Image Upload Box */}
                    <label
                      htmlFor="image_upload"
                      className="w-full p-10 flex flex-col  items-center justify-center cursor-pointer bg-white border-dashed border border-blue-400 text-gray-500 rounded-md"
                    >
                      <PiImagesThin className="text-7xl" />

                      <input
                        ref={fileInputRef}
                        type="file"
                        id="image_upload"
                        multiple
                        accept="image/*"
                        className="hidden"
                        {...register("other_images", {
                          validate: {
                            isImage: (files) =>
                              Array.from(files).every((file) =>
                                [
                                  "image/jpg",
                                  "image/jpeg",
                                  "image/png",
                                  "image/webp",
                                  "image/gif",
                                  "image/JPG",
                                  "image/JPEG",
                                  "image/PNG",
                                  "image/WEBP",
                                  "image/GIF",
                                ].includes(file.type)
                              ) || "Only image files are allowed",
                          },
                        })}
                        onChange={handleImageChange}
                      />
                      <p className="text-gray-400 mt-2 text-sm">
                        Upload 300×300 pixel images in PNG, JPG, or WebP format
                      </p>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Image section end */}
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            {/* Upcomming Product */}
            <div className=" space-y-2 ">
              <label htmlFor="product-upcomming" className="font-medium">
                Upcomming Product
              </label>

              <Select
                id="product-upcomming"
                name="product-upcomming"
                className="rounded"
                placeholder="-Select Upcoming Product-"
                isClearable
                defaultValue={{ value: "true", label: "Yes" }}
                options={[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ]}
                aria-label="-Select Upcoming Product-"
                onChange={(value) => {
                  setProductUpcomming(value.value);
                }}
              />
            </div>

            {/* Hot Deal */}
            <div className=" space-y-2 ">
              <label htmlFor="hot_deal" className="font-medium">
                Hot Deal
              </label>
              <Select
                id="hot_deal"
                name="hot_deal"
                placeholder="-Select hot-deal-"
                defaultValue={{ value: "true", label: "Yes" }}
                options={[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ]}
                aria-label="Select hot-deal-"
                onChange={(value) => {
                  setProductHotDeal(value.value);
                }}
              ></Select>
            </div>
            {/* Free Shipping */}
            <div className=" space-y-2 ">
              <label htmlFor="free_shipping" className="font-medium">
                Free Shipping
              </label>
              <Select
                id="free_shipping"
                name="free_shipping"
                placeholder="-Select Free Shipping-"
                defaultValue={{ value: "false", label: "No" }}
                options={[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ]}
                aria-label="Select flash"
                onChange={(value) => {
                  setProductFreeShipping(value.value);
                }}
              ></Select>
            </div>
            {/* Delivery Cost   */}
            <div className="">
              <label htmlFor="delivery_cost" className="font-medium">
                Delivery Cost
              </label>
              <input
                {...register("delivery_cost", {
                  min: {
                    value: 1,
                    message: "Delivery cost must be at least 1 if provided",
                  },
                })}
                id="delivery_cost"
                defaultValue={stepThreeData?.delivery_cost}
                type="number"
                placeholder="Enter Delivery Cost"
                className="block w-full p-2.5 text-gray-800 outline-primaryColor bg-white border border-gray-300 rounded-lg mt-2"
              />
            </div>

            {/* Delivery Cost Multiply */}
            <div className=" space-y-2 ">
              <label htmlFor="delivery_cost_multiply" className="font-medium">
                Delivery Cost Multiply
              </label>
              <Select
                id="delivery_cost_multiply"
                name="delivery_cost_multiply"
                placeholder="-Select Delevery Cost Multiply-"
                defaultValue={{ value: "false", label: "No" }}
                options={[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ]}
                aria-label="Select flash"
                onChange={(e) => setProductDeliveryCostMultiply(e?.value)}
              ></Select>
            </div>
            {/* Shipping Days */}
            <div className="">
              <label htmlFor="shipping_days" className="font-medium">
                Shipping Days
              </label>
              <input
                defaultValue={stepThreeData?.shipping_days}
                {...register("shipping_days", {
                  min: {
                    value: 1,
                    message: "Shipping Days cannot be negative",
                  },
                })}
                id="shipping_days"
                type="number"
                placeholder="Enter Shipping Days"
                className="block w-full p-2.5 outline-primaryColor text-gray-800 bg-white border border-gray-300 rounded-lg mt-2"
              />
            </div>
            {/* Cash On Delivery */}
            <div className=" space-y-2 ">
              <label htmlFor="cash_on_delivery" className="font-medium">
                Cash On Delivery
              </label>
              <Select
                id="cash_on_delivery"
                name="cash_on_delivery"
                placeholder="-Select Cash On Delivery-"
                defaultValue={{ value: "true", label: "Yes" }}
                options={[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ]}
                aria-label="Select flash"
                onChange={(selectedOption) =>
                  setProductCashOnDelivery(selectedOption?.value)
                }
              ></Select>
            </div>
            {/* Product Warrenty */}
            <div className="">
              <label htmlFor="product_warrenty" className="font-medium">
                Product Warrenty
              </label>
              <input
                // defaultValue={stepOneDefaultdata?.product_warrenty}
                {...register("product_warrenty")}
                id="product_warrenty"
                type="text"
                defaultValue={stepThreeData?.product_warrenty}
                placeholder="Enter Warrenty"
                className="block w-full p-2.5 outline-primaryColor text-gray-800 bg-white border border-gray-300 rounded-lg mt-2"
              />
            </div>
            {/* Product Weight */}
            <div className="">
              <label htmlFor="weight" className="font-medium">
                Product Weight
              </label>
              <input
                // defaultValue={stepOneDefaultdata?.weight}
                {...register("weight")}
                id="weight"
                type="text"
                defaultValue={stepThreeData?.weight}
                placeholder="Enter Weight"
                className="block w-full p-2.5 outline-primaryColor text-gray-800 bg-white border border-gray-300 rounded-lg mt-2"
              />
            </div>
            {/* Product Height */}
            <div className="">
              <label htmlFor="height" className="font-medium">
                Product Height
              </label>
              <input
                defaultValue={stepThreeData?.height}
                {...register("height")}
                id="height"
                type="text"
                placeholder="Enter Height"
                className="block w-full p-2.5 outline-primaryColor text-gray-800 bg-white border border-gray-300 rounded-lg mt-2"
              />
            </div>
            {/* Product Length */}
            <div className="">
              <label htmlFor="length" className="font-medium">
                Product Length
              </label>
              <input
                defaultValue={stepThreeData?.length}
                {...register("length")}
                id="length"
                type="text"
                placeholder="Enter Length"
                className="block w-full p-2.5 outline-primaryColor text-gray-800 bg-white border border-gray-300 rounded-lg mt-2"
              />
            </div>
            {/* Product Warrenty */}
            <div className="">
              <label htmlFor="width" className="font-medium">
                Product Width
              </label>
              <input
                defaultValue={stepThreeData?.width}
                {...register("width")}
                id="width"
                type="text"
                placeholder="Enter Width"
                className="block w-full p-2.5 outline-primaryColor text-gray-800 bg-white border border-gray-300 rounded-lg mt-2"
              />
            </div>
          </div>
          {/* unit */}
          <div className="mt-4">
            <label htmlFor="unit" className="font-medium">
              Unit
            </label>
            <input
              defaultValue={stepThreeData?.unit}
              {...register("unit")}
              id="unit"
              placeholder="Enter Unit Like Pc, Box, kg, Lit etc."
              type="text"
              className="block w-full px-2 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl mt-2"
            />
          </div>

          {/* meta */}
          <div className="mt-8">
            <div className="flex flex-col gap-2 mt-4">
              <label htmlFor="fname" className="text-base font-medium">
                Meta Keyword
              </label>
              {keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1 bg-white mb-3 rounded-lg py-1 min-h-[50px] items-center">
                  {keywords?.map((keyword, index) => (
                    <div
                      key={index}
                      className="bg-gray-300 text-black py-1 px-2 mx-1 rounded-full flex item-center justify-center h-auto"
                    >
                      <span>{keyword?.keyword}</span>
                      <div
                        className="ml-2 w-6 h-6 cursor-pointer bg-gray-400 rounded-full px-2 flex item-center justify-center"
                        onClick={() => removeKeyword(keyword?.keyword)}
                      >
                        X
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="text"
                className="bg-bgray-50 border border-gray-300 p-4 rounded-lg h-14 focus:border focus:border-success-300 focus:ring-0"
                name="fname"
                value={inputKeyword}
                onChange={handleKeywordChange}
                onKeyDown={handleKeyPress}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="meta_title" className="font-medium">
                Meta Title
              </label>
              <input
                defaultValue={stepThreeData?.meta_title}
                {...register("meta_title")}
                id="meta_title"
                type="text"
                className="block w-full px-2 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl mt-2"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="meta_description" className="font-medium">
                Meta Description
              </label>
              <textarea
                cols={5}
                defaultValue={stepThreeData?.meta_description}
                {...register("meta_description")}
                id="meta_description"
                type="text"
                className="block w-full px-2 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl mt-2"
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end items-center gap-2 sm:gap-4 flex-wrap">
          <button
            type="button"
            className=" bg-gray-300 text-gray-900 text-lg  py-2.5 px-6 font-semibold  rounded-lg  text-center"
            onClick={() => setCurrentStep(2)}
          >
            Back
          </button>
          <button
            className=" bg-yellowColor text-white text-lg  py-2.5 px-6 font-semibold  rounded-lg  text-center"
            type="submit"
            onClick={() => setSaveAndPublish(false)}
          >
            Save and UnPublish
          </button>
          <button
            className=" bg-green-600 text-white text-lg  py-2.5 px-6 font-semibold  rounded-lg  text-center"
            type="submit"
            onClick={() => setSaveAndPublish(true)}
          >
            Save and Publish
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateStepThree;