<template>
  <div id="pro-item">
    <el-card :body-style="{ padding: '0px' }">
      <!-- <img src="http://placeholder.qiniudn.com/300x200" class="image"> -->
      <div class="head">
        <div class="head-bg"></div>
        <h2 class="title">{{project.info.content.name}}</h2>
      </div>
      <div style="padding: 14px;">
        <span>{{project.info.content.desc}}</span>
        <div class="bottom clearfix">
          <time class="time">{{ currentDate }}</time>
          <el-button type="text" class="button">操作按钮</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'pr-item',
  props: {
    project: null
  },
  data() {
    return {
      currentDate: moment(this.project.info.create_date).format('YYYY-MM-DD')
    }
  },
  components: {
  }
}
</script>

<style scoped>
#pro-item {
  text-align: left;
}
.head {
  /* background: #5fcc86 url(./swagger-logo.png) no-repeat center;
  background-size: cover; */
  height: 100px;
  position: relative;
  overflow: hidden;
}
.head .title {
  font-size: 20px;
  margin: 0;
  padding: 20px;
  font-weight: normal;
  text-align: left;
  position: relative;
  text-shadow: 2px 5px 5px rgba(0,0,0,0.2);
}
.head .head-bg {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background: #5fcc86 url(./swagger-logo.png) no-repeat right;
  background-size: contain;
  filter: blur(2px);
}
.time {
    font-size: 13px;
    color: #999;
  }

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 100%;
  display: block;
}

.clearfix:before,
.clearfix:after {
    display: table;
    content: "";
}

.clearfix:after {
    clear: both
}
</style>
