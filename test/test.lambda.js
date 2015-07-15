var assert = require('assert');
var Lambda = require('../').Lambda;

describe('Lambda', function(){
  describe('Constructor', function(){
    it('Should be able to be created', function(done){
      var e = new Lambda();
      done();
    });
    it('Should default the self reference to $', function(done){
      var e = new Lambda();
      assert(Lambda.selfSymbol === '$');
      assert(e.selfSymbol === '$');
      done();
    });
    it('Should be able to set the self reference', function(done){
      var e = new Lambda({selfSymbol: 'self'});
      assert(Lambda.selfSymbol === '$');
      assert(e.selfSymbol === 'self');
      done();
    });
  });
  describe('Passthrough', function(){
    it('Should pass through a function instead of compiling it', function(done){
      var e = Lambda(function($){
        return $.a+$.b;
      });
      var v = e({a: 5, b: 2});
      assert(v===7);
      done();
    });
    it('Should be able to return a valid Lambda String representation of the source function', function(done){
      var e = Lambda(function($){
        return $.a+$.b;
      });
      var s = e.toJSON();
      var expected = '($)=>{\n        return $.a+$.b;\n      }';
      assert(s===expected);
      done();
    });
  });
  describe('Compiler', function(){
    it('Should compile a function', function(done){
      var L = new Lambda({selfSymbol: 'self'});
      var f = L.compile('self.a+self.b');
      assert(typeof(f)==='function');
      done();
    });
    it('Should return a compiled function for execution', function(done){
      var L = new Lambda({selfSymbol: 'self'});
      var f = L.compile('self.a+self.b');
      var val = f({a: 3, b: 5});
      assert(val===8);
      done();
    });
    it('Should remember the latest compiled function for execution', function(done){
      var L = new Lambda({selfSymbol: 'self'});
      var f = L.compile('self.a+self.b');
      var val = L.execute({a: 3, b: 5});
      assert(val===8);
      done();
    });
  });
  describe('Interperter', function(){
    it('Should be able to execute a static value "foo"', function(done){
      var e = Lambda('"foo"');
      var v = e({a: 5, b: 2});
      assert(v==='foo');
      done();
    });
    it('Should be able to execute a basic expression a+b', function(done){
      var e = Lambda('$.a+$.b');
      var v = e({a: 5, b: 2});
      assert(v===7);
      done();
    });
    it('Should be able to execute a basic expression with custom selfSymbol', function(done){
      var e = Lambda({selfSymbol: 'self', expression: 'self.a+self.b'});
      var v = e({a: 5, b: 2});
      assert(v===7);
      done();
    });
    it('Should be able to alias parameters a, b=>a+b', function(done){
      var e = Lambda('a, b => a + b');
      var v = e(5, 2);
      assert(v===7);
      done();
    });
    it('Should be able to be created and execute a basic expression $.a+$.b', function(done){
      var e = new Lambda('$.a+$.b');
      var v = e.execute({a: 5, b: 2});
      assert(v===7);
      done();
    });
    it('Should be able to be created and execute a basic multiline expression {var c = $.a+$.b; return c;}', function(done){
      var e = new Lambda('{var c = $.a+$.b; return c;}');
      var v = e.execute({a: 5, b: 2});
      assert(v===7);
      done();
    });
    it('Should be able to be created and to alias parameters a, b=>a+b', function(done){
      var e = new Lambda('a, b => a + b');
      var v = e.execute(5, 2);
      assert(v===7);
      done();
    });
    it('Should be able to use a custom self reference', function(done){
      var e = new Lambda({selfSymbol: 'self', expression: 'self.a + self.b'});
      var v = e.execute({a: 5, b: 2});
      assert(v===7);
      done();
    });
    it('Should be able to take the self reference and the expression', function(done){
      var l = new Lambda({selfSymbol: 'self', expression: 'self.a+self.b'});
      var v = l.execute({a: 5, b: 2});
      assert(v===7);
      done();
    });
    it('Should be able to switch the expression using compile', function(done){
      var l = new Lambda({selfSymbol: 'self', expression: 'self.a+self.b'});
      l.compile('self.a-self.b');
      assert(l.execute({a: 5, b: 2})===3);
      done();
    });
    it('Should return a proper JSON version for $.a', function(done){
      var expected = '$.a';
      var e = Lambda(expected);
      var js = e.toJSON();
      assert(js===expected);
      done();
    });
    it('Should return a proper JSON version for (a, b)=>a+b', function(done){
      var expected = '(a, b)=>a+b';
      var e = Lambda(expected);
      var js = e.toJSON();
      assert(js===expected);
      done();
    });
    it('Should return a proper JSON version for (a, b)=>{return a+b}', function(done){
      var expected = '(a, b)=>{return a+b}';
      var e = Lambda(expected);
      var js = e.toJSON();
      assert(js===expected);
      done();
    });
  });
  describe('ES6 Like Support', function(){
    it('Should be able to be created and to alias parameters ES6 style (a, b)=>a+b', function(done){
      var e = new Lambda('(a, b) => a + b');
      var v = e.execute(5, 2);
      assert(v===7);
      done();
    });
    it('Should be able to use multilpe ES6 style statements', function(done){
      var e = Lambda('(a, b) => {\nvar c = a + b;\nreturn c;\n}');
      var v = e(5, 2);
      assert(v===7);
      done();
    });
    it('Should be able to return object literals ES6 style', function(done){
      var e = Lambda('(a, b) => ({a: a, b: b})');
      var v = e(5, 2);
      assert(v.a===5);
      assert(v.b===2);
      done();
    });
    it('Should support ES6 ...rest (a, b, ...args) => ({a: a, b: b, rest: args})', function(done){
      var e = Lambda('(a, b, ...args) => ({a: a, b: b, rest: args})');
      var v = e(5, 2, 3, 6, 7);
      assert(v.a===5);
      assert(v.b===2);
      assert(v.rest[0]===3);
      assert(v.rest[1]===6);
      assert(v.rest[2]===7);
      done();
    });
    it('Should support ES6 ...rest args (...args) => ({rest: args})', function(done){
      var e = Lambda('(...args) => ({rest: args})');
      var v = e(3, 6, 7);
      assert(v.rest[0]===3);
      assert(v.rest[1]===6);
      assert(v.rest[2]===7);
      done();
    });
    it('Should work with empty arrow function () => {}', function(done){
      var e = Lambda('() => {}');
      var v = e(5, 2);
      assert(v===undefined);
      done();
    });
    it('Should work with () => "foobar"', function(done){
      var e = Lambda('() => "foobar"');
      var v = e(5, 2);
      assert(v==='foobar');
      done();
    });
    it('Should return a proper JSON version when used with ...rest args', function(done){
      var expected = '(a, b, ...rest) => rest';
      var e = Lambda(expected);
      var js = e.toJSON();
      assert(js===expected);
      done();
    });
  });
});
