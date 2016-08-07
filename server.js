/**
 * HTTP SERVER
 * 127.0.0.1:3000
 */
var e = require("express");
e().use(e.static("static")).listen(3000, function () {
    console.log("127.0.0.1:3000");
});
