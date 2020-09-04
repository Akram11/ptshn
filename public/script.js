let drawing = false;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.addEventListener("mousedown", function (e) {
    beginDrawing(e);
});

canvas.addEventListener("mousemove", function (e) {
    doDrawing(e);
});
canvas.addEventListener("mouseup", endDrawing);
canvas.addEventListener("mouseleave", endDrawing);

function beginDrawing(e) {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
}

function doDrawing(e) {
    if (drawing) {
        ctx.strokeStyle = "black";
        ctx.lineTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
        ctx.stroke();
        console.log(dataURL);
    }
}

function endDrawing() {
    drawing = false;
}

$("#clear").click((e) => {
    e.preventDefault();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

let dataURL = canvas.toDataURL();
