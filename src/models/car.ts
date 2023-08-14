import mongoose from "mongoose";
const carSchema = new mongoose.Schema({
    related: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'new'
    },
    vin: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },

})