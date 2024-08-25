function trades(type, trade_status) {
    results_received = 0;
    last_results = 0;
    next_results = 0;
    busy = 0;
    exit_trade = 1;
    $("#trades-tab").addClass("active2");
    $("#watchlist-tab").removeClass("active2");
    $("#account-tab").removeClass("active2");
    $("#portfolio-tab").removeClass("active2");
    screen = "trades";
    $("#content").load("html/trades.html?v=3", function (response, status, http)
    {
        if (status == "success")
        {
            window.location.hash = "trades('" + type + "','" + trade_status + "')";
            if (type == "Open") {
                $("#closed_trades").removeClass("active");
                if (trade_status == 1) {
                    $("#pending_trades").removeClass("active");
                    $("#active_trades").addClass("active");
                } else {
                    $("#pending_trades").addClass("active");
                    $("#active_trades").removeClass("active");
                }
            } else {
                $("#pending_trades").removeClass("active");
                $("#active_trades").removeClass("active");
                $("#closed_trades").addClass("active");
            }
            document.getElementById("trades_list_wrapper").addEventListener("scroll", function () {
                load_more_trades();
            }, false);
            fetch_trades(type, trade_status, 0);
        }
    });
}

function fetch_trades(type, status, start) {

    trade_type = type;
    trade_status = status;
    if (busy == 1)
        return;
    busy = 1;
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code, type: type, status: status, start: start},
        url: url + "trades.php",
        timeout: 5000,
        success: function (res) {
            if (res.success == 1 || res.hasOwnProperty("data")) {
                if (type == 'Open') {
                    if (status == 1)
                        active_trades(res);
                    else
                        pending_trades(res);
                } else
                    closed_trades(res);
            } else if (res.message == "Unauthorised Access") {
                logout();
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                fetch_trades(type, status, start);
            }, 1000);
        }
    });
}

function active_trades(res) {
    var activity = "load";
    if (results_received > 0)
        activity = "append";
    var num_of_results = 20;
    var total_results = res.total_results;
    next_results = parseInt(results_received) + parseInt(num_of_results);
    results_received = parseInt(results_received) + parseInt(total_results);
    if (total_results < num_of_results)
    {
        has_more_results = false;
    } else
    {
        has_more_results = true;
    }
    var data = res.data;
    var html = ''
    for (var i = 0; i < data.length; i++) {
        if (data[i].order_type == "Bought")
            var bgclass = 'green_clr light_green_bg';
        else
            var bgclass = 'red_clr light_red_bg';
        html += '<tr>\n\
                                <td>\n\
                                    <div class="list_cntnt">\n\
                                        <p class="chg"><span class="' + bgclass + '">' + data[i].order_type + ' X ' + data[i].balance_lots +  '</span> <span class="green_clr light_green_bg">' + data[i]["order_placed"] + '</span></p>\n\
                                        <p class="title m-t-10">' + data[i].scrip_id + ' <!--<br>19SEP2022--></p>\n\
                                        <p class="chg m-t-10">' + data[i].order_type + ' by ' + data[i].created_by + '</p>\n\
                                        <p class="chg m-t-10">Margin used <b>' + data[i].margin_used + '</b></p>\n\
                                    </div>\n\
                                </td>\n\
                                <td>\n\
                                    <div class="list_cntnt">\n\
                                        <p class="chg">' + data[i].execution_time + '</p>\n\
                                        <p class="chg m-t-10"><b>' + data[i].executed_price + '</b></p>\n\
                                        <a href="javascript:void(0);" onclick="exit_trade_form(' + data[i].id + ')" class="close_trade_btn">Close Trade</a>\n\
                                        <p class="chg m-t-10">Holding Margin Req.  <b>' + data[i].holding_margin_required + '</b></p>\n\
                                    </div>\n\
                                </td>\n\
                            </tr>';
    }
    if (html != "")
        document.getElementById("active_trade_buttons").style.display = "flex";
    if (data.length == 0 && activity == 'load')
        html += '<tr><td colspan="2">No Active Trades</td></tr>';
    if (activity == "load")
        document.getElementById("trades_list").innerHTML = html;
    else
        document.getElementById("trades_list").innerHTML += html;
    busy = 0;
}

function pending_trades(res) {
    var activity = "load";
    if (results_received > 0)
        activity = "append";
    var num_of_results = 20;
    var total_results = res.total_results;
    next_results = parseInt(results_received) + parseInt(num_of_results);
    results_received = parseInt(results_received) + parseInt(total_results);
    if (total_results < num_of_results)
    {
        has_more_results = false;
    } else
    {
        has_more_results = true;
    }
    document.getElementById("active_trade_buttons").style.display = "none";
    var data = res.data;
    var html = '';
    if (data.length == 0 && activity == 'load')
        html += '<tr><td colspan="2">No Pending Orders</td></tr>';
    for (var i = 0; i < data.length; i++) {
        if (data[i].order_type == "Bought")
            var bgclass = 'green_clr light_green_bg';
        else
            var bgclass = 'red_clr light_red_bg';
        html += '<tr>\n\
                                <td>\n\
                                    <div class="list_cntnt">\n\
                                        <p class="chg"><span class="' + bgclass + '">' + data[i].order_type + ' X ' + data[i].balance_lots + ' (' + data[i].balance_quantity + ')' + '</span>';
        if(data[i].status=="0")
        html += '<span class="green_clr light_green_bg">Pending</span></p>';
        html += ' <p class="title m-t-10">' + data[i].scrip_id + ' </p>\n\
                                        <p class="chg m-t-10">' + data[i].order_type + ' by  ' + data[i].created_by + '</p>\n\
                                        <p class="chg m-t-10">Margin required <b>' + data[i].margin_used + '</b></p>\n\
                                    </div>\n\
                                </td>\n\
                                <td>\n\
                                    <div class="list_cntnt">\n\
                                        <p class="chg">' + data[i].order_time + '</p>\n\
                                        <p class="chg m-t-10"><b>' + data[i].scheduled_price + '</b></p>';
        if (data[i].status == "0"){
            html += '<a href="javascript:void(0);" onclick="open_modify_order_form(' + data[i].id + ',\'' + data[i].scrip_id + '\',' + data[i].scheduled_price + ',' + data[i].balance_lots + ',\''+data[i].order_type+'\')" ><img style="background:#fff; margin-right:10px;" src="img/edit.png" /></a>';
            html += '<a href="javascript:void(0);" onclick="cancel_order(' + data[i].id + ')" ><img style="background:#fff;" src="img/delete.png" /></a>';
        }
        else
            html += data[i].status_str;
        html += '<p class="chg m-t-10">Holding Margin Req.  <b>' + data[i].holding_margin_required + '</b></p>\n\
                                    </div>\n\
                                </td>\n\
                            </tr>';
    }
    if (activity == "load")
        document.getElementById("trades_list").innerHTML = html;
    else
        document.getElementById("trades_list").innerHTML += html;
    busy = 0;
}

function closed_trades(res) {
    var activity = "load";
    if (results_received > 0)
        activity = "append";
    var num_of_results = 20;
    var total_results = res.total_results;
    next_results = parseInt(results_received) + parseInt(num_of_results);
    results_received = parseInt(results_received) + parseInt(total_results);
    if (total_results < num_of_results)
    {
        has_more_results = false;
    } else
    {
        has_more_results = true;
    }
    document.getElementById("active_trade_buttons").style.display = "none";
    var data = res.data;
    var html = '';
    if (data.length == 0 && activity == 'load') {
        html += '<tr><td colspan="2">No Closed Trades</td></tr>';
    }
    for (var i = 0; i < data.length; i++) {
        html += '<tr>\n\
        <td>\n\
    <div class="list_cntnt">\n\
        <p class="title">' + data[i].scrip_id + '</p>\n\
        <p class="chg m-t-10">Sold by  ' + data[i].sell_created_by + ' <span class="red_clr light_red_bg">' + data[i].sell_price + '</span></p>\n\
        <p class="title m-t-10">' + data[i].sell_time + ' </p>\n\
    </div>\n\
</td>\n\
        <td>\n\
    <div class="list_cntnt">';
        if (data[i].profit_loss < 0)
            html += '<p class="chg"><span class="red_clr light_red_bg">' + data[i].profit_loss + ' / -' + data[i].brokerage + '</span> <span class="red_clr light_red_bg">QTY:' + data[i].balance_lots + '</span></p>';
        else
            html += '<p class="chg"><span class="green_clr light_green_bg">' + data[i].profit_loss + ' / -' + data[i].brokerage + '</span> <span class="red_clr light_red_bg">QTY:' + data[i].balance_lots + '</span></p>';
        html += '<p class="chg m-t-10">Bought By  ' + data[i].buy_created_by + ' <span class="green_clr light_green_bg">' + data[i].buy_price + '</span></p>\n\
        <p class="title m-t-10">' + data[i].buy_time + ' <span class="blue_clr light_blue_bg">'+data[i].notes+'</span></p>\n\
    </div>\n\
</td>\n\
        </tr>';
    }
    //html += '<tr><td colspan="2"><a href="javascript:void(0);" onclick="load_more_trades(\'' + type + '\',\'' + trade_status + '\',1,' + next_results + ');">Load More</a></td></tr>';
    if (activity == "load")
        document.getElementById("trades_list").innerHTML = html;
    else
        document.getElementById("trades_list").innerHTML += html;
    busy = 0;
}

function close_trade(id) {
    exit_trade = 1;
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code, id: id},
        url: url + "close-trade.php",
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
                if (order_type = "market_order")
                    $("#order_modal_action").attr("onclick", "trades('Open',1); order_modal_hide();");
                else
                    $("#order_modal_action").attr("onclick", "trades('Open',0); order_modal_hide();");
                document.getElementById("success_modal").style.display = "flex";
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                close_trade(id);
            }, 1000);
        }
    });
}

function close_all_trades_form(market) {
    document.getElementById("trade_market_type_text").innerHTML = market;
    document.getElementById("trade_market_type").value = market;
    document.getElementById("close_all_trades_modal").style.display = "flex";
}

function hide_close_all_trades_form() {
    document.getElementById("close_all_trades_modal").style.display = "none";
}

function close_all_trades() {
    exit_trade = 1;
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    var market = document.getElementById("trade_market_type").value;
    var password = document.getElementById("trade_password").value;
    if (password == "") {
        document.getElementById("trade_password_message").innerHTML = "Please Enter Password";
        return;
    }
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code, market: market, password: password},
        url: url + "close-all-trades.php",
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
                document.getElementById("order_message").innerHTML = "All " + market + " Trades are successfully closed at market price";
                document.getElementById("success_modal").style.display = "flex";
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                close_all_trades();
            }, 1000);
        }
    });
}