var db = require('../config/connection')
var collection = require('../config/collections')
const { response } = require('express')
// var { ObjectID } = require('mongodb')
var objectId = require('mongodb').ObjectID
var bcrypt = require('bcrypt')
const { use } = require('../app')
const { PRODUCTS_COLLECTION } = require('../config/collections')
const TrustedComms = require('twilio/lib/rest/preview/TrustedComms')
const { AwsInstance } = require('twilio/lib/rest/accounts/v1/credential/aws')
const moment = require('moment')
module.exports = {

    addUsers: async (users, callback) => {
        users.Password = await bcrypt.hash(users.Password, 10)
        db.get().collection(collection.USER_COLLECION).insertOne(users).then((data) => {
            callback(data.ops[0])
        })
    },
    getCategory: async () => {
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.CATEGORY_COLLECTION).find({}).toArray()
            resolve(response);

        })
    },


    getAllcatetory: () => {
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.CATEGORY_COLLECTION).find({}).toArray()
            resolve(response)
        })
    },
    getBrands: () => {
        return new Promise(async (resolve, reject) => {
            let Brands = await db.get().collection(collection.BRAND_COLLECTION).find({}).toArray()
            resolve(Brands)

        })
    }
    ,
    addBrand: (brand) => {
        let brandName = (brand.brand).trim()
        return new Promise(async (resolve, reject) => {
            let Brand = await db.get().collection(collection.BRAND_COLLECTION).findOne({ brand: brandName })
            if (Brand) {

                response.brandExist = true
                console.log('exist brand');
                resolve({ resopose: true })

            } else {
                db.get().collection(collection.BRAND_COLLECTION).insertOne({ brand: brandName })
                console.log('successfully inserted that new brand');
                resolve()
            }

        })

    }
    ,
    addCategory: async (Catedata, callback) => {
        console.log('helper ');
        console.log(Catedata);
        console.log('end');


        CategoryName = (Catedata.Category).trim()

        let response = {}
        return new Promise(async (resolve, reject) => {

            let Category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ CategoryName: CategoryName })
            if (Category == null) {
                console.log('this is new category');
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne({
                    CategoryName: CategoryName,

                })


                resolve()
            } else {
                resolve({ catetoryExist: true })
            }


        })
    }

    ,

    addProduct: (product) => {

        return new Promise(async (resolve, reject) => {
            console.log('PRODUCTS STARAAAAAAAAAAAAAAAAAAAAAAAAAAAATTT');
            console.log(product);
            console.log('PRODUCTS ALL SSSSSSSSSSSSSSSSSSSSSSSSSSSSS');
            await db.get().collection(collection.PRODUCTS_COLLECTION).insertOne({
                Name: product.Name,
                Category: product.Category,
                Stock: product.Stock,
                Brand: product.Brand,
                LandingCost: parseFloat(product.LandingCost),
                SalePrice: parseFloat(product.SalePrice),
                Description: product.Description,
                SaleType: product.SaleType,
                offer: false,
                ProductOffer: false,
                totalProducts: product.totalProducts,
                soldProduct: 0


            }).then((data) => {
                resolve(data.ops[0]._id)
            })
        })



    }
    ,


    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray()

            resolve(products)


        })
    },


    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECION).find().toArray()
            resolve(users)
        })
    },


    deleteUsers: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECION).removeOne({ _id: objectId(userId) }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })

    },


    deleteProducts: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).removeOne({ _id: objectId(proId) }).then((response) => {
                console.log(response)
                resolve(response)
            })

        })
    },

    getUsersDetails: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECION).findOne({ _id: objectId(userId) }).then((user) => {
                resolve(user)
            })
        })

    },

    // getProductDetails: (proId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let product = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
    //             [
    //                 {
    //                     $match: { _id: objectId(proId) }
    //                 }
    //                 ,
    //                 {
    //                     $lookup: {
    //                         from: collection.CATEGORY_COLLECTION,
    //                         localField: 'Category',
    //                         foreignField: '_id',
    //                         as: 'Category'

    //                     }
    //                 },
    //                 {
    //                     $unwind: '$Category'
    //                 }



    //             ]).toArray()

    //         resolve(product)



    //     })

    // },

    getProductDetails: (proId) => {

        return new Promise(async (resolve, reject) => {

            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: objectId(proId) })
            console.log(products);
            resolve(products)




        })

    },


    getProductInfo: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {

                resolve(product)

            })

        })

    },



    updateProducts: (proId, proDetails) => {

        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_COLLECTION).findOneAndUpdate({ _id: objectId(proId) }, {
                $set: {
                    Name: proDetails.Name,
                    Category: proDetails.Category,
                    Stock: proDetails.Stock,
                    LandingCost: parseFloat(proDetails.LandingCost),
                    SalePrice: parseFloat(proDetails.SalePrice),

                    Description: proDetails.Description,
                    Brand: proDetails.Brand,
                    SaleType: proDetails.SaleType,
                    totalProducts: parseInt(proDetails.totalProducts),
                    soldProduct: 0
                }

            }).then((data) => {

                resolve(data.value._id)

            })
        })
    },


    updateUsers: (userId, userDetails) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECION).updateOne({ _id: objectId(userId) }, {
                $set: {
                    Name: userDetails.Name,
                    Email: userDetails.Email
                }

            }).then((response) => {
                resolve()
            })
        })
    },
    doAdminSignup: (adminData) => {
        console.log("step 2");
        console.log(adminData);
        let response = {}
        return new Promise(async (resolve, reject) => {
            adminData.Password = await bcrypt.hash(adminData.Password, 10)
            let admin = await db.get().collection(collection.ADMIN_COLLECTON).findOne({ Email: adminData.Email })
            if (admin) {
                response.exist = true
                resolve(response)
            } else {
                await db.get().collection(collection.ADMIN_COLLECTON).insertOne({

                    Name: adminData.Name,
                    Email: adminData.Email,
                    Phone: adminData.Phone,
                    Password: adminData.Password

                }).then((data) => {
                    resolve(data.ops[0])
                })
            }


        })

    },

    doCheckAdmin: (adminData) => {
        console.log("oiiiii");
        console.log(adminData);
        let result = {}
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.ADMIN_COLLECTON).findOne({ Email: adminData.Email })
            if (admin) {
                console.log("admin und");

                result.admin = admin
                result.adminOk = true
                resolve(result)
            } else {
                console.log("admin illlla");
                result.isNotAdmin = true
                resolve(result)
            }
        })
    }
    ,

    adminDoLogin: (adminData) => {
        console.log(adminData);
        let response = {}



        return new Promise(async (resolve, reject) => {

            let admin = await db.get().collection(collection.ADMIN_COLLECTON).findOne({ Email: adminData.Email })

            bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                console.log("thsi is status password");
                console.log(status);
                if (status) {
                    console.log("login success");
                    response.admin = admin

                    response.passwordOk = true
                    resolve(response)

                } else {

                    console.log("admin password incorrect");
                    resolve({ passwordFasle: true })

                }
            })

        })

    },
    deleteBrand: (brandId) => {
        console.log('Thsi is brand user helper                      ', brandId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).removeOne({ _id: objectId(brandId) }).then(() => {
                resolve()
            })
        })

    },

    deleteCategory: (cateId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).removeOne({ _id: objectId(cateId) }).then(() => {
                resolve()
            })
        })

    },
    editBrand: (brandId, newbrand) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).updateOne(
                {
                    _id: objectId(brandId)
                },
                {
                    $set: { brand: newbrand }
                }
            )
            resolve()
        })
    },
    getOneBrand: (brandId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BRAND_COLLECTION).findOne({ _id: objectId(brandId) }).then((data) => {
                resolve(data)
            })
        })
    }
    ,
    getOneCategory: (cateId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(cateId) }).then((data) => {
                resolve(data)
            })
        })
    },
    editCategory: (cateId, newCategory) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne(
                {
                    _id: objectId(cateId)
                },
                {
                    $set: { CategoryName: newCategory }
                }
            )
            resolve()
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {


            db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$products'
                }, {
                    $lookup:
                    {
                        from: collection.PRODUCTS_COLLECTION,    
                        localField: "products.item",
                        foreignField: "_id",
                        as: "orderedProducts.item"
                    }
                },
                
               

            ]).toArray().then((orders) => {

                resolve(orders)
            })
        })
    },
    changeStatus: (order) => {
        console.log("hello hoiiiiiii THIS IS NEW ORDER CHANGING FROM ADMIN ", order, "Ok");
        let orderId = order.orderId
        let proId = order.proId
        let status = order.status
        return new Promise(async (resolve, reject) => {
            if (status == 'Cancelled') {
                console.log("cancelled ok");
                await db.get().collection(collection.ORDER_COLLECTION).findOneAndUpdate(
                    {
                        _id: objectId(orderId), "products.item": objectId(proId)
                    },
                    {
                        $set: {
                            "products.$.productStatus": status,
                            "products.$.Cancel": true,
                            "products.$.placed": false,
                            "products.$.Packed": false,
                            "products.$.Shipped": false,
                            "products.$.Delivered": false

                        }
                    }).then(() => {

                        resolve()
                    })
            } else if (status == 'Packed') {
                console.log("if packed");
                await db.get().collection(collection.ORDER_COLLECTION).findOneAndUpdate(
                    {
                        _id: objectId(orderId), "products.item": objectId(proId)
                    },
                    {
                        $set: {
                            "products.$.productStatus": status,
                            "products.$.Cancel": false,
                            "products.$.placed": false,
                            "products.$.Packed": true,
                            "products.$.Shipped": false,
                            "products.$.Delivered": false,
                            "products.$.packedCompleted": true,
                            "products.$.ShippedCompleted": false,
                            "products.$.DeliveredCompleted": false


                        }
                    }).then(() => {

                        resolve()
                    })
            } else if (status == 'Shipped') {
                console.log("if shipped");
                await db.get().collection(collection.ORDER_COLLECTION).findOneAndUpdate(
                    {
                        _id: objectId(orderId), "products.item": objectId(proId)
                    },
                    {
                        $set: {
                            "products.$.productStatus": status,
                            "products.$.Cancel": false,
                            "products.$.placed": false,
                            "products.$.Packed": false,
                            "products.$.Shipped": true,
                            "products.$.Delivered": false,
                            "products.$.packedCompleted": true,
                            "products.$.ShippedCompleted": true,
                            "products.$.DeliveredCompleted": false
                        }
                    }).then(() => {

                        resolve()
                    })

            } else if (status == 'Delivered') {
                console.log("delivered");
                await db.get().collection(collection.ORDER_COLLECTION).findOneAndUpdate(
                    {
                        _id: objectId(orderId), "products.item": objectId(proId)
                    },
                    {
                        $set: {
                            "products.$.productStatus": status,
                            "products.$.Cancel": false,
                            "products.$.placed": false,
                            "products.$.Packed": false,
                            "products.$.Shipped": false,
                            "products.$.Delivered": true,
                            "products.$.packedCompleted": true,
                            "products.$.ShippedCompleted": true,
                            "products.$.DeliveredCompleted": true
                        }
                    }).then(() => {

                        resolve()
                    })

            }
        })
    },
    createCategoryOffer: (offer) => {


        let Category = (offer.Category).trim();


        return new Promise(async (resolve, reject) => {
            console.log("category", Category, 'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwq');
            let offerExist = await db.get().collection(collection.CATEGORY_OFFER_COLLECTION).findOne(
                { Category: Category }
            )
            console.log("offer Exist   :", offerExist);
            if (offerExist) {
                resolve({ Exist: true })
            } else {


                db.get().collection(collection.CATEGORY_OFFER_COLLECTION).insertOne(offer).then(async (data) => {

                    let activeOffer = data.ops[0]

                    let Discount = activeOffer.Discount
                    let Category = (activeOffer.Category).trim();
                    let Validity = activeOffer.Validity

                    console.log(" discount     :", Discount, "    validity   :", Validity, "   Category  :", Category, "end");







                    let items = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([{
                        $match: { $and: [{ Category: Category }, { offer: false }] }
                    }]).toArray()

                    await items.map(async (product) => {


                        let productPrice = product.SalePrice


                        let offerPrice = productPrice - ((productPrice * Discount) / 100)
                        console.log(productPrice, 'vs', offerPrice)

                        offerPrice = parseInt(offerPrice.toFixed(2))
                        let proId = product._id + ""

                        await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                            {
                                _id: objectId(proId)

                            },
                            {
                                $set: {
                                    SalePrice: offerPrice,
                                    offer: true,
                                    OldPrice: productPrice,
                                    offerPercentage: parseInt(Discount)
                                }
                            })
                    })


                    let Item2 = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([{
                        $match: { $and: [{ Category: Category }, { ProductOffer: true }] }
                    }]).toArray()



                    if (Item2[0]) {

                        console.log('ITHINU PRODUCT OFFER UND EE PRODUCT NU ', Item2[0], 'OK');



                        await Item2.map(async (product) => {



                            let ProdName = product.Name
                            console.log('********************************************************************', ProdName, '^^^^^^^^^^^^^^^^^^^^^^^^');
                            proOFF = await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).aggregate([
                                {
                                    $match: { Product: { $regex: ProdName, $options: 'i' } }
                                }]).toArray()
                            console.log('===============', proOFF[0], '================');
                            let proOffPercentage = parseInt(proOFF[0].Discount)

                            console.log('PERCNETAGE OOOOOOOOOOOOOOOOOO', proOffPercentage, 'LLLLL', 'disount', Discount);
                            console.log(Discount);
                            console.log(proOffPercentage);
                            Discount = parseInt(Discount)

                            let BSToFF = proOffPercentage < Discount ? Discount : proOffPercentage
                            let prize = product.OldPrice
                            let offerrate = prize - ((prize * BSToFF) / 100)
                            console.log(`thisis bst off${BSToFF}`);

                            console.log(BSToFF);
                            // let idfPro = product._id + ""
                            // console.log(idfPro);
                            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                                {
                                    _id: objectId(product._id)

                                },
                                {
                                    $set: {
                                        SalePrice: offerrate,
                                        offer: true,
                                        OldPrice: prize,
                                        offerPercentage: parseInt(BSToFF)
                                    }
                                }
                            )


                        })


                    } else {
                        console.log('ITHINU VERE OFFER PRODUCT OFFER ONNULL ATTA ATHOND DOUCUMENTOM ILLA ');
                    }

                    resolve({ Exist: false })
                })
            }
        })
    },

    getCategoryOffer: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CATEGORY_OFFER_COLLECTION).aggregate().toArray().then((response) => {

                resolve(response)
            })


        })

    },
    deleteCategoryOffer: (offId, Category) => {

        return new Promise(async (resolve, reject) => {

            let items = await db.get().collection(collection.PRODUCTS_COLLECTION)
                .aggregate([{
                    $match: { $and: [{ Category: Category }, { ProductOffer: false }] }
                }])
                .toArray()

            await items.map(async (product) => {


                let productPrice = product.OldPrice


                let proId = product._id + ""

                await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                    {
                        _id: objectId(proId)

                    },
                    {
                        $set: {
                            SalePrice: productPrice,
                            offer: false,

                        }
                    })
            })

            let itemforUpdate = await db.get().collection(collection.PRODUCTS_COLLECTION)
                .aggregate([{
                    $match: { $and: [{ Category: Category }, { ProductOffer: true }] }
                }])
                .toArray()

            if (itemforUpdate[0]) {
                await itemforUpdate.map(async (product) => {

                    let proName = product.Name
                    let Off = await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).aggregate([{
                        $match: { Product: { $regex: proName, $options: 'i' } }
                    }]).toArray()

                    let dis = parseInt(Off[0].Discount)
                    let prze = product.OldPrice
                    let offerPrice = prze - ((prze * dis) / 100)

                    db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                        {
                            _id: objectId(product._id)

                        },
                        {
                            $set: {
                                SalePrice: offerPrice,
                                offer: true,
                                OldPrice: prze,
                                offerPercentage: dis,
                                ProductOffer: true
                            }
                        }
                    )


                })
            }

            db.get().collection(collection.CATEGORY_OFFER_COLLECTION).removeOne({ _id: objectId(offId) }).then(async () => {
                resolve()
            })
        })
    },

    //product offer



    createProductOffer: (offer) => {



        return new Promise(async (resolve, reject) => {

            let Pro = offer.Product

            let offerExist = await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).aggregate([
                {
                    $match: { Product: { $regex: Pro, $options: 'i' } }
                }
            ]

            ).toArray()



            if (offerExist[0]) {

                resolve({ Exist: true })
            } else {

                let d
                await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).insertOne(offer).then((data) => {
                    d = data.ops[0].Discount


                })

                let ProName = offer.Product
                productoffer = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
                    {
                        $match: { Name: { $regex: ProName, $options: 'i' } }
                    }
                ]

                ).toArray()

                let comingPercentage = parseInt(d)

                let activepercentege = productoffer[0].offerPercentage


                let bestOff = comingPercentage < activepercentege ? activepercentege : comingPercentage

                if (productoffer[0].offer) {

                    let price = productoffer[0].OldPrice

                    let offerPrice = price - ((price * bestOff) / 100)

                    db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                        {
                            Name: offer.Product
                        },
                        {
                            $set: {
                                OldPrice: price,
                                SalePrice: offerPrice,
                                offerPercentage: bestOff,
                                offer: true,
                                ProductOffer: true
                            }
                        })

                } else {
                    let price = productoffer[0].SalePrice
                    let offerPrice = price - ((price * comingPercentage) / 100)

                    db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                        {
                            Name: offer.Product
                        },
                        {
                            $set: {
                                OldPrice: price,
                                SalePrice: offerPrice,
                                offerPercentage: bestOff,
                                offer: true,
                                ProductOffer: true
                            }
                        })


                }

            }
            resolve({ Exist: false })

        })
    },
    getProductOffer: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_OFFER_COLLECTION).aggregate().toArray().then((response) => {

                resolve(response)
            })


        })

    },

    deleteProOffer: (offId, Product) => {
        return new Promise(async (resolve, reject) => {

            let items = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([{
                $match: { Name: Product }
            }]).toArray()

            console.log('oooooooooooooot', items);

            let productPrice = items[0].OldPrice

            let category = items[0].Category
            let proName = items[0].Name

            let CateofferExist = await db.get().collection(collection.CATEGORY_OFFER_COLLECTION).findOne(
                { Category: category }
            )


            if (CateofferExist) {

                let percentage = parseInt(CateofferExist.Discount)
                console.log(percentage);

                console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
                let price = items[0].OldPrice
                console.log(price);
                let offerPrice = price - ((price * percentage) / 100)
                console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++0++++++++++');
                console.log(offerPrice);
                console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++0');

                db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                    {
                        Name: proName
                    },
                    {
                        $set: {
                            OldPrice: price,
                            SalePrice: offerPrice,
                            offerPercentage: percentage,
                            offer: true,
                            ProductOffer: false
                        }
                    })

                db.get().collection(collection.PRODUCT_OFFER_COLLECTION).removeOne({ _id: objectId(offId) }).then(() => {
                    resolve()
                })
            } else {
                let proId = items[0]._id + ""

                await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                    {
                        _id: objectId(proId)

                    },
                    {
                        $set: {
                            SalePrice: productPrice,
                            offer: false,
                            ProductOffer: false

                        }
                    })


                db.get().collection(collection.PRODUCT_OFFER_COLLECTION).removeOne({ _id: objectId(offId) }).then(() => {
                    resolve()
                })
            }

        })
    },
    CreateCoupon: (coupon) => {
        coupon.appliedUsers = []
        coupon.Discount = parseInt(coupon.Discount)
        console.log('step 2 ########################   ', (coupon));
        return new Promise(async (resolve, reject) => {

            let Exist_cpn = await db.get().collection(collection.COUPON_COLLECTION).findOne(
                {

                    CouponCode: coupon.CouponCode
                }
            )
            if (!Exist_cpn) {
                db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((data) => {
                    resolve({ Exist: false })

                })

            } else {
                console.log('this cpn Exist');
                resolve({ Exist: true })
            }

        })

    },
    getCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).aggregate().toArray()
            console.log('jsdlkjfklsjdkfjsdklfjsjdflsdflksdldkfls', coupons);
            resolve(coupons)
        })

    },
    deleteCoupon: (couponID, CouponCode) => {
        console.log('SEtep 2 dlt coooooopn _id', couponID);
        console.log('SEtep 2 dlt coooooopn cd', CouponCode);
        return new Promise((resolve, reject) => {

            db.get().collection(collection.COUPON_COLLECTION).removeOne({ _id: objectId(couponID) }).then(() => {
                resolve()
            })

        })
    },
    getSalesReportByDate: (date) => {

        let Start = (date.Start)
        let End = date.End
        console.log('this date', Start, End);

        return new Promise(async (resolve, reject) => {

            // db.get().collection(collection.ORDER_COLLECTION).aggregate([
            //     {
            //         $unwind: '$products'
            //     }, {
            //         $lookup:
            //         {
            //             from: collection.PRODUCTS_COLLECTION,    // or products
            //             localField: "products.item",
            //             foreignField: "_id",
            //             as: "orderedProducts.item"
            //         }
            //     }

            // ])



            let report = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { date: { $gte: new Date(Start), $lt: new Date(End) } },
                },
                {
                    $unwind: '$products'
                }, {
                    $lookup:
                    {
                        from: collection.PRODUCTS_COLLECTION,    // or products
                        localField: "products.item",
                        foreignField: "_id",
                        as: "orderedProducts.item"
                    }
                },
                {
                    $sort: { date: -1 }
                }
            ]).toArray()




            resolve(report)







        })



    },
    addBanner: (banner) => {
       
        return new Promise(async (resolve, reject) => {
            let bannerExist = await db.get().collection(collection.BANNER_COLLECTION).findOne({})
            if (bannerExist) {
                await db.get().collection(collection.BANNER_COLLECTION).updateOne({}, {
                    $set: {
                        BannerHedding: banner.BannerHedding,
                        BannerText: banner.BannerText
                    }
                })

                resolve(bannerExist._id)
            } else {
                db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((data) => {

                    resolve(data.ops[0]._id)
                })

            }

        })

    },
    getBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION).aggregate().toArray()
            resolve(banner)

        })
    },
    deleteBrand: (brandId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BANNER_COLLECTION).removeOne({ _id: objectId(brandId) }).then(() => {
                resolve()
            })


        })
    },
    geMonthlyIncome: (month) => {

        return new Promise(async (resolve, reject) => {
            let result
            result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                // {
                //     $unwind:'$products'
                // },
                // {$match: {'products.productStatus':'Delivered'}}
            ]).toArray()

            for (x of result) {
                x.date = moment(x.date).format('l')
            }
           

            if (result) {
                console.log('&&&&&&&&&&&&@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@22@@@@@@@@666',result[0].price,'0000000000000000008Incm');
            
                let count = '' + month

                let ha
                let text

                var total = 0

                for (i = 0; i < result.length; i++) {
                    ha = result[i].date.slice(1, 9);

                    text = count.concat(ha);

                    if (result[i].date === text) {

                        total += result[i].price[0].total
                      
                    } else {
                        total = 0
                    }

                }
              
                resolve(total)

            } else {
                resolve()
            }

        })
    },

    getMonthlyExpense: (month) => {
        return new Promise(async (resolve, reject) => {
            let result
            result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                // {
                //     $unwind:'$products'
                // },
                // {$match: {'products.productStatus':'Delivered'}},

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
                        date: 1, Expense: { $sum: { $multiply: ['$products.quantity', '$product.LandingCost'] } }
                    }

                },



                
            ]).toArray()

            for (x of result) {
                x.date = moment(x.date).format('l')
            }

          

            if (result) {


                let count = '' + month

                let ha
                let text

                var total = 0
                for (i = 0; i < result.length; i++) {
                    ha = result[i].date.slice(1, 9);

                    text = count.concat(ha);

                    if (result[i].date === text) {
                        total += result[i].Expense
                    } else {
                        total = 0
                    }

                }
                // console.log('&&&&&&&&&&&&^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6666',total,'0000000000000000008Exp');
                resolve(total)

            } else {
                resolve()
            }

        })
    },
    getMonthlySale: () => {
        var today = new Date()

        today = moment(today.date).format('L')

        return new Promise(async (resolve, reject) => {
            result = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
               
                // {
                //     $unwind:'$products'
                // },
                // {$match: {'products.productStatus':'Delivered'}},
                {

                    $project: {
                        date: 1, price: 1
                    }

                }


            ]).toArray()

            if (result) {
                for (x of result) {
                    x.date = moment(x.date).format('L')
                }


                console.log(result[0]);

                let MonthlySale = 0
                let twoLetDbMonth

                for (i = 0; i < result.length; i++) {
                    twoLetDbMonth = result[i].date.slice(0, 2);

                    if (twoLetDbMonth == twoLetDbMonth) {
                        MonthlySale += result[i].price[0].total

                    }





                }
                console.log(MonthlySale);
                resolve(MonthlySale)

            } else {
                resolve(000000)
            }
        })

    },
    getTotalProducts: () => {


        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate().toArray()


            var totalProd = 0
            var soldprod = 0
            for (i = 0; i < products.length; i++) {

                totalProd += products[i].totalProducts + products[i].soldProduct
                soldprod += products[i].soldProduct
            }

            resolve({ totalProd: totalProd, soldprod: soldprod })

        })

    },
    getTopSellingBrand: () => {
        return new Promise(async (resolve, reject) => {
           
            let result = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
                {
                    "$group": {
                        "_id": "$Brand",
                        "total": {
                            "$sum": "$soldProduct"
                        }
                    },

                },
                {
                    "$sort": {
                        "total": -1.0
                    }
                },
                { $limit: 5 }

            ]).toArray()


            var topBrands = []
            var brandsCount = []
           
            await result.map(async (product) => {
                topBrands.push(product._id)
                brandsCount.push(product.total)

            })
            // console.log(topBrands);
            // console.log(brandsCount);

            resolve({ topBrands: topBrands, brandsCount: brandsCount })




        })
    },
    getTopSellingProducts: () => {
        console.log('HELLO THIS I STOOP SELLIJG JSFHSKUDHFN');
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
                {
                    "$sort": {
                        "soldProduct": -1.0
                    }
                },
                { $limit: 5 }
            ]).toArray()
            var topProducts = []
            var ProductsCount = []
           
            await result.map(async (product) => {
                topProducts.push(product.Name)
                ProductsCount.push(product.soldProduct)

            })
            console.log(topProducts);
            console.log(ProductsCount);
            resolve({topProducts:topProducts,ProductsCount:ProductsCount})
        })

    },
    getRecentOrder:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind:"$products"
                },
                {
                    $lookup: {
                        from: collection.USER_COLLECION,
                        localField: 'user',
                        foreignField: '_id',
                        as: 'User'

                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCTS_COLLECTION,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'product'

                    }
                }
                ,
                {
                    "$sort": {
                        "date": -1.0
                    }
                },
                {
                    $limit:6
                }

            ]).toArray()
          
           resolve(orders)
        })
    }


}


