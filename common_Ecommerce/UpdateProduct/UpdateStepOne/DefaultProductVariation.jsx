const ProductTable = ({ defaultVariationData, setDefaultVariationData }) => {
  // Handler function to update state when an input value changes
  const handleInputChange = (index, field, value) => {
    const newData = [...defaultVariationData];
    newData[index][field] = value;
    setDefaultVariationData(newData);
  };

  // Handler to handle image change and store it as a file
  const handleImageChange = (index, file) => {
    const newData = [...defaultVariationData];
    newData[index].variation_image = file;
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 mt-6">
        <div className="overflow-x-auto scrollbar-thin scrollbar-hide ">
          <table className="w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead className="bg-[#fff9ee]">
              <tr className="divide-x divide-gray-300 font-semibold text-center text-gray-900">
                <td className="whitespace-nowrap px-4 py-5">#SL No</td>
                <td className="whitespace-nowrap px-4 py-5">Variant</td>
                <td className="whitespace-nowrap px-4 py-5">Variant Price</td>
                <td className="whitespace-nowrap px-4 py-5">Discount Price</td>
                <td className="whitespace-nowrap px-4 py-5">Buying Price</td>
                <td className="whitespace-nowrap px-4 py-5">Reseller Price</td>
                <td className="whitespace-nowrap px-4 py-5">
                  WholeSeller Price
                </td>
                <td className="whitespace-nowrap px-4 py-5">
                  Wholeseller Min Quantity
                </td>
                <td className="whitespace-nowrap px-4 py-5">
                  Variant Quantity
                </td>
                <td className="whitespace-nowrap px-4 py-5">
                  Variant Alert Quantity
                </td>
                <td className="whitespace-nowrap px-4 py-5">Variant SKU</td>
                <td className="whitespace-nowrap px-4 py-5">Image</td>
              </tr>
            </thead>
            <tbody>
              {defaultVariationData?.map((item, index) => (
                <tr
                  key={index}
                  className={`divide-x divide-gray-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-tableRowBGColor"
                  }`}
                >
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700 text-center">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700 text-center">
                    {item.variation_data?.map((variation, i) => (
                      <span key={variation._id}>
                        {
                          variation.variation_attribute_value_details
                            .attribute_value_slug
                        }
                        {i < item.variation_data.length - 1 ? "-" : ""}{" "}
                        {/* Adds a comma between items */}
                      </span>
                    ))}
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={item.variation_price}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "variation_price",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={item.variation_discount_price}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "variation_discount_price",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={item.variation_buying_price}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "variation_buying_price",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={item.variation_reseller_price}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "variation_reseller_price",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={item.variation_wholeseller_price}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "variation_wholeseller_price",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={item.variation_wholeseller_min_quantity}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "variation_wholeseller_min_quantity",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={item.variation_quantity}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "variation_quantity",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="number"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={item.variation_alert_quantity}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "variation_alert_quantity",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    <input
                      type="text"
                      className="p-2 border rounded-md mx-1.5 outline-primaryColor text-center"
                      value={item.variation_sku}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "variation_sku",
                          e.target.value
                        )
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap py-1.5 font-medium text-gray-700">
                    {/* Display the image preview if it's already an uploaded file */}
                    {item.variation_image instanceof File ? (
                      <img
                        src={URL.createObjectURL(item.variation_image)}
                        alt={item.variation_sku}
                        style={{ width: "50px", height: "50px" }}
                      />
                    ) : (
                      // Display the current image URL or a placeholder
                      <img
                        src={
                          item.variation_image ||
                          "https://via.placeholder.com/50"
                        }
                        alt={item.variation_sku}
                        style={{ width: "50px", height: "50px" }}
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageChange(index, e.target.files[0])
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const DefaultProductVariation = ({
  defaultVariationData,
  setDefaultVariationData,
  stepOneData,
}) => {
  return (
    <div>
      <h1>Product Variants</h1>
      <ProductTable
        defaultVariationData={defaultVariationData}
        setDefaultVariationData={setDefaultVariationData}
        stepOneData={stepOneData}
      />
    </div>
  );
};

export default DefaultProductVariation;
