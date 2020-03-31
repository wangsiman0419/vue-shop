const router = require('koa-router')()
const UsersModel=require('../models/users.js')   //导入users.js
const GoodsModel=require('../models/goods')
router.prefix('/users')
router.get('/',async ctx => {
  var data=await UsersModel.find({})
  ctx.body={
    code:200,
    msg:"请求成功",
    result:data
  }
})
//加入购物车
router.post('/addCart',async ctx=>{
  var userId=ctx.cookies.get("userId")
  if(userId){
    var {productId}=ctx.request.body;
    var goodsData=await GoodsModel.findOne({productId:productId})
    /* productNum  checked */
    var obj=JSON.parse(JSON.stringify(goodsData));
    obj.checked=true;
    obj.productNum=1;
    var userData=await UsersModel.findOne({});
    if(userData.cartList.every(item=>item.productId !=productId)){
      await UsersModel.update({userId:userId},{$push:{"cartList":obj}})
      ctx.body={
        msg:"添加成功",
        code:200
      }
    }else{
      ctx.body={
        msg:"已经添加到购物车",
        code:200
      }
    }
  }else{
    ctx.body={
      msg:"没有登陆"
    }
  }
})
//登陆模块
router.post('/login',async ctx=>{
  var data=ctx.request.body;
  var res=await UsersModel.findOne(data);
  if(res){
    ctx.cookies.set("userId",res.userId,{
      maxAge:1000*60*60
    })
    ctx.cookies.set("userName",res.userName,{
      maxAge:1000*60*60
    })
    ctx.body={
      code:"200",
      msg:"登陆成功",
      result:res.userName
    }
  }else{
    ctx.body={
      code:"400",
      msg:"用户名和密码错误"
    }
  }
  console.log(data)
})
//检查登陆状态
router.get('/checkLogin',async ctx=>{
  var userId=ctx.cookies.get("userId");
  if(userId){
    ctx.body={
      code:200,
      msg:"登陆成功",
      result:ctx.cookies.get("userName")
    }
  }else{
    ctx.body={
      code:1001,
      msg:"未登陆"
    }
  }
})
//退出登陆
router.post('/logout',async ctx=>{
  ctx.cookies.set("userId","",{
    maxAge:-1
  })
  ctx.cookies.set("userName","",{
    maxAge:-1
  })
  ctx.body={
    code:200,
    msg:"退出登陆"
  }
})
//购物车查询
router.get('/cartList',async ctx=>{
  var data=await UsersModel.findOne({})
  var res=data.cartList;
  ctx.body={
    code:200,
    result:res
  }
})
//购物车编辑
router.post('/cartList/edit',async ctx=>{
  var {productNum,productId,checked}=ctx.request.body;
  var userId=ctx.cookies.get("userId");
  var data=await UsersModel.update(
    {userId:userId,"cartList.productId":productId},
    {$set:
    {
      "cartList.$.productNum":productNum,
      "cartList.$.checked":checked
    }
  })
  if(data.ok==1){
    ctx.body={
      code:200,
      msg:"修改成功"
    }
  }
})
//购物车删除
router.post('/cartList/del',async ctx=>{
  var {productId}=ctx.request.body;
  var userId=ctx.cookies.get('userId');
  var data=await UsersModel.update({userId:userId},{$pull:{cartList:{productId:productId}}})
  if(data.ok==1){
    ctx.body={
      code:200,
      msg:"删除成功"
    }
  }else{
    ctx.body={
      code:1001,
      msg:"删除失败"
    }
  }
})
module.exports = router
