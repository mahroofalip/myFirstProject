
$('#checkout-form').submit((e) => {
    console.log("THIS IS e", e);
    e.preventDefault()
    $.ajax({
        url: '/checkout',
        method: 'post',
        data: $('#checkout-form').serialize(),
        success: (response) => {

            if (response.codSuccess) {
                console.log(response);
                location.href = '/placed'
            } else if (response.paypalSucess) {
                location.href = '/pay'
            }
            else {
                console.log(response);
                razorpayPayment(response)
            }
        }

    })
})



function razorpayPayment(order) {
    console.log("OTFSJFKJSKFJKFKDFKJDFSKJDSJHFKJDJFKDJSFJDIKFJF",order,"sfs");
    var options = {
        "key": "rzp_test_47cvOoEZUdlXNa",                       // Enter the Key ID generated from the Dashboard
        "amount": order.amount,                                 // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Electra",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id,                                   //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
        
            verifyPeyment(response, order)

        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#F51414"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}



function verifyPeyment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
         
         
            if (response.status) {
                
                location.href = '/placed'
            } else {
                alert('payment failed')
            }
        }

    })
}