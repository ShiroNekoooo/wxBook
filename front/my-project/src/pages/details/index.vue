<template>
  <div class>
    <div class="cover">
      <div class="pic">
        <img :src="details.goodspic" />
      </div>
    </div>

    <div class="details">
      <h3 class="title">
        <span class="recommend">轻度推荐</span>
        {{details.goodsname}}
      </h3>

      <p>{{details.desc}}</p>
    </div>
    <div class="money clearFix">
      <div class="price">
        ￥
        <span class="m-price">{{details.price}}</span>
      </div>
      <div>库存:{{details.num}}</div>
    </div>

    <div class="options clearFix">
      <!-- <img src alt />
      <img src alt />-->
      <div class="icons">
        <img src="/static/logo/sort.png" alt />
        <span>店铺</span>
      </div>
      <div class="icons" @click="toShopCar">
        <img src="/static/logo/cart.png" alt />
        <span>购物车</span>
      </div>

      <div class="toDo yys">立即购买</div>
      <div class="toDo" @click="add">加入购物车</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      goodsid: null,
      details: []
    };
  },
  onLoad(options) {
    let { goodsid, goodsname } = options;
    this.goodsid = goodsid;

    wx.setNavigationBarTitle({
      title: goodsname
    });
    this.getDetail();
 
  },
  methods: {
    getDetail() {
      //获取详情页信息
      let that = this;

      let goodsid = that.goodsid;
      let nickName = wx.getStorageSync("userinfo").nickName;

      wx.request({
        url: "http://127.0.0.1:3001/wxapiGetNew",
        data: {
        _id:goodsid,
              tag:"detail"
        },
        success(res) {
          res.data.forEach((item, index) => {
            //upload\type\A1txaZ6avw3mCg8HAIo_NSEb.png
            res.data[index].goodspic = 
              "http://127.0.0.1:3000/" + item.goodspic.replace(/\\/g, "/"); //将\\全部替换为\
          });
          that.details = res.data[0];
        }
      });
    },
     add(){
          let that= this;
        //加入之前，需要进行判断，是否登录
        wx.getSetting({
          success(res) {

            // console.log(res)
            //判断是否授权
            if(res.authSetting['scope.userInfo']){
                //已经授权了，就可以执行插入数据库操作
            //    获取商品id，还有用户名

                let  goodsid =  that.goodsid;
                let  nickName = wx.getStorageSync('userinfo').nickName;

                wx.request({
                    url:"http://127.0.0.1:3001/wxapiAddCart",
                    data:{
                      goodsid,
                      nickName
                    },
                    success(result){
                      // console.log(result.errMsg)
                      if(result.errMsg == "request:ok"){
                          //购物车添加成功
                        wx.showToast({
                          title: '添加成功',
                          icon: 'success',
                          duration: 2000
                        })


                      }else{
                          //购物车添加失败
                        wx.showToast({
                          title: '添加失败',
                          icon: 'success',
                          duration: 2000
                        })


                      }
                    }
                })


            }else{
                //跳转，执行授权操作
              wx.showModal({
                title: '提示',
                content: '请先去登录',
                success (res) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url:"/pages/login/main"
                    })
                  }
                }
              })



            }
          }
        })

      },
    getInfo() {
      let that = this;
      wx.getSetting({
        success(res) {
          // console.log(res)
          if (res.authSetting["scope.userInfo"]) {
            //有登录信息

            wx.showToast({
              title: "添加成功",
              icon: "success"
            });
          } else {
            wx.showModal({
              title: "提示",
              content: "请登陆后,再操作",
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: "/pages/login/main" //跳转到login进行登录判断
                  });
                }
              }
            });
          }
        }
      });
    },
    toShopCar() {
      //判断是否登录

      wx.getSetting({
        success(res) {
          // console.log(res)
          if (res.authSetting["scope.userInfo"]) {
            //有登录信息

            wx.switchTab({
              url: `/pages/cart/main`
            });
          } else {
            wx.showModal({
              title: "提示",
              content: "请登陆后,再操作",
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: "/pages/login/main" //跳转到login进行登录判断
                  });
                }
              }
            });
          }
        }
      });
    }
  }
};
</script>

<style  scoped>
.cover {
  width: 100%;
  height: 355px;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}
.cover img {
  width: 100%;
  height: 353px;
}
.recommend {
  background: #f93f33;
  border-radius: 10px;
  margin-right: 10px;
  color: #fff;
  padding: 2px 2px;
}
.details {
  box-sizing: border-box;
  padding: 10px 5px;
}
.title {
  margin-bottom: 4px;
}
.options {
  height: 60px;

  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;

  display: flex;
  background-color: #fff;
}
.options div {
  flex: 1;
  justify-content: space-between;
  text-align: center;
}
.options div img {
  width: 50px;
  height: 50px;
}
.icons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.icons span {
  font-size: 13px;
}
.toDo {
  line-height: 60px;
  color: #fff;
  background: #f25449;
}
.yys {
  background: #ffbd24;
}
.money {
  margin-top: 5px;
  margin-bottom: 100px;
}
.money div {
  float: left;
  font-size: 15px;
  margin-right: 20px;
}
.m-price {
  font-size: 18px;
}
.clearFix::before,
.clearFix::after {
  display: block;
  content: "";
  clear: both;
}
</style>