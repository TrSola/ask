<template>
  <div class='container'>
       <div class='mt-4'>
         <!-- 產品列表 -->
         <user-product-modal
           ref='userProductModalRef'
           :product='product'
           @add-to-cart='addToCart'
         ></user-product-modal>
         <table class='table align-middle'>
           <thead>
             <tr>
               <th>圖片</th>
               <th>商品名稱</th>
               <th>價格</th>
               <th></th>
             </tr>
           </thead>
           <tbody>
             <tr v-for='item in products' :key='item.id'>
               <td style='width: 200px'>
                 <div
                   style='
                     height: 100px;
                     background-size: cover;
                     background-position: center;
                   '
                   :style='{backgroundImage: `url(${item.imageUrl})`}'
                 ></div>
               </td>
               <td>{{ item.title }}</td>
               <td>
                 <div class='h5' v-if='!item.price'>
                   {{ item.origin_price }} 元
                 </div>
                 <del class='h6' v-if='item.price'
                   >原價 {{ item.origin_price }} 元</del
                 >
                 <div class='h5' v-if='item.price'>
                   現在只要 {{ item.price }} 元
                 </div>
               </td>
               <td>
                 <div class='btn-group btn-group-sm'>
                   <button
                     type='button'
                     class='btn btn-outline-secondary'
                     @click='getProduct(item.id)'
                     :disabled='loadingStatus.loadingItem === item.id || !item.is_enabled'
                   >
                     <i
                       class='fas fa-spinner fa-pulse'
                       v-if='loadingStatus.loadingItem === item.id'
                     ></i>
                     查看更多
                   </button>
                   <button
                     type='button'
                     class='btn btn-outline-danger'
                     @click='addToCart(item.id)'
                     :disabled='loadingStatus.loadingItem === item.id || !item.is_enabled'
                   >
                     <i
                       class='fas fa-spinner fa-pulse'
                       v-if='loadingStatus.loadingItem === item.id'
                     ></i>
                     加到購物車
                   </button>
                 </div>
               </td>
             </tr>
           </tbody>
         </table>
         <!-- 購物車列表 -->
         <template v-if="cart.carts && cart.carts.length === 0">
           <div class='text-end'>
           <h2>先放一項商品試試吧</h2>
         </div>
         </template>
        <template v-else>
         <div class='text-end'>
           <button
             class='btn btn-outline-danger'
             type='button'
             @click='deleteAllCarts'
           >
             清空購物車
           </button>
         </div>
        </template>
         <table class='table align-middle'>
           <thead>
             <tr>
               <th></th>
               <th>品名</th>
               <th style='width: 150px'>數量/單位</th>
               <th>單價</th>
             </tr>
           </thead>
           <tbody>
             <template v-if='cart.carts'>
               <tr v-for='cartItem in cart.carts' :key='cartItem.id'>
                 <td>
                   <button
                     type='button'
                     class='btn btn-outline-danger btn-sm'
                     @click='removeCartItem(cartItem.id)'
                     :disabled='loadingStatus.loadingItem === cartItem.id'
                   >
                     <i
                       class='fas fa-spinner fa-pulse'
                       v-if='loadingStatus.loadingItem === cartItem.id'
                     ></i>
                     x
                   </button>
                 </td>
                 <td>
                   {{ cartItem.product.title }}
                   <div class='text-success' v-if='cartItem.coupon'>
                     已套用優惠券
                   </div>
                 </td>
                 <td>
                   <div class='input-group input-group-sm'>
                     <div class='input-group mb-3'>
                       <input
                         v-model.number='cartItem.qty'
                         @blur='updateCart(cartItem)'
                         :disabled='loadingStatus.loadingItem === cartItem.id'
                         min='1'
                         type='number'
                         class='form-control'
                       />
                       <span class='input-group-text' id='basic-addon2'
                         >{{ cartItem.product.unit }}</span
                       >
                     </div>
                   </div>
                 </td>
                 <td class='text-end'>
                   <small
                     v-if='cart.final_total !== cart.total'
                     class='text-success'
                     >折扣價：</small
                   >
                   {{ cartItem.final_total }}
                 </td>
               </tr>
             </template>
           </tbody>
           <tfoot>
             <tr>
               <td colspan='3' class='text-end'>總計</td>
               <td class='text-end'>{{ cart.total }}</td>
             </tr>
             <tr v-if='cart.final_total !== cart.total'>
               <td colspan='3' class='text-end text-success'>折扣價</td>
               <td class='text-end text-success'>{{ cart.final_total }}</td>
             </tr>
           </tfoot>
         </table>
       </div>
       <div class='my-5 row justify-content-center'>
         <v-form
           ref='formRef'
           class='col-md-6'
           v-slot='{ errors }'
           @submit='createOrder'
         >
           <div class='mb-3'>
             <label for='email' class='form-label'>Email</label>
             <v-field
               id='email'
               name='email'
               type='email'
               class='form-control'
               :class="{ 'is-invalid': errors['email'] }"
               placeholder='請輸入 Email'
               rules='email|required'
               v-model='form.user.email'
             ></v-field>
             <error-message
               name='email'
               class='invalid-feedback'
             ></error-message>
           </div>

           <div class='mb-3'>
             <label for='name' class='form-label'>收件人姓名</label>
             <v-field
               id='name'
               name='姓名'
               type='text'
               class='form-control'
               :class="{ 'is-invalid': errors['姓名'] }"
               placeholder='請輸入姓名'
               rules='required'
               v-model='form.user.name'
             ></v-field>
             <error-message
               name='姓名'
               class='invalid-feedback'
             ></error-message>
           </div>

           <div class='mb-3'>
             <label for='tel' class='form-label'>收件人電話</label>
             <v-field
               id='tel'
               name='電話'
               type='text'
               class='form-control'
               :class="{ 'is-invalid': errors['電話'] }"
               placeholder='請輸入電話'
               rules='required|min:8|max:10'
               v-model='form.user.tel'
             ></v-field>
             <error-message
               name='電話'
               class='invalid-feedback'
             ></error-message>
           </div>

           <div class='mb-3'>
             <label for='address' class='form-label'>收件人地址</label>
             <v-field
               id='address'
               name='地址'
               type='text'
               class='form-control'
               :class="{ 'is-invalid': errors['地址'] }"
               placeholder='請輸入地址'
               rules='required'
               v-model='form.user.address'
             ></v-field>
             <error-message
               name='地址'
               class='invalid-feedback'
             ></error-message>
           </div>

           <div class='mb-3'>
             <label for='message' class='form-label'>留言</label>
             <textarea
               name=''
               id='message'
               class='form-control'
               cols='30'
               rows='10'
               v-model='form.message'
             ></textarea>
           </div>
           <div class='text-end'>
             <button type='submit' class='btn btn-danger'>送出訂單</button>
           </div>
         </v-form>
       </div>
     </div>
</template>

<script setup>
import userProductModal from '../components/userProductModal.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import '../assets/main.css'

const Toast = Swal.mixin({
  toast: true,
  position: 'center',
  iconColor: 'white',
  customClass: {
    popup: 'colored-toast'
  },
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true
})
const { VITE_APP_URL: apiUrl, VITE_APP_PATH: apiPath } = import.meta.env

const formRef = ref(null)
const userProductModalRef = ref(null)
const loadingStatus = ref({
  loadingItem: ''
})
const products = ref([])
const product = ref({})
const form = ref({
  user: {
    name: '',
    email: '',
    tel: '',
    address: ''
  },
  message: ''
})
const cart = ref({})
// product
const getProducts = () => {
  const url = `${apiUrl}/api/${apiPath}/products`
  axios
    .get(url)
    .then((response) => {
      products.value = response.data.products
    })
    .catch((err) => {
      alert(err.response.data.message)
    })
}

const getProduct = (id) => {
  const url = `${apiUrl}/api/${apiPath}/product/${id}`
  loadingStatus.value.loadingItem = id
  axios
    .get(url)
    .then((response) => {
      loadingStatus.value.loadingItem = ''
      product.value = response.data.product
      userProductModalRef.value.openModal()
    })
    .catch((err) => {
      alert(err.response.data.message)
    })
}

// cart

const addToCart = (id, qty = 1) => {
  const url = `${apiUrl}/api/${apiPath}/cart`
  loadingStatus.value.loadingItem = id
  const cartData = {
    product_id: id,
    qty
  }

  userProductModalRef.value.hideModal()
  axios
    .post(url, { data: cartData })
    .then(() => {
      loadingStatus.value.loadingItem = ''
      getCart()
      Toast.fire({
        icon: 'success',
        title: '已加入購物車'
      })
    })
    .catch((err) => {
      alert(err.response.data.message)
    })
}

const updateCart = (data) => {
  loadingStatus.value.loadingItem = data.id
  const url = `${apiUrl}/api/${apiPath}/cart/${data.id}`
  const cartData = {
    product_id: data.product_id,
    qty: data.qty
  }
  axios
    .put(url, { data: cartData })
    .then(() => {
      Toast.fire({
        icon: 'success',
        title: '已更新購物車'
      })
      loadingStatus.value.loadingItem = ''
      getCart()
    })
    .catch((err) => {
      alert(err.response.data.message)
      loadingStatus.value.loadingItem = ''
    })
}

const deleteAllCarts = () => {
  Swal.fire({
    title: '是否清空購物車?',
    showDenyButton: true,
    confirmButtonText: '確認清空',
    denyButtonText: '再想想好了'
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      Toast.fire({
        icon: 'warning',
        title: '刪除成功'
      })
      axios
        .delete(url)
        .then(() => {
          getCart()
        })
        .catch((err) => {
          alert(err.response.data.message)
        })
    } else if (result.isDenied) {
      Toast.fire({
        icon: 'info',
        title: '已為您保留購物車內容'
      })
    }
  }).catch(() => {
    alert('伺服器錯誤')
  })
  const url = `${apiUrl}/api/${apiPath}/carts`
}
const getCart = () => {
  const url = `${apiUrl}/api/${apiPath}/cart`
  axios
    .get(url)
    .then((response) => {
      cart.value = response.data.data
    })
    .catch((err) => {
      alert(err.response.data.message)
    })
}

const removeCartItem = (id) => {
  Swal.fire({
    title: '確認要刪除',
    showDenyButton: true,
    confirmButtonText: '確認刪除',
    denyButtonText: '再想想好了'
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      loadingStatus.value.loadingItem = id
      Toast.fire({
        icon: 'warning',
        title: '刪除成功'
      })
      axios
        .delete(url)
        .then(() => {
          loadingStatus.value.loadingItem = ''
          getCart()
        })
        .catch((err) => {
          alert(err.response.data.message)
        })
    } else if (result.isDenied) {
      Toast.fire({
        icon: 'info',
        title: '已為您保留該品項'
      })
    }
  })
  const url = `${apiUrl}/api/${apiPath}/cart/${id}`
}
const createOrder = () => {
  if (cart.value.carts.length === 0) {
    alert('購物車內沒有品項')
  } else {
    const url = `${apiUrl}/api/${apiPath}/order`
    const order = form.value
    axios
      .post(url, { data: order })
      .then((response) => {
        alert(response.data.message)
        formRef.value.resetForm()
        getCart()
      })
      .catch((err) => {
        alert(err.response.data.message)
      })
  }
}

// watch(
//   () => cart.value,
//   (newCart) => {
//     console.log('Cart updated:', newCart)
//   }
// )

onMounted(() => {
  getProducts()
  getCart()
})

</script>
