
function open_order_form(scrip_id) {
    current_scrip = scrip_id;
    $("#content").load("html/order-form.html?v=1", function (response, status, http)
    {
        if (status == "success")
        {
            window.location.hash = "open_order_form('" + scrip_id + "')";
            document.getElementById("order_form_scrip_id").innerHTML = scrip_id;
            document.getElementById("order_scrip_id").value = scrip_id;
            $('.sell_btn').prop('disabled', false);
            scrip_details(scrip_id);
        }
    });
}

function scrip_details(scrip_id) {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    $.ajax({
        type: "POST",
        data: {scrip_id: scrip_id, userid: userid},
        url: url + "scrip-details.php",
        timeout: 5000,
        success: function (res) {
            clearTimeout(scrip_details_timer);
            if(res.Symbol != current_scrip)
                return;
            if (document.getElementById("order_bid_price"))
                document.getElementById("order_bid_price").innerHTML = res.Bid;
            if (document.getElementById("order_ask_price"))
                document.getElementById("order_ask_price").innerHTML = res.Ask;
            if (document.getElementById("quantity_lot"))
                document.getElementById("quantity_lot").innerHTML = res.trade_qty_type;
            if (res.trade_qty_type == "Quantity") {
                if (document.getElementById("lot"))
                    document.getElementById("lot").value = 1;
            }
            document.getElementById("order_form_bid").innerHTML = res.Bid;
            document.getElementById("order_form_ask").innerHTML = res.Ask;
            document.getElementById("order_form_ltp").innerHTML = res.LTP;
            document.getElementById("order_form_atp").innerHTML = res.ATP;
            document.getElementById("order_form_open").innerHTML = res.Open;
            document.getElementById("order_form_low").innerHTML = res.Low;
            document.getElementById("order_form_high").innerHTML = res.High;
            document.getElementById("order_form_oi").innerHTML = res.OI;
            document.getElementById("order_form_prev_close").innerHTML = res.Prev_Close;
            document.getElementById("order_form_bid_qty").innerHTML = res.Bid_Qty;
            document.getElementById("order_form_ask_qty").innerHTML = res.Ask_Qty;
            document.getElementById("order_form_volume").innerHTML = res.Volume;
            document.getElementById("order_form_ltq").innerHTML = res.LTQ;
            document.getElementById("order_form_lot_size").innerHTML = res.lot_size;
            document.getElementById("order_form_upper_circuit").innerHTML = res.upper_circuit;//upper_circuit(res.Prev_Close, res.High, 4);
            document.getElementById("order_form_lower_circuit").innerHTML = res.lower_circuit;//lower_circuit(res.Prev_Close, res.Low, 4);
            document.getElementById("order_form_change").innerHTML = Math.round((parseFloat(res.LTP) - parseFloat(res.Prev_Close)) * 100) / 100;
        },
        error: function (request, status, err) {
            scrip_details_timer =setTimeout(function () {
                scrip_details(scrip_id);
            }, 1000);
        }
    });
}

function change_order_type(type) {
    document.getElementById('order_type').value = type;
    if (type == 'limit_order') {
        document.getElementById('price_li').style.display = 'block';
        document.getElementById('limit_order_buttons').style.display = 'flex';
        document.getElementById('market_order_buttons').style.display = 'none';
        $('#limit_order_button').addClass("active");
        $('#market_order_button').removeClass("active");
    } else {
        document.getElementById('price_li').style.display = 'none';
        document.getElementById('limit_order_buttons').style.display = 'none';
        document.getElementById('market_order_buttons').style.display = 'flex';
        $('#market_order_button').addClass("active");
        $('#limit_order_button').removeClass("active");
    }
}

function place_order(type) {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    var order_type = document.getElementById("order_type").value;
    var scrip_id = document.getElementById("order_scrip_id").value;
    var price = document.getElementById("price").value;
    var lot = document.getElementById("lot").value;
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
        data: {order_type: order_type, txn_type: type, scrip_id: scrip_id, price: price, userid: userid, security_code: security_code, lot: lot},
        url: url + "place-order.php",
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

function order_modal_hide() {
    document.getElementById("success_modal").style.display = "none";
}

function exit_trade_form(id) {
    exit_trade = 0;
    $("#content").load("html/exit-trade.html", function (response, status, http)
    {
        if (status == "success")
        {
            window.location.hash = "exit_trade_form('" + id + "')";
            fetch_trade_details(id);
        }
    });
}

function fetch_trade_details(id, retried) {
    if(typeof retried == 'undefined'){
        current_exit_scrip_id =null;
        current_exit_id = id;
    }
    if(current_exit_id!=id)
        return;
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {id: id, userid: userid, security_code: security_code},
        url: url + "trade-details.php",
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
            $("#exit_button").attr("onclick", "close_trade(" + id + ")");
            scrip_details(scrip_id);
            if (exit_trade != 1) {
                setTimeout(function () {
                    fetch_trade_details(id, true);
                }, 2000);
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                fetch_trade_details(id, true);
            }, 1000);
        }
    });
}

function cancel_order(id) {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code, id: id},
        url: url + "cancel-order.php",
        timeout: 5000,
        success: function (res) {
            if (res.success == 1) {
                document.getElementById("order_image").innerHTML = '<img src="img/checked.gif">';
                document.getElementById("order_success_title").innerHTML = "Success";
                document.getElementById("order_message").innerHTML = res.message;
                document.getElementById("success_modal").style.display = "flex";
            } else {
                document.getElementById("order_image").innerHTML = '<img src="img/failed.png">';
                document.getElementById("order_success_title").innerHTML = "Failed";
                document.getElementById("order_message").innerHTML = res.message;
                document.getElementById("success_modal").style.display = "flex";
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                cancel_order(id);
            }, 1000);
        }
    });
}

function upper_circuit(prev_close, high, increment) {
    if (prev_close == 0)
        return 0;
    var amount = Math.floor(prev_close * (100 + increment) / 100);
    if (amount < high) {
        if (increment == 4)
            increment = 6;
        else
            increment = increment + 3;
        return upper_circuit(prev_close, high, increment);
    } else
        return amount;
}

function lower_circuit(prev_close, low, increment) {
    if (prev_close == 0)
        return 0;
    var amount = Math.ceil(prev_close * (100 - increment) / 100);
    //if (low == 0 || low <= prev_close * 99 / 100)
    //  return amount;
    if (amount > low) {
        if (increment == 4)
            increment = 6;
        else
            increment = increment + 3;
        return lower_circuit(prev_close, low, increment);
    } else
        return amount;
}

var exit_trade = 0;
var current_exit_id=null;
var scrip_details_timer=null;
var current_scrip = null;