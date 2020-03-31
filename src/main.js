import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vant from 'vant'
import 'vant/lib/index.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
axios.defaults.baseURL="http://192.168.0.102:3000"
axios.defaults.withCredentials=true    
axios.defaults.crossDomain=true
Vue.prototype.$http=axios;
Vue.config.productionTip = false
Vue.use(vant)
Vue.use(ElementUI)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
