import React, { PropTypes } from "react"
import Swagger from "swagger-client"
import "whatwg-fetch"
import DropdownMenu from "./DropdownMenu"
import Modal from "boron/DropModal"
import downloadFile from "react-file-download"
import YAML from "js-yaml"
import beautifyJson from "json-beautify"

import "react-dd-menu/dist/react-dd-menu.css"
import "./topbar.less"
import Logo from "./logo_small.png"

export default class Topbar extends React.Component {
  constructor(props, context) {
    super(props, context)

    Swagger("https://generator.swagger.io/api/swagger.json", {
      requestInterceptor: (req) => {
        req.headers["Accept"] = "application/json"
        req.headers["content-type"] = "application/json"
      }
    })
      .then(client => {
        this.setState({ swaggerClient: client })
        client.apis.clients.clientOptions()
          .then(res => {
            this.setState({ clients: res.body })
          })
        client.apis.servers.serverOptions()
          .then(res => {
            this.setState({ servers: res.body })
          })
      })

    this.state = {
      swaggerClient: null,
      clients: [],
      servers: [],
      projects: [],
      curPro: {info:{content:{name:'-'}}},
      version: '-',
      versionExisted: false,
      params: {}
    }
  }

  // Menu actions

  importFromURL = () => {
    let url = prompt("Enter the URL to import from:")
    if(url) {
      fetch(url)
        .then(res => res.text())
        .then(text => {
          this.props.specActions.updateSpec(
            YAML.safeDump(YAML.safeLoad(text))
          )
        })
    }
  }
  // 根据当前url上的参数载入文件
  initImportFromURL = (importURL) => {
    fetch(importURL)
    .then(res => res.text())
    .then(text => {
      this.props.specActions.updateSpec(
        YAML.safeDump(YAML.safeLoad(text))
      )
    }).catch((e) => {
      this.props.specActions.updateSpec("# 当前打开文件url有误")
    })
  }

  importFromFile = () => {
    let fileToLoad = this.refs.fileLoadInput.files.item(0)
    let fileReader = new FileReader()

    fileReader.onload = fileLoadedEvent => {
      let textFromFileLoaded = fileLoadedEvent.target.result
      this.props.specActions.updateSpec(YAML.safeDump(YAML.safeLoad(textFromFileLoaded)))
      this.hideModal()
    }

    fileReader.readAsText(fileToLoad, "UTF-8")
  }

  // 保存到swaggerLab项目
  saveToProject = () => {
    // Editor content -> JS object -> YAML string
    try {
      let editorContent = this.props.specSelectors.specStr()
      let isOAS3 = this.props.specSelectors.isOAS3()
      let fileName = isOAS3 ? "openapi.yaml" : "swagger.yaml"
      let jsContent = YAML.safeLoad(editorContent)
      let yamlContent = YAML.safeDump(jsContent)
      // swagger文件信息
      let info = JSON.stringify(jsContent.info);
      let version = this.state.version;
      let dirName = this.state.params.dirName;
      // info.importURL = this.getImportURL();

      if(yamlContent) {
        let fetchBody = "content="+yamlContent+"&version="+version+"&proDirName="+dirName;
        console.log(this.state.version,this.state.params.dirName);
        // 请求保存接口
        // fetch('http://localhost:8080/api/save', {
        fetch('/api/save', {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: fetchBody
        }).then((res) => {
          if(res.status == 200) {
            alert('保存成功');
          }else {
            throw({msg:'请求保存接口出错', res:res});
          }
        }).catch((e) => {
          throw(e);
        })
      }
    }catch(e) {
      alert('保存失败');
      console.log(e);
    }
  }

  saveAsYaml = () => {
    // Editor content -> JS object -> YAML string
    let editorContent = this.props.specSelectors.specStr()
    let isOAS3 = this.props.specSelectors.isOAS3()
    let fileName = isOAS3 ? "openapi.yaml" : "swagger.yaml"
    let jsContent = YAML.safeLoad(editorContent)
    let yamlContent = YAML.safeDump(jsContent)
    downloadFile(yamlContent, fileName)
  }

  saveAsJson = () => {
    // Editor content  -> JS object -> Pretty JSON string
    let editorContent = this.props.specSelectors.specStr()
    let isOAS3 = this.props.specSelectors.isOAS3()
    let fileName = isOAS3 ? "openapi.json" : "swagger.json"
    let jsContent = YAML.safeLoad(editorContent)
    let prettyJsonContent = beautifyJson(jsContent, null, 2)
    downloadFile(prettyJsonContent, fileName)
  }

  saveAsText = () => {
    // Download raw text content
    console.warn("DEPRECATED: saveAsText will be removed in the next minor version.")
    let editorContent = this.props.specSelectors.specStr()
    let isOAS3 = this.props.specSelectors.isOAS3()
    let fileName = isOAS3 ? "openapi.txt" : "swagger.txt"
    downloadFile(editorContent, fileName)
  }

  convertToYaml = () => {
    // Editor content -> JS object -> YAML string
    let editorContent = this.props.specSelectors.specStr()
    let jsContent = YAML.safeLoad(editorContent)
    let yamlContent = YAML.safeDump(jsContent)
    this.props.specActions.updateSpec(yamlContent)
  }

  downloadGeneratedFile = (type, name) => {
    let { specSelectors } = this.props
    let swaggerClient = this.state.swaggerClient
    if(!swaggerClient) {
      // Swagger client isn't ready yet.
      return
    }
    if(type === "server") {
      swaggerClient.apis.servers.generateServerForLanguage({
        framework : name,
        body: JSON.stringify({
          spec: specSelectors.specJson()
        }),
        headers: JSON.stringify({
          Accept: "application/json"
        })
      })
        .then(res => handleResponse(res))
    }

    if(type === "client") {
      swaggerClient.apis.clients.generateClient({
        language : name,
        body: JSON.stringify({
          spec: specSelectors.specJson()
        })
      })
        .then(res => handleResponse(res))
    }

    function handleResponse(res) {
      if(!res.ok) {
        return console.error(res)
      }

      fetch(res.body.link)
        .then(res => res.blob())
        .then(res => {
          downloadFile(res, `${name}-${type}-generated.zip`)
        })
    }

  }

  clearEditor = () => {
    if(window.localStorage) {
      window.localStorage.removeItem("swagger-editor-content")
      this.props.specActions.updateSpec("")
    }
  }

  // Helpers

  showModal = () => {
    this.refs.modal.show()
  }

  hideModal = () => {
    this.refs.modal.hide()
  }

  // 点击保存，打开保存表单弹窗 = = = = = = = = =
  showSaveModal = () => {
    let editorContent = this.props.specSelectors.specStr()
    let jsContent = YAML.safeLoad(editorContent)
    let version = jsContent.info.version
    this.setState({version: version});

    this.getAllPro().then((pros) => {
      this.setState({projects: JSON.parse(pros)})
      console.log(this.state.projects);
      this.refs.saveModal.show();
    })
  }
  hideSaveModal = () => {
    this.refs.saveModal.hide();
  }
  // 选择存入项目 = = = = = = = = =
  selectPro = (index) => {
    let _this = this;
    console.log(this.state.projects[index]);
    // 设置当前项目名，请求信息
    this.setSaveParams(index, function() {
      // 获取请求参数对象
      let params = _this.state.params;
      // 判断是否存在
      // let fetchURL = 'http://localhost:8080/api/save_test?proDirName='+params.dirName+'&version='+params.version;
      let fetchURL = '/api/save_test?proDirName='+params.dirName+'&version='+params.version;
      // console.log(params.dirName, params.version);
      fetch(fetchURL).then((res) => {
        if(res.status == 200) {
          _this.setState({versionExisted: false});
        }else if(res.status == 202) {
          // 202代表版本存在
          _this.setState({versionExisted: true});
        }else {
          alert('查询保存状态出错');
        }
        console.log(res);
      });
    });

  }

  setSaveParams = (index, callback) => {
    let curPro = this.state.projects[index];
    this.setState({curPro: curPro});
    console.log(curPro);
    let pro = curPro;
    let proName = pro.info.content.name;
    let dirName = pro.info.content.dirName;
    let version = this.state.version;
    this.setState({params:{
      proName: proName,
      dirName: dirName,
      version: version
    }}, function() {
      callback&&callback();
    });
  }

  // 获取所用项目信息接口
  getAllPro() {
    // 请求保存接口
    // fetch('/api/projects').then((res) => {
    // return fetch('http://localhost:8080/api/projects').then((res) => {
    return fetch('/api/projects').then((res) => {
      return res.text();
    })
  }

  query2Dict(param) {
    var pattern = /([^?&=]+)=([^&#]*)/g;
    var dict = {};
    var search = null;
    if (typeof param === "object" && param instanceof Location) {
        search = param.search;
    }
    else if (typeof param === "string") {
        search = param;
    }
    else {
        throw new Error("参数类型非法！请传入window.loaction对象或者url字符串。");
    }
    search.replace(pattern, function (rs, $1, $2) {
        var key = decodeURIComponent($1);
        var value = decodeURIComponent($2);
        dict[key] = value;
        return rs;
    });
    return dict;
  }

  getImportURL() {
    let importURL = this.query2Dict(window.location).import_url;
    if(importURL) {
      return importURL;
    }else {
      return false;
    }
  }

  getURLParams() {
    return this.query2Dict(window.location);
  }

  // 钩子 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
  componentDidMount() {
    let urlParams = this.getURLParams();
    console.log(this.query2Dict(window.location));
    let importURL = this.getImportURL();
    if(importURL) {
      this.initImportFromURL(importURL);
    }
    // 如果是要新建
    if(urlParams.new) {
      alert();
    }
  }

  render() {
    let { getComponent, specSelectors: { isOAS3 } } = this.props
    const Link = getComponent("Link")

    let showGenerateMenu = !(isOAS3 && isOAS3())

    let makeMenuOptions = (name) => {
      let stateKey = `is${name}MenuOpen`
      let toggleFn = () => this.setState({ [stateKey]: !this.state[stateKey] })
      return {
        isOpen: !!this.state[stateKey],
        close: () => this.setState({ [stateKey]: false }),
        align: "left",
        toggle: <span className="menu-item" onClick={toggleFn}>{ name }</span>
      }
    }

    return (
      <div>
        <div className="topbar">
          <div className="topbar-wrapper">
            <Link href="#">
              <img height="30" width="30" className="topbar-logo__img" src={ Logo } alt=""/>
              <span className="topbar-logo__title">Swagger Editor - <small>图灵猫FE</small></span>
            </Link>
            <DropdownMenu {...makeMenuOptions("文件")}>
              <li><button type="button" onClick={this.showSaveModal}>保存到项目</button></li>
              <li role="separator"></li>
              <li><button type="button" onClick={this.importFromURL}>URL 导入</button></li>
              <li><button type="button" onClick={this.showModal}>文件导入</button></li>
              <li role="separator"></li>
              <li><button type="button" onClick={this.saveAsYaml}>下载 YAML</button></li>
              <li><button type="button" onClick={this.saveAsJson}>下载 JSON</button></li>
              <li role="separator"></li>
              <li><button type="button" onClick={this.clearEditor}>清空编辑器</button></li>
            </DropdownMenu>
            <DropdownMenu {...makeMenuOptions("编辑")}>
              <li><button type="button" onClick={this.convertToYaml}>转为 YAML</button></li>
            </DropdownMenu>
            { showGenerateMenu ? <DropdownMenu className="long" {...makeMenuOptions("Generate Server")}>
              { this.state.servers
                  .map((serv, i) => <li key={i}><button type="button" onClick={this.downloadGeneratedFile.bind(null, "server", serv)}>{serv}</button></li>) }
            </DropdownMenu> : null }
            { showGenerateMenu ? <DropdownMenu className="long" {...makeMenuOptions("Generate Client")}>
              { this.state.clients
                  .map((cli, i) => <li key={i}><button type="button" onClick={this.downloadGeneratedFile.bind(null, "client", cli)}>{cli}</button></li>) }
            </DropdownMenu> : null }
          </div>
        </div>
        <Modal className="swagger-ui modal" ref="modal">
          <div className="container">
            <h2>Upload file</h2>
            <input type="file" ref="fileLoadInput"></input>
          </div>
          <div className="right">
            <button className="btn cancel" onClick={this.hideModal}>Cancel</button>
            <button className="btn" onClick={this.importFromFile}>Open file</button>
          </div>
        </Modal>

      <Modal className="swagger-ui modal save-modal" ref="saveModal">
        <div className="container">
          <h2>保存到项目</h2>
          <div className="input-row">
            <label>项目：</label> <input type="text" ref="proInput" disabled value={this.state.curPro.info.content.name}></input>
          </div>
          <div className="input-row">
            <label>版本：</label> <input type="text" ref="versionInput" disabled value={this.state.version}></input>
            { this.state.versionExisted&&
            <span className="tip" >版本已存在，将更新文件</span>
            }
          </div>
          <h3>选择项目：</h3>
          <div className="pro-list">
                {this.state.projects.map((pro, index) =>
                  <div className="pro-item" key={pro.info.content.name} onClick={this.selectPro.bind(this,index)}>
                    <h4>{pro.info.content.name}</h4>
                    <p>{pro.info.content.desc}</p>
                    <ul className="version-list">
                      {pro.swaggers.map((swagger) => {
                        return <li key={swagger.name}>{swagger.name}</li>
                      })}
                    </ul>
                  </div>
                )}
          </div>
        </div>
        <div className="right">
          <button className="btn cancel" onClick={this.hideSaveModal}>取消</button>
          <button className="btn" onClick={this.saveToProject}>保存</button>
        </div>
      </Modal>

      </div>

    )
  }
}

Topbar.propTypes = {
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired
}
