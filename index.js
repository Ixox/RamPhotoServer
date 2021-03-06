// index.js
// 2018, Xavier Hosxe, https://github.com/ixox/photoServer
// Licensed under the MIT license.

const express = require('express');
const app = express();
const sharp = require('sharp');
const fs = require('fs');
const Cache = require('caching-map');

// Number of images in cache
const smallImageCache = new Cache(20000);
const bigImageCache = new Cache(1000);

// Size to recalculate on server before sending over the network
const smallPictureSize = 200;
const bigPictureSize = 1920;


// Local folder of the server
const installationPath = '/srv/dev-disk-by-label-MainDisk/dev/nodejs/photoServer';

// Photo root path
const photoRootPath='/srv/dev-disk-by-label-MainDisk/Photos';

app.use('/static', express.static(installationPath + '/static'));

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


var videoImg =  sharp({create: { width: 200, height: 150, channels: 3, background: { r: 0, g: 255, b: 0 } }}).png().toBuffer();
var errorImg =  sharp({create: { width: 200, height: 150, channels: 3, background: { r: 150, g: 0, b: 0 } }}).png().toBuffer();


// __P => the client requested a small Picture
app.get('/__P/*', (req, res) =>
    {
       var imageName = decodeURI(req.url.substring(5,  req.url.length));
       // Try to retrieve from the cache
       var imgBuffer = smallImageCache.get(imageName);

       if (!imgBuffer) {
            // false means not in cache
           if (imageName === '_html5video.png') {
               sharp({create: { width: 200, height: 120, channels: 3, background: { r: 0, g: 120, b: 150 } }}).png().toBuffer()
               .then(data => {
                   smallImageCache.set(imageName, data);
                   res.send(data);
               });
               return;
           }
           if (imageName === '_othervideo.png') {
               sharp({create: { width: 200, height: 120, channels: 3, background: { r: 150, g: 50, b: 50 } }}).png().toBuffer()
               .then(data => {
                   smallImageCache.set(imageName, data);
                   res.send(data);
               });
               return;
           }
           var path = photoRootPath + imageName;
           sharp(path).resize(smallPictureSize, smallPictureSize)
            .max()
            .rotate()
            .jpeg()
            .toBuffer()
            .then(data => {
                smallImageCache.set(imageName, data);
                res.send(data);
            })
            .catch(err => errorImg.then(data => res.send(data)));
        } else {
            res.send(imgBuffer);
        }
    }
);

// __BigP => the client requested a big Picture
app.get('/__BigP/*', (req, res) =>
    {
       var imageName = decodeURI(req.url.substring(8,  req.url.length));
       var imgBuffer = bigImageCache.get(imageName);
       if (!imgBuffer) {
           var path = photoRootPath + imageName;
           sharp(path).resize(bigPictureSize, bigPictureSize)
            .max()
            .rotate()
            .jpeg()
            .toBuffer()
            .then( data => {
               bigImageCache.set(imageName, data);
               res.send(data);
           });
       } else {
           res.send(imgBuffer);
       }
    }
);

// __V => the client requested a video.. Only HTML5 complient videos are supported.
app.get('/__V/*', (req, res) => 
    {
        var videoName = decodeURI(req.url.substring(5,  req.url.length));
        var path = photoRootPath + '/' + videoName;

        const stat = fs.statSync(path)
        const fileSize = stat.size
        const range = req.headers.range

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1] 
            ? parseInt(parts[1], 10)
            : fileSize-1
            const chunksize = (end-start)+1
            const file = fs.createReadStream(path, {start, end})
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            fs.createReadStream(path).pipe(res)
        }
    }
);

// Any other UTL is a frolder
app.get('/*', (req, res) =>
    {
        getHtml(req, res);
    }
);


// The HTML static file that we'll modify at runtame
var html = fs.readFileSync(installationPath + "/static/photoServer.html",  'utf8');

// 
app.listen(3333, () => console.log('Pictures server is ready. Listening on port 3333.'));


// The main function that constructs the HTML file
function getHtml(req, res) {

    if (req.url === '/favicon.ico') {
        res.status(404).send();
        return;
    }

    var htmlPhotos = '<ul class=\'photos\'>\n';
    var htmlFolders = '';


    var relativePath = decodeURI(req.url);
    var title = 'Photos ' + relativePath;
    relativePath = (relativePath === '/') ? '' : relativePath;


    var items;
    try {
      items = fs.readdirSync(photoRootPath + relativePath);
    } catch (e) {
      // Folder does not exist
      var htmlToSend = html.replace('<TITLE_HERE/>', "Rien a voir ici").replace('<FOLDERS_HERE/>', ('')).replace('<PHOTOS_HERE/>', '');
      res.send(htmlToSend);
      return;
    }


    items.filter(item => !item.startsWith(".")).sort();
    items.sort();

    if (items) {
        for (var i=0; i<items.length; i++) {
            var fullPath = photoRootPath + relativePath + '/' + items[i];
            var fsStat = fs.lstatSync(fullPath);
            if (fsStat.isFile()) {
                var upItemName = items[i].toUpperCase();
                var itemHtml = encodeURI(relativePath + '/' + items[i]).replace(/'/g, "%27");
                if (upItemName.endsWith('.JPG') || upItemName.endsWith('.PNG') || upItemName.endsWith('.TIF')) {
                    var it = "<li class='photo'><img class='photo' src='/__P/" + itemHtml + "'/><div class='photoName'>"+items[i]+"</div></li>\n";
                    htmlPhotos += it;
                } else if (upItemName.endsWith('.MP4')  || upItemName.endsWith('.MOV') ) {
                    var size = fsStat.size / 1024 / 1024;
                    var it = "<li class='video html5video'>"
                                +"<img class='video' src='/__P/_html5video.png'>"
                                +"<div class='videoTitle'>video</div>"
                                +"<div class='videoSize'>"+ size.toFixed(2) +"Mb</div>"
                                +"<div class='photoName' data-fullpath='"+ itemHtml +"'>"+items[i]+"</div>"
                            +"</li>\n";
                    htmlPhotos += it;
                } else if (upItemName.endsWith('.MTS') || upItemName.endsWith('.AVI')) {
                    var size = fsStat.size / 1024 / 1024;
                    var it = "<li class='video'>"
                                +"<img class='video' src='/__P/_othervideo.png'>"
                                +"<div class='videoTitle'>video</div>"
                                +"<div class='videoSize'>"+ size.toFixed(2) +"Mb</div>"
                                +"<div class='photoName'>"+items[i]+"</div>"
                            +"</li>\n";
                    htmlPhotos += it;
                }
            } else if (fsStat.isDirectory()) {
                var folderLink = encodeURI(relativePath + '/' + items[i]).replace(/'/g, "%27");
                var folderHtml = "<li class='folder' data-url='" + folderLink + "'>"+ items[i]  +"\/</li>";
                htmlFolders = folderHtml + htmlFolders;
            }
        }

        if (req.url !== '/') {
            // add parent directory
            var lastIndex = req.url.lastIndexOf('/');
            var parent;
            if (lastIndex === 0) {
                parent = '/';
            } else {
                parent = req.url.substring(0, lastIndex);
            }
            htmlFolders = "<li class='folderUp' data-url='" + parent + "'>..\/ (Up)</li>" + htmlFolders;
        }

        htmlPhotos += '</ul>\n';
        htmlFolders = '<ul class=\'folders\'>\n' + htmlFolders + '</ul>\n';

    } else {
        htmlPhotos+="<h1/>###ERROR###</h1>";
    }

    var htmlToSend = html.replace('<TITLE_HERE/>', title).replace('<FOLDERS_HERE/>', htmlFolders).replace('<PHOTOS_HERE/>', htmlPhotos);

    res.send(htmlToSend);
}
