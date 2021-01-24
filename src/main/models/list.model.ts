import { model } from "mongoose";
import { IListDocument } from "./list.types";
import ListSchema from "./list.schema";

export const ListModel = model<IListDocument>("lists", ListSchema);