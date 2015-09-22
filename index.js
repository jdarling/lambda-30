var Lambda = require('./lib/lambda');
module.exports = {
  Lambda: Lambda
};
if(typeof(window)!=='undefined'){
  window.Lambda = Lambda;
}
