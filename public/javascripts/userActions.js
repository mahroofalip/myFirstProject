





function desableUser( userId,name) {
    console.log('#########################################3333');
    
     console.log(userId);
     
     console.log('#########################################3333+');
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to block " + name + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    })
    .then(async (result) => {

        if (result.isConfirmed) {

            let response = await fetch("http://localhost:3000/admin/disable-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({

                    userId:userId
                    

                })
            })

            location.reload();


        }

        else {
            return false;
        }
    })

}



function enableUser( userId,name) {
    console.log('#########################################3333');
    
     console.log(userId);
     
     console.log('#########################################3333+');
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to unblock " + name + '?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    })
    .then(async (result) => {

        if (result.isConfirmed) {

            let response = await fetch("http://localhost:3000/admin/enable-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({

                    userId:userId
                    

                })
            })

            location.reload();


        }

        else {
            return false;
        }
    })

}