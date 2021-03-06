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
        ctx.strokeStyle = "#3d84a8";
        ctx.lineTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}
function endDrawing() {
    drawing = false;
    $("#signature").val(canvas.toDataURL());
}

$("#clear").click((e) => {
    e.preventDefault();
    $("#signature").attr("value", "");
    console.log("sdfsfsfsfsfsf");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
