
function contact_us_form() {
    screen = "contact";
    $("#content").load("html/contact-us.html", function (response, status, http)
    {
        if (status == "success")
        {
            window.location.hash = "contact_us_form()";
        }
    });
}

function submit_enquiry() {
    var fullname = document.getElementById("fullname").value;
    var phone_number = document.getElementById("phone_number").value;
    var message = document.getElementById("message").value;
    $.ajax({
        type: "POST",
        data: {fullname: fullname, phone_number: phone_number, message: message},
        url: url + "submit-enquiry.php",
        timeout:5000,
        success: function (res) {
            if (res.success == 1) {
                document.getElementById("enquiry_err").innerHTML = "Enquiry successfully submitted";
                document.getElementById("enquiry_form").reset();
            } else
                document.getElementById("enquiry_err").innerHTML = res.message;
        },
        error: function (request, status, err) {
            setTimeout(function () {
                submit_enquiry();
            }, 1000);
        }
    });
}