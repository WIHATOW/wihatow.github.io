onmessage = function (e) {
    var res = request(e.data.url, e.data.method, e.data.body, e.data.header, e.data.username, e.data.password);
    postMessage(res);
    close();
}

onerror = function () {
    close();
}

function request(url, method, body, header, username, password) {
    var http = new XMLHttpRequest();
    method = method || "get";
    http.open(method, url, false, username, password);
    http.setRequestHeader("Access-Control-Allow-Origin", "*");
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    if (header) {
        for (let key in header) {
            http.setRequestHeader(key, header[key]);
        }
    }
    http.send(body);
    return http.responseText;
}