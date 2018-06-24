// photoServer.js
// 2018, Xavier Hosxe, https://github.com/ixox/photoServer
// Licensed under the MIT license.

"use strict";

$(document).ready(function() {
    console.log("Document Ready");

    var currentLi = null;

    $('#bigPicture').hide();
    $('div.videoDiv').hide();

    $('li.folder').attr('style', 'cursor:pointer;');
    $('img.photo').attr('style', 'cursor:pointer;');
    $('li.html5video').attr('style', 'cursor:pointer;');
    $('li.folder').click(function() {
        location.href = $(this).attr("data-url");
    });
    $('li.folderUp').attr('style', 'cursor:pointer;');
    $('li.folderUp').click(function() {
        location.href = $(this).attr("data-url");
    });

    $(window).scroll(function() {
        bigPictureOnScreen();
    });

    $('img.photo').click(function() {
        showImageInBigPicture($(this));
        selectImage($(this));
    });

    $('li.html5video').click(function() {
        var path = $(this).find('div.photoName').attr('data-fullpath');
        $('div.videoDiv').show();
        $('#videoPlayer').find("source").attr("src", "/__V" + path);
        $('#videoPlayer')[0].load();
        $('div.videoDiv').css('top', $(window).scrollTop())
    });

    $('div.htmlvideoclose').click(function() {
        $('#videoPlayer')[0].pause();
        $('div.videoDiv').hide();
    });

    function hideBigPicture() {
        $('img.bigPicture').attr('src', '');
        $('img.bigPicture').attr('width', '100%');
        $('img.bigPicture').attr('height', '100%');
        $('#bigPicture').hide();
        scrollPhotoMiddle(currentLi);
    }

    function selectImage(img) {
        currentLi = img.parent();
        $('img.photo').css({ 'border':'none'});
        img.css({ 'border':'2px red solid'})
        if ($('#bigPicture').is(':visible')) {
            scrollPhotoBottom(img);
        } else {
            scrollPhotoMiddle(img);
        }
    }

    function showImageInBigPicture(img) {
        // Allow correct size/resizing of next picture
        $('img.bigPicture').attr('width', '100%');
        $('img.bigPicture').attr('height', '100%');

        $('img.bigPicture').css('opacity', 0);
        var bigPictureSizeSrc = img.attr('src').replace('/__P/', '/__BigP/');
        $('img.bigPicture').attr('src', bigPictureSizeSrc);
        bigPictureOnScreen();
        $('#bigPicture').show();
        var imageName = img.attr('src');
        $('div.bigPictureName').text(decodeURI(imageName.substring(imageName.lastIndexOf('/') + 1, imageName.length)));
    }

    function bigPictureOnScreen() {
        $('#bigPicture').css('top', $(window).scrollTop())
    }

    function changePicture(next) {
        var nextLi;
        var cl = currentLi;

        if (next) {
            if (currentLi) {
                nextLi = currentLi.next();
            } else {
                nextLi = $('li.photo').first();
            }
        } else {
            if (currentLi) {
                nextLi = currentLi.prev();
            } else {
                nextLi = $('li.photo').last();
            }
        }
        if (!nextLi || nextLi.length <= 0) {
            currentLi = cl;
        } else {
            currentLi = nextLi;
        }
    }

    function selectPicture() {
        if (currentLi) {
            var img = currentLi.find('img');
            selectImage(img);
            if ($('#bigPicture').is(':visible')) {
                showImageInBigPicture(img);
            }
        }
    }

    function scrollPhotoBottom(elem) {
        var height = $(window).height();
        $('html, body').scrollTop(elem.offset().top - height + elem.height() + 10);
    }

    function scrollPhotoMiddle(elem) {
        var height = $(window).height();
        $('html, body').scrollTop(elem.offset().top - (height - elem.height()) / 2);
    }



    $('img.bigPicture')
        .on('load', function(){
            var imgWidth = $(this).width();
            var imgHeight = $(this).height();
            if (imgHeight > $(window).height()) {
                var ratio = $(window).height() / $(this).height() ;
                $(this).attr('height', imgHeight * ratio);
                $(this).attr('width', imgWidth * ratio);
            }
            $(this).css('opacity', 1);

        });

    $("#bigPicture").swipe( {
      //Single swipe handler for left swipes
      swipeLeft:function(event, direction, distance, duration, fingerCount) {
          changePicture(true);
          selectPicture();
      },
      swipeRight:function(event, direction, distance, duration, fingerCount) {
          changePicture(false);
          selectPicture();
      },
      swipeUp:function(event, direction, distance, duration, fingerCount) {
          $(this).slideUp(200, function() {
            hideBigPicture();
          });
      },
      //Default is 75px, set to 0 for demo so any distance triggers swipe
      threshold:20
    });

    $(document).keydown(function(e) {
        // console.log("KEY PRESSED : "+ e.which);

        if (e.which === 8) {
            $('li.folderUp').trigger('click');
        }

        // Still undifined if only folders
        switch(e.which) {
            case 8: // backspace
            break;

            case 37: // left
                changePicture(false);
                selectPicture();
            break;

            case 39: // right
                changePicture(true);
                selectPicture();
            break;

            case 40: // down
                var cl = currentLi;
                if (currentLi) {
                    var posY = currentLi.offset().top;
                    var posX = currentLi.offset().left;
                    while ((Math.abs(currentLi.offset().top - posY) < 10 || Math.abs(currentLi.offset().left - posX) > 10)) {
                        currentLi = currentLi.next();
                        if (currentLi.length === 0) {
                            break;
                        }
                    }
                } else {
                    currentLi = $('li.photo').first();
                }
                if (currentLi.length === 0) {
                    currentLi = cl;
                }
                selectPicture();
            break;

            case 38: // up
                var cl = currentLi;
                if (currentLi) {
                    var posY = currentLi.offset().top;
                    var posX = currentLi.offset().left;
                    while ((Math.abs(currentLi.offset().top - posY) < 10 || Math.abs(currentLi.offset().left - posX) > 10)) {
                        currentLi = currentLi.prev();
                        if (currentLi.length === 0) {
                            break;
                        }
                    }
                } else {
                    currentLi = $('li.photo').last();
                }
                if (currentLi.length === 0) {
                    currentLi = cl;
                }
                selectPicture();
                break;
            case 27:
                hideBigPicture();
                break;

            case 32:
            case 13:
                if (currentLi) {
                    var img = currentLi.find('img');
                    showImageInBigPicture(img);
                    selectImage(img);
                }
            break;


            default:
            return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });
});
