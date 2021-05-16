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
    if (header) {
        for (let key in header) {
            http.setRequestHeader(key, header[key]);
        }
    }
    method = method || "get";
    http.open(method, url, false, username, password);
    http.send(body);
    return http.responseText;
}