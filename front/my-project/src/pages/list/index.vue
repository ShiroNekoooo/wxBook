<template>
  <div class="list">
    <div class="author">
      <img :src="img" alt />
      <p>{{authorName}}</p>
    </div>

    <div class="new clearFix">
      <!--  -->
      <div class="newItem"  @click="toDetail(item._id,item.goodsname)" v-for="(item,index) in newBook" :key="index">
        
        <span class="hot">{{item.status}}</span>
        <p>{{item.goodsname}}</p>
        <img :src="item.goodspic" alt />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      img: "/static/banner/东野圭吾.jpg",
      authorName: null,
      newBook:[],
    
    };
  },
  onLoad(options) {
    
    let {typeid} = options;
    let that = this;
    wx.request({
      "url":"http://127.0.0.1:3001/wxapiGetNew",//该接口同样可以查询到不同类目下数据\
      data:{
         status:{$ne:"3"},//非下架状态
        tag:"list",
       typeid
      },  success(res) {
        console.log(res)
          res.data.forEach((item, index) => {
            res.data[index].goodspic ="http://127.0.0.1:3000/" + item.goodspic.replace(/\\/g, "/"); //将\\全部替换为\
            if(res.data[index].status=='1'){
             res.data[index].status ='新品'
            }
            else if(res.data[index].status=='2'){
                 res.data[index].status ='热卖'
            }
      
       });
          that.newBook = res.data;
          

        }
    })



    this.authorName = options.typename;
    wx.setNavigationBarTitle({
      title: `[ ${options.typename} ]专区`
    });
    wx.setNavigationBarColor({
      frontColor: "#ffffff",
      backgroundColor: "#ff0000",
   
    });

  }
,
  methods:{
    toDetail(_id,goodsname){
      console.log(1)
   
        wx.navigateTo({
        url:`/pages/details/main?goodsid=${_id}&goodsname=${goodsname}`,
         
      }) 

  }
  }
};
</script>

<style  scoped>
.author {
  width: 100%;
  text-align: center;
  font-family: "微软雅黑";
  font-weight: 600;
}
.author img {
  width: 100%;
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
