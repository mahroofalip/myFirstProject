


function deleteAddress(addId) {
   
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ok'
    }).then(async (result) => {
      
        if (result.isConfirmed) {

            let response = await fetch("/delete-address", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    addId: addId,


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