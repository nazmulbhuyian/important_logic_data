import { useState } from "react";
import { TiTick } from "react-icons/ti";
import "./stepper.css";
import StepOne from "./stepOne/StepOne";
import StepTwo from "./stepTwo/StepTwo";
import StepThree from "./stepThree/StepThree";

const AddProduct = () => {
  const steps = ["", "", ""];

  const [currentStep, setCurrentStep] = useState(1);
  const [complete, setComplete] = useState(false);

  // store all step one data
  const [stepOneData, setStepOneData] = useState();
    // State to manage selected attributes
    const [selectedAttributes, setSelectedAttributes] = useState([]);
    // State to manage selected attribute values
    const [selectedAttributeValues, setSelectedAttributeValues] = useState([]);
    // State to store the data prepared for submission
    const [dataToSubmit, setDataToSubmit] = useState([]);
    console.log(dataToSubmit)

  // store all step two data
  const [stepTwoData, setStepTwoData] = useState();

  // store all step three data
  const [stepThreeData, setStepThreeData] = useState();

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
          <StepThree
            setCurrentStep={setCurrentStep}
            stepThreeData={stepThreeData}
            stepTwoData={stepTwoData}
            stepOneData={stepOneData}
          />
        ) : currentStep == 2 ? (
          <StepTwo
            setCurrentStep={setCurrentStep}
            setStepTwoData={setStepTwoData}
            stepTwoData={stepTwoData}
            stepOneData={stepOneData}
          />
        ) : (
          <StepOne stepOneData={stepOneData} setStepOneData={setStepOneData} setCurrentStep={setCurrentStep} selectedAttributes={selectedAttributes} selectedAttributeValues={selectedAttributeValues} setSelectedAttributes={setSelectedAttributes} setSelectedAttributeValues={setSelectedAttributeValues} setDataToSubmit={setDataToSubmit} dataToSubmit={dataToSubmit} />
        )}
      </div>
    </div>
  );
};

export default AddProduct;
