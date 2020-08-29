(function() {

  var proxy = Backbone.Model.defaults({
    id     : '1-the-tempest',
    title  : "The Tempest",
    author : "Bill Shakespeare",
    audience : "",
    b : 0, a : void 0, c : void 0,
    d : 0,
    length : 123
  });

  var klass = Backbone.Collection.extend({
    model : proxy,
    url : function() { return '/collection'; }
  });
  var doc, collection;

  QUnit.module("Backbone.Model", {

    beforeEach: function(assert) {
      doc = new proxy({
        id     : '1-the-tempest',
        title  : "The Tempest",
        author : "Bill Shakespeare",
        length : 123,
        a : void 0, b : void 0, c : void 0, d : void 0
      });
      collection = new klass();
      collection.add(doc);
    }

  });

  QUnit.test("initialize", function(assert) {
    assert.expect(2);
    var Model = Backbone.Model.extend({
      attrbutes : {
        one : 5
      },

      initialize: function() {
        this.one = 1;
        //assert.equal(this.collection, collection); No access to collection in constructor.
      }
    });
    var model = new Model({}, {});
    assert.equal(model.one, 1);
    assert.equal(model.collection, void 0);
  });

  QUnit.test("initialize with attributes and options", function(assert) {
    assert.expect(1);
    var Model = Backbone.Model.extend({
      initialize: function(attributes, options) {
        this.one = options.one;
      }
    });

    var model = new Model({}, {one: 1});

    console.log( "TEST", model.initialize.toString() );

    assert.equal(model.one, 1);
  });

  QUnit.test("initialize with parsed attributes", function(assert) {
    assert.expect(1);
    var Model = Backbone.Model.extend({
      defaults :{
        value : 0
      },
      parse: function(attrs) {
        attrs.value += 1;
        return attrs;
      }
    });
    var model = new Model({value: 1}, {parse: true});
    assert.equal(model.get('value'), 2);
  });

  QUnit.test("initialize with defaults", function(assert) {
    assert.expect(2);
    var Model = Backbone.Model.extend({
      defaults: {
        first_name: 'Unknown',
        last_name: 'Unknown'
      }
    });
    var model = new Model({'first_name': 'John'});
    assert.equal(model.get('first_name'), 'John');
    assert.equal(model.get('last_name'), 'Unknown');
  });

  QUnit.test("parse can return null", function(assert) {
    assert.expect(1);
    var Model = Backbone.Model.extend({
      parse: function(attrs) {
        attrs.value += 1;
        return null;
      }
    });
    var model = new Model({value: 1}, {parse: true});
    assert.equal(JSON.stringify(model.toJSON()), "{}");
  });

  QUnit.test("clone", function(assert) {
    assert.expect(10);
    var a = new (Backbone.Model.defaults({ 'foo': 1, 'bar': 2, 'baz': 3}))();
    var b = a.clone();
    assert.equal(a.get('foo'), 1);
    assert.equal(a.get('bar'), 2);
    assert.equal(a.get('baz'), 3);
    assert.equal(b.get('foo'), a.get('foo'), "Foo should be the same on the clone.");
    assert.equal(b.get('bar'), a.get('bar'), "Bar should be the same on the clone.");
    assert.equal(b.get('baz'), a.get('baz'), "Baz should be the same on the clone.");
    a.set({foo : 100});
    assert.equal(a.get('foo'), 100);
    assert.equal(b.get('foo'), 1, "Changing a parent attribute does not change the clone.");

    var M = Backbone.Model.defaults({p: 1});
    var foo = new M({p: 1});
    var bar = new M({p: 2});
    bar.p = void 0;
    assert.equal(foo.get('p'), 1);
    assert.equal(bar.get('p'), undefined);
  });

  QUnit.test("isNew", function(assert) {
    var M = Backbone.attributes({ 'foo': 0, 'bar': 0, 'baz': 0});
    assert.expect(6);
    var a = new M({ 'foo': 1, 'bar': 2, 'baz': 3});
    assert.ok(a.isNew(), "it should be new");
    a = new M({ 'foo': 1, 'bar': 2, 'baz': 3, 'id': -5 });
    assert.ok(!a.isNew(), "any defined ID is legal, negative or positive");
    a = new M({ 'foo': 1, 'bar': 2, 'baz': 3, 'id': 0 });
    assert.ok(!a.isNew(), "any defined ID is legal, including zero");
    assert.ok( new M({          }).isNew(), "is true when there is no id");
    assert.ok(!new M({ 'id': 2  }).isNew(), "is false for a positive integer");
    assert.ok(!new M({ 'id': -5 }).isNew(), "is false for a negative integer");
  });

  QUnit.test("get", function(assert) {
    assert.expect(2);
    assert.equal(doc.get('title'), 'The Tempest');
    assert.equal(doc.get('author'), 'Bill Shakespeare');
  });

  QUnit.test("has", function(assert) {
    assert.expect(10);
    var model = new (Backbone.Model.defaults({
      'x0': 0,
      'x1': 0,
      'true': false,
      'false': false,
      'empty': '',
      'name': null,
      'null': null,
      'undefined': undefined
    }))();

    assert.strictEqual(model.has('name'), false);

    model.set({
      'x0': 0,
      'x1': 1,
      'true': true,
      'false': false,
      'empty': '',
      'name': 'name',
      'null': null,
      'undefined': undefined
    });

    assert.strictEqual(model.has('x0'), true);
    assert.strictEqual(model.has('x1'), true);
    assert.strictEqual(model.has('true'), true);
    assert.strictEqual(model.has('false'), true);
    assert.strictEqual(model.has('empty'), true);
    assert.strictEqual(model.has('name'), true);

    model.unset('name');

    assert.strictEqual(model.has('name'), false);
    assert.strictEqual(model.has('null'), false);
    assert.strictEqual(model.has('undefined'), false);
  });

  QUnit.test("set and unset", function(assert) {
    assert.expect(7);
    var a = new ( Backbone.Model.defaults({id: 'id', foo: 1, bar: 2, baz: 3}) );
    var changeCount = 0;
    a.on("change:foo", function() { changeCount += 1; });
    a.set({'foo': 2});
    assert.ok(a.get('foo') == 2, "Foo should have changed.");
    assert.ok(changeCount == 1, "Change count should have incremented.");
    // set with value that is not new shouldn't fire change event
    a.set({'foo': 2});
    assert.ok(a.get('foo') == 2, "Foo should NOT have changed, still 2");
    assert.ok(changeCount == 1, "Change count should NOT have incremented.");

    a.validate = function(attrs) {
      assert.equal(attrs.foo, void 0, "validate:true passed while unsetting");
    };
    a.unset('foo', {validate: true});
    assert.equal(a.get('foo'), void 0, "Foo should have changed");
    delete a.validate;
    assert.ok(changeCount == 2, "Change count should have incremented for unset.");

    a.unset('id');
    assert.equal(a.id, undefined, "Unsetting the id should remove the id property.");
  });

  QUnit.test("#2030 - set with failed validate, followed by another set triggers change", function(assert) {
    var attr = 0, main = 0, error = 0;
    var Model = Backbone.Model.extend({
      defaults : {
        x : 0
      },

      validate: function (attr) {
        if (this.x > 1) {
          error++;
          return "this is an error";
        }
      }
    });
    var model = new Model({x:0});
    model.on('change:x', function () { attr++; });
    model.on('change', function () { main++; });
    model.set({x:2});
    model.isValid();
    model.set({x:1});
    model.isValid();
    assert.deepEqual([attr, main, error], [2, 2, 1]);
  });

  QUnit.test("set triggers changes in the correct order", function(assert) {
    var value = null;
    var model = new Backbone.Model;
    model.on('last', function(){ value = 'last'; });
    model.on('first', function(){ value = 'first'; });
    model.trigger('first');
    model.trigger('last');
    assert.equal(value, 'last');
  });

  QUnit.test("set falsy values in the correct order", function(assert) {
    assert.expect(2);
    var model = new ( Backbone.Model.defaults({result: false}) );
    model.on('change', function() {
      assert.equal(model.changed.result, void 0);
      assert.equal(model.previous('result'), false);
    });
    model.set({result: void 0}, {silent: true});
    model.set({result: null}, {silent: true});
    model.set({result: false}, {silent: true});
    model.set({result: void 0});
  });

  QUnit.test("nested set triggers with the correct options", function(assert) {
    var model = new ( Backbone.Model.defaults({ a : 0 }));
    var o1 = {};
    var o2 = {};
    var o3 = {};
    model.on('change', function(__, options) {
      switch (model.get('a')) {
      case 1:
        assert.equal(options, o1);
        return model.set({ a : 2 }, o2);
      case 2:
        assert.equal(options, o2);
        return model.set({ a : 3}, o3);
      case 3:
        assert.equal(options, o3);
      }
    });
    model.set({ a : 1 }, o1);
  });

  QUnit.test("multiple unsets", function(assert) {
    assert.expect(1);
    var i = 0;
    var counter = function(){ i++; };
    var model = new ( Backbone.Model.defaults({a: 1}) );
    model.on("change:a", counter);
    model.set({a: 2});
    model.unset('a');
    model.unset('a');
    assert.equal(i, 2, 'Unset does not fire an event for missing attributes.');
  });

  QUnit.test("unset and changedAttributes", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({a: 1}) );
    model.on('change', function() {
      assert.ok('a' in model.changedAttributes(), 'changedAttributes should contain unset properties');
    });
    model.unset('a');
  });

  QUnit.test("using a non-default id attribute.", function(assert) {
    assert.expect(4);
    var MongoModel = Backbone.Model.extend({idAttribute : '_id', defaults : { _id : '', title : '' }});
    var model = new MongoModel({id: 'eye-dee', _id: 25, title: 'Model'});
    //assert.equal(model.get('id'), 'eye-dee');
    assert.equal(model.id, 25);
    assert.equal(model.isNew(), false);
    model.unset('_id');
    assert.equal(model.id, undefined);
    assert.equal(model.isNew(), true);
  });

  QUnit.test("setting an alternative cid prefix", function(assert) {
    assert.expect(4);
    var Model = Backbone.Model.extend({
      cidPrefix: 'm',

      defaults : { value : '' }
    });
    var model = new Model();

    assert.equal(model.cid.charAt(0), 'm');

    model = new Backbone.Model();
    assert.equal(model.cid.charAt(0), 'm');

    var Collection = Backbone.Collection.extend({
      model: Model
    });
    var collection = new Collection([{id: 'c5'}, {id: 'c6'}, {id: 'c7'}]);

    assert.equal(collection.get('c6').cid.charAt(0), 'm');
    collection.set([{id: 'c6', value: 'test'}], {
      merge: true,
      remove: false
    });
    assert.ok(collection.get('c6').has('value'));
  });

  QUnit.test("set an empty string", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({name : "Model"}) );
    model.set({name : ''});
    assert.equal(model.get('name'), '');
  });

  QUnit.test("setting an object", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({
      custom: { foo: 1 }
    }) );
    model.on('change', function() {
      assert.ok(1);
    });
    model.set({
      custom: { foo: 1 } // no change should be fired
    });
    model.set({
      custom: { foo: 2 } // change event should be fired
    });
  });

  QUnit.test("clear", function(assert) {
    assert.expect(3);
    var changed;
    var model = new ( Backbone.Model.defaults({id: 1, name : "Model"}) );
    model.on("change:name", function(){ changed = true; });
    model.on("change", function() {
      var changedAttrs = model.changedAttributes();
      assert.ok('name' in changedAttrs);
    });
    model.clear();
    assert.equal(changed, true);
    assert.equal(model.get('name'), undefined);
  });

  QUnit.test("defaults", function(assert) {
    assert.expect(2);
    var Defaulted = Backbone.Model.extend({
      defaults: {
        "one": 1,
        "two": 2
      }
    });
    var model = new Defaulted({two: undefined});
    assert.equal(model.get('one'), 1);
    assert.equal(model.get('two'), 2);
    /* defaults as function is deprecated.
    
    Defaulted = Backbone.Model.extend({
      defaults: function() {
        return {
          "one": 3,
          "two": 4
        };
      }
    });
    model = new Defaulted({two: undefined});
    assert.equal(model.get('one'), 3);
    assert.equal(model.get('two'), 4);*/
  });

  QUnit.test("change, hasChanged, changedAttributes, previous, previousAttributes", function(assert) {
    assert.expect(9);
    var model = new ( Backbone.Model.defaults({name: "Tim", age: 10}) )();
    assert.deepEqual(model.changedAttributes(), false);
    model.on('change', function() {
      assert.ok(model.hasChanged('name'), 'name changed');
      assert.ok(!model.hasChanged('age'), 'age did not');
      assert.ok(_.isEqual(model.changedAttributes(), {name : 'Rob'}), 'changedAttributes returns the changed attrs');
      assert.equal(model.previous('name'), 'Tim');
      assert.ok(_.isEqual(model.previousAttributes(), {name : "Tim", age : 10, id : void 0}), 'previousAttributes is correct');
    });
    assert.equal(model.hasChanged(), false);
    assert.equal(model.hasChanged(undefined), false);
    model.set({name : 'Rob'});
    assert.equal(model.get('name'), 'Rob');
  });

  QUnit.test("changedAttributes", function(assert) {
    assert.expect(3);
    var model = new (Backbone.Model.defaults({a: 'a', b: 'b'}))();
    assert.deepEqual(model.changedAttributes(), false);
    assert.equal(model.changedAttributes({a: 'a'}), false);
    assert.equal(model.changedAttributes({a: 'b'}).a, 'b');
  });

  QUnit.test("change with options", function(assert) {
    assert.expect(2);
    var value;
    var model = new ( Backbone.Model.defaults({name: 'Rob'}) );
    model.on('change', function(model, options) {
      value = options.prefix + model.get('name');
    });
    model.set({name: 'Bob'}, {prefix: 'Mr. '});
    assert.equal(value, 'Mr. Bob');
    model.set({name: 'Sue'}, {prefix: 'Ms. '});
    assert.equal(value, 'Ms. Sue');
  });

  QUnit.test("change after initialize", function(assert) {
    assert.expect(1);
    var changed = 0;
    var attrs = {id: 1, label: 'c'};
    var obj = new ( Backbone.Model.defaults(attrs) );
    obj.on('change', function() {
      changed += 1;
    });
    obj.set(attrs);
    assert.equal(changed, 0);
  });

  

  QUnit.test("validate", function(assert) {
    var lastError;
    var model = new ( Backbone.Model.defaults({ a: 0, admin : false }));
    model.validate = function(attrs) {
      if (this.admin != this.previous('admin')) return "Can't change admin status.";
    };
    model.on('invalid', function(model, error) {
      lastError = error;
    });
    var result = model.set({a: 100});
    assert.equal(result, model);
    assert.equal(model.get('a'), 100);
    assert.equal(lastError, undefined);
    result = model.set({admin: true});
    assert.equal(model.get('admin'), true);
    result = model.set({a: 200, admin: false});
    assert.equal(model.validationError.error, "Can't change admin status.");
    //assert.equal(result, false);
    assert.equal(model.get('a'), 200);
  });

  QUnit.test("validate on unset and clear", function(assert) {
    assert.expect(4);
    var error;
    var model = new ( Backbone.Model.defaults({name: "One"}) );
    model.validate = function(attrs) {
      if (!attrs.name) {
        error = true;
        return "No thanks.";
      }
    };
    model.set({name: "Two"});
    assert.equal(model.get('name'), 'Two');
    assert.equal(error, undefined);
    model.unset('name', {validate: true});
    model.isValid();
    assert.equal(error, true);
    assert.equal(model.get('name'), undefined );
  });

  QUnit.test("validate with error callback", function(assert) {
    assert.expect(8);
    var lastError, boundError;
    var model = new ( Backbone.Model.defaults( { a: 0, admin : '' }));
    model.validate = function(attrs) {
      if (this.admin) return "Can't change admin status.";
    };
    var result = model.set({a: 100}, {validate:true});
    assert.equal(result, model);
    assert.equal(model.get('a'), 100);
    assert.equal(model.validationError, null);
    assert.equal(boundError, undefined);
    result = model.set({a: 200, admin: true}, {validate:true});
    assert.equal( model.isValid(), false);
    assert.equal(model.get('a'), 200);
    assert.equal(model.validationError.error, "Can't change admin status.");

    assert.equal(model.isValid(), false);
  });

  QUnit.test("defaults always extend attrs (#459)", function(assert) {
    assert.expect(2);
    var Defaulted = Backbone.Model.extend({
      defaults: {one: 1},
      initialize : function(attrs, opts) {
        assert.equal(this.attributes.one, 1);
      }
    });
    var providedattrs = new Defaulted({});
    var emptyattrs = new Defaulted();
  });

  QUnit.test("Inherit class properties", function(assert) {
    assert.expect(6);
    var Parent = Backbone.Model.extend({
      instancePropSame: function() {},
      instancePropDiff: function() {}
    }, {
      classProp: function() {}
    });
    var Child = Parent.extend({
      instancePropDiff: function() {}
    });

    var adult = new Parent;
    var kid   = new Child;

    assert.equal(Child.classProp, Parent.classProp);
    assert.notEqual(Child.classProp, undefined);

    assert.equal(kid.instancePropSame, adult.instancePropSame);
    assert.notEqual(kid.instancePropSame, undefined);

    assert.notEqual(Child.prototype.instancePropDiff, Parent.prototype.instancePropDiff);
    assert.notEqual(Child.prototype.instancePropDiff, undefined);
  });

  QUnit.test("Nested change events don't clobber previous attributes", function(assert) {
    assert.expect(4);
    ( new ( Backbone.Model.defaults({ state : undefined, other : undefined, z : undefined }) ) )
    .on('change:state', function(model, newState) {
      equal(model.previous('state'), undefined);
      equal(newState, 'hello');
      // Fire a nested change event.
      model.set({other: 'whatever'});
    })
    .on('change:state', function(model, newState) {
      equal(model.previous('state'), undefined);
      equal(newState, 'hello');
    })
    .set({state: 'hello'});
  });

  QUnit.test("hasChanged/set should use same comparison", function(assert) {
    assert.expect(2);
    var changed = 0, model = new ( Backbone.Model.defaults({a: null}) );
    model.on('change', function() {
      assert.ok(model.hasChanged('a'));
    })
    .on('change:a', function() {
      changed++;
    })
    .set({a: undefined});
    assert.equal(changed, 1);
  });

  QUnit.test("#582, #425, change:attribute callbacks should fire after all changes have occurred", function(assert) {
    assert.expect(9);
    var model = new ( Backbone.Model.defaults({ a: '', b : '', c : '' }));

    var assertion = function() {
      assert.equal(model.get('a'), 'a');
      assert.equal(model.get('b'), 'b');
      assert.equal(model.get('c'), 'c');
    };

    model.on('change:a', assertion);
    model.on('change:b', assertion);
    model.on('change:c', assertion);

    model.set({a: 'a', b: 'b', c: 'c'});
  });

  QUnit.test("#871, set with attributes property", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.extend({
      attributes: { attributes : void 0 },
      properties : { attributes : false }
    }) );
    model.set({attributes: true});
    assert.ok(model.has('attributes'));
  });

  QUnit.test("set value regardless of equality/change", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({x: Array }) );
    var a = [];
    model.set({x: a});
    assert.ok(model.get('x') === a);
  });

  QUnit.test("set same value does not trigger change", function(assert) {
    assert.expect(0);
    var model = new ( Backbone.Model.defaults({x: 1}) );
    model.on('change change:x', function() { assert.ok(false); });
    model.set({x: 1});
    model.set({x: 1});
  });

  QUnit.test("unset does not fire a change for undefined attributes", function(assert) {
    assert.expect(0);
    var model = new ( Backbone.Model.defaults({x: undefined}) );
    model.on('change:x', function(){ assert.ok(false); });
    model.unset('x');
  });

  QUnit.test("set: undefined values", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({x: undefined}) );
    assert.ok('x' in model.attributes);
  });

  QUnit.test("hasChanged works outside of change events, and true within", function(assert) {
    assert.expect(6);
    var model = new ( Backbone.Model.defaults({x: 1}))();
    model.on('change:x', function() {
      assert.ok(model.hasChanged('x'));
      assert.equal(model.get('x'), 1);
    });
    model.set({x: 2}, {silent: true});
    assert.ok(model.hasChanged());
    assert.equal(model.hasChanged('x'), true);
    model.set({x: 1});
    assert.ok(model.hasChanged());
    assert.equal(model.hasChanged('x'), true);
  });

  QUnit.test("hasChanged gets cleared on the following set", function(assert) {
    assert.expect(4);
    var model = new ( Backbone.Model.defaults({ x : 0 }) );
    model.set({x: 1});
    assert.ok(model.hasChanged());
    model.set({x: 1});
    assert.ok(!model.hasChanged());
    model.set({x: 2});
    assert.ok(model.hasChanged());
    model.set({});
    assert.ok(!model.hasChanged());
  });

  QUnit.test("`previous` for falsey keys", function(assert) {
    assert.expect(2);
    var model = new ( Backbone.Model.defaults({ z0: true, z: true}) );
    model.set({z0: false, z: false}, {silent: true});
    assert.equal(model.previous( 'z0'), true);
    assert.equal(model.previous('z'), true);
  });

  QUnit.test("nested `set` during `'change:attr'`", function(assert) {
    assert.expect(2);
    var events = [];
    var model = new ( Backbone.Model.defaults({ x : false, y: false, z : false }) );
    model.on('all', function(event) { events.push(event); });
    model.on('change', function() {
      model.set({z: true}, {silent:true});
    });
    model.on('change:x', function() {
      model.set({y: true});
    });
    model.set({x: true});
    assert.deepEqual(events, ['change:y', 'change:x', 'change']);
    events = [];
    model.set({z: true});
    assert.deepEqual(events, []);
  });

  QUnit.test("nested `change` only fires once", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({ x : Boolean }) );
    model.on('change', function() {
      assert.ok(true);
      model.set({x: true});
    });
    model.set({x: true});
  });

  QUnit.test("nested `set` during `'change'`", function(assert) {
    assert.expect(6);
    var count = 0;
    var model = new ( Backbone.Model.defaults({ x : undefined, y : undefined, z : undefined }) );
    model.on('change', function() {
      switch(count++) {
        case 0:
          assert.deepEqual(model.changedAttributes(), {x: true});
          assert.equal(model.previous('x'), undefined);
          model.set({y: true});
          break;
        case 1:
          assert.deepEqual(model.changedAttributes(), {x: true, y: true});
          assert.equal(model.previous('x'), undefined);
          model.set({z: true});
          break;
        case 2:
          assert.deepEqual(model.changedAttributes(), {x: true, y: true, z: true});
          assert.equal(model.previous('y'), undefined);
          break;
        default:
          assert.ok(false);
      }
    });
    model.set({x: true});
  });

  QUnit.test("nested `change` with silent", function(assert) {
    assert.expect(3);
    var count = 0;
    var model = new ( Backbone.Model.defaults({ x : undefined, y : undefined, z : undefined }) );
    model.on('change:y', function() { assert.ok(false); });
    model.on('change', function() {
      switch(count++) {
        case 0:
          assert.deepEqual(model.changedAttributes(), {x: true});
          model.set({y: true}, {silent: true});
          model.set({z: true});
          break;
        case 1:
          assert.deepEqual(model.changedAttributes(), {x: true, y: true, z: true});
          break;
        case 2:
          assert.deepEqual(model.changedAttributes(), {z: false});
          break;
        default:
          assert.ok(false);
      }
    });
    model.set({x: true});
    model.set({z: false});
  });

  QUnit.test("nested `change:attr` with silent", function(assert) {
    assert.expect(0);
    var model = new ( Backbone.Model.defaults({ x : undefined, y : undefined, z : undefined }) );
    model.on('change:y', function(){ assert.ok(false); });
    model.on('change', function() {
      model.set({y: true}, {silent: true});
      model.set({z: true});
    });
    model.set({x: true});
  });

  QUnit.test("multiple nested changes with silent", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({ x : undefined, y : undefined, z : undefined }) );
    model.on('change:x', function() {
      model.set({y: 1}, {silent: true});
      model.set({y: 2});
    });
    model.on('change:y', function(model, val) {
      assert.equal(val, 2);
    });
    model.set({x: true});
  });

  QUnit.test("multiple nested changes with silent", function(assert) {
    assert.expect(1);
    var changes = [];
    var model = new ( Backbone.Model.defaults({ x : undefined, y : undefined, b : undefined }) );
    model.on('change:b', function(model, val) { changes.push(val); });
    model.on('change', function() {
      model.set({b: 1});
    });
    model.set({b: 0});
    assert.deepEqual(changes, [0, 1]);
  });

  QUnit.test("basic silent change semantics", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({ x : undefined, y : undefined, z : undefined }) );
    model.set({x: 1});
    model.on('change', function(){ assert.ok(true); });
    model.set({x: 2}, {silent: true});
    model.set({x: 1});
  });

  QUnit.test("nested set multiple times", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({ a : undefined, b : undefined, z : undefined }) );
    model.on('change:b', function() {
      assert.ok(true);
    });
    model.on('change:a', function() {
      model.set({b: true});
      model.set({b: true});
    });
    model.set({a: true});
  });

  QUnit.test("#1122 - clear does not alter options.", function(assert) {
    assert.expect(1);
    var model = new Backbone.Model();
    var options = {};
    model.clear(options);
    assert.ok(!options.unset);
  });

  QUnit.test("#1122 - unset does not alter options.", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({x: 6 }) );
    var options = {};
    model.unset('x', options);
    assert.ok(!options.unset);
  });

  QUnit.test("#1545 - `undefined` can be passed to a model constructor without coersion", function(assert) {
    var Model = Backbone.Model.extend({
      defaults: { one: 1 },
      initialize : function(attrs, opts) {
        assert.equal(attrs, undefined);
      }
    });
    var emptyattrs = new Model();
    var undefinedattrs = new Model(undefined);
  });

  QUnit.test("#1664 - Changing from one value, silently to another, back to original triggers a change.", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({x:1}) );
    model.on('change:x', function() { assert.ok(true); });
    model.set({x:2},{silent:true});
    model.set({x:3},{silent:true});
    model.set({x:1});
  });

  QUnit.test("#1664 - multiple silent changes nested inside a change event", function(assert) {
    assert.expect(2);
    var changes = [];
    var model = new (Backbone.Model.defaults({ a : '', b : 0, c : '' }) );
    model.on('change', function() {
      model.set({a:'c'}, {silent:true});
      model.set({b:2}, {silent:true});
      model.unset('c', {silent:true});
    });
    model.on('change:a change:b change:c', function(model, val) { changes.push(val); });
    model.set({a:'a', b:1, c:'item'});
    assert.deepEqual(changes, ['a',1,'item']);
    assert.deepEqual(model.attributes, {a: 'c', b: 2, c : void 0, id : void 0  });
  });

  QUnit.test("#1791 - `attributes` is available for `parse`", function(assert) {
    var Model = Backbone.Model.extend({
      parse: function() { this.has('a'); } // shouldn't throw an error
    });
    var model = new Model(null, {parse: true});
    assert.expect(0);
  });

  QUnit.test("silent changes in last `change` event back to original triggers change", function(assert) {
    assert.expect(2);
    var changes = [];
    var model = new ( Backbone.Model.defaults({ a : void 0, b : void 0, c : void 0 }) );
    model.on('change:a change:b change:c', function(model, val) { changes.push(val); });
    model.on('change', function() {
      model.set({a:'c'}, {silent:true});
    });
    model.set({a:'a'});
    assert.deepEqual(changes, ['a']);
    model.set({a:'a'});
    assert.deepEqual(changes, ['a', 'a']);
  });

  QUnit.test("#1943 change calculations should use _.isEqual", function(assert) {
    var model = new ( Backbone.Model.defaults({a: {key: 'value'}}) );
    model.set({ 'a' : {key:'value'} }, {silent:true});
    assert.equal(model.changedAttributes(), false);
  });

  QUnit.test("#1964 - final `change` event is always fired, regardless of interim changes", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({ property : void 0 }) );
    model.on('change:property', function() {
      model.property = 'bar';
    });
    model.on('change', function() {
      assert.ok(true);
    });
    model.property = 'foo';
  });

  QUnit.test("isValid", function(assert) {
    var model = new ( Backbone.Model.defaults({valid: true}) );
    model.validate = function() {
      if (!this.valid) return "invalid";
    };
    assert.equal(model.isValid(), true);
    model.set({valid: false});
    assert.equal(model.isValid(), false);
    model.set({valid:false});
    assert.equal(model.isValid(), false);
    //assert.ok(!model.set('valid', false, {validate: true}));
  });

  QUnit.test("#1179 - isValid returns true in the absence of validate.", function(assert) {
    assert.expect(1);
    var model = new Backbone.Model();
    //model.validate = null;
    assert.ok(model.isValid());
  });

  QUnit.test("#1961 - Creating a model with {validate:true} will call validate and use the error callback", function(assert) {
    var Model = Backbone.Model.extend({
      validate: function () {
        if (this.id === 1) return "This shouldn't happen";
      }
    });
    var model = new Model({id: 1}, {validate: true});
    assert.equal(model.validationError.error , "This shouldn't happen");
  });

  QUnit.test("#2034 - nested set with silent only triggers one change", function(assert) {
    assert.expect(1);
    var model = new ( Backbone.Model.defaults({ a : Boolean, b : Boolean }) );
    model.on('change', function() {
      model.set({b: true}, {silent: true});
      assert.ok(true);
    });
    model.set({a: true});
  });

  QUnit.test('#3778 - id will only be updated if it is set', function(assert) {
    assert.expect(2);
    var model = new ( Backbone.Model.defaults({id: 1, foo : void 0}) );
    model.id = 2;
    model.set({foo: 'bar'});
    assert.equal(model.id, 2);
    model.set({id: 3});
    assert.equal(model.id, 3);
  });
})();
