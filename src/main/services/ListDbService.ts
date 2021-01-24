import {IListDocument} from '../models/list.types';
import * as mongoose from 'mongoose';
import {ListModel} from "../models/list.model";

//const database = require('../../../database.json');

//database.lists.forEach((l: IListDocument) => new ListModel(l).save())

mongoose.connect('mongodb://localhost/shoppinglist', {useNewUrlParser: true})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

export async function getLists(chatId: number): Promise<IListDocument[]> {
    return ListModel.find({chatId});
}

export async function getList(listId: string): Promise<IListDocument> {
    return ListModel.findOne({id: listId});
}

export async function getListByName(chatId: number, name: string): Promise<IListDocument> {
    return ListModel.findOne({chatId, name});
}

export async function addList(chatId: number, name: string, products: string[]) {
    let listByName = await getListByName(chatId, name);

    if (listByName && listByName.name) {
        return listByName;
    }
    return ListModel.create(
        {
            id: new Date().getTime(),
            chatId,
            name,
            products
        });
}

export async function delList(chatId: number, name: string) {
    return ListModel.deleteOne({chatId, name})
}
