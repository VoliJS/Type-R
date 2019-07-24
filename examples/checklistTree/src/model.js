// Data objects are defined in nestedtypes package.
import { Model, Collection, define, type } from '@type-r/models'

@define class Checklist extends Collection {
    get checked(){ return this.every( item => item.checked ); }
    set checked( checked ){
        if( checked !== this.checked ){
            this.updateEach( item => { item.checked = checked } );
        }
    }
}

@define
export class ChecklistItem extends Model {
    static Collection = Checklist;

    static attributes = { // <- Here's an attribute spec. Think of it as a type spec.
        name : String,
        created : Date,
        checked : type( Boolean ).watcher( 'onCheckedChange' ),
        subitems : type( Checklist ).watcher( 'onSubitemsChange' )
    };

    onCheckedChange( checked ){ this.subitems.checked = checked; }

    onSubitemsChange( subitems ){
        if( subitems.length ){
            this.checked = this.subitems.checked;
        }
    }

    remove(){ this.collection.remove( this ); }
}