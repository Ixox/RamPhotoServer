## RAM Photos Server

I developped this server without having in mind to share the code.
So the documentation is minimal and the code quite rough.
But i think it can be usefull for others as it's usefull for me.

My goal was to have a personal http photo server with the following features :
* Read photos and folders from the hard drive and show the folders and pictures in HTML.
* Minimal network bandwidth. Pictures are resized in real time before being send over the network.
* Stream HTML5 compatible video. Very simple but usefull.
* No disk write, thumbnail and pictures are cached in RAM.
* No folder cache for immediate view of new pictures
* Click on any picture or video to see them full screen.
* On a computer can navigate through the pictures with the keyboard (arrow + spacebar + escape)
* On a smartphone can swipe to navigate
* Always see picture name to find them in the real folder if necessary.

There are main html and css files that allow easy modification of the look.
But here is how it looks like with the default files :

<div style="text-align:center">

![Pictures](./pictures/RamPhotosServer.jpg)

</div>


The server side is build with [nodejs](https://nodejs.org) with the following great extensions :
* Fast, unopinionated, minimalist web framework : [express](http://expressjs.com/fr/)
* In-memory cache for JavaScript objects : [caching-map](https://www.npmjs.com/package/caching-map)
* High performance Node.js image processing : [sharp](https://github.com/lovell/sharp)

The UI side uses [jquery](https://jquery.com/) and the [touchSwipe](http://labs.rampinteractive.co.uk/touchSwipe/demos/index.html) plugin.

After downloading this repository a npm install is required.
The "Sharp" extension is compiled and you must have gcc installed.

I installed it as a systemd service file on my Linux NAS using the provided photos.service so that it's always running.
To test it you should be able to run :
 node ./photoServer/index.js

Xavier
