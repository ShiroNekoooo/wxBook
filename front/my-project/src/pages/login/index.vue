<template>
  <div class>
    <button open-type="getUserInfo" @getuserinfo="getInfo">登录</button>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {};
  },
  methods: {
    getInfo(res) {
      console.log(res);
      if (res.mp.detail.errMsg == "getUserInfo:ok") {
        //授权登录成功
        //将信息存入缓存
        wx.setStorage({
          key: "userInfo",
          data: res.mp.detail.userInfo,
          success(r) {
            console.log(r);
            if (r.errMsg == "setStorage:ok") {
              wx.navigateBack({
                delta: 1
              });
            }
          }
        });
      } else {
        //授权失败
        wx.showToast({
          title: "请登录",
          icon: "success",
          duration: 2000
        });
      }
    }
  }
};
</script>

<style  scoped>
</style>