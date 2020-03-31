# vue-shop

### 1.加载首页数据

```js
//goods/list
{
    start:0,
    limit：8
}
```

```js
    //1.前端代码实现
    //只取八条数据，从第一条开始获取
    export default{
        data(){
            return{
                limit:8,
                start:0,
                goodsList:[]
            }
        },
          methods: {
            initData() {   //封装HTTP
              this.$http.get("/goods/list", {
                  //通过params属性传递参数给后端
                  params: { start: this.start, limit: this.limit }
                }).then(res => {
                  if (res.data.code == 200) {
                    this.goodsList = res.data.result;
                    this.total = Math.ceil(res.data.total / this.limit) * 10;
                  }
                });
            }
          }
        },
          mounted() {   //直接调用
            this.initData();
          },
    }
```

```js
//后端业务
router.get('/goods/list', async ctx => {
 var {start,limit}=ctx.query;
 var total=await GoodsModel.find({}).count();
 var data=await GoodsModel.find({}).skip(Number(start)).limit(Number(limit))
 ctx.body={
  code:200,
  msg:"首页数据请求成功",
  result:data,
  //total给前台设置分页用
  total:total
}
})
```

### 2.分页

```js
//前端代码
//taotal  10为1页  30为3页
<el-pagination  
//设置当前处于第几页
@current-change="getPage" 
background layout="prev, pager, next" 
:total="total"></el-pagination>
```

```js
methods:{
   getPage(page){     //获取当前点击的页数
      /* page=1  start=0
         page=2  start=8
         page=3  start=16
       */
      //改变从哪一个位置开始查询
     this.start=(page-1)*this.limit;      //页数从1开始  start从0开始
     this.initData()
    },
}
```

### 三.价格升序和降序

```js
//对goodsList进行升序和降序
//前端代码
<p>排序:<span class="default">默认</span><span class="prices" 
   @click="handleSort">价格<i class="iconfont ">
  {{(sortFlag==1)?'&#xe632;':'&#xe631;'}}</i></span></p>
 data(){
    return{
        sortFlag:1
    }
}
methods:{
//升序 
 compareUp(value){
      return (a,b)=>{
        return a[value]-b[value]
      }
    },
 //降序
    compareDown(value){
      return (a,b)=>{
        return b[value]-a[value]
      }
    }, 
    handleSort(){
      this.sortFlag=(this.sortFlag==1)?-1:1;
      if(this.sortFlag==1){
        this.goodsList.sort(this.compareUp("salePrice"))
      }else{
        this.goodsList.sort(this.compareDown("salePrice"))
      }
    },
}
```

### 四.根据价格区间进行排序

```js
 <div v-for="item of searchPrice" :key="item.id" class="search-price">
     <p @click="handlePrice(item.gt, item.lt)">
        {{ item.gt }}--{{ item.lt }}
    </p>
</div>
methods:{
 handlePrice(gt,lt){     //向后台传递gt,lt
      this.$http({
        url: "/goods/price",
        method: "get",
        params: {
          gt,
          lt
        }
      }).then(res => {
        if (res.data.code == 200) {
          this.goodsList = res.data.result;
          this.total=10;
        } else {
          this.goodsList = [];
          this.$message({
            duration: 1000,
            message: res.data.msg,
            type: "warning"
          });
        }
      });
    },
}

//根据价格区间查询
//后台
router.get("/goods/price",async ctx=>{
  var {gt,lt}=ctx.query;
  var data=await GoodsModel.find({salePrice:{$gt:gt,$lt:lt}})
  if(data.length){
    ctx.body={
      code:200,
      msg:"数据请求成功",
      result:data,
      total:data.length
    }
  }else{
    ctx.body = {
      code:1001,
      msg:"没有数据"
    }
  }
})
```

### 五.默认

```js
<el-button class="default" @click="handleDefault">默认</el-button>
```

```js
methods:{
    handleDefault(){
         this.initData()
    }
}
```

### 六.添加到购物车

```
<button @click="addCart(item.productId)">加入购物车</button>
```

```js
methods:{
    addCart(productId){
      /* post请求方式 */
      this.$http({
        url:"/users/addCart",
        method:"post",
        data:{
          productId
        }
      }).then(res=>{
        this.$message({
          message:res.data.msg,
          code:200,
          duration:1000,
          type:"success"
        })
      })
    } 
}
```

```js
//后端  server/routes/users.js
//添加到购物车
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
router.post('/addCart',async ctx=>{
  var userId="100000077"
  var {productId}=ctx.request.body;
  console.log(ctx.request.body)
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
})
```

### 七.登陆模块

#### 7-1跨域访问服务器上的cookie

```js
//1.前端代码的配置  main.js
axios.defaults.withCredentials=true    //允许htp请求携带cookies
axios.defaults.crossDomain=true
//以上两条允许跨域访问cookies
```

```js
//2.配置服务器   app.js
app.use(cors({
  /* 配置允许跨域的域名 */
   /* *  origin:"*" 允许所有地址访问 */
  origin:"http://192.168.14.13:8080",
  credentials:true
}))
```

```js
//3.首次请求成功时router.get("/",async ctx=>{})
     ctx.cookies.set("name","wangsiman",{
        maxAge:1000*60,/* cookie的有效时长 */
        httpOnly:false 
    })
```

#### 7-2点击实现登录功能

1. 前端获取用户名和密码
2. 携带用户名和密码向后端发送http请求
3. 后端接收用户名和密码
4. 向数据库查询
5. 将结果返回给前端

```js
//1.前端获取用户名和密码
//2.携带用户名和密码向后端发送http请求
<el-button type="primary" @click="handleLogin">确 定</el-button>
methods: {
    handleLogin(){
      if(this.form.username && this.form.pass){
        this.$http({
          url:"/users/login",
          method:"post",
          data:{
            userName:this.form.username,      
            userPwd:this.form.pass
          }.then(res=>{
              console.log(res)
          })
        }
    }
}
```

```js
//3.后端接收用户名和密码  ctx.body
router.post('/login',async ctx=>{
  var data=ctx.request.body;
  })
```

```js
//4.向数据库查询
router.post('/login',async ctx=>{
  var data=ctx.request.body;
  var res=await UsersModel.findOne(data);
    //1.有点话返回结果,没有返回null
    console.log(res)
  })
```

```js
//5.将结果返回给前端   serve/routes/users.js/登录模块
router.post('/login',async ctx=>{
  var data=ctx.request.body;
  var res=await UsersModel.findOne(data);
  if(res){
    ctx.body={
      code:"200",
      msg:"登陆成功"
    }
  }else{
    ctx.body={
      code:"400",
      msg:"用户名和密码错误"
    }
  }
  console.log(data)
})
```

```js
 //前台业务全部功能
<el-button type="primary" @click="handleLogin">确 定</el-button>

methods: {
    handleLogin(){
      if(this.form.username && this.form.pass){
        this.$http({
          url:"/users/login",
          method:"post",
          data:{
            userName:this.form.username,      
            userPwd:this.form.pass
          }
        }).then(res=>{
          if(res.data.code==200){
            this.$message({     //登录成功时
              message:res.data.msg,   
              duration:1000,
              type:"success"
            })
            this.dialogFormVisible=false    //如果登录成功登录框取消
          }else{
            this.$message({    //登录失败时
              message:res.data.msg,
              duration:1000,
              type:"error"
            })
          }
        })
      }else{      //登录密码为空时
        this.$message({
          message:"用户名和密码不能为空",
          duration:1000,
          type:"error"
        })
      }
    },
}
```

#### 7-3使用cookie记录登录的状态

```js
//1.登录成功设置cookie
//后台
router.post('/login',async ctx=>{
  var data=ctx.request.body;
  var res=await UsersModel.findOne(data);
  if(res){                    //登录成功时cooKie记录登录的状态
    ctx.cookies.set("userId",res.userId,{
      maxAge:1000*60*60
    })
    ctx.cookies.set("userName",res.userName,{
      maxAge:1000*60*60
    })
   ...
  }
})
```

```js
//2.再配置一个router检查登录的状态
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
```

```js
//3.页面初次加载时，，调用/user/checkLogin请求  前台
<span>{{successName}}</span>
data(){
    return{
       successName:""
    }
}
 mounted(){
    this.$http('/users/checkLogin').then(res=>{
      if(res.data.code==200){
        this.successName=res.data.result;
      }else{
        this.$message({
          message:"未登录",
          duration:1000,
          type:"warning"
        })
      }
    })
  }
```

##### 如果没有登陆就不能加入购物车，显示“没有登陆"

```js
//进行一个if-else判断，如果登陆才能添加，负责显示一个"没有登陆"
//server/routes/users.js/addCart
router.post('/addCart',async ctx=>{
  var userId=ctx.cookies.get("userId");    //获取一下userId,通过userId判断cookies是否登陆了
  if(userId){
    var {productId}=ctx.request.body;
    console.log(ctx.request.body)
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
      msg:"没有登陆",
    }
  }
 
})
```

#### 7-4退出登陆

```js
//1.配置路由 清除cookies
router.post('/logout',async ctx=>{
  ctx.cookies.set("userId","",{
    maxAge:-1
  })
  ctx.cookies.set("userName","",{
    maxAge:-1
  })
  ctx.body ={
    code:200,
    msg:"退出登陆"
  }
})
```

```js
//2.前端代码
methods:{
    handleLogout(){
          this.$http.post('/users/logout').then(res=>{
              this.$message({
                  message:res.data.msg,
                  duration:1000
              })
              this.successName = ""
          })
      }
}
```

#### 7-5登陆拦截

```js
//使用中间件   app.js/logger
//ctx.path  获取前端向后台访问的接口
//中间件:路由开始之前和路由结束之后中间进行的操作
app.use(async (ctx,next)=>{ 
    console.log(ctx.path)
  //登陆才可以访问后端其他的接口
  if(ctx.cookies.get('userId')){
    await next()     //继续往下执行
  }else{
    //没有登陆的情况，后端有些接口是可以访问的，白名单,
    if(ctx.path=="/users/login" || ctx.path=="/goods/list" || ctx.path=="/Logout"){
      await next()
    }else{
      ctx.body={
        code:1001,
        msg:"未登陆"
      }
    }
  }
})
```

### 八.购物车模块

#### 8-1购物车查询

```js
//users.js
router.get('/cartList',async ctx=>{
   var data=await UsersModel.findOne({})
   var res=data.cartList;
   ctx.body={    //向前台返回数据
     code:200,
     result:res
   }
})
```

#### 8-2购物车的编辑

```js
//前台
<td>
    <van-stepper @change="onChange(item)" v-model="item.productNum" integer />
 </td>


methods:{
 async  onChange(item){
   var {productNum,productId,checked}=item;
   await this.$http.post('/users/cartList/edit',{
     productId,
     productNum,
     checked
   })
 }
}
```

```js
//后台
router.post('/cartList/edit',async ctx=>{
  var {productNum,productId,checked}=ctx.request.body;
  var userId=ctx.cookies.get("userId");
  var data=await UsersModel.update(
    {userId:userId,"cartList.productId":productId},
    {$set:
      {"cartList.$.productNum":productNum,
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
```

#### 8-3购物车的删除

```js
//后端业务
router.post('/cartList/del',async ctx=>{
   var {productId}=ctx.request.body;    //因为是post请求，所以是request   ，如果是get则是query
   console.log(ctx.request.body)
   var userId=ctx.cookies.get("userId");
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
```

```js
//前台代码
<el-button type="danger" @click="handleDelete(item.productId)">删除</el-button>


methods:{
    handleDelete(productId){
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.post('/users/cartList/del',{productId}).then(res=>{
            console.log(res)
            this.initData()
          })
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
        }).catch(() => {});
    },
}
```

### 九.路由守卫

```js
Tips:一定要配置在路由地址所对应的主组件中   //views/Home.vue
/* 路由守卫 */
  beforeRouteLeave(to,from,next){
    this.$http('/users/checkLogin').then(res=>{
      if(res.data.code==200){
        next()
      }else{
        this.$message({
          message:res.data.msg,
          duration:1000
        })
      }
    })
  }
```
### 十.如果数据取不到

```
1.先用cmd查看当前的ip地址
2.在serve的app.js和前端main.js中修改ip地址
```

