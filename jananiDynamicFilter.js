"use client"

import BigSpinner from "@/components/common/loader/BigSpinner";
import { BASE_URL } from "@/utils/baseURL";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import { MdDeleteForever } from "react-icons/md";

const StepTwo = ({
    currentStep,
    setCurrentStep,
    complete,
    steps,
    setComplete,
}) => {
    const stepOneData = useSelector((state) => state.productData.stepOne);
    const stepOneDefaultdata = stepOneData?.productData?.stepOne;

    const localStaorageJananiStepTwoData = localStorage.getItem("jananiStepTwoData");
    const jananiStepTwoData = JSON.parse(localStaorageJananiStepTwoData);

    const [oldFilterSub_Filter, setOldFilterSub_Filter] = useState(jananiStepTwoData);


    //   default category sub category child category for filters
    const category_id = stepOneDefaultdata?.category_id;
    const sub_category_id = stepOneDefaultdata?.sub_category_id;
    const child_category_id = stepOneDefaultdata?.child_category_id;

    // get value and set value and set condition
    const [filtersData, setFiltersData] = useState([]);
    const [filter_id, setFilter_id] = useState('')
    const [filter_name, setFilter_name] = useState('')
    const [child_FiltersData, setChild_FiltersData] = useState([]);
    const [child_filter_id, setChild_Filter_id] = useState('')
    const [child_filter_name, setChild_filter_name] = useState('')

    const [filterStatus, setFilterStatus] = useState(false);
    const [childFilterStatus, setChildFilterStatus] = useState(false);
    const [nextButtonStatus, setNextButtonStatus] = useState(true);

    const [selectInputs, setSelectInputs] = useState([{ id: 1 }]);

    const addSelectInput = () => {
        if (filterStatus === false || childFilterStatus === false) {
            return;
        }
        if (filter_id && child_filter_id) {
            const saveData = {
                filter_id,
                filter_name,
                child_filter_id,
                child_filter_name
            };

            // Check if saveData already exists in alldata
            if (oldFilterSub_Filter.some(data => data.filter_id === filter_id && data.child_filter_id === child_filter_id)) {
                setFilterStatus(false);
                setChildFilterStatus(false);
                const newId = selectInputs.length + 1;
                setSelectInputs([...selectInputs, { id: newId }]);
                setNextButtonStatus(true)
                return;
            }

            setOldFilterSub_Filter(prevData => [...prevData, saveData]);
            const newId = selectInputs.length + 1;
            setFilterStatus(false);
            setChildFilterStatus(false);
            setSelectInputs([...selectInputs, { id: newId }]);
            setNextButtonStatus(true)
        }
    };


    const removeSelectInput = () => {
        if (selectInputs.length > 1) {
            setFilterStatus(true)
            setChildFilterStatus(true)
            const newSelectInputs = selectInputs.slice(0, -1);
            setSelectInputs(newSelectInputs);
            setNextButtonStatus(true)
        }
    };

    // steper manage
    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
            setComplete(false);
        }
    };

    const { data: filters = [], isLoading } = useQuery({
        queryKey: [`/api/v1/filter`],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/filter`);
            const data = await res.json();
            return data;
        },
    }); // get all filter for select

    const { data: child_filters = [] } = useQuery({
        queryKey: [`/api/v1/child_filter`],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/child_filter`);
            const data = await res.json();
            return data;
        },
    }); // get all Child filter for select

    //   set filters
    useEffect(() => {
        if (filters?.data) {
            const getFilterData = filters?.data.filter((filter) => {
                // Check if the filter's category_id matches the current category_id
                const categoryMatch = filter?.category_id?._id === category_id;
                // Check if the filter's sub_category_id matches the current sub_category_id
                const subCategoryMatch = sub_category_id
                    ? filter.sub_category_id?._id === sub_category_id
                    : true;

                const childCategoryMatch = child_category_id
                    ? filter.child_category_id?._id === child_category_id
                    : true;
                // Return true if both category and subcategory match
                return categoryMatch && subCategoryMatch && childCategoryMatch;
            });
            setFiltersData(getFilterData);
        }
    }, [filters?.data, category_id, sub_category_id, child_category_id]);

    //   set child_Filters
    useEffect(() => {
        if (child_filters?.data) {
            const getChild_FilterData = child_filters?.data.filter((filter) => {
                // Check if the filter's category_id matches the current category_id
                const categoryMatch = filter?.category_id?._id === category_id;
                // Check if the filter's sub_category_id matches the current sub_category_id
                const subCategoryMatch = sub_category_id
                    ? filter.sub_category_id?._id === sub_category_id
                    : true;

                const childCategoryMatch = child_category_id
                    ? filter.child_category_id?._id === child_category_id
                    : true;
                // Return true if both category and subcategory match
                // Check if the child filter's filter matches the current filter
                const filterMatch = filter?.filter_id?._id === filter_id;
                return categoryMatch && subCategoryMatch && childCategoryMatch && filterMatch;
            });
            setChild_FiltersData(getChild_FilterData);
        }
    }, [child_filters?.data, category_id, sub_category_id, child_category_id, filter_id]);

    const handleDeleteOldVariation = (data) => {
        setOldFilterSub_Filter(oldFilterSub_Filter.filter((item) => item.filter_id !== data.filter_id));
        setNextButtonStatus(true)
      };

    // submit data
    const handleNext = () => {
        const alldataString = JSON.stringify(oldFilterSub_Filter);
        localStorage.setItem("jananiStepTwoData", alldataString)
        if (currentStep === steps.length) {
            setComplete(true);
          } else {
            setCurrentStep((prev) => prev + 1);
          }
    }

    if (isLoading) {
        return <BigSpinner />
    }

    return (
        <div>

            <h1 className="font-semibold text-xl mt-4">
                Product Filter And Child Filter:{" "}
            </h1>
            {oldFilterSub_Filter && (
                <>
                    <table className="min-w-full divide-y-2 divide-gray-200 text-sm border border-gray-300 mt-4 rounded-xl">
                        <thead>
                            <tr>
                                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                                    Filter Name
                                </th>
                                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 text-left">
                                    Child Filter Name
                                </th>
                                <th className="px-4 py-2 text-center font-medium text-gray-900 whitespace-nowrap">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {oldFilterSub_Filter?.map((filterSubFilter) => (
                                <tr key={filterSubFilter?._id}>
                                    <td className="whitespace-nowrap px-4 py-2 font-semibold">
                                        {filterSubFilter?.filter_name}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-2 font-semibold">
                                        {filterSubFilter?.child_filter_name}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-2 space-x-1 flex items-center justify-center gap-4">
                                        <MdDeleteForever
                                            onClick={() =>
                                                handleDeleteOldVariation(filterSubFilter)
                                            }
                                            className="cursor-pointer text-red-500 hover:text-red-300"
                                            size={25}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}

            <div>
                {selectInputs.map((selectInput, index) => (
                    <div key={selectInput.id} className="grid grid-cols-2 gap-4">
                        <div className="mt-4">
                            <p className="font-medium">Filter Name</p>
                            <Select
                                onChange={(selectedOption) => {
                                    setFilter_id(selectedOption?._id)
                                    setFilter_name(selectedOption?.filter_name)
                                    setFilterStatus(true)
                                    setNextButtonStatus(false)
                                }}
                                id={`filter_id_${selectInput.id}`}
                                name={`filter_id_${selectInput.id}`}
                                isClearable
                                aria-label="Select a Filter"
                                options={filtersData}
                                getOptionLabel={(x) => x?.filter_name}
                                getOptionValue={(x) => x?._id}
                            />
                        </div>
                        <div className="mt-4">
                            <p className="font-medium">Child Filter Name</p>
                            <Select
                                onChange={(selectedOption) => {
                                    setChild_Filter_id(selectedOption?._id)
                                    setChild_filter_name(selectedOption?.child_filter_name)
                                    setChildFilterStatus(true)
                                    setNextButtonStatus(false)
                                }}
                                id={`child_filter_id_${selectInput.id}`}
                                name={`child_filter_id_${selectInput.id}`}
                                isClearable
                                aria-label="Select a Child Filter"
                                options={child_FiltersData}
                                getOptionLabel={(x) => x?.child_filter_name}
                                getOptionValue={(x) => x?._id}
                            />
                        </div>
                    </div>
                ))}

                <div className="grid grid-cols-2 gap-6">
                    <button
                        type="button"
                        className="mt-2 p-2 text-white transition-colors duration-300 transform bg-[#22CD5A] rounded-xl hover:bg-[#22CD5A]"
                        onClick={addSelectInput}
                    >
                        +
                    </button>
                    <button
                        type="button"
                        className="mt-2 p-2 text-white transition-colors duration-300 transform bg-red-500 rounded-xl hover:bg-red-600"
                        onClick={removeSelectInput}
                    >
                        -
                    </button>
                </div>
            </div>

            <div className="m-5 flex items-center justify-between">
                <button
                    className="btn font-semibold border border-gray-200 px-5 py-1 rounded-lg text-white bg-primaryColor"
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                >
                    Previous
                </button>
                {
                    nextButtonStatus == true ?
                        <button
                            className="btn font-semibold border border-gray-200 px-5 py-1 rounded-lg text-white bg-primaryColor"
                            onClick={handleNext}
                            disabled={currentStep === steps.length && !complete}
                        >
                            {currentStep === steps.length ? "Finish" : "Next"}
                        </button>
                        :
                        <button
                            disabled
                            className="btn font-semibold border border-gray-200 px-5 py-1 rounded-lg text-white bg-primaryColor"
                        >
                            Please click + icon
                        </button>
                }
            </div>
        </div>
    );
};

export default StepTwo;