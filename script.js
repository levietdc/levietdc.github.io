window.onload = function () {

    //Get all necessary HTML elements
    var canvas1 = document.getElementById("myCanvas1");
    var context1 = canvas1.getContext("2d");

    var canvas2 = document.getElementById("myCanvas2");
    var context2 = canvas2.getContext("2d");

    var video = document.getElementById("myVideo");
    var button = document.getElementById("myButton");

    //Threshold for edge detection
    var threshold = 150;

    //Play/Pause button event handler
    button.onclick = function () {
        if (video.paused) {
            video.play();
            button.innerHTML = "Pause";
        }
        else {
            video.pause();
            button.innerHTML = "Play";
        }
    };

    //Do some initializations when video is ready
    video.oncanplay = function () {
        var vid = this;

        canvas1.width = canvas2.width = vid.videoWidth;
        canvas1.height = canvas2.height = vid.videoHeight;

        button.disabled = false;
    };

    //Extract video frames and detect edge while video is playing
    video.onplay = function () {
        var vid = this;

        (function loop() {
            if (!vid.paused && !vid.ended) {

                //Draw original current frame on context1
                context1.drawImage(vid, 0, 0);

                //Get image data from context1 and detect edge
                var frameData = context1.getImageData(0, 0, vid.videoWidth, vid.videoHeight);
                var frameEdge = sobel(frameData, threshold);

                //Draw edge image data on context2
                context2.putImageData(frameEdge, 0, 0);

                //Loop these things every 1000/30 miliseconds (30 fps)
                setTimeout(loop, 1000 / 30);
            }
        })();
    };

    //Change button to "Play" when video has ended
    video.onended = function () {
        button.innerHTML = "Play";
    };
};

function sobel(imgData, th) {

    //Some image information
    var row = imgData.height;
    var col = imgData.width;

    var rowStep = col * 4;
    var colStep = 4;

    var data = imgData.data;

    var newImgData = new ImageData(col, row);

    //Loop for each pixel
    for (var i = 1; i < row - 1; i += 1)
        for (var j = 1; j < col - 1; j += 1) {

            //Current position
            var center = i * rowStep + j * colStep;

            //Get value of 8 neighbor pixels (green channel)
            var topLeft = data[center - rowStep - colStep + 1];
            var top = data[center - rowStep + 1];
            var topRight = data[center - rowStep + colStep + 1];
            var left = data[center - colStep + 1];
            var right = data[center + colStep + 1];
            var bottomLeft = data[center + rowStep - colStep + 1];
            var bottom = data[center + rowStep + 1];
            var bottomRight = data[center + rowStep + colStep + 1];

            //Calculate the gradient
            var dx = (topRight - topLeft) + 2 * (right - left) + (bottomRight - bottomLeft);
            var dy = (bottomLeft - topLeft) + 2 * (bottom - top) + (bottomRight - topRight);
            var grad = Math.sqrt(dx * dx + dy * dy);

            //Thresholding
            if (grad >= th)
                newImgData.data[center] = newImgData.data[center + 1] = newImgData.data[center + 2] = 255;
            else
                newImgData.data[center] = newImgData.data[center + 1] = newImgData.data[center + 2] = 0;

            newImgData.data[center + 3] = 255;
        }

    return newImgData;
}