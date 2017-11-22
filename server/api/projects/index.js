let fs = require('fs');
let path = require('path');
// projects路径
const PROJECTS_PATH = path.resolve(__dirname, '../../files/projects');
// 项目目录命名规则
const proDirNameReg = new RegExp("^_\\S+");
// 项目信息json文件名
const PRO_INFO_FILENAME = 'info.json';
// swagger文件命名规则
const SWAGGRE_FILE_REGEXP = new RegExp("\\S+.yaml");

module.exports = main;
// 入口
function main(req,res,next) {
  var resData = {};
  // 获取项目列表
  var proList = getProList();
  res.send(proList);
}

// 获取项目列表
function getProList() {
  let proList = [];
  let files = fs.readdirSync(PROJECTS_PATH);
  files.forEach((item, index, arr) => {
    let proItem = {info:null, swaggers:[], error: null};
    // 1.符合命名规则的项目目录 (只要满足这一点就属于一个swagger项目，若内部存在问题则写入error属性)
    if(proDirNameReg.test(item)) {
      // 2.目录内存在info.json且格式正确
      let info = getInfoJSON(item);
      let swaggers = [];
      if(!info.error) {
        // 3.获取合法的swagger文件
        swaggers = getSwaggers(item);
      }else {
        proItem.error = {code: 1, msg:'项目信息获取失败'}
      }
      proItem.info = info;
      proItem.swaggers = swaggers;
      proList.push(proItem);
    }
  });
  return proList;
}

// 获取并验证项目info.json
function getInfoJSON(dirName) {
  let info = {error: null, content: null};
  let filePath = path.resolve(PROJECTS_PATH, dirName, PRO_INFO_FILENAME);
  let infoFile;
  try{
    infoFile= JSON.parse(fs.readFileSync(filePath));
    if(valideInfoFile(infoFile)) {
      info.content = infoFile;
      // 补充当前项目目录名(_xx)
      info.content.dirName = dirName;
    }else {
      info.error = {msg: '项目信息格式错误'}
    }
  }catch(e) {
    info.error = {msg: '获取项目信息失败'}
  }
  return info;
}
// info.json格式验证
// @待补充
function valideInfoFile(infoFile) {
  return true;
}

// 获取项目目录下的swagger文件信息
function getSwaggers(dirName) {
  let swaggers = [];
  let files = fs.readdirSync(path.resolve(PROJECTS_PATH, dirName));
  files.forEach((item, index, arr) => {
    let swagger = {name: '', filename: '', path: '', error: null}
    if(SWAGGRE_FILE_REGEXP.test(item)) {
      swagger.name = item.substr(0, item.length - 5);
      swagger.filename = item;
      swagger.path = path.join(dirName, item);
      swaggers.push(swagger);
    }
  });
  return swaggers;
}
