var express = require('express');
var router = express.Router();

// 获取所有项目
router.get('/projects', require('../api/projects'));

// 保存swagger文件
let saveAPI = require('../api/save');
router.get('/save_test', saveAPI.saveTest);
router.post('/save', saveAPI.save);


module.exports = router
