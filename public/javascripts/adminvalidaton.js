$(document).ready(function () {
    $("#adminsignup").validate({
       
        rules: {

            Name: {
                required: true,
                minlength: 2,
                normalizer: function (value) {
                    return $.trim(value);
                }
            },
            Email: {
                required: true,
                email: true,
                normalizer: function (value) {
                    return $.trim(value);
                }
            },
            Phone: {
                required: true,
                number: true,
                normalizer: function (value) {
                    return $.trim(value);
                }


            },
            Password: {
                required: true,
                normalizer: function (value) {
                    return $.trim(value);
                }

            },
            confirmPassword:{
                required: true,
                normalizer: function (value) {
                    return $.trim(value);
                }
            }


        }
    })

});
