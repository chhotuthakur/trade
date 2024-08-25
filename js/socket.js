var invalid_login = false;

function socket_actions() {
    socket.on('connect', function () {
        console.log("connected");
        //document.getElementById("network_status").innerHTML+='connected';
    });
    socket.on('db_err', function (data) {
        //console.log("connected");
        //document.getElementById("network_status").innerHTML+=data.message;
    });
    socket.on('scrip_data', function (data) {
        //console.log("scrip_data:" + JSON.stringify(data));
        update_scrip_data(data);
    });
    socket.on('invalid_login', function (data) {
        //document.getElementById("network_status").innerHTML+='invalid_login';
        socket.close();
        var storage = window.localStorage;
        storage.removeItem("userid");
        storage.removeItem("security_code");
        storage.removeItem("app_id");
        if (document.getElementById("err")) {
            document.getElementById("err").innerHTML = data.message;
            $('#login_button').prop('disabled', false);
        } else
            login_form();
    });
    socket.on('symbol_subscribed', function (data) {
        //console.log(data.message);
    });
    socket.on('symbol_unsubscribed', function (data) {
        //console.log(data.message);
    });
    socket.on('login_successful', function (data) {
        //$("#loader").hide();
        //console.log("Logged in");
        $('#login_button').prop('disabled', false);
        //document.getElementById("network_status").innerHTML+='login_successful';
        var storage = window.localStorage;
        storage.setItem("userid", data.userid);
        storage.setItem("security_code", data.security_code);
        storage.setItem("app_id", data.app_id);
        resubscribe();
        if (screen != "market_watch" && screen_requested == "market_watch") {
            screen_requested = "";
            market_watch('MCX');
        }
        //setupListeners();
    });
    socket.on("connect_failed", function (data) {
        console.log("connect_failed: " + data);
    });
    socket.on("connect_error", function (data) {
        console.log("connect_error: " + data);
    });
    socket.on("disconnect", function (data) {
        console.log("disconnect due to " + data);
    });
}

function reconnect() {
    if (typeof socket === "undefined") {
        var storage = window.localStorage;
        var userid = storage.getItem("userid");
        var security_code = storage.getItem("security_code");
        if (userid != null && security_code != null) {
            var obj = { userid: userid, security_code: security_code, role: '0' }
            var json = JSON.stringify(obj);
            socket = io.connect(socketurl, { query: "value=" + json, transports: ['websocket'] });
            socket_actions();
        } else {
            if (screen != "market_watch" && screen_requested == "market_watch") {
                var username = document.getElementById("username").value;
                var password = document.getElementById("password").value;
                var obj = { username: username, password: password, role: '0' }
                var json = JSON.stringify(obj);
                socket = io.connect(socketurl, { query: "value=" + json, transports: ['websocket'] });
                socket_actions();
            } else {
                socket.close();
                if (document.getElementById("err")) {
                    document.getElementById("err").innerHTML = data.message;
                    $('#login_button').prop('disabled', false);
                } else
                    login_form();
            }

        }

    }
}