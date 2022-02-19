

async function editCagegory(cateId) {
    console.log("THIS IS CATEGORY ID              " + cateId);
    let response = await fetch("/admin/editCategory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({

            cateId: cateId

        })
    })
    let cateName = await response.json()
    document.getElementById('cateForEdit').value = cateName.CategoryName
    document.getElementById('idForEdit').value=cateName._id
   

}

function reload(){
    location.reload()
}

function deleteCategory(event, cateId, name) {
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

            let response = await fetch("/admin/deleteCategory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({

                    cateId: cateId

                })
            })

            location.reload();


        }

        else {
            return false;
        }
    })

}

