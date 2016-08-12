var stringType = typeof('');
var util = require('util');

var isNumeric = function (n){
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var parseFunc = function(fs){
  var reParseFunc = /(function\s*)([^\(]*\s*)\(([\s\w\$,-_]*)\)[^\{]*(\{[^\.][\s|\S]*(?=\})\})/;
  var nameIndex = 2;
  var paramsIndex = 3;
  var codeIndex = 4;
  var info = reParseFunc.exec(fs);
  return {
    name: info[nameIndex],
    params: info[paramsIndex],
    source: info[codeIndex],
  };
};

var getFunctionSource = function(f){
  var fs = f.toString();
  var info = parseFunc(fs);
  return '('+info.params+')=>'+info.source;
};

var wrapLambdaFunction = function(source, handler, restPos){
  var f = false;
  if(isNumeric(restPos)){
    f = function(){
      var params = Array.prototype.slice.call(arguments);
      var rest = params.splice(restPos, params.length);
      params.push(rest);
      return handler.apply(this, params);
    };
  }
  f = f || function(){
    return handler.apply(this, arguments);
  };
  f.toJSON = function(){
    return source;
  };
  return f;
};

var undefinedType = (function(undefined){
  return typeof(undefined);
})();

var numberType = typeof(1);

var reRestArgs = /\.\.\.([a-z][a-z0-9_]*)[ \t]*$/i;
try{
  // Fast, use single line operator
  var reExtractFatArrow = new RegExp('^[(\\s]*([^()]*?)[)\\s]*=>(.*)', 's');
}catch(e){
  // Bit slower, match any or \r or \n
  var reExtractFatArrow = /^[(\s]*([^()]*?)[)\s]*=>((.|[\r\n])*)/;
}

var compile = function(self, selfSymbol, expression){
  var type = typeof(expression);
  var identity = function(self){
    return self;
  };
  if(expression === null) return identity;
  if(type === undefinedType) return identity;
  if(type === stringType){
    var source = expression;
    if(expression === ""){
      return identity;
    }
    if(expression.indexOf("=>") === -1){
      if(expression.trim().charAt(0)!=='{'){
        expression = "return " + expression;
      }
      var l = new Function(selfSymbol, expression);
      return wrapLambdaFunction(source, l);
    }
    var expr = expression.match(reExtractFatArrow);
    var args = (expr[1]||'').toString();
    var al = args.match(reRestArgs);
    expression = expr[2].trim();
    if(expression.charAt(0)!=='{'){
      expression = "return " + expr[2];
    }
    if(al){
      args = args.split(',');
      args.pop();
      var c = args.length;
      args.push(al[1]);
      var l = new Function(args, expression);
      return wrapLambdaFunction(source, l, c);
    }
    var l = new Function(expr[1], expression);
    return wrapLambdaFunction(source, l);
  }
};

var Lambda = function Lambda(expression){
  var self = this, type = typeof(expression);
  var options = expression||{};
  if(type==='function'){
    return wrapLambdaFunction(getFunctionSource(expression), expression);
  }
  if(this.constructor !== Lambda){
    return compile(null,
        options.selfSymbol||Lambda.selfSymbol,
        options.expression||expression);
  }
  self.selfSymbol = options.selfSymbol||Lambda.selfSymbol;
  if(type==='string'){
    options = {
      expression: expression
    };
  }
  if(options.expression){
    self.compile(options.expression);
  }
};

Lambda.prototype.compile = function(expression){
  var self = this;
  return self._f = compile(this, this.selfSymbol, expression);
};

Lambda.prototype.execute = function(scope){
  var self = this;
  return self._f.apply(scope, arguments);
};

Lambda.selfSymbol = '$';

module.exports = Lambda;
