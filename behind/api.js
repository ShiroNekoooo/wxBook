let express = require("express")

let MongoClient = require("mongodb")
let ObjectId = require('mongodb').ObjectId;
let DBurl = 'mongodb://127.0.0.1:27017/myShop'



let app = express();
//获取类别
app.get("/wxapiGetType",function(req,res){
    MongoClient.connect(DBurl,function(err,db){
        db.collection("type").find().toArray(function(err,types){
            res.send(types)
        })
    })


})
//获取最新
app.get("/wxapiGetNew",function(req,res){
    let where = req.query
    if(where.tag=='index'){
        //首页传来
        delete where.tag
    }
        else if (where.tag=='list'){
            //传到list页
            where.status = JSON.parse(where.status)
            delete where.tag
        }
        else if (where.tag == 'detail'){
            delete where.tag
                where._id = ObjectId(where._id)
        }
       
    MongoClient.connect(DBurl,function(err,db){
        db.collection("goods").find(where).toArray(function(err,goods){
            res.send(goods)
        })
    })


})

//插入购物车接口
app.get("/wxapiAddCart",function(req,res){
    let  {goodsid,nickName} = req.query;

    // console.log(goodsid,nickName)
    let num = 1;
    let checked = "1" //选中状态
    let username  =nickName;
    //执行添加
    MongoClient.connect(DBurl,function(err,db){

        //在做购物车添加之前，需要判断一下，当前商品，当前用户，是否加入过购物车
        db.collection('cart').find({
            username,
            goodsid
        }).toArray(function(e,r){
            // console.log(r,'123')
                if(r.length){
                    //证明之前此用户加入过购物车
                    let  oldNum = r[0].num; //原来购买的数量
                    oldNum++;
                    db.collection('cart').updateOne({
                        username,
                        goodsid
                    },{$set:{
                        num:oldNum
                        }},function(es,rs){
                        res.writeHead(200,{"Content-Type":"application/json"})

                        res.write(JSON.stringify(rs))

                        res.end()
                    })
                    // console.log(r)
                }else{

                    //新的商品，没加入过
                    db.collection('cart').insertOne({
                        num,checked,username,goodsid
                    },function(es,rs){
                        res.writeHead(200,{"Content-Type":"application/json"})

                        res.write(JSON.stringify(rs))

                        res.end()
                    })
                }
        })


    })

})
//获取当前用户的购物车信息
app.get('/wxapiGetUserCarts',function(req,res){
    //1.获取用户名称
    let username = req.query.username;
    MongoClient.connect(DBurl,function(err,db){
        db.collection('cart').find({username}).toArray(function(e,carts){
            carts.forEach((item,index)=>{
                db.collection('goods').findOne({
                    _id:ObjectId(item.goodsid)
                },function(er,rs){
                    carts[index]['goodsname'] = rs.goodsname
                    carts[index]['goodspic'] = rs.goodspic
                    carts[index]['price'] = rs.price

                    // console.log(carts[index])
                    if(index >= carts.length-1){
                        res.writeHead(200,{"Content-Type":"application/json"})

                        res.write(JSON.stringify(carts))

                        res.end()
                    }

                })



            })
            // res.send(types)

        })
    })



})

//更改购物车状态接口
app.get('/wxapiChangeChecked',function(req,res){
    let  _id = ObjectId(req.query.id);  // 获取购物车id，用来作为修改的条件
    let  checked = req.query.checked;  //获取修改之后的状态值
    //执行修改
    MongoClient.connect(DBurl,function(err,db){
        db.collection('cart').updateOne({
            _id
        },{
            $set:{
                checked
            }
        },function(e,r){
            res.writeHead(200,{"Content-Type":"application/json"})

            res.write(JSON.stringify(r))

            res.end()
        })
    })


})


//更改购物车状态接口
app.get('/wxapiChangeAllChecked',function(req,res){

    let  username = req.query.username;  //获取修改之后的状态值
    let  checked = req.query.checked;  //获取修改之后的状态值
    //执行修改
    MongoClient.connect(DBurl,function(err,db){
        db.collection('cart').updateMany({
            username
        },{
            $set:{
                checked
            }
        },function(e,r){
            res.writeHead(200,{"Content-Type":"application/json"})

            res.write(JSON.stringify(r))

            res.end()
        })
    })


})


app.listen(3001,()=>{
    console.log("3001端口开启")
})