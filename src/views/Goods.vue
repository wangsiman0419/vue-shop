<template>
  <div class="home">
    <Home></Home>
    <div class="container">
      <router-link to="/" >首页</router-link> |
      <router-link to="/detail" >商品详情</router-link>
      <div class="rank">
        <p >排序：<el-button class="default">默认</el-button><span @click="handleSort"> 价格</span>
        <i class="iconfont">{{(sortFlag==1)?'&#xe632;':'&#xe631;'}}</i>
        </p>
      </div>
      <div class="search">
          <h3>price</h3>
          <div v-for="item of searchPrice" :key="item.id">
            <p @click="handlePrice(item.gt,item.lt)">{{ item.gt }}--{{ item.lt }}</p>
          </div>
      </div>
       <div class="right">
          <div class="list" v-for="item of goodsList" :key="item.id">
            <img :src="item.productImage" alt="">
            <p class="name">{{item.productName}}</p>
            <p class="price">￥{{item.salePrice}}</p>
            <button class="add"  @click="addCart(item.productId)">加入购物车</button>
          </div>
        </div>
        <el-pagination
          @current-change="getPage"
          background
          layout="prev, pager, next"
          :total="30">
        </el-pagination>
      </div>
    </div>
</template>

<script>
import Home from '@/components/Home.vue'
export default {
  name: "home",
  data() {
    return {
      searchPrice: [
        { gt: 0, lt: 100, id: 1001 },
        { gt: 100, lt: 500, id: 1002 },
        { gt: 500, lt: 1000, id: 1003 },
        { gt: 1000, lt: 5000, id: 1004 },
        { gt: 5000, lt: 10000, id: 1005 }
      ],
      goodsList:[],
      limit:8,
      start:0,
      sortFlag:1
    };
  },
  components:{
    Home
  },
  mounted() {
   this.initData()
  },
  methods:{
    initData(){
       this.$http.get("/goods/list",{params:{start:this.start,limit:this.limit}}).then(res => {
          this.goodsList = res.data.result;
       });
    },
    handlePrice(gt,lt){
       this.$http({
         url:'/goods/price',
         method:'get',
         params:{
           gt,
           lt
         }
       }).then(res=>{
         if(res.data.code==200){
             this.goodsList=res.data.result;
             this.total=Math.ceil(res.data.total/this.limit)*10
         }else{
           this.goodsList=[];
           this.$message({
              duration:1000,
              message:res.data.msg,
              type:'warning'
            })
         }
       })
    },
    getPage(page){
       this.start=(page-1)*this.limit;
       this.initData()
    },
    //升序
    compareUp(value){
      return(a,b)=>{
        return a[value]-b[value]
      }
    },
    //降序
    compareDown(value){
      return(a,b)=>{
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
    addCart(productId){
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
  },
  beforeRouteLeave (to, from, next) {
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
};
</script>
<style scoped >
.home {
  width: 1000px;
  margin-left: auto;
  margin-right: auto;
}
.container {
  width:800px;
  margin-left: auto;
  margin-right: auto;
  background: rgb(243, 244, 245);
  padding-left: 100px;
  padding-right: 100px;
}
.logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 10px;
}
.login {
  display: flex;
  justify-content: space-between;
  padding-left: 100px;
  padding-right: 100px;
  padding-top: 10px;
}
.search{
  padding-left: 50px;
  padding-right: 50px; 
  text-align: center;
  width: 100px;
  float: left;
}
.rank {
  background: #fff;
  text-align: right;
  font-size: 15px;
  line-height: 35px;
  padding-right: 10px;
}
.el-button {
  width: 40px;
  height: 20px;
  padding: 0;
  font-size: 12px;
}
.content{
  display: flex;
}
.right{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding-left: 20px;
}
.list img{
  width: 130px;
  height: 150px;
}
.list{
  background: #fff;
  border: 1px solid rgb(219, 218, 218);
  margin-bottom: 15px;
}
.list:not(4n+4){
  margin-right: 20px;
}
.name{
  text-align: center;
  font-size: 14px;
  margin-bottom: 0;
  margin-top: 10px;
  font-weight: bold;
}
.price{
  margin-bottom: 5px;
  color: #c20c0c;
}
.add{
  width: 110px;
  margin-left: 10px;
  margin-bottom: 5px;
  font-size: 13px;
  background: #fff;
  border: none;
  border: 1px solid #c20c0c ;
  color: #c20c0c;
}
.add:hover{
  background: #c20c0c;
  color: #fff;
}
.el-pagination{
  text-align: center;
}
.carts{
  font-size: 20px;
}
</style>
