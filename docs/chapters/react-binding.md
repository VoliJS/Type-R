# ReactJS bindings

[React-MVx](https://volicon.github.io/React-MVx/) is an MVVM application frameworks which uses Type-R to manage a multi-layer application state.

- React-MVx adds [two-way data binding](https://volicon.github.io/React-MVx/#link) capabilities to both Record and Collection. Data-binding is based on the ["value link" pattern](https://medium.com/@gaperton/managing-state-and-forms-with-react-part-1-12eacb647112) and implemented with Link class from [NestedLink](https://github.com/Volicon/NestedLink) library taking the value and validation error directly from the Record.
- [Record](https://volicon.github.io/Type-R/#record) class is used to manage [component's state](https://volicon.github.io/React-MVx/#state).
- The subset of the [Record attributes type annotation](https://volicon.github.io/Type-R/#definition) is used to define component [props](https://volicon.github.io/React-MVx/#props) and [context](https://volicon.github.io/React-MVx/#context).
- [Store](https://volicon.github.io/Type-R/#store) class is used to represent [component's store](https://volicon.github.io/React-MVx/#store) (also called "local store"), which is typically used in the root component of SPA page associated with a route. The state of the children components uses upper component's stores to resolve id-references.
- Type-R [global store](https://volicon.github.io/Type-R/#-static-store-global) may be used as a store for the data shared by application pages. This store is used to resolve id-references in case if local stores lookup failed.

<aside class="warning">
The meaning of the Store in Type-R and React-Mvx is very different to that in other frameworks. The sole reason you need the store is to have collections of records which are being used to resolve id-references. If you don't have <a href="https://volicon.github.io/Type-R/#normalized-data">id-references</a> in JSON, you don't need stores. Use state instead.
</aside>