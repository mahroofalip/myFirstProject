var express = require('express');
const { response, render, set } = require('../app');
const prductHelpers = require('../helpers/prduct-helpers');
var router = express.Router();
var productsHelpers = require('../helpers/prduct-helpers')
var userHelper = require('../helpers/user-helpers');
const { route } = require('./users');
const moment = require('moment')
// const multer = require('multer');
const path = require('path');
const { ifError, rejects } = require('assert');
const { runInNewContext } = require('vm');
const Admin = require('mongodb/lib/admin');
const { resolve } = require('path');
var formidable = require('formidable');
var fs = require('fs');
const { TrunkInstance } = require('twilio/lib/rest/trunking/v1/trunk');
require('dotenv').config();
const AWS = require('aws-sdk')

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ID,
	secretAccessKey: process.env.AWS_SECRET
})



/* GET users listing. */




const varifyLogin = (req, res, next) => {
	if (req.session.admin) {
		next()
	} else {
		res.redirect('/admin')
	}
}



router.get('/', function (req, res, next) {

	let validErr = req.session.validErr
	req.session.validErr = null
	let passwordErr = req.session.passwordErr
	req.session.passwordErr = null

	if (req.session.admin) {
		res.redirect('/admin/gethome')
	} else {
		res.render('admin/login', { validErr: validErr, passwordErr: passwordErr, admin: true })
	}
});


// Admin signup

// router.get('/signup', (req, res) => {
// 	let matchErr = req.session.adminPasswordMatchErr
// 	req.session.adminPasswordMatchErr = null
// 	let existErr = req.session.existErr
// 	req.session.existErr = null



// 	res.render("admin/admin-signup", { matchErr: matchErr, existErr: existErr })
// })

router.get('/gethome',varifyLogin, async (req, res) => {

	let admin = req.session.admin
    
	console.log("thsi is info to dashboad admin");
	let recentOrders = await productsHelpers.getRecentOrder()
	
	res.render('admin/admin-dashboard', { recentOrders, admin, admin: true })
})

router.post('/gethome', (req, res) => {

	if (req.body.Password === req.body.confirmPassword) {

		productsHelpers.doAdminSignup(req.body).then((response) => {
			console.log("responsr from database");
			if (response.exist) {
				req.session.existErr = "You are already Exist"
				res.redirect('/admin/signup')
			} else {

				console.log(response);
				req.session.admin = response
				res.redirect('/admin/gethome')
			}



		})


	} else {

		req.session.adminPasswordMatchErr = "The Password Confirmation Does Not Match"
		res.redirect('/admin/signup')

	}

})




router.post('/admin-login', async (req, res) => {
	const admindata = req.body
	console.log(admindata);

	await productsHelpers.doCheckAdmin(admindata).then((response) => {
		console.log("admin.js");
		console.log(response);
		console.log("end");
		if (response.isNotAdmin) {

			req.session.validErr = "invalid admin"
			res.redirect('/admin')
		} else {

			productsHelpers.adminDoLogin(admindata).then((response) => {

				if (response.passwordFasle) {
					req.session.passwordErr = "Password is incorrect"
					res.redirect('/admin')
				} else {
					console.log(response);
					req.session.admin = response.admin

					res.redirect('/admin/gethome')
				}


			})
		}

	})

})


// addproduct section start

router.get('/add-products', varifyLogin, async function (req, res) {
	await productsHelpers.getCategory().then(async (response) => {
		console.log(response);
		await productsHelpers.getBrands().then((brands) => {
			console.log(brands);
			res.render('admin/add-products', { categories: response, brands, admin: true })
		})

	})
})






//Adding products

router.post('/add-products', varifyLogin, (req, res) => {


	productsHelpers.addProduct(req.body).then((id) => {
		console.log(req.files);

		let Image1 = req.files.image1
		let Image2 = req.files.image2
		let Image3 = req.files.image3
		let Image4 = req.files.image4

		//adding the four images of products

		//IMFG1
		let params1 = {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: id + '11.jpg',
			Body: Image1.data
		}

		s3.upload(params1, (err, data) => {
			if (err) {

				console.log(err, 'Profile Uplad Err  :1');
			} else {

				console.log(data, 'IMAGE ONE SUCCESSFULLY UPLOADED');
				//IMG2
				let params2 = {
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: id + '22.jpg',
					Body: Image2.data
				}

				s3.upload(params2, (err, data) => {
					if (err) {

						console.log(err, 'Profile Uplad Err  :2');
					} else {

						console.log(data, 'IMAGE TWO SUCCESSFULLY UPLOADED');

						//IMG3
						let params3 = {
							Bucket: process.env.AWS_BUCKET_NAME,
							Key: id + '33.jpg',
							Body: Image3.data
						}

						s3.upload(params3, (err, data) => {
							if (err) {

								console.log(err, 'Profile Uplad Err  :3');
							} else {

								console.log(data, 'IMAGE THREE SUCCESSFULLY UPLOADED');
								//IMG4
								let params4 = {
									Bucket: process.env.AWS_BUCKET_NAME,
									Key: id + '44.jpg',
									Body: Image4.data
								}

								s3.upload(params4, (err, data) => {
									if (err) {

										console.log(err, 'Profile Uplad Err  :4');
									} else {

										console.log(data, 'IMAGE FOUR SUCCESSFULLY UPLOADED');
									}
									res.redirect('/admin/product-list')
								})

							}

						})
					}

				})



			}

		})


		// Image1.mv('./public/product-images/' + id + '11.jpg', (err1, done) => {

		// 	if (!err1) {
		// 		Image2.mv('./public/product-images/' + id + '22.jpg', (err2, done) => {
		// 			if (!err2) {
		// 				Image3.mv('./public/product-images/' + id + '33.jpg', (err3, done) => {
		// 					if (!err3) {
		// 						Image4.mv('./public/product-images/' + id + '44.jpg', (err4, done) => {
		// 							if (!err4) {
		// 								res.redirect('/admin/product-list')
		// 							}
		// 						})
		// 					}
		// 				})
		// 			}
		// 		})
		// 	}

		// })
	})

})




router.get('/view-users', varifyLogin, function (req, res) {

	productsHelpers.getAllUsers().then((response) => {
		let users = response
		console.log(users)

		res.render('admin/view-users', { admin: true, users })
	})
});




router.get('/delete-user/:id', varifyLogin, (req, res) => {
	let userId = req.params.id
	console.log(userId)
	productsHelpers.deleteUsers(userId).then((response) => {
		res.redirect('/admin/view-users')

	})
})




router.post('/delete-product', varifyLogin, (req, res) => {
	

	let product = req.body

	productsHelpers.deleteProducts(product.proId).then((response) => {
		res.redirect('/admin/product-list')

	})
})



router.get('/edit-product/:id', varifyLogin, async (req, res) => {
	let Featured = false
	let TopSelling = false
	let Latest = false
	let OtherSale = false

	let product = await prductHelpers.getProductDetails(req.params.id)
	if (product.SaleType == "Featured") {
		Featured = true
	} else if (product.SaleType == "Latest") {
		Latest = true
	} else if (product.SaleType == "TopSelling") {
		TopSelling = true
	} else if (product.SaleType == "Normal") {
		OtherSale = true
	}

	let response = await productsHelpers.getCategory()
	let category = await productsHelpers.getCategory()
	let Brands = await productsHelpers.getBrands()
	await productsHelpers.getCategory(req.params.id)
	let Brand = await productsHelpers.getBrands()

	res.render('admin/edit-product', { Brand, product, category, Brands, Featured, TopSelling, Latest, OtherSale, categories: response })



})

router.post('/edit-products', varifyLogin, async (req, res) => {

	await productsHelpers.updateProducts(req.body.productId, req.body).then((id) => {

		if (req.files) {
			var Image1 = req.files.image1
			var Image2 = req.files.image2
			var Image3 = req.files.image3
			var Image4 = req.files.image4

			//adding the four images of products



			if (Image1) {
			
				let params1 = {
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: id + '11.jpg',
					Body: Image1.data
				}

				s3.upload(params1, async (err, data) => {
					if (err) {

						console.log(err, 'Profile Uplad Err  :1');
					} else {

						console.log(data, 'IMAGE 1 SUCCESSFULLY UPLOADED');
					}

				})



			}

			//  if 2 image 

			if (Image2) {
			
				let params2 = {
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: id + '22.jpg',
					Body: Image2.data
				}

				s3.upload(params2, async (err, data) => {
					if (err) {

						console.log(err, 'Profile Uplad Err  :2');
					} else {

						console.log(data, 'IMAGE 2 SUCCESSFULLY UPLOADED');
					}

				})


			}



			if (Image3) {
			
				let params2 = {
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: id + '33.jpg',
					Body: Image2.data
				}

				s3.upload(params2, async (err, data) => {
					if (err) {

						console.log(err, 'Profile Uplad Err  :3');
					} else {

						console.log(data, 'IMAGE 3 SUCCESSFULLY UPLOADED');
					}

				})

			}




			if (Image4) {
				let params4 = {
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: id + '44.jpg',
					Body: Image4.data
				}

				s3.upload(params4, async (err, data) => {
					if (err) {

						console.log(err, 'Profile Uplad Err  :4');
					} else {

						console.log(data, 'IMAGE 4 SUCCESSFULLY UPLOADED');
					}

				})


			}


		}



	})

	setTimeout(() => {
		res.redirect('/admin/product-list')
	}, 3000)




})


router.get('/product-list', varifyLogin, (req, res) => {
	productsHelpers.getAllProducts().then(async (products) => {

		await products.map((product) => {

			if (product.totalProducts < 10) {

				product.stock = 'Low Stock'
			} else if (product.totalProducts === 0) {
				product.stock = 'Out Of Stock'
			} else {
				product.stock = 'In Stock'
			}
		})

	
		res.render('admin/prouct-list', { admin: true, products })
	})
})


router.post('/enable-user', varifyLogin, (req, res) => {
	userHelper.enableUser(req.body.userId).then((response) => {
		res.json()
	})
})


router.post('/disable-user', varifyLogin, (req, res) => {
	userHelper.disableUser(req.body.userId).then((response) => {
		res.json()
	})
})


router.get('/category-mngt', varifyLogin, async (req, res) => {
	let Category = await productsHelpers.getAllcatetory()
	let CatErr = req.session.CategoryExist
	req.session.CategoryExist = null
	let oneCategory = await productsHelpers.getOneCategory(req.params.id)

	res.render('admin/categorymngt', { Category, CatErr, oneCategory, admin: true })
})

router.get('/getCategory', async (req, res) => {
	let Category = await productsHelpers.getAllcatetory()

	res.json(Category)
})

router.post('/category-mngt', varifyLogin, (req, res) => {

	productsHelpers.addCategory(req.body).then((response) => {
		if (response) {
			req.session.CategoryExist = "This Category Already Exist"
			res.redirect('/admin/category-mngt')
		} else {
			res.redirect('/admin/category-mngt')
		}

	})


})



router.get('/brandmngt', varifyLogin, async (req, res) => {
	let BrandErr = req.session.brandErr
	req.session.brandErr = null
	let Brands = await productsHelpers.getBrands()

	res.render('admin/Brandmngt', { BrandErr, Brands, admin: true })
})

router.post('/brandmngt', varifyLogin, (req, res) => {

	productsHelpers.addBrand(req.body).then((response) => {
		if (response) {
			req.session.brandErr = "This brand Exist"
			res.redirect('/admin/brandmngt')
		} else {
			res.redirect('/admin/brandmngt')
		}
	})

})

//delet category and brand section

router.post('/deleteBrand', (req, res) => {
	console.log('this is delete brand');
	console.log(req.body);
	productsHelpers.deleteBrand(req.body.brndId).then(() => {
		res.redirect('/admin/brandmngt')
	})

})



router.post('/deleteCategory', (req, res) => {
	console.log('category delete');
	console.log(req.body);
	productsHelpers.deleteCategory(req.body.cateId).then(() => {
		res.redirect('/admin/category-mngt')
	}
	)

})
//delete category and brand section end

//edit brand and category section routes
router.post('/editBrand', (req, res) => {

	productsHelpers.getOneBrand(req.body.brandId).then((brand) => {


		res.json(brand)
	})

})



router.post('/brand-edit', (req, res) => {
	console.log('thisi  sreq body edit prolsjfskjfksuj');
	console.log(req.body);
	productsHelpers.editBrand(req.body.id, req.body.brand).then(() => {
		res.redirect('/admin/brandmngt')
	})
})






router.post('/category-edit', (req, res) => {
	console.log(req.body);

	productsHelpers.editCategory(req.body.id, req.body.CategoryName).then(() => {
		res.redirect('/admin/category-mngt')
	})
})


router.post('/editCategory', (req, res) => {

	productsHelpers.getOneCategory(req.body.cateId).then((category) => {
		// console.log("THISI S ONE CATEGORY                   "+category.CategoryName);

		res.json(category)
	})

})

//edit brand and category section routes end

router.get('/order-mngt',varifyLogin, async (req, res) => {

	let orders = await productsHelpers.getAllOrders()

	for (x of orders) {
		x.date = moment(x.date).format('lll')
	}


	res.render('admin/order-mngt', { orders, admin: true })
})


router.post('/changeStatus', (req, res) => {

	productsHelpers.changeStatus(req.body).then((status) => {
		res.json()
	})
})

router.get('/offer-mngt',varifyLogin, async (req, res) => {
	let Category = await userHelper.getCategory()
	let CategoryOffers = await productsHelpers.getCategoryOffer()

	for (x of CategoryOffers) {
		x.Validity = moment(x.Validity).format('lll')
	}

	res.render('admin/offer-mmgt', { Category, CategoryOffers })
})

router.post('/category-offer', (req, res) => {
	console.log("new Added offers detais     ", req.body);
	productsHelpers.createCategoryOffer(req.body).then((offer) => {

		res.json(offer)

	})
})

router.post('/deleteCateOffer', (req, res) => {
	console.log("THISIS CATEGORY ID", req.body);
	productsHelpers.deleteCategoryOffer(req.body.offId, req.body.Category).then(() => {
		res.redirect('/admin/offer-mngt')
	})
})






router.post('/deleteProOffer', (req, res) => {
	console.log("THISIS CATEGORY ID", req.body);
	productsHelpers.deleteProOffer(req.body.offId, req.body.Product).then(() => {
		res.redirect('/admin/product-offer')
	})
})


router.get('/product-offer',varifyLogin, async (req, res) => {

	let products = await productsHelpers.getAllProducts()
	let productOff = await productsHelpers.getProductOffer()
	// console.log('AFJSLFLSLFJLSLFSLFKSFLSKDFLSKFSDKFS;FKS;F',products,'OKOKOK');

	res.render('admin/product-offer', { products, productOff })
})
router.post('/product-offer', (req, res) => {

	productsHelpers.createProductOffer(req.body).then((offer) => {

		res.json(offer)

	})
	//
})

// coupon started

router.get('/coupon-mngt',varifyLogin, async (req, res) => {
	let Coupons = await productsHelpers.getCoupons()
	res.render('admin/coupon-mngt', { Coupons })
})


router.post('/Coupon', (req, res) => {

	productsHelpers.CreateCoupon(req.body).then((data) => {
		if (data.Exist) {
			res.json({ Exist: true })
		} else {
			res.json({ Exist: false })
		}
	})
})

router.post('/deleteCoupon', (req, res) => {

	productsHelpers.deleteCoupon(req.body.cnp_id, req.body.Cpncode).then(() => {
		res.redirect('/admin/coupon-mngt')
	})
})

// cpn end


// report start

router.get('/stockReport',varifyLogin, async (req, res) => {

	let products = await productsHelpers.getAllProducts()


	res.render('admin/Stock-reptort', { products })


})


router.get('/Sales-report',varifyLogin, async (req, res) => {
	let orders = await productsHelpers.getAllOrders()
	console.log(orders[0].orderedProducts);


	for (x of orders) {
		x.date = moment(x.date).format('lll')
	}



	res.render('admin/Sales-report', { orders })
})


router.get('/user-report',varifyLogin, async (req, res) => {
	let orders = await productsHelpers.getAllOrders()
	for (x of orders) {
		x.date = moment(x.date).format('lll')
	}
	console.log('THIOS I S SJFSJLFS', orders);
	res.render('admin/user-report', { orders })
})

router.post('/salesReportByDate', async (req, res) => {
	console.log('SALES REPORT WITH DATE', req.body, 'ok')
	let data = await productsHelpers.getSalesReportByDate(req.body)
	for (x of data) {
		x.date = moment(x.date).format('lll')
	}
	let dts = req.body.Start
	let dte = req.body.End
	res.render('admin/filterd-salereport', { data, dts, dte })
})
//report end


//banner
router.get('/banner-mngt',varifyLogin, async (req, res) => {
	let banner = await productsHelpers.getBanner()
	console.log('thisis baner fjskfjks', banner);
	res.render('admin/banner-mngt', { banner })
})


router.post('/add-banner', (req, res) => {
	console.log(req.body);
	console.log(req.files);
	productsHelpers.addBanner(req.body).then((id) => {
		if (req.files) {

			var Image = req.files.image1
			if (Image) {




				let params = {
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: id + 'bnr.jpg',
					Body: Image.data
				}
				s3.upload(params, (err, data) => {
					if (err) {

						console.log(err, 'Profile Uplad Err');
					} else {

						
					}

				})


				res.redirect('/admin/banner-mngt')

			} else {
				console.log('No banner');

			}

		} else {
			res.redirect('/admin/banner-mngt')
		}



	
	})
})


router.post('/deleteBanner', (req, res) => {
	console.log(req.body.id);
	productsHelpers.deleteBrand(req.body.id).then(() => {
		res.redirect('/admin/banner-mngt')
	}
	)
})

router.get('/getIncome', async (req, res) => {

	let income = [];
	for (var i = 1; i <= 12; i++) {

		income.push(await productsHelpers.geMonthlyIncome(i))
	}
	
	res.json(income)


})

router.get('/getExpense', async (req, res) => {

	let Expense = [];

	for (var i = 1; i <= 12; i++) {

		Expense.push(await productsHelpers.getMonthlyExpense(i))
	}


	res.json(Expense)
})


router.get('/salesOnThisMonth', async (req, res) => {

	var MonthlySale = await productsHelpers.getMonthlySale()
	res.json(MonthlySale)

})

let totRav

router.get('/salesOnThisYear', async (req, res) => {

	let income = [];
	for (var i = 1; i <= 12; i++) {

		income.push(await productsHelpers.geMonthlyIncome(i))
	}



	const initialValue = 0;
	const sumWithInitial = income.reduce(
		(previousValue, currentValue) => previousValue + currentValue,
		initialValue
	);


	totRav = sumWithInitial
	res.json(sumWithInitial)
})







router.get('/totalProfit', async (req, res) => {




	let Expense = [];

	for (var i = 1; i <= 12; i++) {

		Expense.push(await productsHelpers.getMonthlyExpense(i))
	}


	const initialValue = 0;
	const sumWithInitial = Expense.reduce(
		(previousValue, currentValue) => previousValue + currentValue,
		initialValue
	);


	let Profit = totRav - sumWithInitial
	res.json(Profit)


})


// total products
router.get('/totalProducts', async (req, res) => {

	let response = await productsHelpers.getTotalProducts()

	res.json(response)
})


router.get('/totalUsers', async (req, res) => {
	let count
	let totalUsers = await productsHelpers.getAllUsers()
	count = totalUsers.length
	res.json(count)



})


router.get('/topSellignBrand', async (req, res) => {

	let topselling = await productsHelpers.getTopSellingBrand()
	res.json(topselling)
})


router.get('/topSellignProducts', async (req, res) => {

	let topsellingPro = await productsHelpers.getTopSellingProducts()
	res.json(topsellingPro)
})


router.get('/logout', (req, res) => {
	req.session.admin = null
	res.redirect('/admin')
})

module.exports = router;







































