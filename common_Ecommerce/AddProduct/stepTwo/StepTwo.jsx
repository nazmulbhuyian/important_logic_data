import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BASE_URL } from "../../../../utils/baseURL";
import { LoaderOverlay } from "../../../common/loader/LoderOverley";
import MultiSpecSelect from "./MultiSpecSelect";
import SingleSpecSelect from "./SingleSpecSelect";

const StepTwo = ({
  setCurrentStep,
  stepTwoData,
  setStepTwoData,
  stepOneData,
}) => {
  // State to track selected specifications
  const [selectedSpecifications, setSelectedSpecifications] = useState(
    stepTwoData?.specifications || []
  );

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
      {stepOneData?.showProductVariation == true ? (
        <>
          <h2 className="text-lg text-semibold text-secondaryColor mb-4">You can add multiple values for a specification here:</h2>
          <MultiSpecSelect
            specification={specification}
            setSelectedSpecifications={setSelectedSpecifications}
            selectedSpecifications={selectedSpecifications}
          />
        </>
      ) : (
        <>
          <h2 className="text-lg text-semibold text-secondaryColor mb-4">You can add a value for a specification here:</h2>
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

export default StepTwo;
