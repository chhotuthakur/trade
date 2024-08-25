function exit_scrip_trade_form(scrip_id) {
    exit_scrip_trade = 0;
    $("#content").load("html/exit-scrip-trade.html", function (response, status, http)
    {
        if (status == "success")
        {
            window.location.hash = "exit_scrip_trade_form('" + scrip_id + "')";
            fetch_scrip_trade_details(scrip_id);
        }
    });
}

function fetch_scrip_trade_details(scrip_id, retried) {
    if (typeof retried == 'undefined') {
        current_exit_id = null;
        current_exit_scrip_id = scrip_id;
    }
    if (current_exit_scrip_id != scrip_id)
        return;
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {scrip_id: scrip_id, userid: userid, security_code: security_code},
        url: url + "scrip-trade-details.php",
        timeout: 5000,
        success: function (res) {
            var data = res.data;
            var scrip_id = data.scrip_id;
            current_scrip = scrip_id;
            var order_type = data.order_type;
            var profit_loss = data.profit_loss;
            if (document.getElementById("order_form_scrip_id"))
                document.getElementById("order_form_scrip_id").innerHTML = scrip_id;
            if (profit_loss > 0) {
                $("#exit_button").removeClass("red_bg");
                $("#exit_button").addClass("green_bg");
                if (document.getElementById("exit_profit_loss"))
                    document.getElementById("exit_profit_loss").innerHTML = " profit of " + profit_loss;
            } else {
                $("#exit_button").removeClass("green_bg");
                $("#exit_button").addClass("red_bg");
                if (document.getElementById("exit_profit_loss"))
                    document.getElementById("exit_profit_loss").innerHTML = " loss of " + profit_loss;
            }
            if (document.getElementById("exit_order_type"))
                document.getElementById("exit_order_type").innerHTML = order_type;
            $("#exit_button").attr("onclick", "close_scrip_trade(\'" + scrip_id + "\')");
            scrip_details(scrip_id);
            if (exit_scrip_trade != 1) {
                setTimeout(function () {
                    fetch_scrip_trade_details(scrip_id, true);
                }, 2000);
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                fetch_scrip_trade_details(scrip_id, true);
            }, 1000);
        }
    });
}

function close_scrip_trade(scrip_id) {
    exit_scrip_trade = 1;
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code, scrip_id: scrip_id},
        url: url + "close-scrip-trades.php",
        timeout: 5000,
        success: function (res) {
            if (res.success == 0) {
                document.getElementById("order_image").innerHTML = '<img src="img/failed.png">';
                document.getElementById("order_success_title").innerHTML = "Failed";
                document.getElementById("order_message").innerHTML = res.message;
                document.getElementById("success_modal").style.display = "flex";
            }
            if (res.success == 1) {
                document.getElementById("order_image").innerHTML = '<img src="img/checked.gif">';
                document.getElementById("order_success_title").innerHTML = "Success";
                if (res.type == 1)
                    var txn = "Sold";
                else
                    var txn = "Bought";
                document.getElementById("order_message").innerHTML = txn + ' ' + res.lots + ' lots of <span>' + res.scrip_id + '</span> AT ' + res.price;
                $("#order_modal_action").attr("onclick", "portfolio(); order_modal_hide();");
                document.getElementById("success_modal").style.display = "flex";
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                close_scrip_trade(scrip_id);
            }, 1000);
        }
    });
}

var exit_scrip_trade = 0;
var current_exit_scrip_id = null