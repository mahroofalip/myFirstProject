



async function editBrand(brandId) {
    console.log("THIS IS CATEGORY ID              " + brandId);
    let response = await fetch("/admin/editBrand", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({

            brandId: brandId

        })
    })
    let brand = await response.json()
   

    document.getElementById('brandForEdit').value = brand.brand
    document.getElementById('idForEdit').value = brand._id


}


function reload() {
    location.reload()
}



function deleteBrand(event, brndId, name) {
    event.preventDefault();

    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete  " + name + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(async (result) => {

        if (result.isConfirmed) {

            let response = await fetch("/admin/deleteBrand", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({

                    brndId: brndId

                })
            })

            location.reload();


        }

        else {
            return false;
        }
    })

}

