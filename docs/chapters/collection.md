# Collection

Collections are ordered sets of models. The collection is an array-like object exposing ES6 Array and BackboneJS Collection interface. It encapsulates JS Array of models (`collection.models`) and a hashmap for a fast O(1) access by the model `id` and `cid` (`collection.get( id )`).

Collactions are deeply observable. You can bind "changes" events to be notified when the collection has been modified, listen for the model "add",  "remove", and "change" events.

Every `Model` class has an implicitly defined `Collection` accessible as a static member of a model's constructor. In a most cases, you don't need to define the custom collection class.

```javascript
@define class Book extends Model {
    static attributes = {
        title : String
        author : Author
    }
}

// Implicitly defined collection.
const books = new Book.Collection();
```

You can define custom collection classes extending `Model.Collection` or any other collection class. It can either replace the default Collection type, or 

```javascript
// Define custom collection class.
@define class Library extends Model.Collection {
    doSomething(){ ... }
}

@define class Book extends Model {
    // Override the default collection.
    static Collection = Library;
}

// Define another custom collection class.
@define class OtherLibrary extends Model.Collection {
    // Specify the model so the collection will be able to restore itself from JSON.
    static model = Book; 
}
```

<aside class="notice">
The collection must know the type of its models to restore its elements from JSON properly. When the `model` is not specified, the collection can hold any Model subclass but it cannot deserialize itself.
</aside>

## Collection types

### `constructor` CollectionClass( models?, options? )

The most common collection type is an **aggregating serializable collection**. By default, collection aggregates its elements which are treated as an integral part of the collection (serialized, cloned, disposed, and validated recursively). An aggregation means the _single owner_, as the single object cannot be an integral part of two distinct things. The collection will take ownership on its models and will put an error in the console if it can't.

When creating a Collection, you may choose to pass in the initial array of models.

```javascript
@define class Role extends Model {
    static attributes = {
        name : String
    }
}

const roles = new Role.Collection( json, { parse : true } );
```

### `constructor` CollectionClass.Refs( models?, options? )

Collection of model references is a **non-aggregating non-serializable collection**. `Collection.Refs` doesn't aggregate its elements, which means that containing models are not considered as an integral part of the enclosing collection and not being validated, cloned, disposed, and serialized recursively.

It is useful for a local non-persistent application state.

### `metatype` subsetOf(masterRef, CollectionClass?)

The subset of other collections are **non-aggregating serializable collection**. Subset-of collection is serialized as an array of model ids and used to model many-to-many relationships. The collection object itself is recursively created and cloned, however, its models are not aggregated by the collection thus they are not recursively cloned, validated, or disposed. `CollectionClass` argument may be omitted unless you need the model's attribute to be an instance of the particular collection class.

<aside class="notice">
<b>subsetOf</b> collections are not deeply observable.
</aside>

<aside class="notice">
Since its an attribute <i>metatype</i> (combination of type and attribute metadata), it's not a real constructor and cannot be used with <b>new</b>. Use <b>collection.createSubset()</b> method to create subset-of collection instances.
</aside>

Must have a reference to the master collection which is used to resolve model ids to models. `masterRef` may be:

- direct reference to a singleton collection.
- function, returning the reference to the collection.
- symbolic dot-separated path to the master collection resolved relative to the model's `this`. You may use `owner` and `store` macro in path:
    - `owner` is the reference to the model's owner. `owner.some.path` works as `() => this.getOwner().some.path`.
    - `store` is the reference to the closes store. `store.some.path` works as `() => this.getStore().some.path`.

```javascript
@define class Role extends Model {
    static attributes = {
        name : String,
        ...
    }
}

@define class User extends Model {
    static attributes = {
        name : String,
        roles : subsetOf( 'owner.roles', Role.Collection )
    }
}

@define class UsersDirectory extends Store {
    static attributes = {
        roles : Role.Collection,
        users : User.Collection // `~roles` references will be resolved against this.roles
    }
}
```

## Array API

A collection class is an array-like object implementing ES6 Array methods and properties.

### collection.length

Like an array, a Collection maintains a length property, counting the number of models it contains.

### collection.slice( begin, end )

Return a shallow copy of the `collection.models`, using the same options as native Array#slice.

### collection.indexOf( recordOrId : any ) : number

Return an index of the model in the collection, and -1 if there is no such a model in the collection.

Can take the model itself as an argument, `id`, or `cid` of the model.

### collection.forEach( iteratee : ( val : Model, index ) => void, context? )

Iterate through the elements of the collection.

<aside class="notice">Use <code>collection.updateEach( iteratee, index )</code> method to update models in a loop.</aside>

### collection.map( iteratee : ( val : Model, index ) => T, context? )

Map elements of the collection. Similar to `Array.map`.

### collection.filter( iteratee : Predicate, context? )

Return the filtered array of models matching the predicate.

The predicate is either the iteratee function returning boolean, or an object with attribute values used to match with model's attributes.

### collection.every( iteratee : Predicate, context? ) : boolean

Return `true` if all models match the predicate.

### collection.some( iteratee : Predicate, context? ) : boolean

Return `true` if at least one model matches the predicated.

### collection.push( model, options? )

Add a model at the end of a collection. Takes the same options as `add()`.

### collection.pop( options? )
Remove and return the last model from a collection. Takes the same options as `remove()`.

### collection.unshift( model, options? )

Add a model at the beginning of a collection. Takes the same options as `add()`.

### collection.shift( options? )
Remove and return the first model from a collection. Takes the same options as `remove()`.

## Backbone API

Common options used by Backbone API methods:

- `{ sort : false }` - do not sort the collection.
- `{ parse : true }` - parse raw JSON (used to set collection with data from the server).

### `callback` collection.initialize( models?, options? )

Initialization function which is called at the end of the constructor.

### collection.clone()

Clone the collection. An aggregating collection will be recursively cloned, non-aggregated collections will be shallow cloned.

### collection.models

Raw access to the JavaScript array of models inside of the collection. Usually, you'll want to use `get`, `at`, or the other methods to access model objects, but occasionally a direct reference to the array is desired.

### collection.get( id )
Get a model from a collection, specified by an `id`, a `cid`, or by passing in a model.

```javascript
const book = library.get(110);
```

### collection.at( index )

Get a model from a collection, specified by index. Useful if your collection is sorted, and if your collection isn't sorted, at will still retrieve models in insertion order. When passed a negative index, it will retrieve the model from the back of the collection.

### collection.add( models, options? )

Add a model (or an array of models) to the collection. If this is the `Model.Collection`, you may also pass raw attributes objects, and have them be vivified as instances of the `Model`. Returns the added (or preexisting, if duplicate) models.

Pass `{at: index}` to splice the model into the collection at the specified index. If you're adding models to the collection that are already in the collection, they'll be ignored, unless you pass `{merge: true}`, in which case their attributes will be merged into the corresponding models.

1. Trigger the one event per model:
    - `add`(model, collection, options) for each model added.
    - `change`(model, options) for each model changed (if the `{merge: true}` option is passed).
3. Trigger the single event:
    - `update`(collection, options) if any models were added.
    - `sort`(collection, options) if an order of models was changed.
4. Trigger `changes` event in case if any changes were made to the collection and objects inside.

### collection.remove( models, options? )

Remove a model (or an array of models) from the collection, and return them. Each model can be a model instance, an id string or a JS object, any value acceptable as the id argument of collection.get.

1. Trigger `remove`(model, collection, options) for each model removed.
3. If any models were removed, trigger:
    - `update`(collection, options)
    - `changes`(collection, options).

### collection.set( models, options? )

The set method performs a "smart" update of the collection with the passed list of models. If a model in the list isn't yet in the collection it will be added; if the model is already in the collection its attributes will be merged; and if the collection contains any models that aren't present in the list, they'll be removed. All of the appropriate "add", "remove", and "change" events are fired as this happens. Returns the touched models in the collection. If you'd like to customize the behavior, you can disable it with options: `{remove: false}`, or `{merge: false}`.

#### Events
1. Trigger the one event per model:
    - `add`(model, collection, options) for each model added.
    - `remove`(model, collection, options) for each model removed.
    - `change`(model, options) for each model changed.
3. Trigger the single event:
    - `update`(collection, options) if any models were added.
    - `sort`(collection, options) if an order of models was changed.
4. Trigger `changes` event in case if any changes were made to the collection and objects inside.

```javascript
const vanHalen = new Man.Collection([ eddie, alex, stone, roth ]);

vanHalen.set([ eddie, alex, stone, hagar ]);

// Fires a "remove" event for roth, and an "add" event for hagar.
// Updates any of stone, alex, and eddie's attributes that may have
// changed over the years.
```

### collection.reset(models, options?)

Replace the collection's content with the new models. More efficient than `collection.set`, but does not send model-level events.

Calling `collection.reset()` without passing any models as arguments will empty the entire collection.

1. Trigger event `reset`(collection, options).
2. Trigger event `changes`(collection, options).

### collection.pluck(attribute) 

Pluck an attribute from each model in the collection. Equivalent to calling map and returning a single attribute from the iterator.

```javascript
const users = new UserCollection([
  {name: "Curly"},
  {name: "Larry"},
  {name: "Moe"}
]);

const names = users.pluck("name");

alert(JSON.stringify(names));
```

## Sorting

Type-R implements BackboneJS Collection sorting API with some extensions.

### collection.sort(options?)

Force a collection to re-sort itself. You don't need to call this under normal circumstances, as a collection with a comparator will sort itself whenever a model is added. To disable sorting when adding a model, pass `{sort: false}` to add. Calling sort triggers a "sort" event on the collection.

By default, there is no comparator for a collection. If you define a comparator, it will be used to maintain the collection in sorted order. This means that as models are added, they are inserted at the correct index in `collection.models`.

Note that Type-R depends on the arity of your comparator function to determine between the two styles, so be careful if your comparator function is bound.

Collections with a comparator will not automatically re-sort if you later change model attributes, so you may wish to call sort after changing model attributes that would affect the order.

### `static` comparator = 'attrName'

Maintain the collection in sorted order by the given model's attribute.

### `static` comparator = x => number | string

Maintain the collection in sorted order according to the "sortBy" comparator function.

"sortBy" comparator functions take a model and return a numeric or string value by which the model should be ordered relative to others.

### `static` comparator = (x, y) => -1 | 0 | 1

Maintain the collection in sorted order according to the "sort" comparator function.

"sort" comparator functions take two models and return -1 if the first model should come before the second, 0 if they are of the same rank and 1 if the first model should come after.

Note how even though all of the chapters in this example are added backward, they come out in the proper order:

```javascript
@define class Chapter extends Model {
    static attributes = {
        page : Number,
        title : String
    }
}

var chapters = new Chapter.Collection();

chapters.comparator = 'page';

chapters.add({page: 9, title: "The End"});
chapters.add({page: 5, title: "The Middle"});
chapters.add({page: 1, title: "The Beginning"});

alert(chapters.map( x => x.title ));
```

## Other methods

### CollectionClass.from( models, options? )

Create `CollectionClass` from the array of models. Similar to direct collection creation, but supports additional option for strict data validation.
If `{ strict : true }` option is passed the validation will be performed and an exception will be thrown in case of an error.

Please note, that Type-R always performs type checks on assignments, convert types, and reject improper updates reporting it as an error. It won't, however, execute custom validation
rules on every update as they are evaluated lazily. `strict` option will invoke custom validators and will throw on every error or warning instead of reporting them and continue.

```javascript
// Validate the body of an incoming HTTP request.
// Throw an exception if validation fails.
const body = MyRequestBody.from( ctx.request.body, { parse : true, strict : true });
```

### collection.createSubset( models?, options? )

Create the collection which is a subset of a source collection serializable as an array of model ids. Takes the same arguments as the collection's constructor.

The created collection is an instance of `subsetOf( sourceCollection, CollectionCtor )` attribute type (non-aggregating serializable collection). 

<aside class="notice">
Records in the collection must have an `id` attribute populated to work properly with subsets.
</aside>

### collection.assignFrom( otherCollection )

Synchronize the state of the collection and its aggregation tree with other collection of the same type. Updates existing objects in place. Model in the collection is considered to be "existing" if it has the same `id`.

Equivalent to `collection.set( otherCollection.models, { merge : true } )` and triggers similar events on change.

### collection.dispose()

Dispose of the collection. An aggregating collection will recursively dispose of its models.