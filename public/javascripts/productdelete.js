
function deleteItem(event, proId,name) {
    event.preventDefault();
  
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete  " +name +'?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(async (result) => {
       
        if (result.isConfirmed) {
            
            let response = await fetch("/admin/delete-product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                   
                    proId: proId
    
                })
            })
           
            location.reload();

               
        }

        else {
            return false;
        }
    })

}

