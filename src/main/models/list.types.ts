import { Document, Model } from "mongoose";


export interface IList {
    chatId: number;
    name: string;
    products: string[];
}

export interface IListDocument extends IList, Document {}
export interface IListModel extends Model<IListDocument> {}