<template>
   <div class="home">
       <h2>所有商品</h2>
       <div v-for="(item,index) of goodsList" :key="item.id" class="lists">
            <div class="nums">
                <p class="num">{{index+1}}</p>
            </div>
            <div>
                 <img class="img" :src="item.productImage" alt="">
            </div>
           <div class="detail">
                <p class="name">{{item.productName}}</p>
                <p class="price">￥{{item.salePrice}}</p>  
           </div>
            <div class="add">
                <button @click="addCart(item.productId)">加入购物车</button>
            </div>
       </div>
   </div>
    
</template>
<script>
export default {
    data(){
        return{
            goodsList:[]
        }
    },
    mounted(){
         this.$http.get("/goods/list",{params:{start:this.start,limit:this.limit}}).then(res => {
          this.goodsList = res.data.result;
       });
    },
    methods:{
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
    }
}
</script>
<style scoped >
.home{
    width: 800px;
    margin-left: auto;
    margin-right: auto;
    background: rgb(240, 237, 237);
}
.img{
    height: 150px;
    width: 150px;
}
h2{
    text-align: center;
}
.lists{
    display: flex;
    flex-direction: row;
}
.nums{
    width: 120px;
    color: red;
    margin-top: 40px;
}
.num{
    background: #fff;
    height: 30px;
    width: 30px;
    border-radius: 50%;
    text-align: center;
    line-height:30px;
    margin-left: 40px;
}
.detail{
    padding: 0 50px;
    width: 140px;
}
.name{
    font-weight: bold;
}
.price{
    color: red;
}
.add{
    margin-top: 40px;
}
</style>