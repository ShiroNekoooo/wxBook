<template>
  <div>
    <mp-searchbar
      :isFocus="true"
      :inputValue="inputValue"
      :placeholder="placeholder"
      @input="input"
      @blur="blur"
      @focus="focus"
      @confirm="confirm"
    ></mp-searchbar>

    <swiper indicator-dots autoplay="true" circular class="swipers">
      <swiper-item v-for="item in img" :key="item">
        <img :src="item" />
      </swiper-item>
    </swiper>

    <swiper class="classify clearFix">
      <swiper-item v-for="(item,index) in info" :key="index">
        <div
          @click="toList(value._id,value.typename)"
          class="items-list"
          v-for="(value,keys) in item"
          :key="keys"
        >
          {{value.typename}}
          <img :src="value.typepic" />
        </div>
      </swiper-item>
    </swiper>

    <swiper class="swipers ads">
      <swiper-item>
        <img class="ads" src="/static/banner/index2.jpg" />
      </swiper-item>
    </swiper>

    <div class="new clearFix">
      <div class="newItem" @click="toDetail(item._id,item.goodsname)" v-for="(item,index) in newBook" :key="index">
        <span class="hot">{{item.status}}</span>
        <p>{{item.goodsname}}</p>
        <img :src="item.goodspic" alt />
      </div>
    </div>
  </div>
</template>

<script>
import mpSearchbar from "mpvue-weui/src/searchbar";
export default {
  data() {
    return {
      img: [
        "/static/banner/index1.jpg",
        "/static/banner/index2.jpg",
        "/static/banner/index3.jpg"
      ],
      info: [],
      newBook: []
    };
  },

  components: {
    mpSearchbar
  },

  onShow() {
    this.GetTypes();
    this.GetNew();
  },
  methods: {
    
    //获取图书类别
    GetTypes() {
      let info = [];
      let that = this;
      wx.request({
        url: "http://127.0.0.1:3001/wxapiGetType",
        success(res) {
          res.data.forEach((item, index) => {
            //upload\type\A1txaZ6avw3mCg8HAIo_NSEb.png
            res.data[index].typepic =
              "http://127.0.0.1:3000/" + item.typepic.replace(/\\/g, "/"); //将\\全部替换为\
          });
          let len = Math.ceil(res.data.length / 10); //分页--每页10个--向上取整
          for (let i = 0; i < len; i++) {
            if (i < len) {
              //如果未超过分页数-1
              let arr = res.data.splice(0, 10);
              info.push(arr);
            } else {
              info.push(res.data);
            }
          }
          that.info = info;
        }
      });
    },
    //获取热卖图书
    GetNew() {
      let that = this;

      wx.request({
        url: "http://127.0.0.1:3001/wxapiGetNew",
        data: {
          status: "1",
          tag: "index"
        },
        success(res) {
          res.data.forEach((item, index) => {
            res.data[index].goodspic =
              "http://127.0.0.1:3000/" + item.goodspic.replace(/\\/g, "/"); //将\\全部替换为\
         
          if(res.data[index].status=='1'){
             res.data[index].status ='新品'
            }
            else if(res.data[index].status=='2'){
                 res.data[index].status ='热卖'
            }
         });
          that.newBook = res.data;
        }
      });
    },
    //从类别跳转到列表页
    toList(typeid, typename) {
      let url = "/pages/list/main/?typeid=" + typeid + "&typename=" + typename;
      wx.navigateTo({
        //  url:'/pages/list/main?typeid='+typeid+'&typename='+typename
        url: `/pages/list/main?typeid=${typeid}&typename=${typename}`
      });
    },
    //跳转到详情页
       toDetail(_id,goodsname){
    
   
        wx.navigateTo({
        url:`/pages/details/main?goodsid=${_id}&goodsname=${goodsname}`,
         
      }) 

  }

  }
};
</script>

<style scoped>
.swipers {
  width: 100%;
}
.swipers img {
  width: 100%;
  height: 100%;
}
.classify {
  height: 185px;
  box-shadow: 0 0 15px black;
}

.items-list {
  width: 73px;
  height: 90px;
  border: 1px solid #ccc;
  float: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.items-list img {
  width: 40px;
  height: 50px;
}
.items-list {
  font-size: 14px;
}
.clearFix::before,
.clearFix::after {
  content: "";
  display: block;
  clear: both;
}
.ads {
  margin-top: 2px;
  margin-bottom: 3px;
  height: 100px !important;
  user-select: none;
}
.new {
  border-top: 1px solid #ccc;
  margin-top: 10px;
}
.newItem {
  position: relative;
  width: 32%;
  height: 185px;
  border-bottom: 1px solid #ccc;
  border-left: 1px solid #ccc;
  text-align: center;
  overflow: hidden;
  margin-left: 2px;
  float: left;
  box-sizing: border-box;
  padding: 20px 0;
}
.newItem img {
  width: 100%;
  height: 100%;
}
.hot {
  position: absolute;
  top: 0;
  left: 3px;
  background-color: red;
  color: #fff;
  border-radius: 10px;
}
</style>
