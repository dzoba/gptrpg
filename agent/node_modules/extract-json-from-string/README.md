[![Build Status](https://travis-ci.org/tandrewnichols/extract-json-from-string.png)](https://travis-ci.org/tandrewnichols/extract-json-from-string) [![downloads](http://img.shields.io/npm/dm/extract-json-from-string.svg)](https://npmjs.org/package/extract-json-from-string) [![npm](http://img.shields.io/npm/v/extract-json-from-string.svg)](https://npmjs.org/package/extract-json-from-string) [![Maintainability](https://api.codeclimate.com/v1/badges/b25fdcdef562b02676bc/maintainability)](https://codeclimate.com/github/tandrewnichols/extract-json-from-string/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/b25fdcdef562b02676bc/test_coverage)](https://codeclimate.com/github/tandrewnichols/extract-json-from-string/test_coverage) [![dependencies](https://david-dm.org/tandrewnichols/extract-json-from-string.png)](https://david-dm.org/tandrewnichols/extract-json-from-string) ![Size](https://img.shields.io/badge/size-1097b-brightgreen.svg)

# extract-json-from-string

Extract JSON/javascript objects from strings

## Installation

`npm install --save extract-json-from-string`

## Summary

Extract random JSON and javascript objects from a longer string, e.g. "Expected { foo: 'bar' } to equal { foo: 'baz' }" (I'm looking at you jasmine 1.3). Also works with arrays.

## Usage

Just pass the string into the one exported function and get a list of objects and arrays contained therein returned to you. If the string contains no valid objects or arrays (**_valid_** objects or arrays), you'll get an empty array back.

### Node

```js
const extract = require('extract-json-from-string');

let objects = extract('Expected { foo: "bar" } to equal { foo: "baz" }');
// [
//   { foo: 'bar' },
//   { foo: 'baz' }
// ]
```

### Browser

```js
let objects = window.extractJson('Expected { foo: "bar" } to equal { foo: "baz" }');
// [
//   { foo: 'bar' },
//   { foo: 'baz' }
// ]
```

## N.B.

For the time being, I've written a very naive implementation. There are lots of ways to break this (like stringified JSON or escaped quotes within the value of a property). Please report any issues, and I'll do my best to fix them and make it _less_ naive.

## Contributing

Please see [the contribution guidelines](CONTRIBUTING.md).
