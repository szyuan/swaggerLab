# swaggerLab files>project>readme.md

## 文件路径规则
* **projects**
	* **_shop** `[proDir]`
		* **1.0.0** `[version].yaml`
		* **2.0.0** `[version].yaml`
		* ...
		* **info.json** `项目信息`

## 项目文件夹名称规则
  _shop `下划线开头，跟一个或多个非空字符`
  ```
  const proDirNameReg = new RegExp("^_\S+");
  ```

## 项目内info.json规则
```
{
	"name": "shop",		// 项目名称
	"desc": "商城项目",	// 项目描述
	"creator": "szy",	// 创建者
	"create_date": "2017-11-20T21:01:27+08:00" //创建时间
}

```
