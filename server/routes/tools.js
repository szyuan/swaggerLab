let express = require('express');
let router = express.Router();
let path = require('path');


function main(req, res, next) {
  console.log(req.params.toolname);
  return express.static(path.resolve(__dirname));
}


module.exports = main;
