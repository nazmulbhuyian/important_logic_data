import Select from "react-select";
const UpdateMultiSpecSelect = ({ setSelectedSpecifications, specification, selectedSpecifications }) => {
  // Function to handle selecting/unselecting values
  const handleSelectChange = (specId, specName, selectedOptions) => {
    const selectedValues = selectedOptions?.map((option) => ({
      _id: option?._id,
      specification_value_name: option?.specification_value_name,
    }));

    setSelectedSpecifications((prevState) => {
      const specIndex = prevState?.findIndex((spec) => spec?._id === specId);

      if (specIndex > -1) {
        // Specification exists, update the values
        const updatedSpec = {
          ...prevState[specIndex],
          specification_values: selectedValues,
        };
        return [
          ...prevState.slice(0, specIndex),
          updatedSpec,
          ...prevState.slice(specIndex + 1),
        ];
      } else {
        // Specification doesn't exist, add it with selected values
        return [
          ...prevState,
          {
            _id: specId,
            specification_name: specName,
            specification_values: selectedValues,
          },
        ];
      }
    });
  };
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {specification?.map((spec) => {
          // Find the selected specification for the current spec
          const selectedSpec = selectedSpecifications.find(
            (s) => s._id === spec._id
          );

          return (
            <div key={spec?._id}>
              <h3>{spec?.specification_name}</h3>
              <Select
                isMulti
                options={spec?.specification_values}
                getOptionLabel={(option) => option?.specification_value_name}
                getOptionValue={(option) => option?._id}
                onChange={(selectedOptions) =>
                  handleSelectChange(
                    spec?._id,
                    spec?.specification_name,
                    selectedOptions
                  )
                }
                placeholder={`Select ${spec?.specification_name}`}
                className="mb-3"
                value={
                  selectedSpec?.specification_values.map((value) => ({
                    _id: value._id,
                    specification_value_name: value.specification_value_name,
                  })) || []
                } // Set default value from selectedSpecifications
              />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default UpdateMultiSpecSelect;
