

// const ProductCompareTable = ({ products }) => {
//     const renderHeader = () => {
//         return (
//             <tr>
//                 <th>Specification</th>
//                 {products.map((product) => (
//                     <th key={product._id}>{product.name}</th>
//                 ))}
//             </tr>
//         );
//     };

//     const renderRows = () => {
//         const allSpecifications = products.reduce((acc, product) => {
//             return acc.concat(product.specification);
//         }, []);

//         const uniqueSpecifications = [...new Map(allSpecifications.map((spec) => [spec._id, spec])).values()];

//         return uniqueSpecifications.reduce((acc, spec) => {
//             const detailRows = spec.specification_details.map((detail) => (
//                 <tr key={detail._id}>
//                     <td>{detail.specification_details_name}</td>
//                     {products.map((product) => (
//                         <td key={product._id}>
//                             {product.specification
//                                 .find((pSpec) => pSpec._id === spec._id)
//                                 ?.specification_details.find((pDetail) => pDetail._id === detail._id)
//                                 ?.specification_details_value || '-'}
//                         </td>
//                     ))}
//                 </tr>
//             ));

//             return [...acc, <tr key={spec._id}><td colSpan={products.length + 1}>{spec.specification_name}</td></tr>, ...detailRows];
//         }, []);
//     };

//     return (
//         <table className="table-auto border-collapse w-full">
//             <thead>{renderHeader()}</thead>
//             <tbody>{renderRows()}</tbody>
//         </table>
//     );
// };

// export default ProductCompareTable;






const ProductCompareTable = ({ products }) => {
    const renderHeader = () => {
        return (
            <tr>
                <th>Specification</th>
                {products.map((product) => (
                    <th key={product._id}>{product.name}</th>
                ))}
            </tr>
        );
    };

    const renderRows = () => {
        const allSpecifications = products.reduce((acc, product) => {
            return acc.concat(product.specification);
        }, []);

        const uniqueSpecifications = [...new Map(allSpecifications.map((spec) => [spec.specification_name, spec])).values()];

        return uniqueSpecifications.reduce((acc, spec) => {
            const detailRows = spec.specification_details.map((detail) => (
                <tr key={detail._id}>
                    <td>{detail.specification_details_name}</td>
                    {products.map((product) => (
                        <td key={product._id}>
                            {product.specification
                                .find((pSpec) => pSpec.specification_name === spec.specification_name)
                                ?.specification_details.find((pDetail) => pDetail.specification_name === detail.specification_name)
                                ?.specification_details_value || '-'}
                        </td>
                    ))}
                </tr>
            ));

            return [...acc, <tr key={spec._id}><td colSpan={products.length + 1}>{spec.specification_name}</td></tr>, ...detailRows];
        }, []);
    };

    return (
        <table className="table-auto border-collapse w-full">
            <thead>{renderHeader()}</thead>
            <tbody>{renderRows()}</tbody>
        </table>
    );
};

export default ProductCompareTable;




[
    {
        "_id": 1,
        "name" : "laptop",
        "specification" : [

            {
                "_id": "specification_2",
                "specification_name" : "Display Information",
                "specification_details" : [
                    {
                        "_id": "specification_details_4",
                        "specification_details_name" : "Audio",
                        "specification_details_value" : "102"
                    },
                    {
                        "_id": "specification_details_5",
                        "specification_details_name" : "Wifi",
                        "specification_details_value" : "52"
                    },
                    {
                        "_id": "specification_details_6",
                        "specification_details_name" : "USB",
                        "specification_details_value" : "120"
                    }
                ]
            },
            {
                "_id": "specification_4",
                "specification_name" : "Configure Information",
                "specification_details" : [
                    {
                        "_id": "specification_details_11",
                        "specification_details_name" : "Batery",
                        "specification_details_value" : "1"
                    },
                    {
                        "_id": "specification_details_12",
                        "specification_details_name" : "Adapter",
                        "specification_details_value" : "2"
                    },
                    {
                        "_id": "specification_details_13",
                        "specification_details_name" : "Blutooth",
                        "specification_details_value" : "3"
                    }
                ]
            },

            {
                "_id": "specification_6",
                "specification_name" : "Ports, Connectors & Slots Information",
                "specification_details" : [
                    {
                        "_id": "specification_details_360",
                        "specification_details_name" : "Audio Jack Combo",
                        "specification_details_value" : "mic jack"
                    },
                    {
                        "_id": "specification_details_1480",
                        "specification_details_name" : "Extra M.2 Slot",
                        "specification_details_value" : "Yes"
                    },
                    {
                        "_id": "specification_details_1370",
                        "specification_details_name" : "Supported SSD Type",
                        "specification_details_value" : "NVMe M.4"
                    }
                ]
            }

        ]
    },


    {
        "_id": 2,
        "name" : "Monitor",
        "specification" : [
            {
                "_id": "specification_1",
                "specification_name" : "Basic Information",
                "specification_details" : [
                    {
                        "_id": "specification_details_1",
                        "specification_details_name" : "Ram",
                        "specification_details_value" : "15"
                    },
                    {
                        "_id": "specification_details_2",
                        "specification_details_name" : "Rom",
                        "specification_details_value" : "35"
                    },
                    {
                        "_id": "specification_details_3",
                        "specification_details_name" : "Display",
                        "specification_details_value" : "121"
                    }
                ]
            },

            {
                "_id": "specification_4",
                "specification_name" : "Configure Information",
                "specification_details" : [
                    {
                        "_id": "specification_details_10",
                        "specification_details_name" : "Batery",
                        "specification_details_value" : "4"
                    },
                    {
                        "_id": "specification_details_11",
                        "specification_details_name" : "Adapter",
                        "specification_details_value" : "5"
                    },
                    {
                        "_id": "specification_details_12",
                        "specification_details_name" : "WEBCAM",
                        "specification_details_value" : "6"
                    }
                ]
            }]},

    {
        "_id": 3,
        "name" : "PC",
        "specification" : [

            {
                "_id": "specification_4",
                "specification_name" : "Configure Information",
                "specification_details" : [
                    {
                        "_id": "specification_details_11",
                        "specification_details_name" : "Batery",
                        "specification_details_value" : "18"
                    },
                    {
                        "_id": "specification_details_12",
                        "specification_details_name" : "Adapter",
                        "specification_details_value" : "30"
                    },
                    {
                        "_id": "specification_details_13",
                        "specification_details_name" : "Blutooth",
                        "specification_details_value" : "11"
                    }
                ]
            },
            {
                "_id": "specification_5",
                "specification_name" : "Ports, Connectors & Slots Information",
                "specification_details" : [
                    {
                        "_id": "specification_details_36",
                        "specification_details_name" : "Audio Jack Combo",
                        "specification_details_value" : "mic and headphone combo jack"
                    },
                    {
                        "_id": "specification_details_148",
                        "specification_details_name" : "Extra M.2 Slot",
                        "specification_details_value" : "NO"
                    },
                    {
                        "_id": "specification_details_137",
                        "specification_details_name" : "Supported SSD Type",
                        "specification_details_value" : "NVMe M.2"
                    }
                ]
            }

            ]}

]