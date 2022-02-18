// function addToCart(prodId){
//     $.ajax({
//         url:'/addCart/'+prodId,
//         method:'get',
//         success:(response)=>{
//             if(response.status){
//                 let count = $('#cart-count').html()
//                 count=parseInt(count)+1
//                 $("#cart-count").html(count)
//             }
           
//         }
//     })
// }




// function addTobag(proId) {

//     $.ajax({
//         url: '/add-to-cart/' + proId,
//         method: 'get',
//         success: (response) => {
//             if (response.status) {
//                 const Toast = Swal.mixin({
//                     toast: true,
//                     position: 'top-end',
//                     showConfirmButton: false,
//                     timer: 1000,
//                     timerProgressBar: true,
//                     didOpen: (toast) => {
//                         toast.addEventListener('mouseenter', Swal.stopTimer)
//                         toast.addEventListener('mouseleave', Swal.resumeTimer)
//                         document.getElementById('bag-count').innerHTML = response.count
//                     }
//                 })
//                 Toast.fire({
//                     icon: 'success',
//                     title: 'Added to Bag'
//                 }).then((res) => {
//                     // location.reload()
//                 })

//             } else {
//                 location.href = "/user-signin"
//             }

//         }
//     })
// }






// function addtocart(proid){
//     $.ajax({
//         url:'/add-to-cart/'+proid,
//         method:'get',
//         success:(response)=>{
//             if(response.status){
//                 let count=$('#cart-count').html()
//                 count=parseInt(count)+1
//                 $("#cart-count").html(count)
//             }
         
//         }  
//     })
// }
