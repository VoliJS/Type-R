Type-R implements Backbone 1.1 events API in the form of the `Events` mixin and `Messenger` base class.

An implementation is optimized for the large amount of subscriptions
![performance](./events-performance.jpg)

## Events mixin

Events is a mixin, giving the object the ability to bind and trigger custom named events. Events do not have to be declared before they are bound, and may take passed arguments.

#### eventSource.on(event, callback, [context])

Bind a callback function to an object. The callback will be invoked whenever the event is fired. If you have a large number of different events on a page, the convention is to use colons to namespace them: "poll:start", or "change:selection". The event string may also be a space-delimited list of several events...

    book.on("change:title change:author", ...);

Callbacks bound to the special "all" event will be triggered when any event occurs, and are passed the name of the event as the first argument. For example, to proxy all events from one object to another:

    proxy.on("all", function(eventName) {
        object.trigger(eventName);
    });

All event methods also support an event map syntax, as an alternative to positional arguments:

    book.on({
        "change:author": authorPane.update,
        "change:title change:subtitle": titleView.update,
        "destroy": bookView.remove
    });

To supply a context value for this when the callback is invoked, pass the optional last argument: `model.on('change', this.render, this)` or `model.on({change: this.render}, this)`.

#### eventSource.off([event], [callback], [context])

Remove a previously-bound callback function from an object. If no context is specified, all of the versions of the callback with different contexts will be removed. If no callback is specified, all callbacks for the event will be removed. If no event is specified, callbacks for all events will be removed.

    // Removes just the `onChange` callback.
    object.off("change", onChange);

    // Removes all "change" callbacks.
    object.off("change");

    // Removes the `onChange` callback for all events.
    object.off(null, onChange);

    // Removes all callbacks for `context` for all events.
    object.off(null, null, context);

    // Removes all callbacks on `object`.
    object.off();

Note that calling `model.off()`, for example, will indeed remove all events on the model — including events that Backbone uses for internal bookkeeping.

#### eventsSource.trigger(event, [*args]) 

Trigger callbacks for the given event, or space-delimited list of events. Subsequent arguments to trigger will be passed along to the event callbacks.

#### eventsSource.once(event, callback, [context]) 
Just like on, but causes the bound callback to fire only once before being removed. Handy for saying "the next time that X happens, do this". When multiple events are passed in using the space separated syntax, the event will fire once for every event you passed in, not once for a combination of all events

#### eventsSource.listenTo(other, event, callback) 
Tell an object to listen to a particular event on an other object. The advantage of using this form, instead of other.on(event, callback, object), is that listenTo allows the object to keep track of the events, and they can be removed all at once later on. The callback will always be called with object as context.

    view.listenTo(model, 'change', view.render);

#### eventsSource.stopListening([other], [event], [callback]) 

Tell an object to stop listening to events. Either call stopListening with no arguments to have the object remove all of its registered callbacks ... or be more precise by telling it to remove just the events it's listening to on a specific object, or a specific event, or just a specific callback.

    view.stopListening();

    view.stopListening(model);

#### eventsSource.listenToOnce(other, event, callback) 

Just like listenTo, but causes the bound callback to fire only once before being removed.

## Messenger

Messenger is an abstract base class implementing Events mixin and some convinience methods.

#### messenger.cid

Unique run-time only messenger instance id.

#### messenger.initialize()

Callback which is called at the end of the constructor.

#### messenger.dispose()

Executes `messenger.stopListening()` and `messenger.off()`.