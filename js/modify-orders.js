function open_modify_order_form(id,scrip_id,price,units,order_type) {
    current_scrip = scrip_id;
    $("#content").load("html/modify-order-form.html?v=3", function (response, status, http)
    {
        if (status == "success")
        {
            window.location.hash = "open_modify_order_form('" + scrip_id + "')";
            document.getElementById("order_form_scrip_id").innerHTML = scrip_id;
            document.getElementById("order_scrip_id").value = scrip_id;
            document.getElementById("order_id").value = id;
            document.getElementById("lot").value = units;
            document.getElementById("price").value = price;
            if(order_type=="Bought")
                document.getElementById("modify_sell_button").style.display="none";
            else
                document.getElementById("modify_buy_button").style.display="none";
            $('.sell_btn').prop('disabled', false);
            scrip_details(scrip_id);
        }
    });
}

function modify_order(type) {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    var order_id = document.getElementById("order_id").value;
    var order_type = document.getElementById("order_type").value;
    var scrip_id = document.getElementById("order_scrip_id").value;
    var price = document.getElementById("price").value;
    var lot = document.getElementById("lot").value;
    var scrip_qty_type = "mega";
    if(document.getElementById("mini").checked)
        scrip_qty_type = "mini";
    if (lot == "") {
        document.getElementById("order_err").innerHTML = "Please enter no. of lots/quantity";
        return;
    } else if (isNaN(lot)) {
        document.getElementById("order_err").innerHTML = "Please enter correct lot value";
        return;
    }
    if (order_type == "limit_order") {
        if (price == "") {
            document.getElementById("order_err").innerHTML = "Please enter price";
            return;
        } else if (isNaN(price)) {
            document.getElementById("order_err").innerHTML = "Please enter correct price value";
            return;
        }
    } else {
        document.getElementById("price").value = "";
        price = "";
    }
    $('.sell_btn').prop('disabled', true);
    $.ajax({
        type: "POST",
        data: {order_type: order_type, txn_type: type, scrip_id: scrip_id, price: price, userid: userid, security_code: security_code, lot: lot, scrip_qty_type: scrip_qty_type, order_id:order_id},
        url: url + "modify-order.php",
        timeout: 5000,
        success: function (res) {
            if (res.success == 0) {
                document.getElementById("order_image").innerHTML = '<img src="img/failed.png">';
                document.getElementById("order_success_title").innerHTML = "Failed";
                document.getElementById("order_message").innerHTML = res.message;
                document.getElementById("success_modal").style.display = "flex";
                $('.sell_btn').prop('disabled', false);
            }
            if (res.success == 1) {
                document.getElementById("order_image").innerHTML = '<img src="img/checked.gif">';
                document.getElementById("order_success_title").innerHTML = "Success";
                if (type == 1)
                    var txn = "Sold";
                else
                    var txn = "Bought";
                if (order_type == "limit_order") {
                    document.getElementById("order_message").innerHTML = res.message;
                    $("#order_modal_action").attr("onclick", "trades('Open',0); order_modal_hide();");
                } else {
                    document.getElementById("order_message").innerHTML = txn + ' ' + lot + ' lots of <span>' + scrip_id + '</span> AT ' + res.price;
                    $("#order_modal_action").attr("onclick", "trades('Open',1); order_modal_hide();");
                }
                document.getElementById("success_modal").style.display = "flex";
                $('.sell_btn').prop('disabled', false);
            }
        },
        error: function (request, status, err) {
            document.getElementById("order_message").innerHTML = "The Server didn't respond on time. Please check trades before re-ordering";
            if (order_type == "limit_order") {
                $("#order_modal_action").attr("onclick", "trades('Open',0); order_modal_hide();");
            } else {
                $("#order_modal_action").attr("onclick", "trades('Open',1); order_modal_hide();");
            }
            document.getElementById("order_image").innerHTML = '<img src="img/failed.png">';
            document.getElementById("order_success_title").innerHTML = "Error";
            document.getElementById("success_modal").style.display = "flex";
        }
    });
}