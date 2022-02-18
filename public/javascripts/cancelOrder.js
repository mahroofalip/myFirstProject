







function cancelOrder( orderId,proId, name) {
    console.log('#########################################3333');
     console.log(orderId);
     console.log(proId);
     
     console.log('#########################################3333+');
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to Cancel " + name + '?',
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
                    productId:proId

                })
            })

            location.reload();


        }

        else {
            return false;
        }
    })

}

