let fs = require('fs');
let path = require('path');
let config = require('../config');

// 尝试保存
function saveTest(req,res,next) {
  let proDirName = req.query.proDirName;
  let version = req.query.version;
  let versionFileName = version+'.yaml';
  let proPath = path.resolve(config.PROJECTS_PATH, proDirName);
  let files;
  try{
    files = fs.readdirSync(proPath);
    // 判断files里是否存在相同文件名(version)
    if(!files.some((item, index, arr) => {
      return (item == versionFileName)
    })) {
      res.send({msg: '可以保存'})
    }else {
      res.status(202).send({msg: '版本已存在，保存将会覆盖'})
    }
  }catch(e) {
    if(e.code == 'ENOENT');
      res.status(404).send({error: e, msg: "项目不存在"})
  }
}

// 保存接口
function save(req,res,next) {
  let proDirName = req.body.proDirName
  let fileName = req.body.version
  let content = req.body.content

  if(validInfo(proDirName, fileName)) {
    let filePathName = path.resolve(config.PROJECTS_PATH, proDirName, fileName+'.yaml');
    try {
      fs.writeFileSync(filePathName, content)
      res.send({msg: "保存成功"})
    } catch(e) {
      res.status(501).send({msg: "文件保存失败", error: e});
      return
    }
  }
}


// 验证swagger文件info
function validInfo(a,b) {
  if(a&&b) {
    return true;
  }else {
    return false;
  }
}

module.exports = {
  save,
  saveTest
};
