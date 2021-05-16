function readFile(file) {
    return sync(request, file);
}

function readJson(file, callback) {
    readFile(file).then((data) => {
        callback(JSON.parse(data));
    }).catch(e => {
        callback({});
    })
}

function request(url, success, error, method, body, header, username, password) {
    var worker = new Worker(window.location.origin + "/market/utils/networker.js");
    worker.onerror = error;
    worker.onmessage = function (e) {
        success(e.data);
    };
    worker.postMessage({
        url: url,
        method: method,
        body: body,
        header: header,
        username: username,
        password: password
    });
}

async function requestSync(url) {
    return await sync(request, url);
}

function sync(task) {
    var url = arguments[1]
    return new Promise(function (resolve, reject) {
        task(url, function (e) {
            resolve(e);
        }, function (e) {
            reject(e);
        });
    });
}

async function readFileSync(file) {
    return await requestSync(file);
}

async function readJsonSync(file) {
    var data = await readFileSync(file);
    if (data) {
        return JSON.parse(data);
    }
    return {};
}

async function parseApplication(name, version) {
    var application = await readJsonSync("https://code.aliyun.com/wihatow/Market/raw/master/api/"
     + name + "/" + version + ".json");
    var base = "https://code.aliyun.com/wihatow/Applications/raw/master";
    var path = base + "/" + application.path + "/v" + application.versionName + "(" + application.versionCode + ")/";
    var app = {
        name: application.name,
        packageName: application.packageName,
        icon: base + "/" + application.path + "/" + application.icon,
        url: path + application.label + "." + application.suffix,
        description: application.description,
        versionCode: application.versionCode,
        versionName: application.versionName,
        time: application.time,
        size: application.size,
        suffix: application.suffix,
        screenshots: [
        ],
        spread: window.location.origin + "/markert/" + application.spread
    };
    app.screenshots = path + application.screenshots.join("," + path);
    app.screenshots = app.screenshots.split(",");
    if (application.changed.length) {
        app.changed = application.changed;
    }
    return app;
}

async function parseApplications() {
    var res = await readJsonSync("https://code.aliyun.com/wihatow/Market/raw/master/api/applications.json");
    var applications = {};
    /**
     * web界面使用数据结构如下：
     * {
     *      xxx：[
     *          v1.0.0,
     *          v1.1.1
     *      ]
     * }
     */
    for (let key in res) {
        applications[key] = res[key].versions;
    }
    return applications;
}

function generateAppItem(application, canDownload) {
    var line = document.createElement("div");
    line.style.float = "left";
    line.className = "verticalCenter";
    line.classList.add("margin5px");

    var left = document.createElement("div");
    left.style.float = "left";
    line.appendChild(left);

    var right = document.createElement("div");
    right.style.float = "left";
    line.appendChild(right);

    var icon = document.createElement("img");
    icon.src = application.icon;
    icon.style.padding = "5pt";
    icon.style.width = "60pt"
    if (canDownload) {
        var url = document.createElement("a");
        url.href = application.url;
        url.download = application.packageName + "_v" + application.versionName + "(" + application.versionCode + ")." + application.suffix;
        url.appendChild(icon);
        left.appendChild(url);
    } else {
        left.appendChild(icon);
    }

    var name = document.createElement("div");
    name.innerText = application.name;
    right.appendChild(name);

    var size = document.createElement("div");
    size.innerText = formatSize(application.size);
    right.appendChild(size);

    var version = document.createElement("div");
    version.innerText = application.versionName;
    right.appendChild(version);

    var time = document.createElement("div");
    time.innerText = application.time;
    right.appendChild(time);

    return line;
}

function download(file, rename) {
    var element = document.createElement("a");
    element.href = file;
    element.download = rename ? rename : "";
    element.click();
}

function downloadJson(json, name) {
    var data = new Blob([JSON.stringify(json)], {
        type: 'application/json'
    });
    var element = document.createElement("a");
    element.href = URL.createObjectURL(data);
    element.download = name ? name : "";
    element.click();
}

function parseQuery(query) {
    var args = {};
    var strings = query.match(/\w+=[^&]+/g);
    if (!strings) {
        return undefined;
    }
    for (let i = 0; i < strings.length; i++) {
        var string = strings[i].split("=");
        args[string[0]] = string[1];
    }
    return args;
}

function formatSize(size) {
    var flag = "B";
    if (size > Math.pow(2, 30)) {
        size /= Math.pow(2, 30);
        flag = "GB";
    } else if (size > Math.pow(2, 20)) {
        size /= Math.pow(2, 20);
        flag = "MB";
    } else if (size > Math.pow(2, 10)) {
        size /= Math.pow(2, 10);
        flag = "KB";
    }
    return Math.round(size * 100) / 100 + flag;
}