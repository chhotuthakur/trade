function portfolio() {
    exit_trade = 1;
    exit_scrip_trade = 1;
    screen = "portfolio";
    $("#trades-tab").removeClass("active2");
    $("#watchlist-tab").removeClass("active2");
    $("#account-tab").removeClass("active2");
    $("#portfolio-tab").addClass("active2");
    $("#content").load("html/portfolio.html", function (response, status, http)
    {
        if (status == "success")
        {
            window.location.hash = "portfolio()";
            fetch_portfolio();
        }
    });
}
function fetch_portfolio() {
    if (screen != "portfolio")
        return;
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code},
        url: url + "portfolio.php",
        timeout:5000,
        success: function (res) {

            if (screen != "portfolio")
                return;
            if (res.success == 1) {
                document.getElementById("ledger_balance").innerHTML = res.ledger_balance;
                document.getElementById("m2m_balance").innerHTML = res.m2m_balance;
                document.getElementById("available_balance").innerHTML = res.available_balance;
                document.getElementById("active_profit_loss").innerHTML = res.active_profit_loss;
                var data = res.data;
                var html = ''
                for (var i = 0; i < data.length; i++) {
                    if(data[i]["order_type"]=="Sold")
                        var span='<span style="color:red">';
                    else
                        var span='<span style="color:white">';
                    html += '<tr onclick="exit_scrip_trade_form(\'' + data[i]["scrip_id"] + '\')">\n\
				<td>\n\
                                    <div class="list_cntnt">\n\
					<p class="title">' + data[i]["scrip_id"] + '</p>\n\
					<p class="chg">Margin: <b>' + data[i]["margin_used"] + '</b></p>\n\
                                        <p><a href="javascript:void(0);" class="close_trade_btn" onclick=onclick="exit_scrip_trade_form(\'' + data[i]["scrip_id"] + '\')">Close Trades</a></p>\n\
                                    </div>\n\
				</td>\n\
				<td>\n\
                                    <div class="list_cntnt">\n\
					<p class="chg">' + span + data[i]["order_type"] + '</span> : <span class="green_clr">' + data[i]["balance_lots"] + '</span> @ <span class="green_clr">' + data[i]["executed_price"] + '</span></p>';
                    if (data[i]["profit_loss"] >= 0)
                        html += '<p class="chg green_clr">' + data[i]["profit_loss"] + '</p>';
                    else
                        html += '<p class="chg red_clr">' + data[i]["profit_loss"] + '</p>';
                    html += '<p class="chg">CMP <b>' + data[i]["current_price"] + '</b></p>\n\
                                    </div>\n\
				</td>\n\
                            </tr>';
                }
                document.getElementById("portfolio_list").innerHTML = html;
                setTimeout(function () {
                    fetch_portfolio();
                }, 2000);
            } else if (res.message == "Unauthorised Access") {
                logout();
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                fetch_portfolio();
            }, 1000);
        }
    });
}