

(async function () {

    const response = await fetch("/admin/getIncomeExp",)


    let income = await response.json()
    const response2 = await fetch('/admin/getExpense')
    let expense = await response2.json()


    $("#bar-chart").length && (a = document.getElementById("bar-chart").getContext("2d"),
        new Chart(a, {
            type: "bar", data: {
                labels: ["Jan", "Feb", "March", "April", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"],
                datasets: [{ label: "Expense", data: expense, backgroundColor: "#6900ff" },
                { label: "Revenue", data: income, backgroundColor: "#20bf6b" }]
            }
        }))

        const brand = await fetch("/admin/topSellignBrand",)
        let topbrand = await brand.json()
       
        let Brands=topbrand.topBrands
        let brandsCount=topbrand.brandsCount
        $("#topSallingBrand").length && (a = document.getElementById("topSallingBrand").getContext("2d"),
        new Chart(a, {
            type: "doughnut", data: {
                labels: Brands, datasets: [{
                    backgroundColor: ["#8854d0", "#20bf6b", "#eb3b5a", "#4b6584","#54add0"],
                    data: brandsCount
                }]
            }
        }))
        let Products = await fetch("/admin/topSellignProducts",)
              Products =await Products.json()
              console.log(Products)
              let Pro=Products.topProducts
              let proC=Products.ProductsCount
        $("#topSellingCategory").length && (a = document.getElementById("topSellingCategory").getContext("2d"),
        new Chart(a, {
            type: "doughnut", data: {
                labels: Pro, datasets: [{
                    backgroundColor: ["#8854d0", "#20bf6b", "#eb3b5a", "#4b6584","#8854d0"],
                    data:proC
                }]
            }
        }))



})();

// console.log('THIS IS SFSJF',income);
