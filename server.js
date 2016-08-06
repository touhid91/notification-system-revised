/**
 * HTTP SERVER
 * 127.0.0.1:3000
 */
express()
    .use(express.static("static"))
    .listen(3000);
