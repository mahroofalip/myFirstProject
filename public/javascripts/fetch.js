
(async function () {

    const response = await fetch("http://localhost:3000/getCartCount",)
    const wishcount = await fetch('/get-wishlist-count')
    let count = await response.json()
    const wcount = await wishcount.json()


    if (!count == 0) {
        document.getElementById('countCart').innerHTML = count
    } else {
        console.log('no products in cart')
    }

    if (!wcount == 0) {
        document.getElementById('countWishlist').innerHTML = wcount
    } else {
        console.log("no product in wishlist");
    }


})();





// var countCart =document.querySelector(".countCart")

async function addtocart(prodId) {
    console.log(prodId);
    const response = await fetch("http://localhost:3000/add-to-Cart", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: prodId,
        })
    })
    const data = await response.json()


    if (data) {

        document.getElementById('countCart').innerHTML = data.count

        if (data.cart.status) {
            swal("hey " + data.user + "!", "This product added to Cat again!", "success");
        }







    } else {
        window.location = '/login'
    }



}



// add to wishlist 

async function addtowishlist(proId) {

    console.log('ADD TO WISHLLIST WORKING');
    console.log(proId);
    const response = await fetch('http://localhost:3000/add-to-wishlist', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: proId,
        })
    })

    const data = await response.json()
    console.log('this is dta WISHLIST');
    console.log(data);
    if (data) {
        console.log("data reached");
        const wishcount = await fetch('/get-wishlist-count')

        const wcount = await wishcount.json()

        document.getElementById('countWishlist').innerHTML = wcount

        if (data.Exist) {
            swal("hey " + data.user + "!", "This product already added to wishlist!", "success");
        } else if (data.user) {
            // added:true
            swal("hey " + data.user + "!", "This product successfully added added to wishlist!", "success");
        }




    } else {

        window.location = '/login'

    }



}




async function changeQuantity(cartId, proId, count) {
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    console.log("change quantity");
    const change = await fetch("http://localhost:3000/change-product-quantity", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            cartId: cartId,
            proId: proId,
            count: count,
            quantity: quantity
        })


    }


    )

    displayqty(proId);

}






async function displayqty(prodId) {
    let proQty = document.getElementsByClassName('qty')

    console.log(prodId);
    let quaty = await fetch('http://localhost:3000/getOneProductQty', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: prodId,
        })
    })

    let qty = await quaty.json()



    for (let i = 0; i < proQty.length; i++) {
        proQty[i].innerHTML = qty[0].products[i].quantity


    }


    getOneTotalPrice()


}



window.onload = () => {


    getOneTotalPrice()




}










async function getOneTotalPrice() {
    let proQty = document.getElementsByClassName('qty')
    let totalAmount = document.getElementsByClassName('total')
    // let countDisplay= document.getElementsByClassName('countCart')

    let allTotalAmount = document.getElementsByClassName('alltotal')
    let total = await fetch("http://localhost:3000/getTotalOneProduct")
    const cartTotal = await total.json()
    console.log(cartTotal);
    let smallTotel = cartTotal.eachItem
    let largeTotal = cartTotal.total

    for (let i = 0; i < proQty.length; i++) {
        totalAmount[i].innerHTML = smallTotel[i].total


    }


    allTotalAmount[0].innerHTML = `<strong class='text-success'>Grand Total: <span class='text-dark'>${largeTotal[0].total}</span></strong>`



}


















function cancelOrder(event, proName, orderId, ProId) {

    console.log('DELETE WISHLIST FUCTION CALLED');
    console.log(proName);
    console.log(orderId);
    console.log(ProId);
    event.preventDefault();

    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to Cancel" + proName + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(async (result) => {

        if (result.isConfirmed) {

            let response = await fetch("http://localhost:3000/cancelOrder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    orderId: orderId,
                    ProId: ProId

                })
            })

            location.reload();




        }

        else {
            return false;
        }
    })

}

















function deleteItem(event, proId, cartId, name) {
    event.preventDefault();

    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + name + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ok'
    }).then(async (result) => {

        if (result.isConfirmed) {

            let response = await fetch("http://localhost:3000/deleteFromCart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cartId: cartId,
                    proId: proId

                })
            })

            Swal.fire({

                icon: 'success',
                title: 'Sucessfully Deleted!',
                showConfirmButton: false,
                timer: 1500
            })

            setTimeout(() => {
                location.reload();
            }, 1000)





        }

        else {
            return false;
        }
    })

}




function deleteItemFromWishlist(event, proId, wishlistId, name) {

    console.log('DELETE WISHLIST FUCTION CALLED');
    console.log(proId);
    console.log(wishlistId);
    console.log(name);
    event.preventDefault();

    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete" + name + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(async (result) => {

        if (result.isConfirmed) {

            let response = await fetch("http://localhost:3000/deleteFromWishlist", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    wId: wishlistId,
                    proId: proId

                })
            })
            // let data = await response.json()
            location.reload();




        }

        else {
            return false;
        }
    })

}








async function filterByPrice(start, end) {
    let category = document.getElementById('CatePro').innerHTML


    let response = await fetch("http://localhost:3000/filterby", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            start: start,
            end: end,
            category: category

        })
    })
    window.location = '/filterby'




}






async function filterByPriceUserSearchPro(start, end) {
    let category = document.getElementById('CatePro2').innerHTML
   
   

    let response = await fetch("http://localhost:3000/filterbyBrandCateNameWithPirce", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            start: start,
            end: end,
            category: category,
           
        })
    })
    window.location = '/filterbyBrandCateNameWithPirce'




}



//  input id="CategoryForFilter" name="Category" value="{{this.Category}}"  type="text" hidden>
//                  <input id="BrandForFilter" name="Brand" value="{{this.Brand}}"  type="text" hidden></input>