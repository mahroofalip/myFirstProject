var db = require('../config/connection')
var collection = require('../config/collections')
var bcrypt = require('bcrypt')
const { use } = require('../routes/users')
const moment = require('moment')
// var { ObjectID } = require('mongodb')
var objectId = require('mongodb').ObjectID
const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_47cvOoEZUdlXNa',
    key_secret: 'fIfOoweCzV2c6kJarijkTjW5',
});
const { response } = require('express')
const { resolve } = require('path')
module.exports = {

    doCheckUser: (datauser) => {
        // console.log(datauser);
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECION).findOne({ Email: datauser.Email })
            resolve(user)
        })

    },



    doSignup: (userData) => {


        userData.isEnabled = true



        return new Promise(async (resolve, reject) => {


            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECION).insertOne({
                Name: userData.Name,
                Email: userData.Email,
                Password: userData.Password,
                mobile: userData.mobile,
                isEnabled: userData.isEnabled,
                DOB: null

            }).then((data) => {
                console.log(data);
                resolve(data.ops[0])

            })






        })

    },

    enableUser: (userId) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.USER_COLLECION)
                .updateOne({ _id: objectId(userId) }, {
                    $set: {
                        isEnabled: true
                    }
                }).then(() => {
                    resolve({ status: true })
                })
        })
    },
    disableUser: (userId) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.USER_COLLECION)
                .updateOne({ _id: objectId(userId) }, {
                    $set: {
                        isEnabled: false
                    }
                }).then(() => {
                    resolve({ status: true })
                })
        })
    },


    doLoginWithmoble: (mobile_number) => {



        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECION).findOne({ mobile: mobile_number }) //, isEnabled: true-->



            response.user = user

            resolve(response)



        })


    },





    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {

            let response = {}

            let blockedUser = await db.get().collection(collection.USER_COLLECION).findOne({ Email: userData.Email, isEnabled: false })

            if (blockedUser) {

                resolve({ block: true })
            } else {

                let user = await db.get().collection(collection.USER_COLLECION).findOne({ Email: userData.Email, isEnabled: true })
                if (user) {
                    bcrypt.compare(userData.Password, user.Password).then((status) => {
                        if (status) {
                            console.log('login success')
                            response.user = user
                            response.passwordOk = true
                            response.validUser = true
                            resolve(response)
                        } else {
                            console.log('Password Incorrect')


                            resolve({ passwordFasle: true })

                        }

                    })
                } else {
                    console.log('Invalid User')


                    resolve({ invalidUser: true })
                }


            }


        })

    },







    doUserForLogin: (mobile) => {

        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECION).findOne({ mobile: mobile })
            console.log("user ....................................", user);
           
            if (user) {
                response = user;
                response.user.invalidUser=false 
                resolve(response)
            }else{
                response.invalidUser=true
                resolve(response)
              
            }

        })

    },






    addToCart: (proId, userId) => {

        let proObj = {
            item: objectId(proId),
            quantity: 1

        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)

                if (proExist != -1) {

                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }


                        ).then(() => {
                            resolve({ status: true })
                        })
                } else {
                    console.log('helo thisis pro exist 11111111111111111111111111111', proExist);
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },
                        {

                            $push: { products: proObj }


                        }

                    ).then(() => {
                        resolve({ status: false })
                    })

                }
            }
            else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },



    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        $match: { user: objectId(userId) }
                    }
                    ,
                    {
                        $unwind: '$products'
                    }
                    ,
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },

                    {
                        $lookup: {
                            from: collection.PRODUCTS_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    }
                    ,
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }



                ]).toArray()


            resolve(cartItems)
        })
    },



    // this is on item total item* price

    getTotalAmount: (userId) => {


        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCTS_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: 1, total: { $sum: { $multiply: ['$quantity', '$product.SalePrice'] } }
                        }
                    }




                ]).toArray()

            resolve(total)
        })






    },



    getAllTotalAmount: (userId) => {


        return new Promise(async (resolve, reject) => {
            let totalAmount = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCTS_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', '$product.SalePrice'] } }
                        }
                    },




                ]).toArray()


            resolve(totalAmount)
        })






    },
    getExpense: (userId) => {


        return new Promise(async (resolve, reject) => {
            let expense = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    }
                    ,
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCTS_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    }
                    ,
                    

                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: 1, expense: { $sum: { $multiply: ['$quantity', '$product.LandingCost'] } }
                        }
                    }


                ]).toArray()

            let totalExpense = []

            await expense.map((product) => {
                let qty = product.quantity
                let landrate = product.product.LandingCost
                let exp = qty * landrate
                totalExpense.push(exp)


                console.log(qty);
                console.log(landrate);
                console.log(exp);
                console.log(totalExpense);




            })
            let ex = totalExpense.reduce(add)
            function add(total, num) {
                return total + num;
            }

            console.log("hellosfssfsfsfsfsfoooooooooooooooooooooooooooooooooooooooooooooooooooooooiiii");
            console.log(ex);
            console.log("hellosfssfsfsfsfsfoooooooooooooooooooooooooooooooooooooooooooooooooooooooiiii");


            resolve(ex)
        })


    }
    ,







    getCartCount: (userId) => {
        console.log('ok  cart count');
        console.log(userId);
        let count = 0
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
                console.log(count);
            }
            resolve(count)


        })
    },



    changeProductQty: ({ cartId, proId, count, quantity }) => {
       
        count = parseInt(count)

        return new Promise( (resolve, reject) => {

            if (count == -1 && quantity < 2) {
               
                db.get().collection(collection.CART_COLLECTION).updateOne(
                    {
                        _id: objectId(cartId)
                    },
                    {
                        $pull: { products: { item: objectId(proId) } }
                    }
                ).then(() => {
                    resolve({ deleted: true })
                })
              

              

            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(cartId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': count }
                        }

                    ).then(() => {
                        resolve({deleted:false})
                    })


            }

        })
    },
    dltProductFromCart: ({ cartId, proId }) => {
        console.log("ok 2");
        console.log(cartId);
        console.log(proId);
        console.log("ok 2 end");

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.CART_COLLECTION)
                .findOneAndUpdate({ _id: objectId(cartId) },
                    {
                        $pull: { products: { item: objectId(proId) } }
                    }
                ).then((response) => {


                    resolve()

                })

        })

    },

    addAddress: (userAddress, userId) => {
        userAddress.id = objectId()
        let objAddress = {
            user: objectId(userId),
            addresses: [userAddress]
        }
        console.log(userAddress);
        return new Promise(async (resolve, reject) => {

            let Address = await db.get().collection(collection.USER_ADDRESS).findOne({ user: objectId(userId) })
            console.log(Address);
            if (Address) {
                db.get().collection(collection.USER_ADDRESS).
                    updateOne(
                        {
                            user: objectId(userId)
                        },
                        {
                            $push: {
                                addresses: userAddress
                            }

                        }

                    ).then((data) => {
                        console.log('successfully pushed');
                        console.log(data);
                        resolve()
                    }
                    )

            } else {

                db.get().collection(collection.USER_ADDRESS).insertOne(objAddress).then(() => {
                    console.log("success fully inser");
                    resolve()
                })

            }


        })

    },

    getUserAddress: (userId) => {

        return new Promise(async (resolve, reject) => {
            let addresses = await db.get().collection(collection.USER_ADDRESS).findOne({ user: objectId(userId) })

            resolve(addresses)

        })
    },

    getOneAddress: (addressId, userId) => {
        console.log("ad_id", addressId, "us_id", userId);
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_ADDRESS).aggregate([
                {
                    $match: { user: objectId(userId) }
                }
                ,
                {
                    $unwind: "$addresses"
                }
                ,
                {
                    $match: { "addresses.id": objectId(addressId) }
                }

            ]
            ).toArray()
            let result = address[0].addresses
            resolve(result)

        })

    },
    editUserAddress: (address, userId) => {

        let adrresId = address.AddressId
        let Name = address.Name
        let Mobile = address.Mobile
        let Pincode = address.Pincode
        let Locality = address.Locality
        let Address = address.Address
        let State = address.State
        let City = address.City
        let Which = address.Which

        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.USER_ADDRESS).updateOne(
                { user: objectId(userId), "addresses.id": objectId(adrresId) },
                {
                    $set: {
                        "addresses.$.Name": Name,
                        "addresses.$.Moblie": Mobile,
                        "addresses.$.Pincode": Pincode,
                        "addresses.$.Locality": Locality,
                        "addresses.$.Address": Address,
                        "addresses.$.State": State,
                        "addresses.$.City": City,
                        "addresses.$.Which": Which
                    }
                }

            )

            resolve()
        })
    }
    ,
    deleteUserAddress: (addressId, userId) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_ADDRESS).updateOne({
                user: objectId(userId)
            }, {
                $pull: { addresses: { id: objectId(addressId) } }
            }


            )
            resolve()
        })

    },
    getProductQty: (proId, userId) => {
        console.log("2 step for qty to Cart");
        console.log(proId);
        console.log(userId);
        console.log('ok');
        return new Promise(async (resolve, reject) => {
            let qty = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                }


            ]
            ).toArray()

            resolve(qty)
        })

    },

    placeOrder: async (order, products, orderAddress, totalPrice, userId, applyed, code, expense) => {

        if (applyed) {
            totalPrice =
                [{
                    _id: null,
                    total: totalPrice
                }]

        }

        var orderObj = {
            address: orderAddress,
            user: objectId(userId),
            PaymentMethod: order.PaymentMethod,
            products: products,
            price: totalPrice,
            date: new Date(),
            expense: expense

        }




        for (i = 0; i < products.length; i++) {
            products[i].productStatus = order.PaymentMethod === 'COD' ? 'placed' : 'pending'
            products[i].Cancel = false
            products[i].placed = true
            products[i].Packed = false
            products[i].Shipped = false
            products[i].Delivered = false
            products[i].packedCompleted = false
            products[i].ShippedCompleted = false
            products[i].DeliveredCompleted = false


        }



        if (order.PaymentMethod === 'COD') {

            if (applyed) {

                db.get().collection(collection.USER_COLLECION).updateOne(
                    {
                        _id: objectId(userId)
                    },
                    {
                        $set: {

                            couponApplied: true,
                            coupon: code

                        }
                    }
                )


            } else {
                console.log('not apply cpn');
            }



            // await products.map(async (product) => {

            //     console.log('THELO FJOISDJFIOSJFIJSILFJSOIDFOISDJFSLDF THIS IS PROIDUSFSJ ID AND QYT', product.item)
            //     let qtypro = product.quantity
            //     console.log('THELO FJOISDJFIOSJFIJSILFJSOIDFOISDJFSLDF THIS IS PROIDUSFSJ ID AND QYT', qtypro)

            //     db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: objectId(product.item) },
            //         { $inc: { totalProducts: -qtypro, soldProduct: qtypro } }

            //     )


            // })




        }


        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {

                if (response.ops[0].products[0].productStatus == "placed") {


                    db.get().collection(collection.COUPON_COLLECTION)
                    db.get().collection(collection.CART_COLLECTION).removeOne({ user: objectId(userId) })
                } else {

                    console.log('payment not completed cart no clean')
                }

                console.log("this is place order");
                console.log(response.ops[0]);
                resolve(response.ops[0]._id)

                console.log('ok');
            })
        })

    },

    getCartProductList: (userId) => {

        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

            resolve(cart.products)
        })
    }
    ,
    getUserOrders: (userId) => {
        console.log(userId)
        return new Promise(async (resolve, reject) => {

            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },

                {
                    $unwind: '$products'
                },

                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        _id: 1, address: 1, user: 1, PaymentMethod: 1, products: 1, price: 1, date: 1, product: 1, subtotal: { $sum: { $multiply: ['$products.quantity', '$product.SalePrice'] } }
                    }
                },
                { $sort: { date: -1 } }


            ]).toArray()



            resolve(orders)

        })
    },
    cancelOrder: (order, proId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne(
                {
                    _id: objectId(order), "products.item": objectId(proId)
                },
                {
                    $set: {
                        "products.$.productStatus": "Cancelled",
                        "products.$.Cancel": true,
                        "products.$.placed": false,
                        "products.$.Packed": false,
                        "products.$.Shipped": false,
                        "products.$.Delivered": false



                    }
                }
            )

            resolve()
        })

    },

    getDetailsOrder: (proId, orderId) => {

        return new Promise(async (resolve, reject) => {
            let proInfo
            // let Details = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            //     {
            //         $match: { _id: objectId(orderId) }
            //     },

            //     {
            //         $unwind: '$products'
            //     },

            //     {
            //         $lookup: {
            //             from: collection.PRODUCTS_COLLECTION,
            //             localField: 'products.item',
            //             foreignField: '_id',
            //             as: 'product'

            //         }
            //     },
            //     {
            //         $unwind: '$product'
            //     },


            // ]).toArray()


            proInfo = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $match: { 'products.item': objectId(proId) }
                }
            ]).toArray()

            // console.log("pro info ssssssssssssssssssssssssssssssssssssssssssssssssssdfdf pro info", proInfo,"okdfsfs");


            resolve(proInfo)
            // resolve({obj1:Details,obj2:proInfo})

        })
    },
    generateRazorpay: (orderId, totalPrice) => {
        console.log('userhelpr razorparyssssssssss');
        let Id = '' + orderId

        return new Promise((resolve, reject) => {

            total = totalPrice
            console.log('ok');
            instance.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: Id,
                notes: {
                    TYPE: "RAZORPAY",

                }

            },
                (err, order) => {
                    if (err) {
                        console.log(err);
                    } else {


                        resolve(order)
                    }

                }

            )
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const { createHmac } = require('crypto');
            let hmac = createHmac('sha256', 'fIfOoweCzV2c6kJarijkTjW5');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            console.log(hmac);
            if (hmac === details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })

    },

    changePaymentStatus: (orderId, userId, applyed, code, products) => {

        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })

            console.log(order.products);
            let products = order.products
            for (i = 0; i < products.length; i++) {
                products[i].productStatus = 'placed'
                products[i].Cancel = false
                products[i].placed = true
                products[i].Packed = false
                products[i].Shipped = false
                products[i].Delivered = false
                products[i].packedCompleted = false
                products[i].ShippedCompleted = false
                products[i].DeliveredCompleted = false
            }

            console.log('This is applyed', applyed);
            console.log(code);
            if (applyed) {

                db.get().collection(collection.USER_COLLECION).updateOne(
                    {
                        _id: objectId(userId)
                    },
                    {
                        $set: {

                            couponApplied: true,
                            coupon: code

                        }
                    }
                )


            } else {
                console.log('not apply cpn');
            }

            // await products.map(async (product) => {

            //     console.log('THELO FJOISDJFIOSJFIJSILFJSOIDFOISDJFSLDF THIS IS PROIDUSFSJ ID AND QYT', product.item)
            //     let qtypro = product.quantity
            //     console.log('THELO FJOISDJFIOSJFIJSILFJSOIDFOISDJFSLDF THIS IS PROIDUSFSJ ID AND QYT', qtypro)

            //     db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: objectId(product.item) },
            //         { $inc: { totalProducts: -qtypro, soldProduct: qtypro } }

            //     )


            // })



            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, { $set: { products: products } })
            db.get().collection(collection.CART_COLLECTION).removeOne({ user: objectId(userId) })

            resolve()
        })

    }
    ,
    getUsersDetails: (userId) => {
        console.log("yyyyyyyyyyyyyyyyyyyyyyyyyyyy", userId);
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECION).findOne({ _id: objectId(userId) })
            resolve(user)

        })


    },
    updateProfile: (userDetails, userId, proImge) => {

         if(userDetails.Gender==123){
            userDetails.Gender=null
         } 
         
        return new Promise((resolve, reject) => {
            if (!proImge) {
                db.get().collection(collection.USER_COLLECION).updateOne({ _id: objectId(userId) }, {
                    $set: {
                        Name: userDetails.Name,
                        Email: userDetails.Email,
                        mobile: userDetails.mobile,
                        Gender: userDetails.Gender,
                        DOB: userDetails.DOB
                    }
                }
                )
            } else {
                db.get().collection(collection.USER_COLLECION).updateOne({ _id: objectId(userId) }, {
                    $set: {
                        Name: userDetails.Name,
                        Email: userDetails.Email,
                        mobile: userDetails.mobile,
                        Gender: userDetails.Gender,
                        DOB: userDetails.DOB,
                        proImge: true
                    }
                }
                )
            }

            resolve(userId)
        })


    },
    addToWishlist: (proId, userId) => {

        let proObj = {
            item: objectId(proId)

        }


        return new Promise(async (resolve, reject) => {
            let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (wishlist) {

                let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
                let proExist = wishlist.products.findIndex(product => product.item == proId)

                if (proExist != -1) {

                    resolve({ proExist: true })

                } else {

                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne(
                        {
                            user: objectId(userId)
                        },
                        {
                            $push: { products: proObj }
                        }
                    )

                    resolve({ proExist: false })


                }


            } else {
                let wishObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishObj).then(() => {
                    resolve({ proExist: false })
                })
            }
        })
    },
    getWishCount: (userId) => {

        let count = 0
        return new Promise(async (resolve, reject) => {
            let wishlilst = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (wishlilst) {
                count = wishlilst.products.length

            }
            resolve(count)


        })
    },
    getProductWishlist: (userId) => {

        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },

                {
                    $unwind: '$products'
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'product'

                    }
                },
                {
                    $unwind: '$product'
                },
            ]).toArray()

            resolve(products)
        })
    },
    dltProductFromWishlist: ({ wId, proId }) => {


        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.WISHLIST_COLLECTION)
                .findOneAndUpdate({ _id: objectId(wId) },
                    {
                        $pull: { products: { item: objectId(proId) } }
                    }
                ).then(() => {


                    resolve()

                })

        })

    },
    searchProducts: (content) => {
        console.log("step 2", content);
        return new Promise(async (resolve, reject) => {


            products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([

                {
                    $match: {
                        $or: [{ 'Name': { $regex: content, $options: 'i' } },
                        { 'Category': { $regex: content, $options: 'i' } }, { 'Brand': { $regex: content, $options: 'i' } }]
                    }
                },
            ]

            ).toArray()
            resolve(products)


        })

    }
    ,
    getlFeaturedtProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ SaleType: "Featured" }).toArray()

            resolve(products)
        }
        )
    },
    getLatestProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ SaleType: "Latest" }).toArray()

            resolve(products)
        }
        )
    },


    getTopsellingProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ SaleType: "TopSelling" }).toArray()

            resolve(products)
        }
        )

    },
    getCategory: async () => {
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.CATEGORY_COLLECTION).find({}).toArray()
            resolve(response);

        })
    },
    getSearchingByCategory: (Category) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_COLLECTION).find({ Category: Category })
                .toArray((err, results) => {
                    resolve(results)
                });

        })

    },
    getSimilarProducts: (Category) => {
        console.log("THIS IS CATEGORY" + Category);
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
                {
                    $match:
                    {
                        Category: Category
                    }
                }
                ,
                {
                    $limit: 4
                }
            ]).toArray((err, similarpro) => {
                console.log("this i si similar pro   l", similarpro, "fs");
                resolve(similarpro)
            })


        })
    },
    getCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).aggregate().toArray()
            console.log('jsdlkjfklsjdkfjsdklfjsjdflsdflksdldkfls', coupons);
            resolve(coupons)
        })

    },


    applyCoupon: (code, userId) => {

        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECION).findOne({
                _id: objectId(userId)
            })

            console.log('this is user ', user);
            let couponCode = await db.get().collection(collection.COUPON_COLLECTION).findOne({
                CouponCode: code.code
            })

            console.log("/////");
            console.log(couponCode);
            console.log(user.couponApplied);
            console.log("Checking condition");
            console.log(user.coupon == code.code);
            if (user.coupon == code.code) {
                response.userApplied = true
                resolve(response)
            }
            else {
                if (couponCode == null) {
                    console.log('invalid code from user');
                    response.invalidCode = true
                    resolve(response)
                }
                else {
                    response.invalidCode = false
                    response.coupon = couponCode
                    resolve(response)
                }
            }
        })
    },
    getBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION).aggregate().toArray()
            resolve(banner)

        })
    },
    filterByPrice: (start, end, category) => {

        return new Promise(async (resolve, reject) => {
            console.log('helpr ');
            console.log(start, end);
            console.log(category);


            let Products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match: { Category: category }
                    },
                    {
                        $match: {
                            SalePrice: { $gte: start, $lte: end }
                        }
                    }
                ]
            ).toArray()

            resolve(Products)
        })
    },

    getPriceDefaultPro: (start, end, category) => {

        return new Promise(async (resolve, reject) => {
            console.log('helpr ');
            console.log(start, end);
            console.log(category);


            let Products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match: { Category: category }
                    },
                    {
                        $match: {
                            SalePrice: { $gte: start, $lte: end }
                        }
                    }
                ]
            ).toArray()

            resolve(Products)
        })


    }

}





