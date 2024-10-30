import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../utils/baseURL";
import { LoaderOverlay } from "../../../common/loader/LoderOverley";
import MultiSpecSelect from "./UpdateMultiSpecSelect";
import SingleSpecSelect from "./UpdateSingleSpecSelect";

const UpdateStepTwo = ({
  setCurrentStep,
  stepTwoData,
  setStepTwoData,
  stepOneData,
}) => {

  // State to track selected specifications
  const [selectedSpecifications, setSelectedSpecifications] = useState([]);

  useEffect(() => {
    if (!stepTwoData.dont_need_maping) {
      const transformed = stepTwoData?.map((spec) => ({
        category_id: spec?.specification_id?.category_id,
        specification_name: spec?.specification_id?.specification_name,
        specification_serial: spec?.specification_id?.specification_serial,
        specification_show: spec?.specification_id?.specification_show,
        specification_slug: spec?.specification_id?.specification_slug,
        specification_status: spec?.specification_id?.specification_status,
        _id: spec?.specification_id?._id,
        specification_values: spec?.specification_values?.map((value) => ({
          specification_value_name:
            value?.specification_value_details?.specification_value_name,
          specification_value_slug:
            value?.specification_value_details?.specification_value_slug,
          specification_value_status:
            value?.specification_value_details?.specification_value_status,
          _id: value?.specification_value_details?._id,
        })),
      }));
      setSelectedSpecifications(transformed); // Set the transformed data to state
    } else {
      setSelectedSpecifications(stepTwoData?.specifications);
    }
  }, [stepTwoData]);

  const { data: specification = [], isLoading } = useQuery({
    queryKey: [`/api/v1/specification/${stepOneData?.category_id}`],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_URL}/specification/${stepOneData?.category_id}`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      return data?.data;
    },
  }); // get all specifications for select

  // loading set
  if (isLoading) {
    return <LoaderOverlay />;
  }

  return (
    <div>
      {stepOneData?.is_variation == true ? (
        <>
          <h2 className="text-lg text-semibold text-secondaryColor mb-4">
            You can add multiple values for a specification here:
          </h2>
          <MultiSpecSelect
            specification={specification}
            setSelectedSpecifications={setSelectedSpecifications}
            selectedSpecifications={selectedSpecifications}
          />
        </>
      ) : (
        <>
          <h2 className="text-lg text-semibold text-secondaryColor mb-4">
            You can add a value for a specification here:
          </h2>
          <SingleSpecSelect
            specification={specification}
            setSelectedSpecifications={setSelectedSpecifications}
            selectedSpecifications={selectedSpecifications}
          />
        </>
      )}
      <div className="flex justify-end items-center gap-2 sm:gap-4 flex-wrap">
        <button
          className="btn bg-gray-300 text-gray-900 text-lg py-2.5 px-6 font-semibold rounded-lg text-center"
          onClick={() => setCurrentStep(1)}
        >
          Back
        </button>
        <button
          className="btn bg-primaryColor text-white text-lg py-1.5 px-6 font-semibold rounded-lg text-center"
          onClick={() => {
            setStepTwoData({
              ...stepTwoData,
              specifications: selectedSpecifications,
              dont_need_maping: true,
            });
            setCurrentStep(3);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UpdateStepTwo;
