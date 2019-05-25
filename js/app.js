;
var app = {};
app.avatarCreator = (function(module) {
    /* Variables declare */
    var $frameBtn   = $('#avatar-frame-btn'),
        $framePath  = $('#avatar-frame-path');
    var $avatarBtn  = $('#avatar-btn'),
        $avatarPath = $('#avatar-path');
    var $generateBtn= $('#avatar-generate'),
        $downloadBtn= $('#avatar-download')
    var frameFile = null,
        avatarFile= null;
    var avatarWidth = 1024,  // Output size
        avatarHeight= 1024;  // Output size
    var outputFileName = "Avatar.png";

    var ERROR_MESSAGE = {
        INPUT_FILES: "Input files are incorrect!",
        UNKNOWN: "Error! Please try again."
    };

    module.initialize = function () {
        registerEvents();
    }
    
    function registerEvents() {
        $frameBtn.change(function(e) {
            var name = splitFileName(e.target.value);
            $framePath.val(name);
            frameFile = e.target.files[0];
        });
        $avatarBtn.change(function(e) {
            var name = splitFileName(e.target.value);
            $avatarPath.val(name);
            avatarFile = e.target.files[0];
        });
        $generateBtn.on('click', function() {
            NProgress.start();
            NProgress.set(0.5);
            var message = mergeFrameAndAvatarToImageObject();
            if (message && message.length > 0) {
                alert(message);
                NProgress.done();
            }
        });
        $downloadBtn.on('click', function() {
            var canvas = document.getElementById('final-avatar');
            if (!isCanvasBlank(canvas)) {
                var data = canvas.toDataURL();
                download(data, outputFileName, "image/png");
            }
        });
    }

    function splitFileName(fileName) {
        return fileName.replace(/^.*[\\\/]/, '');
    }

    function isInputFileCorrect() {
        if (!frameFile || !avatarFile)
            return false;
        return frameFile.type.split('/')[0] === 'image'
            &&avatarFile.type.split('/')[0] === 'image'
    }

    function isCanvasBlank(canvas) {
        var blank = document.createElement('canvas');
        blank.width  = avatarWidth;
        blank.height = avatarHeight;

        return canvas.toDataURL() === blank.toDataURL();
    }

    function mergeFrameAndAvatarToImageObject() {
        var canvas  = document.getElementById('final-avatar');
        var context = canvas.getContext("2d");

        if (!isInputFileCorrect())
            return ERROR_MESSAGE.INPUT_FILES;

        var imgFiles = [
            URL.createObjectURL(avatarFile), URL.createObjectURL(frameFile)];
        var imgObjs = [];
        var count = imgFiles.length;

        $.each(imgFiles, function() {
            var imgObj = new Image();
            imgObjs.push(imgObj);
            imgObj.onload = function() {
                count--;
                if (!count) {
                    $.each(imgObjs, function(idx) {
                        if (idx === 0) { /* Image is avatar */
                            var diff = compareWidthHeight(
                                this.width, 
                                this.height
                            );
                            context.drawImage(this, 
                                diff[0]/2, diff[1]/2, this.width-diff[0], this.height-diff[1], 
                                0, 0, avatarWidth, avatarHeight
                            );
                        } else { /* Image is frame */
                            context.drawImage(this, 0, 0, avatarWidth, avatarHeight);
                        }
                    });
                    NProgress.done();
                }
            };
            imgObj.src = this;
        });
    }

    function compareWidthHeight(width, height) {
        var arrCompare = [];
        if(width > height) {
            arrCompare[0] = width - height;
            arrCompare[1] = 0;
        } else {
            arrCompare[0] = 0;
            arrCompare[1] = height - width;
        }
        return arrCompare;
    }
    return module;
})(app);
$(document).ready(function(){
    app.avatarCreator.initialize();
});
