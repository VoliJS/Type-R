

export const couchbase = connection({
    database : {
        cache : 'cache',
        store : 'store',
    }
});

export const couchbase = connection({

})
.database( 'cache' )
.database( 'store' );