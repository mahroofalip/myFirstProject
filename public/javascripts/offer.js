
//product offer
$('#proOfferForm').submit((e) => {
    console.log("Offer ajax called");
    e.preventDefault()
    $.ajax({
        url: '/admin/product-offer',
        method: 'post',
        data: $('#proOfferForm').serialize(),
        success: (response) => {

            if (response.Exist) {

                Swal.fire({

                    icon: 'warning',
                    title: 'This Product Offer already Exist !',
                    showConfirmButton: false,
                    timer: 2500
                })
            } else {
                Swal.fire({

                    icon: 'success',
                    title: 'Offer Successfully Added !',
                    showConfirmButton: false,
                    timer: 2500
                })
                setTimeout(() => {
                    location.reload();
                }, 2000)


            }



        }

    })
})



function deleteProOffer(offId, Product) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + Product + " Offer ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(async (result) => {

        if (result.isConfirmed) {

            let response = await fetch("http://localhost:3000/admin/deleteProOffer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({

                    offId: offId,
                    Product: Product


                })
            })

            location.reload();
        }

        else {
            return false;
        }
    })

}



//product offer end
//category offer start
$('#CateOfferForm').submit((e) => {
    console.log("Offer ajax called");
    e.preventDefault()
    $.ajax({
        url: '/admin/category-offer',
        method: 'post',
        data: $('#CateOfferForm').serialize(),
        success: (response) => {

            if (response.Exist) {

                Swal.fire({

                    icon: 'warning',
                    title: 'This category aready Exist!',
                    showConfirmButton: false,
                    timer: 2500
                })
            } else {
                Swal.fire({

                    icon: 'success',
                    title: 'Offer Successfully Added !',
                    showConfirmButton: false,
                    timer: 2500
                })
                setTimeout(() => {
                    location.reload();
                }, 2000)


            }



        }

    })
})



function deleteCategoryOffer(offId, category) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + category + " Offer ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(async (result) => {

        if (result.isConfirmed) {

            let response = await fetch("http://localhost:3000/admin/deleteCateOffer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({

                    offId: offId,
                    Category: category


                })
            })

            location.reload();
        }

        else {
            return false;
        }
    })

}

//cate end


// coupon start



$('#couponOfferForm').submit((e) => {
    console.log("Offer ajax called");
    e.preventDefault()
    $.ajax({
        url: '/admin/Coupon',
        method: 'post',
        data: $('#couponOfferForm').serialize(),
        success: (response) => {

            if (response.Exist) {

                Swal.fire({

                    icon: 'warning',
                    title: 'This Coupon aready Exist!',
                    showConfirmButton: false,
                    timer: 2500
                })
            } else {
                Swal.fire({

                    icon: 'success',
                    title: 'Coupon Successfully Added !',
                    showConfirmButton: false,
                    timer: 2500
                })
                setTimeout(() => {
                    location.reload();
                }, 1000)


            }

      

        }

    })
})





function deleteCoupon(cnp_id, Cpncode) {
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete This Coupon ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then(async (result) => {

        if (result.isConfirmed) {

            let response = await fetch("http://localhost:3000/admin/deleteCoupon", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({

                    cnp_id: cnp_id,
                    Cpncode: Cpncode

                })
            })

            location.reload();
        }

        else {
            return false;
        }
    })

}




// coupn aply


    var successCount = 0;

    function applyCoupon() {

        let code = document.getElementById('coupon').value
     
        console.log("apply coupon " + code)
        $.ajax({
            url: '/applyCoupon',
            method: 'post',
            data: {
                code: code
            },
            success: async(response) => {
                console.log("* response *")
                console.log(response)
                 
                if (response.invalidCode == true) {
                   
                   
                    
                     document.getElementById('aplytex').style.display = 'block'
                     document.getElementById('cpErr').style.color = 'red'
                     document.getElementById('cpErr').style.display = 'block'
                     document.getElementById('cpErr').innerHTML = 'Invalid Coupon'
                   
                    document.getElementById('aplysuccess').style.display = 'none'
                    document.getElementById('saved').style.display='none'
                    document.getElementById('totalPayabletext').innerHTML=''
                    document.getElementById('totalPayable').innerHTML=''
                    document.getElementById('lipayable').style.display='none'
                } else if(response.invalidCode == false) {
                  console.log('THIS IS TOTAL RESPONSE');
                  console.log(response);
                  console.log('THIS IS COUPN DETAILS');
                  console.log(response.coupnDetails);
                 let percDis=response.coupnDetails.coupon.Discount
                 let total=response.total
                 console.log('this is percentage of coupn off',percDis);
                 console.log('this total amout of this order',total);
                 console.log(typeof total);
                 let Amount = total-((total*percDis)/100)
                 console.log('amount total of order',Amount);
                 console.log(typeof Amount);
                   
                 let amount = Amount.toFixed(0)
                 amount= parseInt(amount)
                 
                 console.log('amount total of order',amount);

                 console.log(typeof amount);
                let saved = total-amount
       
                document.getElementById('lipayable').style.display='block'
                document.getElementById('saved').style.display='block'
                document.getElementById('totalPayabletext').innerHTML='Total Payable'
                document.getElementById('totalPayable').innerHTML='₹'+amount
                document.getElementById('saved').innerHTML = 'Your Total Savings on This order ₹' + saved
                document.getElementById('cpErr').style.display = 'block'
                document.getElementById('cpErr').style.color = 'green'
                document.getElementById('cpErr').innerHTML = 'Sucessfully Applyed This Coupon'
                document.getElementById('aplytex').style.display = 'none'
                document.getElementById('aplysuccess').style.display = 'block'
                document.getElementById('aplysuccess').innerHTML = `  <lottie-player
                                                                       src="https://assets1.lottiefiles.com/packages/lf20_4qldwfx4.json"
                                                                        background="transparent" speed="1"
                                                                       style="width: 35px; "  autoplay>
                                                                        </lottie-player>`
       
                                                                   
             await fetch("http://localhost:3000/submitCouponApplyedData", {
             method: "POST",
             headers: {
             "Content-Type": "application/json"
             },
             body: JSON.stringify({
                                                            
             Amount: amount,
             code:code
        
             })                                                
              })                                                                    
           
                } 
                else if(response.userApplied=true){
                    Swal.fire({
                        title: 'This Coupon You Already Applyed',
                        icon:'warning',
                        showClass: {
                          popup: 'animate__animated animate__fadeInDown'
                        },
                        hideClass: {
                          popup: 'animate__animated animate__fadeOutUp'
                        }
                      })
                }

            }
        })
    }





// async function getInputValue() {
//     var inputVal = document.getElementById("myInput").value;


//     const response = await fetch("http://localhost:3000/applayCoupon", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             code: inputVal,
//         })
//     })


//     let d = await response.json()
//     if (d.Wrong) {
        // document.getElementById('disc').style.display = 'none'
        // // document.getElementById('discount').style.display = 'none'
        // // document.getElementById('discountH1').style.display = 'none'
        // document.getElementById('aplytex').style.display = 'block'
        // document.getElementById('cpErr').style.color = 'red'
        // document.getElementById('cpErr').style.display = 'block'
        // document.getElementById('cpErr').innerHTML = 'This Coupn Not Avalable'
        // // document.getElementById('dis').style.display = 'none'
        // document.getElementById('aplysuccess').style.display = 'none'
        // document.getElementById('saved').style.display='none'
        // document.getElementById('totalPayabletext').innerHTML=''
        // document.getElementById('totalPayable').innerHTML=''
        // document.getElementById('lipayable').style.display='none'
        
//     } else {
//         // document.getElementById('discountH1').style.display = 'block'
//         // document.getElementById('discount').style.display = 'block'
//         document.getElementById('lipayable').style.display='block'
//         document.getElementById('saved').style.display='block'
//         document.getElementById('totalPayabletext').innerHTML='Total Payable'
//         document.getElementById('totalPayable').innerHTML='₹'+d.payable
//         document.getElementById('saved').innerHTML = 'Your Total Savings on This order ₹' + d.saved
//         document.getElementById('cpErr').style.display = 'block'
//         document.getElementById('cpErr').style.color = 'green'
//         document.getElementById('cpErr').innerHTML = 'Sucessfully Applyed This Coupon'

//         document.getElementById('aplytex').style.display = 'none'
//         document.getElementById('aplysuccess').style.display = 'block'
//         document.getElementById('aplysuccess').innerHTML = `  <lottie-player
//                                                                src="https://assets1.lottiefiles.com/packages/lf20_4qldwfx4.json"
//                                                                 background="transparent" speed="1"
//                                                                style="width: 35px; "  autoplay>
//                                                                 </lottie-player>`
                                                               

//         // document.getElementById('dis').style.display = 'block'
//         // document.getElementById('dis').innerHTML = ''+ d.saved
      
//     }
// }


// //cpn end




