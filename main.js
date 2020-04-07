var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

//refactoring
var template = require('./lib/template.js');


var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if (pathname === '/') {
        if (queryData.id === undefined) {
            fs.readdir('./data', function(error, filelist) {
                var title = 'welcome';
                var describtion = 'Hello, Node.js';
                var list = template.list(filelist);
                var html = template.html(title, list,
                    `<h2>${title}</h2>${describtion}`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        } else {
            fs.readdir('./data', function(error, filelist) {
                fs.readFile(`data/${queryData.id}`, 'utf8', function(err, describtion) {
                    var title = queryData.id;
                    var list = template.list(filelist);
                    var html = template.html(title, list,
                        `<h2>${title}</h2>${describtion}`,
                        `<a href="/create">create</a>
                         <a href="/update?id=${title}">update</a>
                         <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value="delete">
                         </form>
                        `
                    );
                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function(error, filelist) {
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.html(title, list, `
              <form action="/create_process" method="post">
                  <p><input type="text" name="title" placeholder="title"></p>
                  <p>
                      <textarea name="describtion" placeholder="describtion"></textarea>
                  </p>
                  <p>
                      <input type="submit">
                  </p>
              </form>
              `,'');
            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === '/create_process') {
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var title = post.title;
            var describtion = post.describtion;
            fs.writeFile(`data/${title}`, describtion, 'utf-8', function(err){
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end();
            })
        });
    } else if(pathname === '/update'){
        fs.readdir('./data', function(error, filelist) {
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, describtion) {
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.html(title, list,
                    `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="describtion" placeholder="describtion">${describtion}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname ==='/update_process'){
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var describtion = post.describtion;
            fs.rename(`data/${id}`, `data/${title}`, function(error){
                fs.writeFile(`data/${title}`, describtion, 'utf-8', function(err){
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                })
            })
        });
    } else if(pathname === '/delete_process'){
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            fs.unlink(`data/${id}`, function(error){
                response.writeHead(302, {Location: `/`});
                response.end();
            })
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
    }


    //response.end(fs.readFileSync(__dirname + _url)); ////사용자가 접속한  url에 따라 파일을 읽음
    //301 = 이주소는 이주소로 영원히 바뀐다.
    //302 = 라다이렉션
});
app.listen(3000);

//pm2 start main.js --watch --ignore-watch="data/* session/*" --no-daemon
