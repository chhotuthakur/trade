function market_watch(market, segment) {
    if(typeof segment == "undefined")
        segment="Future";
    market_trade_type=segment;
    results_received = 0;
    last_results = 0;
    next_results = 0;
    busy = 0;
    exit_trade = 1;

    $("#trades-tab").removeClass("active2");
    $("#watchlist-tab").addClass("active2");
    $("#account-tab").removeClass("active2");
    $("#portfolio-tab").removeClass("active2");
    if (market != null)
        current_market = market;
    else
        market = current_market;
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    var nse_enabled = storage.getItem("nse_enabled");
    var mcx_enabled = storage.getItem("mcx_enabled");
    var options_enabled = storage.getItem("options_enabled");
    if (userid == null) {
        login_form();
        return;
    }
    $("#content").load("html/market-watch.html?v=4", function (response, status, http)
    {
        if (status == "success")
        {
            if(nse_enabled==0)
                $("#tab_NSE").hide();
            if(mcx_enabled==0)
                $("#tab_MCX").hide();
            if(options_enabled==0)
                $("#tab_ALL").hide();
            screen = "market_watch";
            window.location.hash = "market_watch('" + market + "')";
            highlight_tab();
            fetch_market_watch_data(userid, security_code, market, segment);
        }
    });
    $("#footer").load("html/footer.html");
}

function fetch_scrips(trade_type, search) {
    if (typeof socket != "undefined")
        socket.emit("subscribe_symbol", {room: "all_scrips"});
    var market = current_market;
    $.ajax({
        type: "POST",
        data: {market: market, trade_type: market_trade_type, search: search},
        url: url + "fetch-scrips.php",
        timeout: 5000,
        success: function (res) {
            var rows = '';
            for (var i = 0; i < res.length; i++) {
                var data = res[i].data;
                var symbol = data.Symbol;
                var converted_symbol = replace_symbols(symbol);
                rows += '<tr>\n\
                                <td>\n\
                                    <div class="list_cntnt">\n\
                                        <p class="title">' + res[i].name + '</p>\n\
                                        <p class="id">' + res[i].expiry_date + '</p>\n\
                                        <p class="chg">Lot Size:' + res[i].lot_size + '</p>\n\
                                    </div>\n\
                                </td>\n\
                                <td>\n\
                                    <div class="list_cntnt">\n\
                                        <p class="chg">H:<span id="search_' + converted_symbol + '_High">' + data.High + '</span></p>\n\
                                    </div>\n\
                                </td>\n\
                                <td>\n\
                                    <div class="list_cntnt">\n\
                                        <p class="title_number" id="search_' + converted_symbol + '_Bid">' + data.Bid + '</p>\n\
                                        <p class="chg">L: <span id="search_' + converted_symbol + '_Low">' + data.Low + '</span></p>\n\
                                    </div>\n\
                                </td>\n\
                                <td>\n\
                                    <div class="list_cntnt">\n\
                                        <p class="title_number" id="search_' + converted_symbol + '_Ask">' + data.Ask + '</p>\n\
                                        <p class="chg">O: ' + data.Open + '</p>\n\
                                    </div>\n\
                                </td>\n\
                                <td>\n\
                                    <div class="list_cntnt">\n\
                                        <input type="checkbox" name="mcx_search"  id="search_' + converted_symbol + '_check" class="check_box" onclick="process_market_watch(\'' + symbol + '\');">\n\
                                        <div class="check_mark"></div>\n\
                                    </div>\n\
                                </td>\n\
                            </tr>';
            }
            document.getElementById("search_data").innerHTML = rows;
            var storage = window.localStorage;
            var market_data = storage.getItem("market_data");
            if (market_data != null) {
                var arr = JSON.parse(market_data);
                for (var i = 0; i < arr.length; i++) {
                    var converted_symbol = replace_symbols(arr[i]);
                    if (document.getElementById("search_" + converted_symbol + "_check"))
                        document.getElementById("search_" + converted_symbol + "_check").checked = true;
                }
            }
            if (typeof socket === "undefined") {
                setTimeout(function () {
                    reconnect();
                }, 3000);
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                fetch_scrips(trade_type, search);
            }, 1000);
        }
    });
}

function process_market_watch(symbol) {
    var converted_symbol = replace_symbols(symbol);
    if (document.getElementById("search_" + converted_symbol + "_check").checked) {
        add_to_watch(symbol);
    } else
        remove_from_watch(symbol);
}

function add_to_watch(symbol) {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, symbol: symbol, security_code: security_code},
        url: url + "add-to-watchlist.php",
        timeout: 5000,
        success: function (res) {
            if (res.success == 0) {
                login_form();
                return;
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                add_to_watch(symbol);
            }, 1000);
        }
    });
}

function remove_from_watch(symbol) {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, symbol: symbol, security_code: security_code},
        url: url + "remove-from-watchlist.php",
        timeout: 5000,
        success: function (res) {
            if (res.success == 0) {
                login_form();
                return;
            } else
                socket.emit("unsubscribe_symbol", {room: symbol});
        },
        error: function (request, status, err) {
            setTimeout(function () {
                remove_from_watch(symbol);
            }, 1000);
        }
    });
}

function fetch_market_watch_data(userid, security_code, market, segment) {
    if(market=="ALL")
        segment="Options";
    market_trade_type=segment;
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code, market: market, segment: segment},
        url: url + "fetch-market-watch-scrips.php",
        timeout: 5000,
        success: function (res) {
            var scrips = [];
            if (res.success == 0) {
                login_form();
                return;
            }
            var rows = '';
            if (typeof socket === "undefined") {
                setTimeout(function () {
                    reconnect();
                }, 3000);
            }
            for (var i = 0; i < res.length; i++) {
                var data = res[i].data;
                var symbol = data.Symbol;
                var converted_symbol = replace_symbols(symbol);
                var change = parseFloat(data.LTP) - parseFloat(data.Prev_Close);
                scrips.push(symbol);
                change = change.toFixed(2);
                rows += '<tr onclick="open_order_form(\'' + symbol + '\')">\n\
                                <td class="scrip_name">\n\
                                    <div class="list_cntnt">\n\
                                        <p class="title">' + res[i].name + '</p>\n\
                                        <p class="id">' + res[i].expiry_date + '</p>\n\
                                        <p class="chg">Chg:<span id="watch_' + converted_symbol + '_Change">' + change + '</span>\n\
\n\                                     H:<span id="watch_' + converted_symbol + '_High">' + data.High + '</span></p>\n\
                                    </div>\n\
                                </td>\n\
                                <td>\n\
                                    <div class="list_cntnt">\n\
                                        <p class="title_number" id="watch_' + converted_symbol + '_Bid">' + data.Bid + '</p>\n\
                                        <p class="chg">L: <span id="watch_' + converted_symbol + '_Low">' + data.Low + '</span></p>\n\
                                    </div>\n\
                                </td>\n\
                                <td>\n\
                                    <div class="list_cntnt">\n\
                                        <p class="title_number" id="watch_' + converted_symbol + '_Ask">' + data.Ask + '</p>\n\
                                        <p class="chg">O: ' + data.Open + '</p>\n\
                                    </div>\n\
                                </td>\n\
                            </tr>';
            }
            document.getElementById("mcx_future_data").innerHTML = rows;
            var storage = window.localStorage;
            storage.setItem("market_data", JSON.stringify(scrips));
            if (typeof socket != "undefined") {
                socket.emit("unsubscribe_symbol", {room: "all_scrips"});
                for (var i = 0; i < scrips.length; i++) {
                    socket.emit("subscribe_symbol", {room: scrips[i]});
                }
            } else {
                resubscribe();
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                fetch_market_watch_data(userid, security_code, market, segment);
            }, 1000);
        }
    });
}
function resubscribe() {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code, market: current_market, segment: market_trade_type},
        url: url + "fetch-market-watch-scrips.php",
        timeout: 5000,
        success: function (res) {
            var scrips = [];
            if (res.success == 0) {
                login_form();
                return;
            }
            for (var i = 0; i < res.length; i++) {
                var data = res[i].data;
                var symbol = data.Symbol;
                scrips.push(symbol);

            }
            if (typeof socket != "undefined") {
                for (var i = 0; i < scrips.length; i++) {
                    socket.emit("subscribe_symbol", {room: scrips[i]});
                }
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                resubscribe();
            }, 1000);
        }
    });
}

function update_scrip_data(obj) {
    var data = obj.data;
    var converted_symbol = replace_symbols(data.Symbol);
    if (document.getElementById("search_" + converted_symbol + "_Bid")) {
        var previous_bid = document.getElementById("search_" + converted_symbol + "_Bid").innerHTML;
        document.getElementById("search_" + converted_symbol + "_Bid").innerHTML = data.Bid;
        if (parseFloat(previous_bid) > parseFloat(data.Bid)) {
            $("#search_" + converted_symbol + "_Bid").removeClass("green_bg");
            $("#search_" + converted_symbol + "_Bid").addClass("red_bg");
        }
        if (parseFloat(previous_bid) < parseFloat(data.Bid)) {
            $("#search_" + converted_symbol + "_Bid").removeClass("red_bg");
            $("#search_" + converted_symbol + "_Bid").addClass("green_bg");
        }
    }
    if (document.getElementById("watch_" + converted_symbol + "_Bid")) {
        var previous_bid = document.getElementById("watch_" + converted_symbol + "_Bid").innerHTML;
        document.getElementById("watch_" + converted_symbol + "_Bid").innerHTML = data.Bid;
        if (parseFloat(previous_bid) > parseFloat(data.Bid)) {
            $("#watch_" + converted_symbol + "_Bid").removeClass("green_bg");
            $("#watch_" + converted_symbol + "_Bid").addClass("red_bg");
        }
        if (parseFloat(previous_bid) < parseFloat(data.Bid)) {
            $("#watch_" + converted_symbol + "_Bid").removeClass("red_bg");
            $("#watch_" + converted_symbol + "_Bid").addClass("green_bg");
        }
    }
    if (document.getElementById("search_" + converted_symbol + "_Ask")) {
        var previous_Ask = document.getElementById("search_" + converted_symbol + "_Ask").innerHTML;
        document.getElementById("search_" + converted_symbol + "_Ask").innerHTML = data.Ask;
        if (parseFloat(previous_Ask) > parseFloat(data.Ask)) {
            $("#search_" + converted_symbol + "_Ask").removeClass("green_bg");
            $("#search_" + converted_symbol + "_Ask").addClass("red_bg");
        }
        if (parseFloat(previous_Ask) < parseFloat(data.Ask)) {
            $("#search_" + converted_symbol + "_Ask").removeClass("red_bg");
            $("#search_" + converted_symbol + "_Ask").addClass("green_bg");
        }
    }
    if (document.getElementById("watch_" + converted_symbol + "_Ask")) {
        var previous_Ask = document.getElementById("watch_" + converted_symbol + "_Ask").innerHTML;
        document.getElementById("watch_" + converted_symbol + "_Ask").innerHTML = data.Ask;
        if (parseFloat(previous_Ask) > parseFloat(data.Ask)) {
            $("#watch_" + converted_symbol + "_Ask").removeClass("green_bg");
            $("#watch_" + converted_symbol + "_Ask").addClass("red_bg");
        }
        if (parseFloat(previous_Ask) < parseFloat(data.Ask)) {
            $("#watch_" + converted_symbol + "_Ask").addClass("red_bg");
            $("#watch_" + converted_symbol + "_Ask").addClass("green_bg");
        }
    }
    if (document.getElementById("search_" + converted_symbol + "_High"))
        document.getElementById("search_" + converted_symbol + "_High").innerHTML = data.High;
    if (document.getElementById("search_" + converted_symbol + "_Low"))
        document.getElementById("search_" + converted_symbol + "_Low").innerHTML = data.Low;
    if (document.getElementById("watch_" + converted_symbol + "_High"))
        document.getElementById("watch_" + converted_symbol + "_High").innerHTML = data.High;
    if (document.getElementById("watch_" + converted_symbol + "_Low"))
        document.getElementById("watch_" + converted_symbol + "_Low").innerHTML = data.Low;
    var change = parseFloat(data.LTP) - parseFloat(data.Prev_Close);
    change = change.toFixed(2);
    if (document.getElementById("watch_" + converted_symbol + "_Change"))
        document.getElementById("watch_" + converted_symbol + "_Change").innerHTML = change;
    var order_scrip_id = "";
    if (document.getElementById("order_scrip_id"))
        order_scrip_id = document.getElementById("order_scrip_id").value;
    if (order_scrip_id != "" && data.Symbol == order_scrip_id) {
        var res = data;
        document.getElementById("order_bid_price").innerHTML = res.Bid;
        document.getElementById("order_ask_price").innerHTML = res.Ask;
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
        var change = parseFloat(res.LTP) - parseFloat(res.Prev_Close);
        document.getElementById("order_form_change").innerHTML = change.toFixed(2);
    }
}

function clear_search(trade_type, val) {
    document.getElementById(val).value = "";
    fetch_scrips(trade_type, "");
}

function highlight_tab() {
    if (current_market == 'MCX') {
        $('#tab_NSE').removeClass('active');
        $('#tab_ALL').removeClass('active');
        $('#tab_MCX').addClass('active');
        $("#scrips_search_btn").attr("onclick","search_modal_show('Future')");
    } else if (current_market == 'NSE') {
        $('#tab_MCX').removeClass('active');
        $('#tab_ALL').removeClass('active');
        $('#tab_NSE').addClass('active');
        $("#scrips_search_btn").attr("onclick","search_modal_show('Future')");
    }
    else{
        $('#tab_MCX').removeClass('active');
        $('#tab_NSE').removeClass('active');
        $('#tab_ALL').addClass('active');
        $("#scrips_search_btn").attr("onclick","search_modal_show('Options')");
    }
}

function replace_symbols(text) {
    var arr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    var final_text = text.toUpperCase();
    var textArr = final_text.split("");
    var str = "";
    for (var i = 0; i < textArr.length; i++) {
        var char = textArr[i];
        if (arr.indexOf(textArr[i]) == -1)
            char = "_";
        str += char;
    }
    return str;
}
var current_market = 'MCX';
var market_trade_type = 'Future';