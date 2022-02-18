const { response } = require('express');
var express = require('express');
const session = require('express-session');
const { resource } = require('../app');
var router = express.Router();
var productsHelpers = require('../helpers/prduct-helpers');
const moment = require('moment')
var userHelper = require('../helpers/user-helpers');
const { route } = require('./admin');
var fs = require('fs')
require('dotenv').config();

const paypal = require('paypal-rest-sdk')
const { count } = require('console');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Abk8lJiNtkDmhe7ycIIhB196rhwp1gHAXonXWl2gWSb5j5LC8pRk3urK1Ji8wkE60Ip13srNT-213i15',
    'client_secret': 'EJSO6M-wOEEuc1WQ5PAnJeigCztHsv5iL_rZAdJgEzuSiX6qeLkj7zFxV795n7UdxuSW2nOI0gtvNC34'
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceID = process.env.SERVICE_ID;

const client = require("twilio")(accountSid, authToken);


// varifyLogin chekking middleware


const varifyLogin = (req, res, next) => {
    if (req.session.isloggedIn) {
        next()
    } else {
        res.redirect('/login')
    }
}

/* GET home page. */

router.get('/', async (req, res, next) => {
    let sessionData = req.session.user
    let banner = await userHelper.getBanner()
    let featured = await userHelper.getlFeaturedtProducts()
    let latest = await userHelper.getLatestProducts()
    let topSelling = await userHelper.getTopsellingProducts()
    let Category = await userHelper.getCategory()

    res.render('users/user_home', { sessionData, latest, featured, topSelling, Category, banner })



});


router.get('/getProductsByCategory/:category', async (req, res) => {
    let Category = await userHelper.getCategory()
    let sessionData = req.session.user
    await userHelper.getSearchingByCategory(req.params.category).then((products) => {
        res.render('users/Category-Products', { products, Category, sessionData })
    })

})



router.get('/login', async (req, res) => {


    if (req.session.user) {

        res.redirect('/')
    } else {
        let Category = await userHelper.getCategory()
        let validUserErr = req.session.validUserErr
        req.session.validUserErr = null
        let BlockErr = req.session.BlockErr
        req.session.BlockErr = null
        let passwordErr = req.session.passwordErr
        req.session.passwordErr = null
        let otpSendingErrMsg = req.session.otpSendingErrMsg
        req.session.otpSendingErrMsg = null


        res.render('users/login', { Category, validUserErr: validUserErr, BlockErr: BlockErr, passwordErr: passwordErr, otpSendingErrMsg: otpSendingErrMsg })


    }

})





router.post('/login', (req, res) => {
    userHelper.doLogin(req.body).then((response) => {

        if (response.invalidUser) {

            req.session.validUserErr = "Invalid username please Check"
            res.redirect('/login')

        } else if (response.passwordFasle) {
            req.session.passwordErr = "Entered password is wrong"
            res.redirect('/login')
        } else if (response.block) {
            req.session.BlockErr = "You are blocked  by admin"
            res.redirect('/login')
        } else {
            req.session.user = response.user
            console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq jstlogin login', req.session.user);
            req.session.user.loggedIn = true
            req.session.isloggedIn = true

            res.redirect('/')
        }


    })
})



// OTP login
router.get('/loginverifyotp', async (req, res) => {

    let Category = await userHelper.getCategory()
    let otpCodeIncorrectErr = req.session.otpCodeIncorrectErr
    req.session.otpCodeIncorrectErr = null
    res.render('users/loginotpverify', { otpCodeIncorrectErr: otpCodeIncorrectErr, Category })
})

router.post('/otplogin', (req, res, next) => {

    if (req.session.user) {
        res.redirect('/')
    } else {

        const toPhoneNumber = '+91' + req.body.mobile;

        userHelper.doUserForLogin(toPhoneNumber).then((response) => {


            if (!response.isEnabled) {
                req.session.BlockErr = "You are blocked by admin"

                res.redirect('/login')
            } else {

                req.session.user_mobile = toPhoneNumber;

                console.log(req.session.user_mobile);

                try {
                    client.verify
                        .services(serviceID)
                        .verifications.create({ to: toPhoneNumber, channel: "sms" })
                        .then((verification) => {
                            if (verification.status === "pending") {
                                // console.log('on pending otp kodukk');
                                res.redirect('/loginverifyotp')


                            } else {
                                req.session.otpSendingErrMsg = "OTP sending failed. Please try again";
                                res.redirect('/login');
                            }
                        });
                } catch (error) {
                    req.session.otpSendingErrMsg = "OTP sending failed. Please try again";
                    res.redirect('/login');
                }
            }
        })



    }


})
router.get('/resend-otp-login', (req, res) => {

    let toPhoneNumber = req.session.user_mobile

    try {
        client.verify
            .services(serviceID)
            .verifications.create({ to: toPhoneNumber, channel: "sms" })
            .then((verification) => {
                if (verification.status === "pending") {

                    res.redirect('/loginverifyotp')


                } else {
                    req.session.otpSendingErrMsg = "OTP sending failed. Please try again";
                    res.redirect('/login');
                }
            });
    } catch (error) {
        req.session.otpSendingErrMsg = "OTP sending failed. Please try again";
        res.redirect('/login');
    }


})

router.post('/loginverifyotp', function (req, res, next) {

    const verificationCode = req.body.verificationCode;

    const toPhoneNumber = req.session.user_mobile
    try {
        client.verify
            .services(serviceID)
            .verificationChecks.create({ to: toPhoneNumber, code: verificationCode })
            .then((verification_check) => {
                if (verification_check.status === "approved") {


                    const mobile = req.session.user_mobile


                    userHelper.doLoginWithmoble(toPhoneNumber).then((response) => {


                        req.session.user = response.user
                        console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq otp login', req.session.user);
                        req.session.user.loggedIn = true

                        res.redirect('/')


                    })
                } else {
                    req.session.otpCodeIncorrectErr = "Entered Code is Incorrect"
                    res.redirect('/loginverifyotp')
                }
            });
    } catch (error) {
        req.session.otpCodeIncorrectErr = "Entered Code is Incorrect"
        res.redirect('/loginverifyotp')

    }
});



// OTP login End





// sign up with otp

router.get('/signup', async (req, res) => {
    let Category = await userHelper.getCategory()
    let signupErr = req.session.userSignupErr
    req.session.userSignupErr = null
    let otpErr = req.session.otpErrMsg
    req.session.otpErrMsg = null
    let matchErr = req.session.matchErr
    req.session.matchErr = null

    res.render('users/signup', { signupErr: signupErr, matchError: matchErr, otpErr: otpErr, Category })
})







router.post('/getotp', async function (req, res, next) {


    if (req.body.Password == req.body.ConformPassword) {

        const toPhoneNumber = '+91' + req.body.mobile;

        const response = await userHelper.doCheckUser(req.body)


        if (!response) {


            req.session.user_name = req.body.Name;
            req.session.user_email = req.body.Email;
            req.session.user_mobile = toPhoneNumber;
            req.session.user_password = req.body.Password;



            try {
                client.verify
                    .services(serviceID)
                    .verifications.create({ to: toPhoneNumber, channel: "sms" })
                    .then((verification) => {
                        if (verification.status === "pending") {
                            res.redirect('/otpveryfy')
                        } else {
                            req.session.otpErrMsg = "OTP sending failed. Please try again";
                            res.redirect('/signup');
                        }
                    });
            } catch (error) {
                req.session.otpErrMsg = "OTP sending failed. Please try again";
                res.redirect('/signup');
            }

        } else {
            console.log("this is existing usr");
            req.session.userSignupErr = "Sorry... username already taken";
            res.redirect('/signup')


        }

    } else {
        req.session.matchErr = "The password Confirmation does not match"

        res.redirect('/signup')
    }

});


router.get('/otpveryfy', async (req, res) => {
    let Category = await userHelper.getCategory()
    let verifyErr = req.session.signupOtpCodeIncorrectErr
    // console.log(verifyErr);
    req.session.signupOtpCodeIncorrectErr = null
    // console.log(verifyErr);
    res.render('users/otpverify', { verifyErr: verifyErr, Category })
})



router.get('/resend-otp', (req, res) => {
    console.log('user phone number :', req.session.user_mobile);
    let toPhoneNumber = req.session.user_mobile
    try {
        client.verify
            .services(serviceID)
            .verifications.create({ to: toPhoneNumber, channel: "sms" })
            .then((verification) => {
                if (verification.status === "pending") {
                    res.redirect('/otpveryfy')
                } else {
                    req.session.otpErrMsg = "OTP sending failed. Please try again";
                    res.redirect('/signup');
                }
            });
    } catch (error) {
        req.session.otpErrMsg = "OTP sending failed. Please try again";
        res.redirect('/signup');
    }


})

router.post('/verifyotp', function (req, res, next) {

    const verificationCode = req.body.verificationCode;
    const toPhoneNumber = req.session.user_mobile

    try {
        client.verify
            .services(serviceID)
            .verificationChecks.create({ to: toPhoneNumber, code: verificationCode })
            .then((verification_check) => {
                if (verification_check.status === "approved") {

                    const userData = {
                        Name: req.session.user_name,
                        Email: req.session.user_email,
                        mobile: req.session.user_mobile,
                        Password: req.session.user_password

                    }

                    userHelper.doSignup(userData).then((response) => {


                        req.session.user = response



                        res.redirect('/')

                    })

                } else {
                    req.session.signupOtpCodeIncorrectErr = "Entered Code is Incorrect"
                    res.redirect('/otpveryfy')
                }
            });
    } catch (error) {
        req.session.signupOtpCodeIncorrectErr = "Entered Code is Incorrect"
        res.redirect('/otpveryfy')
    }
});



// add to cart with feth api

router.post('/add-to-Cart', async (req, res) => {

    if (req.session.user) {

        let cart = await userHelper.addToCart(req.body.id, req.session.user._id)
        let count = await userHelper.getCartCount(req.session.user._id)
        let user = req.session.user.Name

        res.json({ count, cart, user })

    } else {

        res.json(false)
    }



})

// GET cart count

router.get('/getCartCount', async (req, res) => {

    if (req.session.user) {

        let count = await userHelper.getCartCount(req.session.user._id)
        res.json(count)



    } else {


    }
})

router.post('/getOneProductQty', varifyLogin, (req, res) => {

    let proId = req.body.id

    userHelper.getProductQty(proId, req.session.user._id).then((qty) => {

        res.json(qty)
    })
})







// GET CART

router.get('/cart', varifyLogin, async (req, res) => {
    let Category = await userHelper.getCategory()
    if (req.session.user) {

        cartCount = await userHelper.getCartCount(req.session.user._id)

        let count = cartCount
        let sessionData = req.session.user

        let product = await userHelper.getCartProducts(req.session.user._id)
        let total = await userHelper.getAllTotalAmount(req.session.user._id)

        res.render('users/cart', { sessionData, product, count, total, Category })




    } else {
        res.redirect('/login')
    }



}
)





router.get('/productDetails/:id', async (req, res) => {
    let sessionData = req.session.user
    let Category = await userHelper.getCategory()
    id = req.params.id
    productsHelpers.getProductInfo(id).then(async (product) => {

        let category = product.Category
        let proBacedCategory = await userHelper.getSimilarProducts(category)

        res.render('users/product-details', { product, Category, sessionData, proBacedCategory })
    })


})





router.post('/change-product-quantity', (req, res, next) => {

    userHelper.changeProductQty(req.body).then((response) => {

        res.json(response)


    })

})


router.post('/deleteFromCart', (req, res) => {
    console.log('DELET FROM CART');
    console.log(req.body);
    let proId = req.body.proId
    // let Name = productsHelpers.getProductDetails(proId)
    userHelper.dltProductFromCart(req.body).then(() => {
        res.json()


    })
})
// chekocut

router.get('/checkout', varifyLogin, async (req, res) => {
    let sessionData = req.session.user
    let Category = await userHelper.getCategory()
    let total = await userHelper.getAllTotalAmount(req.session.user._id)
    let eachItem = await userHelper.getTotalAmount(req.session.user._id)
    let add = await userHelper.getUserAddress(req.session.user._id)
    let coupons = await userHelper.getCoupons()
    if (add) {
        let address = add.addresses

        if (eachItem[0]) {
            res.render('users/chekout', { sessionData, total, eachItem, address, Category, coupons })
        } else {
            res.redirect('/cart')
        }

    } else {
        res.redirect('/add-address-to-checkout')
    }



})

var payable = null
var applyed = false
var secretCode
router.post('/submitCouponApplyedData', (req, res) => {

    payable = req.body.Amount
    secretCode = req.body.code
    applyed = true
    console.log(payable);

})


router.post('/checkout', varifyLogin, async (req, res) => {
    console.log('yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', payable, secretCode);
    let Address = await userHelper.getOneAddress(req.body.addressForShip, req.session.user._id)
    let products = await userHelper.getCartProductList(req.session.user._id)
    let totalPrice = await userHelper.getAllTotalAmount(req.session.user._id)


    let couponAmount = payable

    console.log('coupon Amount form Checkout', couponAmount, 'razorpay');
    if (couponAmount) {
        console.log('COUPN APPLAYED AND COUNTINEU');

        console.log('Coupn applyed and got offer');
        userHelper.placeOrder(req.body, products, Address, couponAmount, req.session.user._id, applyed, secretCode).then((orderId) => {

            console.log('order-id    ', orderId);


            if (req.body.PaymentMethod === 'COD') {
                console.log('this is not onlie payment');
                applyed = false
                res.json({ codSuccess: true })

            } else if (req.body.PaymentMethod === 'Razorpay') {
                console.log('paymeeeent razooooooooooooooor paayyyyyyyyyyyyyyyy');
                userHelper.generateRazorpay(orderId, couponAmount).then((response) => {
                    payable = null
                    res.json(response)
                })
            } else {
                req.session.orderId = orderId
                console.log("ORDER ID SSSSSSSSSSSSSS", req.session.orderId, "GDFGDG");
                res.json({ paypalSucess: true })

            }
        })
    } else {
        console.log('COUPN NOT APPLAYED AND COUNTINEU');


        userHelper.placeOrder(req.body, products, Address, totalPrice, req.session.user._id, applyed, secretCode).then((orderId) => {
            console.log('order-id    ', orderId);


            if (req.body.PaymentMethod === 'COD') {
                console.log('this is not onlie payment');
                res.json({ codSuccess: true })
            } else if (req.body.PaymentMethod === 'Razorpay') {
                console.log('paymeeeent razooooooooooooooor paayyyyyyyyyyyyyyyy');
                console.log(totalPrice);
                let totalPrice1 = totalPrice[0].total
                userHelper.generateRazorpay(orderId, totalPrice1).then((response) => {
                    res.json(response)
                })
            } else {
                req.session.orderId = orderId
                console.log("ORDER ID SSSSSSSSSSSSSS", req.session.orderId, "GDFGDG");
                res.json({ paypalSucess: true })

            }
        })
    }



})

//paypal start
router.get('/pay', async (req, res) => {



    console.log('coupon Amount form Checkout', payable, 'paypal');
    if (payable) {
        console.log("paypal router with coupon");
        payable = parseInt(payable)
        let total = payable / 75
        let amount = parseInt(total)
        console.log("total", amount);
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/success",
                "cancel_url": "http://localhost:3000/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Electra products",
                        "sku": "001",
                        "price": amount,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": amount
                },
                "description": "Hat for the best team ever"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.redirect(payment.links[i].href);
                    }
                }
            }
        });
    } else {
        console.log("paypal router without coupon");
        let totalPrice = await userHelper.getAllTotalAmount(req.session.user._id)
        let total = totalPrice[0].total / 75
        let amount = parseInt(total)
        console.log("total", amount);
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/success",
                "cancel_url": "http://localhost:3000/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "Electra products",
                        "sku": "001",
                        "price": amount,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": amount
                },
                "description": "Hat for the best team ever"
            }]
        };

        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                throw error;
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.redirect(payment.links[i].href);
                    }
                }
            }
        });
    }


});



router.get('/success', async (req, res) => {

    if (payable) {


        let total = payable / 75
        let amount = parseInt(total)
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": amount
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                console.log(JSON.stringify(payment));
                let products = await userHelper.getCartProductList(req.session.user._id)
                userHelper.changePaymentStatus(req.session.orderId, req.session.user._id, applyed, secretCode, products).then(() => applyed = false)
                applyed = false
                payable = null

                res.redirect('/placed');
            }
        });
    } else {
        let totalPrice = await userHelper.getAllTotalAmount(req.session.user._id)

        let total = totalPrice[0].total / 75
        let amount = parseInt(total)
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;

        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": amount
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                console.log(JSON.stringify(payment));
                userHelper.changePaymentStatus(req.session.orderId, req.session.user._id, applyed, secretCode).then(() => applyed = false)
                applyed = false

                res.redirect('/placed');
            }
        });
    }

});

router.get('/cancel', (req, res) => {
    res.redirect('/')
});
// end paypal





router.get('/placed', varifyLogin, async (req, res) => {
    let sessionData = req.session.user
    let Category = await userHelper.getCategory()
    res.render('users/placed', { sessionData, Category })

})



// /add-new-address'
router.get('/add-address-to-checkout', async (req, res) => {
    let Category = await userHelper.getCategory()
    let sessionData = req.session.user
    res.render('users/add-address-checkout', { sessionData, Category })
})
router.post('/add-new-address-to-checkout', (req, res) => {
    let Mobile = "+91" + req.body.Mobile;
    let data = {
        Name: req.body.Name,
        Mobile: Mobile,
        Pincode: req.body.Pincode,
        Locality: req.body.Locality,
        Address: req.body.Address,
        State: req.body.State,
        City: req.body.City,
        Which: req.body.Which
    }

    userHelper.addAddress(data, req.session.user._id).then(() => {
        res.redirect('/checkout')
    })


})



router.post('/edit-address-checkout', varifyLogin, (req, res) => {

    userHelper.editUserAddress(req.body, req.session.user._id).then(() => {
        res.redirect('/checkout')
    })

})


router.get('/edit-address-chekout/:id', varifyLogin, async (req, res) => {
    let Category = await userHelper.getCategory()
    let sessionData = req.session.user
    userHelper.getOneAddress(req.params.id, req.session.user._id).then((address) => {
        let home
        let office
        let other
        if (address.Which === "Home") {
            home = true
        } else if (address.Which === "Office") {
            office = true
        } else {
            other = true
        }
        res.render('users/address-edit-chekout', { address, home, office, other, sessionData, Category })
    })
})


//chekout end

router.get('/add-new-address', varifyLogin, async (req, res) => {
    let sessionData = req.session.user
    let Category = await userHelper.getCategory()
    res.render('users/add-address', { sessionData, Category })
})

router.post('/add-new-address', varifyLogin, (req, res) => {

    let Mobile = "+91" + req.body.Mobile;
    let data = {
        Name: req.body.Name,
        Mobile: Mobile,
        Pincode: req.body.Pincode,
        Locality: req.body.Locality,
        Address: req.body.Address,
        State: req.body.State,
        City: req.body.City,
        Which: req.body.Which
    }

    userHelper.addAddress(data, req.session.user._id).then(() => {
        res.redirect('/saved-address')
    })




})







router.get('/profile', varifyLogin, async (req, res) => {
    let Category = await userHelper.getCategory()
    let sessionData = req.session.user
    userBio = await userHelper.getUsersDetails(req.session.user._id)
    // console.log(userBio);

    let dobOk = false
    if (!userBio.DOB == '') {
        dobOk = true
    } else {
        // console.log("user not set DOB");
    }

    let Gender = false
    if (!userBio.Gender == '') {
        Gender = true
    } else {
        // console.log('user not set Gender');
    }

    res.render('users/profile', { sessionData, userBio, dobOk, Gender, Category })
})





router.get('/edit-profile', varifyLogin, async (req, res) => {
    let Category = await userHelper.getCategory()
    let sessionData = req.session.user
    userBio = await userHelper.getUsersDetails(req.session.user._id)
    let dobOk = false
    if (!userBio.DOB == '') {
        dobOk = true
    } else {
        // console.log("user not set DOB");
    }

    // console.log(userBio)
    res.render('users/profile-edit', { sessionData, userBio, dobOk, Category })
})




router.post('/edit-profile', varifyLogin, (req, res) => {

    userHelper.updateProfile(req.body, req.session.user._id)
        .then((id) => {
            if (req.files) {

                var image = req.files.ProfileImage


            } else {
                // console.log('No image for Update');
            }


            //adding profile pic

            if (image) {
                image.mv('./public/profile-images/' + id + '11.jpg', (err, done) => {
                    // console.log('image 1 succss fully edited');
                })

            } else {
                // console.log('no value image variabile');

            }





            res.redirect('/profile')






        })






})









router.get('/saved-address', varifyLogin, async (req, res) => {
    let sessionData = req.session.user
    let Category = await userHelper.getCategory()

    await userHelper.getUserAddress(req.session.user._id).then((Address) => {

        res.render('users/saved-address', { Address, sessionData, Category })
    })

})

router.get('/edit-address/:id', varifyLogin, async (req, res) => {
    let sessionData = req.session.user
    let Category = await userHelper.getCategory()
    userHelper.getOneAddress(req.params.id, req.session.user._id).then((address) => {

        let home
        let office
        let other
        if (address.Which === "Home") {
            home = true
        } else if (address.Which === "Office") {
            office = true
        } else {
            other = true
        }
        res.render('users/address-edit', { address, home, office, other, sessionData, Category })
    })

})








router.post('/edit-address', varifyLogin, (req, res) => {
    userHelper.editUserAddress(req.body, req.session.user._id).then(() => {
        res.redirect('/saved-address')
    })

})

router.post('/delete-address', varifyLogin, (req, res) => {
    console.log(req.body, "thisis addres id TRRRRRRRRRRRRRRRRRETTYRYGYHFGYTHYT");
    userHelper.deleteUserAddress(req.body.addId, req.session.user._id).then(
        res.json()
    )
})


router.get('/getTotalOneProduct', varifyLogin, async (req, res) => {

    let eachItem = await userHelper.getTotalAmount(req.session.user._id)
    let total = await userHelper.getAllTotalAmount(req.session.user._id)

    res.json({ eachItem: eachItem, total: total })

}
)
router.get('/orders-page', varifyLogin, async (req, res) => {
    let Category = await userHelper.getCategory()
    let sessionData = req.session.user
    let order = await userHelper.getUserOrders(req.session.user._id)


    for (x of order) {
        x.date = moment(x.date).format('lll')
    }


    res.render('users/orders', { sessionData, order, Category })
})







router.post('/cancelOrder', async (req, res) => {
    console.log('oooooooooooooooooooooooooooooo', req.body.orderId, req.body.productId);
    await userHelper.cancelOrder(req.body.orderId, req.body.productId).then((response) => {

        res.redirect('/orders-page')

    })
})


router.get('/order-Detals-page', varifyLogin, async (req, res) => {

    let Category = await userHelper.getCategory()
    let sessionData = req.session.user
    let Details = await userHelper.getDetailsOrder(req.query.proId, req.query.orderId)



    for (x of Details) {
        x.date = moment(x.Details).format('lll')
    }




    let qty = Details[0].products.quantity
    let price = Details[0].product[0].SalePrice
    let subtotal = qty * price


    res.render('users/order-Details', { Details, sessionData, Category, subtotal })



})


router.post('/verify-payment', (req, res) => {

    console.log('HELLO ');

    userHelper.verifyPayment(req.body).then(async () => {
        let products = await userHelper.getCartProductList(req.session.user._id)
        userHelper.changePaymentStatus(req.body['order[receipt]'], req.session.user._id, applyed, secretCode, products).then(() => {
            applyed = false
            res.json({ status: true })
        })
    }).catch((err) => {
        console.log(err);
        res.json({ status: false })
    })
})


//WISH LIST START

router.get('/wishlist', varifyLogin, async (req, res) => {
    let Category = await userHelper.getCategory()
    userHelper.getProductWishlist(req.session.user._id).then((products) => {
        let sessionData = req.session.user
        res.render('users/wishlist', { sessionData, products, Category })
    })


})

router.post('/add-to-wishlist', (req, res) => {

    if (req.session.user) {


        userHelper.addToWishlist(req.body.id, req.session.user._id).then(async (response) => {
            let count = await userHelper.getWishCount(req.session.user._id)

            if (response.proExist) {

                let user = req.session.user.Name
                let Exist = true
                res.json({ user, Exist, count })
            } else {

                let added = true
                res.json({ added, count })
            }

        })
    } else {

        res.json(false)
    }

})


router.get('/get-wishlist-count', async (req, res) => {
    if (req.session.user) {

        let count = await userHelper.getWishCount(req.session.user._id)
        res.json(count)



    } else {

        // console.log('wishlist ok but user not ok');
    }




})


router.post('/deleteFromWishlist', (req, res) => {


    userHelper.dltProductFromWishlist(req.body).then(() => {
        res.json()




    })
})
//WISH LIST END

// Browse product and Category

router.post('/search', async (req, res) => {
    let Category = await userHelper.getCategory()
    await userHelper.searchProducts(req.body.content).then((products) => {
        res.render('users/filtered-products', { products, Category })
    })
})







router.post('/applyCoupon', varifyLogin, async (req, res, next) => {

    await userHelper.applyCoupon(req.body, req.session.user._id).then(async (response) => {


        if (response.userApplied == true) {
            console.log(">>>>>>>>>>");
            res.json({ userApplied: true })
        }
        else {

            if (response.invalidCode == true) {

                res.json({ invalidCode: true })

            } else {

                let totalprice = await userHelper.getAllTotalAmount(req.session.user._id)

                let total = totalprice[0].total
                console.log("* apply coupon **");
                console.log(response);
                console.log('MANDAN SHREE HARI');
                console.log(total);
                res.json({ invalidCode: false, coupnDetails: response, total: total })
            }

        }


    })
})


var filterbypriceProducts


// filter by price
router.post('/filterby', async (req, res) => {


    let start = parseInt(req.body.start)
    let end = parseInt(req.body.end)
    let category = req.body.category

    if (category) {
        req.session.filterCategory = category
        req.session.start=start
        req.session.end=end
        userHelper.filterByPrice(start, end, category).then((Products) => {

            filterbypriceProducts = Products
            res.json()
        })
    } else {
        userHelper.filterByPrice(start, end, req.session.filterCategory).then((Products) => {

            filterbypriceProducts = Products
            res.json()
        })
    }

})











router.get('/filterby', async (req, res) => {
    let Category = await userHelper.getCategory()
    let sessionData = req.session.user
    let products = filterbypriceProducts
    res.render('users/filterdByPriceCategory', { products, Category, sessionData })

})


var filteredDifaultProducts

router.post('/filterbyBrandCateNameWithPirce', (req, res) => {
   
    
    let start = parseInt(req.body.start)
    let end = parseInt(req.body.end)
    let category = req.body.category

    if (category) {
        req.session.filterCategory = category
        req.session.start=start
        req.session.end=end
        userHelper.filterByPrice(start, end, category).then((Products) => {

            filteredDifaultProducts = Products
            res.json()
        })
    } else {
        userHelper.filterByPrice(start, end, req.session.filterCategory).then((Products) => {

            filteredDifaultProducts = Products
            res.json()
        })
    }

    


})

router.get('/filterbyBrandCateNameWithPirce', async (req, res) => {
   
    let Category = await userHelper.getCategory()
    let sessionData = req.session.user
    products = filteredDifaultProducts
    res.render('users/filterdDifaltWithPrice', { products, Category, sessionData })

})







router.get('/logout', (req, res) => {

    req.session.user = null
    res.redirect('/')
})



module.exports = router;

// jk;-5612kl paypal password    