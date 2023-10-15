const mongoose = require('mongoose');
// Define the schemas
const addressSchema = new mongoose.Schema({
    user: String,
    userName: String,
    year: Number,
});

const dataSchema = new mongoose.Schema({
    name: String,
    year: Number,
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'addresses',
    },
});

// Create models
export const Address = mongoose.model('addresses', addressSchema);
export const Data = mongoose.model('datas', dataSchema);



//  in typescript
import { Schema, model, Document, Types } from 'mongoose';

// Define the interfaces for address and data
interface IAddress extends Document {
  user: string;
  userName: string;
  year: number;
}

interface IData extends Document {
  name: string;
  year: number;
  address: Types.ObjectId | IAddress;
}

// Define the schemas
const addressSchema = new Schema<IAddress>({
  user: String,
  userName: String,
  year: Number,
});

const dataSchema = new Schema<IData>({
  name: String,
  year: Number,
  address: {
    type: Schema.Types.ObjectId,
    ref: 'addresses',
  },
});

// Create models
export const Address = model<IAddress>('addresses', addressSchema);
export const Data = model<IData>('datas', dataSchema);




// Post a reg data in db
export const postRegUserServices = async (userData) => {
    const newAddress = {
        user: userData.address.user,
        userName: userData.address.userName,
        year: userData.address.year,
    };
    const createUser = await Address.create(newAddress);

    const newUserData = {
        name: userData.name,
        year: userData.year,
        address: createUser._id, // Reference to the new Address document
    };
    const createUser2 = await Data.create(newUserData);
    return createUser2
}


// find one data
export const findOneRegUserServices = async (userData) => {

    // const FindUser = await Data.findOne({ name: "nazmul" });
    // const FindUser2 = await Address.findOne({ _id: FindUser?.address });
    // return {FindUser, FindUser2};

    const allDataWithAddresses = await Data.findOne({ name: "nazmul2" }).populate('address');
    return allDataWithAddresses;
}

// find all data
export const sendAllDataSpecificRegUserServices = async (userData) => {

    const allDataWithAddresses = await Data.find({}).populate('address');
    // const formattedData = allDataWithAddresses.map((data: { name: any; address: { user: any; userName: any; }; }) => ({
    //     name: data.name,
    //     user: data.address.user,
    //     userName: data.address.userName,
    // }));

    const formattedData = allDataWithAddresses.map((data) => ({
        name: data.name,
        address: {
            user: data.address.user,
            userName: data.address.userName,
        },
    }));

    return formattedData;

}

export const findOneAndSendSpecificRegUserServices = async (userData) => {
    const allDataWithAddresses = await Data.findOne({ name: "nazmul" }).populate('address');

    if (allDataWithAddresses) {
        const { name, address } = allDataWithAddresses;
        const filteredData = {
            name,
            address: {
                user: address.user,
                userName: address.userName,
            },
        };

        return filteredData;
    } else {
        return null; // Handle the case where the data is not found
    }
}


export const postRegUser = async (req, res, next) => {
    try {

        const data = req.body;
        const result = await postRegUserServices(data);
        if (!result) {
            return res.send('User Not Added. Something Wrong');
        } else {
            res.status(200).json({
                status: 'Successfully',
                data: result
            })
        }

        res.status(200).json({
            status: 'Successfully',
            data: result
        })

    } catch (error) {
        res.status(400).json({
            status: 'Failled',
            message: "User Registration Failed"
        })
    }
}