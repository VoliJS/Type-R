## Custom attribute metatypes

"Attribute metatype" is the Type-R attribute type descriptor with metadata attached.
Metatype is created by assigning the result of `type( T )` expression to some variable.

The following attribute types are available from `@type-r/ext-types` package.

### `attribute` : MicrosoftDate

`Date` attribute represented in JSON as Microsoft date (represented in JSON as string `/Date(timestamp)`)

### `attribute` : Timestamp

`Date` attribute represented in JSON as UNIX timestamp (the result of `date.getTime()`).

### `attribute` : Integer

`Number` attribute converting value to integer on assignment. Can be called as function.

### `attribute` : Email

`String` attribute with email validation check.

### `attribute` : IPAddress

`String` attribute with IP address validation check.

### `attribute` : Url

`String` attribute with URL validation check.