$('.category_change').change(function () {
    var categoryId = $(this).val();
    // console.log(categoryId);
    $.ajax({
        type: "GET",
        url: '/admin/getbrands/' + categoryId,
        dataType: "json",
        success: function (response) {
            let htmlStr
            // let htmlStr = '<option value="">Select Brand</option>';
            for (var i=0; i< response.length;i++){
                htmlStr += `<option value="${response[i]}">${response[i]}</option>`
            }
            $('.category_brand').html(htmlStr)
        },
        error: function (response) {
            console.log(response);
        }
    });
})








// const Category = document.getElementById('CatgoryWithBrand')
// const B =document.getElementsByClassName('Brand')
// let brand
// let brnd
// getCategory()
// async function getCategory() {
//     brnd = await fetch("http://localhost:3000/admin/getCategory", {

//         headers: {
//             "Content-Type": "application/json"
//         }
//     })
//     brand = await brnd.json()
//     console.log("hello")
//     console.log(brand)
//     for (let i = 0; i < brand.length; i++) {

//         Category.innerHTML += `  
// <tbody >
// <tr >

// <td>1</td>
// <td>${brand[i].CategoryName}</td>
// <td>
// <a class="btn btn-success" href=""> Edit </a>

// <a class="btn btn-danger" href="">Delete</a>
// </td>
// <td>
// <h5 style="display: inline; 
// ">Brands in <span
//     style="margin-left: 5px;">${brand[i].CategoryName}</span>
// </h5>
// <div class="Brand">

// </div>



// </td>

// </tr>

// </tbody>

//                                 `
// for (let j = 0; j < brand[i].SubCategory.length; j++){

// B[j].innerHTML+=`
// <span style="display: block; margin-top: 10px;">
// <span style="margin-right: 10px;">
//     ${brand[j].SubCategory[j]}</span> <a style="margin-right: 10px;" href=""
//     class="btn btn-success">Edit</a> <a class="btn btn-danger" href="">Delete</a> </span>`
// }


// }




  
// //  ${brand[i].SubCategory[i]}
//     console.log("hello")
// }