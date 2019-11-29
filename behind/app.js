let express = require("express")

let app = new express()
var multiparty = require('multiparty');
app.use('/upload', express.static('upload'))


let fs = require('fs')
//使用ejs模板 


app.set("view engine", "ejs")
app.set("views", __dirname + "/views")

app.use('/', express.static('static'))


let MongoClient = require("mongodb")
let ObjectId = require('mongodb').ObjectId;
let DBurl = 'mongodb://127.0.0.1:27017/myShop'

// ======================类别=================
//渲染视图type下index
app.get('/', function (req, res) {
    // res.render('type/index')
    MongoClient.connect(DBurl, function (err, db) {
        if (err) throw err
        db.collection("type").find().toArray(function (err, types) {

            res.render("type/index", { types })

        })
    })


});

app.get('/add', function (req, res) {
    res.render('type/add')
});

//插入
app.post("/doAdd", function (req, res) {
    var form = new multiparty.Form();
    form.uploadDir = 'upload/type'
    form.parse(req, function (err, field, files) {
        console.log(field, files)
        let typename = field.typename[0]
        let typepic = files.typepic[0].path
        MongoClient.connect(DBurl, function (err, db) {
            if (err) throw err
            db.collection('type').findOne({
                typename
            }, (err, rs) => {
                if (rs) {
                    fs.unlink(typepic, function (e, r) { })//删除图片
                    res.send("<script>alert('当前类目已经存在');history.back();</script>")
                    return false
                } else {
                    db.collection('type').insertOne({
                        typename,
                        typepic

                    }, function (e, r) {

                        if (files.typepic[0].size == 0) {
                            //证明无图片上传
                            fs.unlink(typepic, function () { })//删除
                        }
                        if (r.insertedId) {
                            //证明上传了图片
                            res.send("<script>alert('上传成功');location.href='/';</script>")


                        }
                        else {//上传失败
                            fs.unlink(typepic, function () { })//删除
                            res.send("<script>alert('上传失败');location.href='/';</script>")
                        }
                    })
                }
            })
        })
    })

})

//删除
app.get('/type/doDel', function (req, res) {
    // 接受参数

    //处理id，将id变成 ObjectId(id)
    console.log(req.query)
    let _id = ObjectId(req.query.id);

    let typepic = req.query.typepic;
    MongoClient.connect(DBurl, function (err, db) {
        // 获取所有的类别
        db.collection('type').removeOne({ _id }, function (e, r) {
            // console.log(e,'23456789',r)
            if (r.deletedCount) {
                //证明删除成功

                //删除图片
                fs.unlink(typepic, function () { })
                res.send("<script>alert('删除成功！');location.href='/';</script>")
            } else {
                //删除失败
                res.send("<script>alert('删除失败！');location.href='/';</script>")
            }
        })
    })


})
//跳转修改
app.get("/type/edit", function (req, res) {
    console.log(req.query)
    let _id = ObjectId(req.query.id)
    MongoClient.connect(DBurl, function (err, db) {
        db.collection("type").findOne({ _id }, function (e, r) {
            res.render("type/edit", {
                type: r
            })
        }
        )

    })


})
//执行修改
app.post('/doEdit', function (req, res) {
    var form = new multiparty.Form()
    form.uploadDir = 'upload/type'
    form.parse(req, function (err, fields, files) {
        console.log(fields, 1111, files)

        let _id = ObjectId(fields.id[0])
        let oldPic = fields.oldpic[0]

        let typename = fields.typename[0]
        let typepic = files.typepic[0].path

        MongoClient.connect(DBurl, function (err, db) {

            let update = {}
            if (files.typepic[0].size) {
                //证明有图片更换
                update = {
                    $set: {
                        typename,
                        typepic
                    }
                }
            }
            else {//图片没更换
                update = {
                    $set: {
                        typename
                    }
                }
            }
            db.collection("type").updateOne({ _id }, update, function (e, r) {
                console.log(r)
                if (files.typepic[0].size) {
                    //图片更换了
                    if (r.modifiedCount) {
                        //更新了一条
                        if (oldPic) {//旧图片删除
                            fs.unlink(oldPic, function (e, r) { })
                            res.send("<script>alert('更新成功');location.href='/';</script>")

                        }
                    } else {
                        fs.unlink(typepic, function (e, r) { }) //无modifiedCount，则删除刚才更新的那张图片（无用
                        res.send("<script>alert('更新失败');location.href='/';</script>")

                    }


                }
                else {
                    //图片没换
                    fs.unlink(typepic, function (e, r) { })//删除 默认添加的图片（无用,因为这里图片没有更改)
                    if (r.modifiedCount) {
                        //更新了一条
                        res.send("<script>alert('更新成功');location.href='/';</script>")

                    } else {
                        res.send("<script>alert('更新失败');location.href='/';</script>")

                    }
                }
            })

        })




    })
})

// ======================商品=================

//显示商品添加add页面
app.get('/goods/add', function (req, res) {
    MongoClient.connect(DBurl, function (err, db) {
        db.collection("type").find().toArray(function (err, r) {

            res.render('goods/add', {
                type: r
            })
        })

    })


})
//添加
app.post("/goods/doAdd", function (req, res) {
    var form = new multiparty.Form();
    form.uploadDir = 'upload/goods' //图片传到goods下

    form.parse(req, function (err, fields, files) {

        let goodsname = fields.goodsname[0]
        let price = fields.price[0]
        let num = fields.num[0]
        let desc = fields.desc[0]
        let typeid = fields.typeid[0];

        let status = fields.status[0]

        //商品图片
        let goodspic = files.goodspic[0].path



        MongoClient.connect(DBurl, function (err, db) {
            if (err) throw err
            db.collection('goods').findOne({
                goodsname
            }, (err, rs) => {
                if (rs) {
                    fs.unlink(goodspic, function (e, r) { })//删除图片
                    res.send("<script>alert('当前商品已经存在');history.back();</script>")
                    return false
                } else {
                    db.collection('goods').insertOne({
                        goodsname, goodspic, price, status, num, desc, typeid


                    }, function (e, r) {

                        if (files.goodspic[0].size == 0) {
                            //证明无图片上传
                            fs.unlink(goodspic, function () { })//删除
                        }
                        if (r.insertedId) {
                            //证明上传了图片
                            res.send("<script>alert('商品插入成功');location.href='/goods/index';</script>")


                        }
                        else {//上传失败
                            fs.unlink(goodspic, function () { })//删除
                            res.send("<script>alert('商品插入失败');location.href='/goods/index';</script>")
                        }
                    })
                }
            })
        })
    })
})
// /显示在商品的index页面
app.get('/goods/index', function (req, res) {

    //获取商品信息
    MongoClient.connect(DBurl, function (err, db) {
        // 获取所有的类别
        db.collection('goods').find().toArray(function (e, goods) {
            // console.log(r)

            // 根据当前商品的类别id，去type表中获取对应的类别名称
            // item.typeid  就是type表中id
            new Promise(function (resolve, reject) {
                goods.forEach((item, index) => {
                    db.collection('type').findOne({ _id: ObjectId(item.typeid) }, function (er, rs) {
                        // console.log(rs)  临时添加一个属性 typename
                        goods[index].typename = rs.typename;

                    })

                })
                setTimeout(() => {
                    resolve(goods)
                }, 100)

            }).then((goods) => {
                // console.log(goods)

                res.render("goods/index", {
                    goods
                })
            })


        })
    })

    // res.send('index')
})

//删除  
app.get('/goods/doDel', function (req, res) {
    // 接受参数

    //处理id，将id变成 ObjectId(id)
    console.log(req.query)
    let _id = ObjectId(req.query.id);

    let goodspic = req.query.goodspic;
    MongoClient.connect(DBurl, function (err, db) {
        // 获取所有的类别
        db.collection('goods').removeOne({ _id }, function (e, r) {
            // console.log(e,'23456789',r)
            if (r.deletedCount) {
                //证明删除成功

                //删除图片
                fs.unlink(goodspic, function () { })
                res.send("<script>alert('删除成功！');location.href='/goods/index';</script>")
            } else {
                //删除失败
                res.send("<script>alert('删除失败！');location.href='/goods/index';</script>")
            }
        })
    })


})

//显示修改页
app.get('/goods/edit', function (req, res) {
    //获取商品id
    let _id = ObjectId(req.query.id);

    MongoClient.connect(DBurl, function (err, db) {
        // 获取所有的类别
        db.collection('goods').findOne({ _id }, function (e, goods) {
            // console.log(r,1234567890)

            //获取所有的类别
            db.collection('type').find().toArray(function (es, types) {
                // console.log(r,1234567890)
                res.render("goods/edit", {
                    types, //  将获取到的类别渲染到add模板中
                    goods //  将要修改的数据
                })
            })
            // res.render("goods/edit",{
            //     goods:r
            // })
        })
    })

    // res.render("goods/edit",{})
})
//执行修改
app.post('/goods/doEdit', function (req, res) {
    var form = new multiparty.Form();
    form.uploadDir = "upload"  //  设置上传文件存储目录

    form.parse(req, function (err, fields, files) {
        //获取商品信息

        let goodsname = fields.goodsname[0];
        let typeid = fields.typeid[0];
        let status = fields.status[0];
        let price = fields.price[0];
        let num = fields.num[0];
        let desc = fields.desc[0];

        // 商品图片  1
        let goodspic = files.goodspic[0].path;

        //获取id
        let _id = ObjectId(fields.id[0])   //  条件id
        let oldPic = fields.oldPic[0]  //老的图片名称

        MongoClient.connect(DBurl, function (err, db) {
            //直接判断是否有新的上传图片
            if (files.goodspic[0].size) {
                //有新的上传图片
                db.collection('goods').updateOne({ _id }, {
                    $set: {
                        goodsname, price, num, status, desc, typeid, goodspic
                    }
                }, function (e, r) {
                    if (r.modifiedCount) {
                        //修改成功
                        if (oldPic) {
                            fs.unlink(oldPic, function () { })
                        }
                        res.send("<script>alert('商品修改成功！');location.href='/goods/index';</script>")
                    } else {
                        //修改失败
                        fs.unlink(goodspic, function () { })
                        res.send("<script>alert('商品修改失败！');history.back();</script>")
                    }
                })



            } else {
                //没有新的上传图片
                fs.unlink(goodspic, function () { }) // 没有新的上传图片，那么需要删除垃圾信息
                db.collection('goods').updateOne({ _id }, {
                    $set: {
                        goodsname, price, num, status, desc, typeid
                    }
                }, function (e, r) {
                    // console.log(r)
                    if (r.modifiedCount) {
                        res.send("<script>alert('商品修改成功！');location.href='/goods/index';</script>")
                    } else {
                        res.send("<script>alert('商品修改失败！');history.back();</script>")
                    }
                })

            }

        })


    });
})

//===============购物车管理模块================
app.get('/cart/index', function (req, res) {
    //链接数据库
    MongoClient.connect(DBurl, function (err, db) {
        db.collection('cart').find({}).toArray(function (e, carts) {
            // console.log(carts)
            if (carts.length) {
                carts.forEach((item, index) => {
                    // console.log(123)
                    db.collection('goods').findOne({
                        _id: ObjectId(item.goodsid)
                    }, function (er, rs) {
                        carts[index]['goodsname'] = rs.goodsname
                        carts[index]['goodspic'] = rs.goodspic
                        carts[index]['price'] = rs.price

                        // console.log(carts[index])
                        if (index >= carts.length - 1) {
                            res.render('cart/index', {
                                carts
                            })
                        }

                    })



                })
            } else {
                res.render('cart/index', {
                    carts
                })
            }




        })
    })

})



app.listen(3000, (res) => {
    console.log('端口开启成功')
});