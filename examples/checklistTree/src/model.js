// Data objects are defined in nestedtypes package.
import { Model, Collection, define, type } from '@type-r/models'

const Checklist = predefine();

Checklist.Attributes({
    name : String,
    created : Date,
    checked : type( Boolean )
        .onChange( ( model, checked ) => {
            model.subitems.updateEach( item => { item.checked = checked } ) 
        }),

    subitems : type( Checklist )
        .onChange( model => {
            model.checked = model.every( item => item.checked );
        })
});

@define
export class ChecklistItem extends Model {
    static Collection = Checklist;

    static attributes = { // <- Here's an attribute spec. Think of it as a type spec.
    };

    remove(){ this.collection.remove( this ); }
}