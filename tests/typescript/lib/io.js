import * as tslib_1 from "tslib";
import "reflect-metadata";
import "isomorphic-fetch";
import { define, attr, prop, Record, Store, type, Collection } from 'type-r';
import { expect } from 'chai';
import { memoryIO } from '../../../endpoints/memory';
import { attributesIO } from '../../../endpoints/attributes';
import { localStorageIO } from '../../../endpoints/localStorage';
import { restfulIO, RestfulEndpoint } from '../../../endpoints/restful';
import nock from 'nock';
describe('IO', function () {
    describe('memory endpoint', function () {
        var testData = [
            { name: "John" }
        ];
        var User = (function (_super) {
            tslib_1.__extends(User, _super);
            function User() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            User.endpoint = memoryIO(testData);
            tslib_1.__decorate([
                attr,
                tslib_1.__metadata("design:type", String)
            ], User.prototype, "name", void 0);
            User = tslib_1.__decorate([
                define
            ], User);
            return User;
        }(Record));
        it('loads the test data', function (done) {
            var users = new User.Collection();
            users.fetch()
                .then(function () {
                expect(users.length).to.eql(1);
                expect(users.first().name).to.eql('John');
                done();
            });
        });
        it('create', function (done) {
            var x = new User({ name: "test" });
            x.save().then(function () {
                expect(x.id).to.eql("1");
                done();
            });
        });
        it('read', function (done) {
            var x = (new User({ id: "1" })).fetch().then(function (x) {
                expect(x.name).to.eql("test");
                done();
            });
        });
        it('update', function (done) {
            var x = new User({ id: "1" });
            x.fetch()
                .then(function () {
                x.name = "Mike";
                return x.save();
            })
                .then(function () {
                var y = new User({ id: "1" });
                return y.fetch();
            })
                .then(function (y) {
                expect(y.name).to.eql('Mike');
                done();
            });
        });
        it('list', function (done) {
            var users = new User.Collection();
            users.fetch()
                .then(function () {
                expect(users.length).to.eql(2);
                expect(users.first().name).to.eql("John");
                expect(users.last().name).to.eql("Mike");
                done();
            });
        });
        it("destroy", function (done) {
            var x = new User({ id: "1" });
            x.destroy()
                .then(function () {
                var users = new User.Collection();
                return users.fetch();
            })
                .then(function (users) {
                expect(users.length).to.eql(1);
                expect(users.first().name).to.eql("John");
                done();
            });
        });
    });
    it('can override endpoint with .has.endpoint', function (done) {
        var NoEndpoint = (function (_super) {
            tslib_1.__extends(NoEndpoint, _super);
            function NoEndpoint() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            NoEndpoint.attributes = {
                type: 'no endpoint'
            };
            NoEndpoint = tslib_1.__decorate([
                define
            ], NoEndpoint);
            return NoEndpoint;
        }(Record));
        var HasEndpoint = (function (_super) {
            tslib_1.__extends(HasEndpoint, _super);
            function HasEndpoint() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            HasEndpoint.endpoint = memoryIO([{ id: 666 }]);
            HasEndpoint.attributes = {
                type: 'has endpoint'
            };
            HasEndpoint = tslib_1.__decorate([
                define
            ], HasEndpoint);
            return HasEndpoint;
        }(Record));
        var TestStore = (function (_super) {
            tslib_1.__extends(TestStore, _super);
            function TestStore() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            TestStore.endpoint = attributesIO();
            TestStore.attributes = {
                a: type(NoEndpoint.Collection).endpoint(memoryIO([{ id: "777" }])),
                b: HasEndpoint.Collection,
                c: type(HasEndpoint.Collection).endpoint(memoryIO([{ id: "555" }]))
            };
            TestStore = tslib_1.__decorate([
                define
            ], TestStore);
            return TestStore;
        }(Store));
        var s = new TestStore();
        s.fetch().then(function () {
            expect(s.a.first().id).to.eql("777");
            expect(s.b.first().id).to.eql(666);
            expect(s.c.first().id).to.eql("555");
            done();
        });
    });
    describe("restful endpoint", function () {
        describe('Base test', function () {
            var usersStorage = {
                models: [],
                counter: 0
            };
            var USER_REGEX = /\/users\/(\w+)/;
            function getUserId(uri) {
                return uri.match(USER_REGEX)[1];
            }
            function getUser(id) {
                return usersStorage.models.filter(function (u) { return u.id == id; })[0];
            }
            function cloneUser(_a) {
                var id = _a.id, name = _a.name;
                return { id: id, name: name };
            }
            nock.cleanAll();
            nock('http://restful.basic')
                .persist()
                .get('/users')
                .reply(200, function () {
                return usersStorage.models.map(cloneUser);
            })
                .get(USER_REGEX)
                .reply(function (uri) {
                var user = getUser(getUserId(uri));
                if (user) {
                    return [200, cloneUser(user)];
                }
                else {
                    console.warn("GET: NOT FOUND", uri);
                    return [404];
                }
            })
                .post('/users')
                .reply(200, function (uri, requestBody) {
                var id = ++usersStorage.counter, user = tslib_1.__assign({ id: String(id) }, requestBody);
                usersStorage.models.push(user);
                return cloneUser(user);
            })
                .put(USER_REGEX)
                .reply(function (uri, requestBody) {
                var user = getUser(getUserId(uri));
                if (user) {
                    user.name = requestBody.name;
                    return [200, cloneUser(user)];
                }
                else {
                    console.warn("PUT: NOT FOUND", uri);
                    return [404];
                }
            })
                .delete(USER_REGEX)
                .reply(function (uri) {
                var user = getUser(getUserId(uri));
                if (user) {
                    var idx = usersStorage.models.indexOf(user);
                    usersStorage.models.splice(idx, 1);
                    return [200];
                }
                else {
                    console.warn("DELETE: NOT FOUND", uri);
                    return [404];
                }
            });
            testEndpoint(restfulIO('http://restful.basic/users'))();
        });
        describe('Relative urls', function () {
            var User = (function (_super) {
                tslib_1.__extends(User, _super);
                function User() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                User.endpoint = restfulIO('./users');
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", String)
                ], User.prototype, "name", void 0);
                User = tslib_1.__decorate([
                    define
                ], User);
                return User;
            }(Record));
            var Store = (function (_super) {
                tslib_1.__extends(Store, _super);
                function Store() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Store.endpoint = restfulIO('./store');
                tslib_1.__decorate([
                    attr,
                    tslib_1.__metadata("design:type", String)
                ], Store.prototype, "name", void 0);
                tslib_1.__decorate([
                    prop(User),
                    tslib_1.__metadata("design:type", User)
                ], Store.prototype, "user", void 0);
                Store = tslib_1.__decorate([
                    define
                ], Store);
                return Store;
            }(Record));
            var Root = (function (_super) {
                tslib_1.__extends(Root, _super);
                function Root() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                Root.endpoint = restfulIO('http://restful.relative/');
                tslib_1.__decorate([
                    prop(User.Collection),
                    tslib_1.__metadata("design:type", Collection)
                ], Root.prototype, "users", void 0);
                tslib_1.__decorate([
                    prop(Store),
                    tslib_1.__metadata("design:type", Store)
                ], Root.prototype, "store", void 0);
                Root = tslib_1.__decorate([
                    define
                ], Root);
                return Root;
            }(Record));
            var root = new Root();
            root.store.id = 99;
            root.store.user.id = 1000;
            nock('http://restful.relative')
                .get('/users')
                .reply(200, [{ id: 10, name: 'John' }, { id: 11, name: 'Jack' }])
                .get('/store/99')
                .reply(200, { id: 99, name: 'something' })
                .get('/store/99/users/1000')
                .reply(200, { id: 1000, name: 'special' });
            it('resolves in simple case', function (done) {
                root.store.fetch().then(function () {
                    expect(root.store.name).to.eql('something');
                    done();
                });
            });
            it('resolves for collection', function (done) {
                root.users.fetch().then(function () {
                    expect(root.users.map(function (u) { return u.id; })).deep.equal([10, 11]);
                    done();
                });
            });
            it('nested resolve', function (done) {
                var user = root.store.user;
                user.fetch().then(function () {
                    expect(user.name).to.equal('special');
                    done();
                });
            });
        });
        describe("Merging options", function () {
            RestfulEndpoint.defaultFetchOptions = {
                cache: "force-cache",
                credentials: "omit",
                mode: "navigate",
                redirect: "manual",
            };
            it("uses default options", function () {
                var io = restfulIO(""), options = io.buildRequestOptions("get");
                expect(options.cache).to.equal("force-cache");
                expect(options.credentials).to.equal("omit");
                expect(options.mode).to.equal("navigate");
                expect(options.redirect).to.equal("manual");
            });
            it("Overrides at ctor", function () {
                var io = restfulIO("", { credentials: "include", cache: "reload" }), options = io.buildRequestOptions("get");
                expect(options.cache).to.equal("reload");
                expect(options.credentials).to.equal("include");
            });
            it("Overrides at call", function () {
                var io = restfulIO("", { credentials: "include", cache: "reload" }), options = io.buildRequestOptions("get", { cache: "no-store", credentials: "same-origin" });
                expect(options.cache).to.equal("no-store");
                expect(options.credentials).to.equal("same-origin");
            });
        });
    });
    if (typeof localStorage !== 'undefined')
        describe('localStorage endpoint', testEndpoint(localStorageIO("/test")));
});
function testEndpoint(endpoint) {
    return function () {
        var User = (function (_super) {
            tslib_1.__extends(User, _super);
            function User() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            User.endpoint = endpoint;
            tslib_1.__decorate([
                attr,
                tslib_1.__metadata("design:type", String)
            ], User.prototype, "name", void 0);
            User = tslib_1.__decorate([
                define
            ], User);
            return User;
        }(Record));
        var generatedId;
        it('create', function (done) {
            var x = new User({ name: "test" });
            x.save().then(function () {
                generatedId = x.id;
                expect(x.id).to.be.not.empty;
                done();
            });
        });
        it('read', function (done) {
            var x = new User({ id: generatedId });
            x.fetch().then(function () {
                expect(x.name).to.eql("test");
                done();
            });
        });
        it('update', function (done) {
            var x = new User({ id: generatedId });
            x.fetch()
                .then(function () {
                x.name = "Mike";
                return x.save();
            })
                .then(function () {
                var y = new User({ id: generatedId });
                return y.fetch();
            })
                .then(function (y) {
                expect(y.name).to.eql('Mike');
                done();
            });
        });
        it('list', function (done) {
            var users = new User.Collection();
            users.fetch()
                .then(function () {
                expect(users.length).to.eql(1);
                expect(users.last().name).to.eql("Mike");
                done();
            });
        });
        it("destroy", function (done) {
            var x = new User({ id: generatedId });
            x.destroy()
                .then(function () {
                var users = new User.Collection();
                return users.fetch();
            })
                .then(function (users) {
                expect(users.length).to.eql(0);
                done();
            });
        });
    };
}
//# sourceMappingURL=io.js.map