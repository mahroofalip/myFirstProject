var countCt = document.getElementById('countCart')



// var countCart =document.querySelector(".countCart")

async function PostUserId(prodId) {
    // console.log(prodId);
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
        displayCount()
        window.location = '/cart'
    } else {
        window.location = '/login'
    }



}

window.onload = async () => {

    const count = await fetch("http://localhost:3000/getCartCount",)

    const cartCount = await count.json()
    if (cartCount) {
        countCt.innerHTML = cartCount

        return
    }


}


async function displayCount() {

    const count = await fetch("http://localhost:3000/getCartCount",)

    const cartCount = await count.json()
    countCt.innerHTML = cartCount



}
