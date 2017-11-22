<template>
  <div id="projects">
    <div class="header">
      <h2 class="title">所有项目</h2>
    </div>
    <div class="main">
      <div class="pro-list-wrapper">
        <el-row>
          <el-col :span="5" v-for="(project, index) in projectList" :key="index" :offset="index > 0 ? 1 : 0">
            <div class="pro-item-wrapper"  @click="proItemClick($event, index)">
              <pro-item :project="project"></pro-item>
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="dialog-wrapper" v-if="projectList.length">
        <el-dialog :title="currentPro.info.content.name" :visible.sync="dialogVisible">
          <header>
              <div class="info-item">描述：{{currentPro.info.content.desc}}</div>
              <div class="info-item">创建者：{{currentPro.info.content.creator}}</div>
              <div class="info-item">创建日期：{{currentPro.info.content.create_date}}</div>
          </header>
          <el-table
            @row-click="rowClick"
            :data="versionTableData"
            style="width: 100%">
            <el-table-column
              prop="name"
              label="版本"
              width="180">
            </el-table-column>
            <el-table-column
              prop="author"
              label="作者"
              width="180">
            </el-table-column>
            <el-table-column
              prop="las_modified"
              label="最后修改时间">
            </el-table-column>
          </el-table>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import proItem from '../proItem/proItem'

export default {
  name: 'projects',
  components: {
    proItem
  },
  data() {
    return {
      projectList: [],
      dialogVisible: false,
      currentIndex: 0
    }
  },
  methods: {
    proItemClick(e, index) {
      this.currentIndex = index;
      this.dialogVisible = true;
    },
    rowClick(data, e) {
      let url = location.origin+'/tools/editor?import_url=/swagger/'+data.path;
      window.open(url, '_blank');
    }
  },
  created() {
    this.axios.get('/api/projects').then((req) => {
      if(req.status == 200) {
        this.projectList = req.data;
      }else {
        console.error(req);
      }
    });
  },
  computed: {
    currentPro() {
      return this.projectList[this.currentIndex];
    },
    versionTableData() {
      let data = [];
      let fileList = this.projectList[this.currentIndex].swaggers;
      data = fileList;
      return data;
    }
  }
}
</script>

<style scoped>
  .header {
    height: 100px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);
    background: #f0f0f0;
  }
  .title {
    margin: 0;
    padding: 20px;
    text-align: left;
    font-weight: normal;
  }
  .main {
    padding: 20px;
  }
  .dialog-wrapper {
    text-align: left;
  }
  .el-dialog {}
  .el-dialog header {
    padding: 10px;
    background: #eee;
    height: auto;
  }
  .el-dialog .el-dialog__body {
    padding: 0;
  }
</style>
