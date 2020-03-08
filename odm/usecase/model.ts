import { db } from './database'

class User {
    id 
}

db
    .collection( 'users', User, {
        id : doc => [ doc.a, doc.b ],

        filters : {
            brief : Q.where( ).limit
        }
    });


db.fromCollection( 'users', UserLight, {

})