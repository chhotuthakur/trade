function profile() {
    screen = "profile";
    $("#content").load("html/profile.html?v=6", function (response, status, http)
    {
        if (status == "success")
        {
            window.location.hash = "profile()";
            profile_margin_details();
        }
    });
}

function login_form() {
    screen = "login_form";
    document.getElementById("footer").innerHTML = "";
    $("#content").load("html/login.html?v=3", function (response, status, http)
    {
        if (status == "success")
        {
            $('#login_button').prop('disabled', false);
            app_name();
        }
    });
}

function app_name() {
    $.ajax({
        type: "POST",
        url: url + "app-name.php",
        timeout: 5000,
        success: function (res) {
            if (res.success == 1) {
                document.getElementById("app_name").innerHTML = res.app_name;
                document.getElementById("logo").innerHTML = '<img src="https://' + domain + "/" + res.logo + '" />';
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                app_name();
            }, 1000);
        }
    });
}

function login_user() {
    screen_requested = "market_watch";
    //$("#loader").show();
    if (document.getElementById("err"))
        document.getElementById("err").innerHTML = "";
    if (document.getElementById("login_button").disabled === true)
        return;
    $('#login_button').prop('disabled', true);
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    $.ajax({
        type: "POST",
        data: {username: username, password: password},
        url: url + "validate-login.php",
        timeout: 5000,
        success: function (data) {
            $('#login_button').prop('disabled', false);
            if (data.success == 1) {
                //document.getElementById("network_status").innerHTML+='login_successful';
                var storage = window.localStorage;
                storage.setItem("userid", data.userid);
                storage.setItem("security_code", data.security_code);
                storage.setItem("app_id", data.app_id);
                var segments = data.segments;
                storage.setItem("nse_enabled", segments.nse_enabled);
                storage.setItem("mcx_enabled", segments.mcx_enabled);
                storage.setItem("options_enabled", segments.options_enabled);
                var obj = {userid: data.userid, security_code: data.security_code, role: '0'}
                var json = JSON.stringify(obj);
                socket = io.connect(socketurl, {query: "value=" + json, transports: ['websocket']});
                socket_actions();
            } else {
                if (document.getElementById("err")) {
                    document.getElementById("err").innerHTML = data.message;
                }
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                login_user();
            }, 1000);
        }
    });
}

function my_account() {
    exit_trade = 1;
    $("#trades-tab").removeClass("active2");
    $("#watchlist-tab").removeClass("active2");
    $("#account-tab").addClass("active2");
    $("#portfolio-tab").removeClass("active2");
    screen = "account";
    $("#content").load("html/my-account.html", function (response, status, http)
    {
        if (status == "success")
        {
            if (domain != "goldtree.live")
                $("#withdrawal_link").hide();
//            if (domain == 'fantasy11.in.net') {
//                document.getElementById("withdrawal_link").innerHTML = '<a href="https://fantasy11.net" target="_blank">\n\
//                        <span class="txt">Deposit / Withdraw</span>\n\
//                        <span class="icn"><i class="fas fa-key"></i></span>\n\
//                    </a>';
//            }
            window.location.hash = "my_account()";
            fetch_username();
        }
    });
}

function fetch_username() {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code},
        url: url + "fetch-username.php",
        timeout: 5000,
        success: function (res) {
            document.getElementById("username").innerHTML = res.fullname;
        },
        error: function (request, status, err) {
            setTimeout(function () {
                fetch_username();
            }, 1000);
        }
    });
}

function logout() {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code},
        url: url + "logout.php",
        timeout: 5000,
        success: function (res) {
            storage.removeItem("userid");
            storage.removeItem("security_code");
            login_form();
            if (typeof socket != "undefined")
                socket.close();
        },
        error: function (request, status, err) {
            setTimeout(function () {
                logout();
            }, 1000);
        }
    });
}

function change_password_form() {
    screen = "password_form";
    $("#content").load("html/change-password.html?v=2", function (response, status, http)
    {
        if (status == "success")
        {
            window.location.hash = "change_password_form()";
        }
    });
}

function update_password() {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    var form = document.password_form;
    var new_password = form.new_password.value;
    var current_password = form.current_password.value;
    var repeat_password = form.repeat_password.value;
    if (new_password !== repeat_password) {
        document.getElementById("password_err").innerHTML = "Repeat password should be same as new password";
        return;
    } else if (current_password == "") {
        document.getElementById("password_err").innerHTML = "Current password should not be blank";
        return;
    } else if (new_password == "") {
        document.getElementById("password_err").innerHTML = "New password should not be blank";
        return;
    } else {
        $.ajax({
            type: "POST",
            data: {userid: userid, security_code: security_code, current_password: current_password, new_password: new_password},
            url: url + "update-password.php",
            timeout: 5000,
            success: function (res) {
                if (res.success == 1) {
                    document.getElementById("password_err").innerHTML = "Password successfully updated";
                    document.getElementById("order_image").innerHTML = '<img src="img/checked.gif">';
                    document.getElementById("order_success_title").innerHTML = "Password successfully updated";
                    document.getElementById("success_modal").style.display = "flex";
                } else
                    document.getElementById("password_err").innerHTML = res.message;
            },
            error: function (request, status, err) {
                setTimeout(function () {
                    update_password();
                }, 1000);
            }
        });
    }
}

function profile_margin_details() {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code},
        url: url + "profile-margin-details.php",
        timeout: 5000,
        success: function (res) {
            if (res.success == 1) {
                document.getElementById("mcx_enabled").innerHTML = res.mcx_enabled;
                document.getElementById("nse_enabled").innerHTML = res.nse_enabled;
                document.getElementById("options_enabled").innerHTML = res.options_enabled;
                document.getElementById("mcx_exposure_type").innerHTML = res.mcx_exposure_type;
                document.getElementById("nse_brokerage").innerHTML = res.nse_brokerage;
                document.getElementById("nse_intraday_margin").innerHTML = res.nse_intraday_margin;
                document.getElementById("nse_holding_margin").innerHTML = res.nse_holding_margin;
                document.getElementById("options_brokerage").innerHTML = res.options_brokerage;
                document.getElementById("options_intraday_margin").innerHTML = res.options_intraday_margin;
                document.getElementById("options_holding_margin").innerHTML = res.options_holding_margin;
                document.getElementById("options_brokerage_type").innerHTML = res.options_brokerage_type;
                document.getElementById("mcx_brokerage_type").innerHTML = res.mcx_brokerage_type;
                document.getElementById("mcx_brokerage").innerHTML = res.mcx_brokerage;
                if (res.mcx_exposure_type == "per_turnover") {
                    document.getElementById("mcx_intraday_margin").innerHTML = res.mcx_intraday_margin;
                    document.getElementById("mcx_holding_margin").innerHTML = res.mcx_holding_margin;
                } else {
                    var mcx_margins = res.mcx_per_lot_margins;
                    var mcx_holding = [];
                    var mcx_intraday = [];
                    for (var i = 0; i < mcx_margins.length; i++) {
                        mcx_holding.push(mcx_margins[i].trade_name + "/" + mcx_margins[i].holding);
                        mcx_intraday.push(mcx_margins[i].trade_name + "/" + mcx_margins[i].intraday);
                    }
                    document.getElementById("mcx_per_lot_holding").innerHTML = mcx_holding.join(", ");
                    document.getElementById("mcx_per_lot_intraday").innerHTML = mcx_intraday.join(", ");
                }
            } else if (res.message == "Unauthorised Access") {
                logout();
            }

        },
        error: function (request, status, err) {
            setTimeout(function () {
                profile_margin_details();
            }, 1000);
        }
    });
}
