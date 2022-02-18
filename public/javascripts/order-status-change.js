
async function changeStatus(id, proId, status) {
    console.log("THIS IS CORRRENT STATUS            ", status)
    console.log('THSI IS ORDER ID        ', id)
    const response = await fetch("/admin/changeStatus", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            orderId: id,
            proId: proId,
            status: status

        })
    })

    location.reload()

}




