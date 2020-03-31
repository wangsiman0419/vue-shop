const mongoose = require('mongoose');    //shop是数据库名
mongoose.connect( 'mongodb://127.0.0.1:27017/shop', {useNewUrlParser: true},(err)=>{
    if(err) throw err;
    console.log("database连接成功")
});
module.exports = mongoose;