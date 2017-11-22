<template>
  <div id="navi">
    <el-menu
      class="el-menu"
      mode="horizontal"
      background-color="#222"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-menu-item index="0">
        <span class="logo">Swagger<span class="logo-lab">Lab</span></span>
      </el-menu-item>
      <el-menu-item index="1">处理中心</el-menu-item>
      <el-submenu index="2">
        <template slot="title">我的工作台</template>
        <el-menu-item index="2-1">选项1</el-menu-item>
        <el-menu-item index="2-2">选项2</el-menu-item>
        <el-menu-item index="2-3">选项3</el-menu-item>
      </el-submenu>
      <el-menu-item index="3"><a href="#" target="_blank">订单管理</a></el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'navi'
}
</script>

<style>
  #navi {

  }
  .logo {
    font-size: 2.5em;
    font-weight: bold;
    font-style: italic;
  }
  .logo-lab {
    color: orange;
  }
  .el-menu {
    border-bottom: 0;
  }
</style>
