function funds() {
    screen = "funds";
    $("#content").load("html/funds.html", function (response, status, http)
    {
        if (status == "success")
        {
            window.location.hash = "funds()";
            fetch_funds();
        }
    });
}

function fetch_funds() {
    var storage = window.localStorage;
    var userid = storage.getItem("userid");
    var security_code = storage.getItem("security_code");
    $.ajax({
        type: "POST",
        data: {userid: userid, security_code: security_code},
        url: url + "funds.php",
        timeout:5000,
        success: function (res) {
            if (res.success == 1) {
                var data = res.data;
                var html = ''
                for (var i = 0; i < data.length; i++) {
                    html += '<tr>\n\
                    <td>\n\
                        <div class="list_cntnt">\n\
                            <p class="chg">' + data[i]["time"] + '</p>\n\
                        </div>\n\
                    </td>\n\
                    <td>\n\
                        <div class="list_cntnt">';
                    if (data[i]["type"] == 'Added')
                        html += '      <p class="chg" ><span class="green_bg" style="padding: 5px 10px;">+' + data[i]["amount"] + '</span></p>';
                    if (data[i]["type"] == 'Deducted')
                        html += '      <p class="chg" ><span class="red_bg" style="padding: 5px 10px;">-' + data[i]["amount"] + '</span></p>';
                    html += '    </div>\n\
                    </td>\n\
                </tr>'

                }
                document.getElementById("funds_table").innerHTML = html;
            } else {
                document.getElementById("funds_table").innerHTML = '<tr><td>' + res.message + '</td></tr>';
                if (res.message == "Unauthorised Access")
                    logout();
            }
        },
        error: function (request, status, err) {
            setTimeout(function () {
                fetch_funds();
            }, 1000);
        }
    });
}