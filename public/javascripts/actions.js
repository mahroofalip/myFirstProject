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





