// Data objects are defined in nestedtypes package.
import { Record, define } from 'type-r'

@define class Checklist extends Record.Collection {
    get checked(){ return this.every( item => item.checked ); }
    set checked( checked ){
        if( checked !== this.checked ){
            this.updateEach( item => { item.checked = checked } );
        }
    }
}

@define
export class ChecklistItem extends Record {
    static Collection = Checklist;

    static attributes = { // <- Here's an attribute spec. Think of it as a type spec.
        name : String,
        created : Date,
        checked : Boolean.has.watcher( 'checkedWatcher' ),
        subitems : Checklist.has.watcher( 'subitemsWatcher' )
    };

    checkedWatcher( checked ){ this.subitems.checked = checked; }

    subitemsWatcher( subitems ){
        if( subitems.length ){
            this.checked = this.subitems.checked;
        }
    }

    remove(){ this.collection.remove( this ); }
}