Lambda-30
===

A Lambda String implementation for Node.js that supports some ES6.

Install
---

```shell
npm install lambda-30
```

Testing
---

```shell
npm test
```

Usage
---

###Basic

```javascript
var L = require('lambda-30').Lambda;
var f = L('(a, b)=>a+b');
var val = f(5, 8);
// val is 13
f = L('$.a+$.b'); // No params supplied used $ as self reference
val = f({a: 3, b: 5});
// val is 8
```

###Options

```javascript
var Lambda = require('lambda-30').Lambda;
var L = new Lambda({selfSymbol: 'self'});
var f = L.compile('self.a+self.b');
var val = f({a: 3, b: 5});
// val is 8
```

###Multi-line

```javascript
var L = require('lambda-30').Lambda;
// note: long string form used for convience only
var f = L(`(a, b)=>{
    var c = 2;
    var sum = a+b;
    var avg = sum / c;
    return {
      count: c,
      sum: sum,
      avg: avg
    };
}`);
```

###...rest

```javascript
var L = require('lambda-30').Lambda;
// note: long string form used for convience only
var f = L(`(...nums)=>{
    var c = nums.length;
    var sum = nums.reduce(function(curr, next){
      return curr + next;
    }, 0);
    var avg = sum / c;
    return {
      count: c,
      sum: sum,
      avg: avg
    };
}`);
```

###toJSON

Really this should be called toString but I didn't want to override the default toString implementation.
```javascript
var L = require('lambda-30').Lambda;
var expected = '(a, b)=>{return a+b}';
var e = L(expected);
var js = e.toJSON();
assert(js===expected);

var e = Lambda(function($){
    return $.a+$.b;
  });
var s = e.toJSON();
var expected = '($)=>{\n        return $.a+$.b;\n      }';
assert(s===expected);
```
