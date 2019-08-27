import { auto, Collection, CollectionConstructor, define, Record, type, value } from "type-r";
import { LocalStorageEndpoint } from '@type-r/endpoints';
import * as uuid from 'node-uuid';
import "reflect-metadata";


@define export class ToDo extends Record {

    // Use LocalStroge to store todos.
    static endpoint = new LocalStorageEndpoint('angularToDoMvc');

    static Collection: CollectionConstructor<ToDo>;

    @value(false).required.as completed: boolean;
    @type(String).required.as title: string;

    setTitle(title) {
        this.title= title;
    }
}


export const ToDos: Collection<ToDo> = new ToDo.Collection();
