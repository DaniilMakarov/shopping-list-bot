import { Schema } from "mongoose";

const schema = new Schema({
    id: {
        type: String,
        required: true
    },
    chatId: {
        type: Number,
        required: true,
        default: 0
    },
    name: {
        type: String,
        required: true
    },
    products: {
        type: [String],
        default: []
    }
});

export default schema;