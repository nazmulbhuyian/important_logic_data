products = [
    {
        "name": "Laptop",
        "price": 1200,
        "brands": "HP",
        "avality": 0,
        "filters": [
            {"generation": 11},
            {"display": 14},
            {"ram": 8}
        ]
    },
    {
        "name": "Laptop",
        "price": 1400,
        "brands": "ASUS",
        "avality": 1,
        "filters": [
            {"generation": 13},
            {"display": 11},
            {"ram": 4}
        ]
    },
    {
        "name": "Laptop",
        "price": 800,
        "brands": "DELL",
        "avality": 3,
        "filters": [
            {"generation": 10},
            {"display": 14},
            {"ram": 8}
        ]
    },
    {
        "name": "Laptop",
        "price": 1000,
        "brands": "LENOVO",
        "avality": 1,
        "filters": [
            {"generation": 8},
            {"display": 16},
            {"processor": "Intel"}
        ]
    },
    {
        "name": "Laptop",
        "price": 1600,
        "brands": "MSI",
        "avality": 3,
        "filters": [
            {"type": "led"},
            {"display": 14},
            {"processor": "Intel"},
            {"rom": 512}
        ]
    }
]

filter_data = {
    "min_price": 700,
    "max_price": 1000,
    "avality": [1, 3],
    "brands": ["LENOVO", "MSI", "HP", "ASUS"],
    "filters": [
        {"generation": [8, 11]},
        {"display": [11, 14, 16]},
        {"ram": [4, 8]}
    ]
}

export const findAllCategoryServices = async () => {
    const filterData = {
    "min_price": 700,
    "max_price": 2000,
    "avality": [1, 3],
    "brands": ["LENOVO", "MSI", "HP", "ASUS"],
    "filters": [
        {"generation": [8, 13]},
        {"display": [11, 14, 16]},
        {"ram": [4, 8]}
    ]
}

    const products = await CategoryModel.find({}).sort({ "_id": -1 }).select("-__v -createdAt -updatedAt");
    


const filteredProducts = products.filter(product => {
        if (
            filterData.min_price <= product.price && product.price <= filterData.max_price &&
            filterData.avality.includes(product.avality) &&
            filterData.brands.includes(product.brands)
        ) {
            return filterData.filters.every(filterCondition => {
                return Object.entries(filterCondition).every(([key, value]) => {
                    return product.filters.some(filter => {
                        return filter[key] !== undefined && value.includes(filter[key]);
                    });
                });
            });
        }
        return false;
    });

console.log(filteredProducts)


}
