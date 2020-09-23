// Data objects are defined in nestedtypes package.
import { Model, Collection, define, type, attributes, predefine, AttributesMixin } from '@type-r/models'

interface Checklist extends AttributesMixin<typeof Checklist>{}
@define class Checklist extends Model {
    static attributes = {
        name : String,
        created : Date,
        checked : type( Boolean )
            .onChange( ( model : any, checked ) => {
                ( model as any).subitems.updateEach( item => {
                    item.checked = checked;
                } );
            }),
    
        subitems : type([ Checklist ])
    }
}

const x = new Checklist()

x.subitems

const _Checklist = attributes({
    name : String,
    created : Date,
    checked : type( Boolean )
        .onChange( ( model : any, checked ) => {
            ( model as any).subitems.updateEach( item => {
                item.checked = checked;
            } );
        }),

    subitems : type([ Checklist ]).onChange(() => true )
});



interface Checklist_ extends AttributesMixin<typeof _Checklist>{
    subitems : Collection<Checklist>
}