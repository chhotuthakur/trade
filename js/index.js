/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
//document.addEventListener('deviceready', onDeviceReady, false);
var domain = window.location.hostname;
var url = "https://" + domain + "/api/";
var socketurl = "https://" + domain + ":3000";
var screen = "login_form";
var screen_requested = "";
var results_received = 0;
var busy = 0;
var last_results = 0;
var trade_type = 'Open';
var trade_status = 0;
var next_results = 0;
var has_more_results = true;
function onDeviceReady() {
    document.addEventListener("backbutton", onBackButton, false);
    market_watch('MCX');
}

function onBackButton() {
    var hash = window.location.hash;
    window.history.back(-1);
    setTimeout(function () {
        hash = window.location.hash;
        if (hash == "")
            navigator.app.exitApp();
        else {
            var arr = hash.split("#");
            var fun = arr[1];
            eval(fun);
        }
    }, 300);
}

function reached_bottom(div) {
    //document.getElementById("network_status").innerHTML = "Top: " + $(div).scrollTop() + " Inner:" + $(div).innerHeight() + " Height:" + $(div)[0].scrollHeight;    
    if ($(div).scrollTop() + $(div).innerHeight() >= $(div)[0].scrollHeight - 5)
        return true;
    else
        return false;
}

function load_more_trades() {
    var bottom = reached_bottom("#trades_list_wrapper");
    if (last_results == next_results)
        return;
    if (bottom == true) {
        if (has_more_results == true) {
            fetch_trades(trade_type, trade_status, next_results);
            last_results = next_results;
        }
    }
}