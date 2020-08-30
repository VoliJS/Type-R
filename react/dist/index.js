!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("react"),require("@type-r/models")):"function"==typeof define&&define.amd?define(["exports","react","@type-r/models"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Nested={},e.React,e.Nested)}(this,function(r,c,s){"use strict";function e(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var f=e(c),n=h(function(e){return new a(new e)});function t(e){var t=n(e.constructor);return c.useEffect(function(){t.assignFrom(e),t[s.defaultStore]=e.getStore()},[e._changeToken]),t}function o(n,r){void 0===r&&(r=1e3);var o=t(n);return c.useEffect(function(){var e;function t(){e&&clearTimeout(e),e=setTimeout(function(){n.assignFrom(o),e=null},r)}return o.on("change",t),function(){o.off("change",t),e&&(clearTimeout(e),n.assignFrom(o))}},[]),o}n.copy=t,n.delayChanges=o;function u(e){return new a(e.createSubset([]))}var i={of:h(function(e){return new a(new(s.Collection.of(e)))}),ofRefs:h(function(e){return new a(new(s.Collection.ofRefs(e)))}),subsetOf:function(t){var e=c.useReducer(l,t,u),n=e[0],r=e[1];return c.useEffect(function(){var e=n.value;e.resolvedWith||e.resolve(t)},[Boolean(t.models.length)]),c.useEffect(function(){return n._onChildrenChange=r,function(){return n.value.dispose()}},v),n.value}},a=(p.prototype.getStore=function(){return this.value._defaultStore},p);function p(e){this.value=e,this._onChildrenChange=void 0,this._changeToken=e._changeToken,e._owner=this,e._ownerKey||(e._ownerKey="reactState")}function l(e){if(e._changeToken===e.value._changeToken)return e;var t=new a(e.value);return t._onChildrenChange=e._onChildrenChange,t}function h(o){return function(e){var t=c.useReducer(l,e,o),n=t[0],r=t[1];return c.useEffect(function(){return n._onChildrenChange=r,function(){return n.value.dispose()}},v),n.value}}var v=[];var y=[];function d(){return c.useReducer(g,null)[1]}function g(e,t){return t._changeToken}var k=function(e,t){return(k=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)};function m(e,t){function n(){this.constructor=e}k(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}var b=function(){return(b=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)},w=Array.prototype,_=Object.prototype;function O(e){if(e&&"object"==typeof e)switch(Object.getPrototypeOf(e)){case w:return P;case _:return j}return C}var L,C={clone:function(e){return e},map:function(e,t){return[]},remove:function(e){return e}},j={map:function(e,t){var n,r=[],o=e.value;for(var u in o){o.hasOwnProperty(u)&&(void 0===(n=t(e.at(u),u))||r.push(n))}return r},remove:function(e,t){return delete e[t],e},clone:function(e){return b({},e)}},P={clone:function(e){return e.slice()},remove:function(e,t){return e.splice(t,1),e},map:function(e,t){for(var n=e.value.length,r=Array(n),o=0,u=0;o<n;o++){var i=t(e.at(o),o);void 0===i||(r[u++]=i)}return r.length===u||(r.length=u),r}};function S(e){this.value=e,this.error=void 0}r.Linked=(Object.defineProperty(S.prototype,"current",{get:function(){return this.value},set:function(e){this.set(e)},enumerable:!0,configurable:!0}),Object.defineProperty(S.prototype,"_changeToken",{get:function(){return this.value},enumerable:!0,configurable:!0}),S.prototype.onChange=function(t){var n=this;return new V(this,function(e){t(e),n.set(e)})},S.prototype.pipe=function(n){var r=this;return new V(this,function(e){var t=n(e,r.value);void 0===t||r.set(t)})},Object.defineProperty(S.prototype,"props",{get:function(){var t=this;return"boolean"==typeof this.value?{checked:this.value,onChange:function(e){return t.set(Boolean(e.target.checked))}}:{value:this.value,onChange:function(e){return t.set(e.target.value)}}},enumerable:!0,configurable:!0}),S.prototype.update=function(e,t){var n=e(this.clone(),t);void 0===n||this.set(n)},S.prototype.action=function(t){var n=this;return function(e){return n.update(t,e)}},S.prototype.equals=function(e){return new B(this,e)},Object.defineProperty(S.prototype,"true",{get:function(){var e=this;return function(){return e.set(!0)}},enumerable:!0,configurable:!0}),Object.defineProperty(S.prototype,"false",{get:function(){var e=this;return function(){return e.set(!1)}},enumerable:!0,configurable:!0}),Object.defineProperty(S.prototype,"null",{get:function(){var e=this;return function(){return e.set(null)}},enumerable:!0,configurable:!0}),Object.defineProperty(S.prototype,"isTruthy",{get:function(){return!!this.value||void 0},enumerable:!0,configurable:!0}),S.prototype.enabled=function(e){return new M(this,e||"")},S.prototype.contains=function(e){return new D(this,e)},S.prototype.push=function(){var e=P.clone(this.value);Array.prototype.push.apply(e,arguments),this.set(e)},S.prototype.unshift=function(){var e=P.clone(this.value);Array.prototype.unshift.apply(e,arguments),this.set(e)},S.prototype.splice=function(){var e=P.clone(this.value);Array.prototype.splice.apply(e,arguments),this.set(e)},S.prototype.map=function(e){return O(this.value).map(this,e)},S.prototype.removeAt=function(e){var t=this.value,n=O(t);this.set(n.remove(n.clone(t),e))},S.prototype.at=function(e){return new K(this,e)},S.prototype.clone=function(){var e=this.value;return O(e).clone(e)},S.prototype.pick=function(){for(var e={},t=arguments.length?arguments:Object.keys(this.value),n=0;n<t.length;n++){var r=t[n];e[r]=new K(this,r)}return e},Object.defineProperty(S.prototype,"$",{get:function(){if(!this._value$){var e=this._value$={},t=this.value;for(var n in t)t.hasOwnProperty(n)&&(e[n]=new K(this,n))}return this._value$},enumerable:!0,configurable:!0}),S.prototype.check=function(e,t){return this.error||e(this.value)||(this.error=t||e.error||J),this},S),(L=r.Linked||(r.Linked={})).value=function(e,t){return new E(e,t)},L.mutable=function(n){return new E(n,function(e){for(var t in e)e.hasOwnProperty(t)&&(n[t]=e[t])})},L.getValues=function(e){return z(e,"value")},L.getErrors=function(e){return z(e,"error")},L.hasErrors=function(e){for(var t in e)if(e.hasOwnProperty(t)&&e[t].error)return!0;return!1},L.setValues=function(e,t){if(t)for(var n in e){var r,o=G(n);t.hasOwnProperty(o)&&(void 0===(r=t[o])||e[n].set(r))}};var T,E=(m(A,T=r.Linked),A.prototype.set=function(e){},A);function A(e,t){var n=T.call(this,e)||this;return n.set=t,n}var R,V=(m($,R=r.Linked),$.prototype.set=function(e){},$);function $(e,t){var n=R.call(this,e.value)||this;n.set=t;var r=e.error;return r&&(n.error=r),n}var F,B=(m(I,F=r.Linked),I.prototype.set=function(e){this.parent.set(e?this.truthyValue:null)},I);function I(e,t){var n=F.call(this,e.value===t)||this;return n.parent=e,n.truthyValue=t,n}var x,M=(m(N,x=r.Linked),N.prototype.set=function(e){this.parent.set(e?this.defaultValue:null)},N);function N(e,t){var n=x.call(this,null!=e.value)||this;return n.parent=e,n.defaultValue=t,n}var q,D=(m(U,q=r.Linked),U.prototype.set=function(e){var t,n,r=this,o=Boolean(e);this.value!==o&&(t=this.parent.value,n=e?t.concat(this.element):t.filter(function(e){return e!==r.element}),this.parent.set(n))},U);function U(e,t){var n=q.call(this,0<=e.value.indexOf(t))||this;return n.parent=e,n.element=t,n}var H,J="Invalid value",K=(m(W,H=r.Linked),W.prototype.remove=function(){this.parent.removeAt(this.key)},W.prototype.update=function(r,o){var u=this.key;this.parent.update(function(e){var t=e[u],n=r(O(t).clone(t),o);if(void 0!==n)return e[u]=n,e})},W.prototype.set=function(t){var n=this.key;this.parent.update(function(e){if(e[n]!==t)return e[n]=t,e})},W);function W(e,t){var n=H.call(this,e.value[t])||this;return n.parent=e,n.key=t,n}function z(e,t){var n,r={};for(var o in e){!e.hasOwnProperty(o)||void 0!==(n=e[o][t])&&(r[G(o)]=n)}return r}function G(e){return"$"===e[0]?e.slice(1):e}var Q,X=(m(Y,Q=c.Component),Y.prototype.linkAt=function(e){return this.$at(e)},Y.prototype.$at=function(e){var t=this.state[e],n=this.links||(this.links={}),r=n[e];return r&&r.value===t?r:n[e]=new ee(this,e,t)},Y.prototype.linkAll=function(){return this.state$.apply(this,arguments)},Y.prototype.state$=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];for(var n=this.state,r=this.links||(this.links={}),o=0,u=e.length?e:Object.keys(n);o<u.length;o++){var i=u[o],a=n[i],c=r[i];c&&c.value===a||(r[i]=new ee(this,i,a))}return r},Y);function Y(){var e=null!==Q&&Q.apply(this,arguments)||this;return e.links=null,e}var Z,ee=(m(te,Z=r.Linked),te.prototype.set=function(e){var t={};t[this.key]=e,this.component.setState(t)},te);function te(e,t,n){var r=Z.call(this,n)||this;return r.component=e,r.key=t,r}var ne,re=(m(oe,ne=r.Linked),oe.prototype.set=function(e){},oe.prototype.update=function(r,o){this.set(function(e){var t=O(e).clone(e),n=r(t,o);return void 0===n?e:n})},oe);function oe(e,t){var n=ne.call(this,e)||this;return n.set=t,n}function ue(e){var t=c.useState(e),n=t[0],r=t[1];return new re(n,r)}function ie(e){var t=c.useState(e),n=t[0],r=t[1],o=ae();return new re(n,function(e){return o.current&&r(e)})}function ae(){var e=c.useRef(!0);return c.useEffect(function(){return function(){return e.current=!1}},[]),e}function ce(e){var t=e instanceof r.Linked?e.value:e,n=ue(t);return c.useEffect(function(){return n.set(t)},[t]),n}function se(e){var t=e instanceof r.Linked?e.value:e,n=ie(t);return c.useEffect(function(){return n.set(t)},[t]),n}function fe(e){return e&&void 0!==e._changeToken?e._changeToken:e}function pe(e,t){return e.prototype instanceof s.Transactional?"props."+t+" && props."+t+"._changeToken":e===Date?"props."+t+" && props."+t+".getTime()":e===s.Linked?"props."+t+" && props."+t+".value":"props."+t}r.Link=r.Linked,r.LinkedComponent=X,r.PropValueLink=K,r.StateLink=ee,r.arrayHelpers=P,r.helpers=O,r.objectHelpers=j,r.pureRenderProps=function(e,t){var n,r=s.attributes(e).prototype._attributes,o=Object.keys(e),u=new Function("props","\n        return [\n            "+o.map(function(e){return pe(r[e].type,e)}).join(", ")+"\n        ]\n    "),i=new Function("props","vector","\n        return "+o.map(function(e,t){return"vector["+t+"] !== ( "+pe(r[e].type,e)+" )"}).join(" || ")+";\n    ");function a(e){var t=n.call(this,e)||this;return t._vector=u(t.props),t}return m(a,n=c.Component),a.prototype.shouldComponentUpdate=function(e){return i(e,this._vector)},a.prototype.componentDidUpdate=function(){this._vector=u(this.props)},a.prototype.render=function(){return f.default.createElement(t,b({},this.props))},a},r.useBoundLink=ce,r.useChanges=function(t){var n=d();c.useEffect(function(){function e(e){n(e)}return t.onChanges(e),function(){return t.offChanges(e)}},y)},r.useCollection=i,r.useDelayChanges=o,r.useEvent=function(e,t,n){c.useEffect(function(){return e.on(t,n),function(){e.off(t,n)}},[])},r.useForceUpdate=d,r.useIO=function(e,t){void 0===t&&(t=[]);var r=ie(null);c.useEffect(function(){r.set(function(e){var t=e||[0,null];return[t[0]+1,t[1]]}),e().then(function(){return r.set(function(e){var t=e[0];e[1];return[t-1,null]})}).catch(function(n){return r.set(function(e){var t=e[0];e[1];return[t-1,n]})})},t);var n=r.value;return null!==n&&!n[0]&&(n[1]||!0)},r.useIsMountedRef=ae,r.useLink=ue,r.useLinked=ue,r.useLocalStorage=function(t,e){var n=c.useRef();n.current=e,c.useEffect(function(){var e=JSON.parse(localStorage.getItem(t)||"{}");return r.Linked.setValues(n.current,e),function(){var e=r.Linked.getValues(n.current);localStorage.setItem(t,JSON.stringify(e))}},[])},r.useModel=n,r.useModelCopy=t,r.useSafeBoundLink=se,r.useSafeLink=ie,r.useSafeLinked=ie,r.useSafeSyncLinked=se,r.useSyncLinked=ce,r.whenChanged=function(e,t,n,r){var o=arguments.length;switch(o){case 1:return[fe(e)];case 2:return[fe(e),fe(t)];case 3:return[fe(e),fe(t),fe(n)];default:for(var u=[fe(e),fe(t),fe(n),fe(r)],i=4;i<o;i++)u.push(fe(arguments[i]));return u}},Object.defineProperty(r,"__esModule",{value:!0})});
//# sourceMappingURL=index.js.map
