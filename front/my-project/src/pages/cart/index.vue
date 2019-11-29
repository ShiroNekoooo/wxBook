<template>
  <div>
    <div style="margin-bottom: 75px">
      <div v-for="(item,index) in carts" class="cartlist">

        <switch style="flex: 1;" type="checkbox" :data-index="index" :checked="item.checked == 1 ? true : false" @change="checkedChange" :data-id="item._id"></switch>


        <img :src="item.goodspic" alt="" class="img" style="flex: 2">
        <div style="flex: 4; margin-left: 20px">
          <div style="position: relative;top: -40px;">
            <text>{{ item.goodsname }}</text>
          </div>
          <div class="cartlist_div">
            <div>
              <text>￥{{ item.price }}</text>
            </div>
            <div style="margin-left: 80px">
              <text>-</text>
              <text style="margin: 0px 20px">{{ item.num }}</text>
              <text>+</text>
            </div>
          </div>

        </div>
      </div>
    </div>


      <div class="bottom">
<!--        底部按钮-->
        <div>
          <switch type="checkbox" :checked="kg" @change="changeAllChecked">全选</switch>
        </div>

        <div style="margin-left: 40px">
          合计：￥{{ total }}
        </div>
        <div style="margin-left: 110px">
          <text>结算(0)</text>
        </div>

      </div>
  </div>
</template>

<script>
   export default {
      data(){
        return {
            carts:[],
            kg:false,
            total:0
        }
      },

     methods:{
       getCarts(){
              // console.log('获取购物车信息')
              let  that = this;
              let  username = wx.getStorageSync('userinfo').nickName;
              wx.request({
                url:"http://127.0.0.1:3001/wxapiGetUserCarts",
                data:{
                    username
                },
                success(res){
                  res.data.forEach((item,index)=>{
                    res.data[index].goodspic = "http://127.0.0.1:3000/"+item.goodspic.replace('\\','/');

                  })
                  // console.log(res)
                  //res.data 是所有的购车信息
                  //判断当前res。data中是否有没被选中的商品 ，如果有，kg=  false ，没有 kg ==true
                  //checked = 0  没被选中

                   //如果能够查到当前res。data中有checked=0的商品，那么返回的是当前商品所在位置
                   //如果没有，返回的是-1

                   let  index =  res.data.findIndex((item,index)=>{
                        return  item.checked == 0;
                   })

                  // console.log(index)
                  if(index ==  -1){
                    //证明全被选中了
                    that.kg = true
                  }else{
                    //有没被选中的
                    that.kg = false
                  }

                  //  获取所有被选中的商品
                  let  checkedInfo = res.data.filter((item,index)=>{
                        return  item.checked == "1"
                  })
                  // console.log(checkedInfo)
                  let  total = 0; //计算总价格的

                  checkedInfo.forEach((item,index)=>{
                        total +=  parseFloat(item.price) * parseFloat(item.num)
                  })

                  that.total = total;
                  //计算总价

                    that.carts = res.data;
                }
              })


          },


       checkedChange(e){
            //改变当前商品的状态
         // console.log(e)
         let that =this;
         let  id = e.mp.currentTarget.dataset.id; //购物车id
         let  index =e.mp.currentTarget.dataset.index;// index就是修改购物车下标变量
         let  checked;
         if(e.mp.detail.value){
            //选中
            checked = "1"
         }else{
            //取消
           checked = "0"
         }

         wx.request({
           url:"http://127.0.0.1:3001/wxapiChangeChecked",
           data:{
             id,
             checked
           },
           success(res) {
             // console.log(res)
             if(res.data.ok == 1){
                //1.直接去调用 获取所有购物车信息的方法（最简答但是最不合理的，因为每一次都需要去获取数据库信息）
                // that.getCarts()

                //2.不需要去操作数据库，在原有的数据基础上进行处理
                that.carts[index].checked = checked; //  给当前的carts进行从新赋值（最新的数据）


                let c = that.carts.findIndex((item,index)=>{
                  return  that.carts[index].checked == 0;
                })

               console.log(that.carts)
               // //
               // // console.log(c)
               if(c ==  "-1"){
                 //证明全被选中了
                 that.kg = true
               }else{
                 //有没被选中的
                 that.kg = false
               }


             // 也得处理total   that。carts 就是最新的
               //  获取所有被选中的商品
               let  checkedInfo = that.carts.filter((item,index)=>{
                 return  item.checked == "1"
               })
               // console.log(checkedInfo)
               let  total = 0; //计算总价格的

               checkedInfo.forEach((item,index)=>{
                 total +=  parseFloat(item.price) * parseFloat(item.num)
               })

               that.total = total;

             }
           }
         })



       },

       changeAllChecked(e){
         //改变所有的状态
         let that = this;
         let  checked;
         if(e.mp.detail.value){
           //选中
           checked = "1"
         }else{
           //取消
           checked = "0"
         }
         let  username  =  wx.getStorageSync('userinfo').nickName;
         wx.request({
           url:"http://127.0.0.1:3001/wxapiChangeAllChecked",
           data:{
             username,
             checked
           },
           success(res){
             console.log(res)

             //怎么处理 所有商品状态都发生改变，
             // that.getCarts()
             that.carts.forEach((item,index)=>{
                that.carts[index].checked = checked
             })
             // console.log(checkedInfo)
             let  total = 0; //计算总价格的

             //判断当前是选中还是取消
             if(e.mp.detail.value){
                // 1
               //如果是全部选中状态，那么遍历所有的购物车信息，进行价格的累加
               that.carts.forEach((item,index)=>{
                 total +=  parseFloat(item.price) * parseFloat(item.num)
               })

             }else{
                // 0 如果是全部取消，直接付0即可
               total = 0;
             }
          //赋值
             that.total = total;







           }
         })


       }
     },
     onShow(){
        // console.log(1)
       let  that =this;
       wx.getSetting({
         success(res) {
           //判断是否授权
           if(!res.authSetting['scope.userInfo']){
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

           }else{
             //登录成功（授权成功）

             //获取购物车信息
             that.getCarts();


           }
          }
       })
     }
  }
</script>

<style scoped>
  .cartlist{
    width: 100%;
    height: 180px;
    border: 1px solid #ccc;
    border-radius: 20px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    margin-top: 10px;
    justify-content: space-around;
  }

  .img{
    width: 90px;
    height: 130px;
  }
  .cartlist_div{
    position: relative;
    bottom: -40px;
  }
  .cartlist_div div{
      float: left;
  }

  .bottom{
    width: 100%;
    height: 65px;
    border: 1px solid  #ccc;
    border-radius: 5px;
    box-sizing: border-box;

    position: fixed;
    bottom: 0px;
    background: #fff;
  }

  .bottom  div{
    float: left;
    line-height: 65px;
  }
</style>
