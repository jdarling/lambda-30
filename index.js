module.exports = {
  Lambda: require('./lib/lambda')
};
if(typeof(window)!=='undefined'){
  window.Lambda = Lambda;
}
