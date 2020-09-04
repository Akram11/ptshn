// console.log("this is the linked scripts");
// let body = document.getElementsByTagName("body");
// body.style.backgroundColor = "red";

// $("form").css("background-color", "yellow");
$("document").on("load", () => {
    console.log("inside load");
    var canvas = document.getElementById("tutorial");
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgb(200, 0, 0)";
        ctx.fillRect(10, 10, 50, 50);

        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        ctx.fillRect(30, 30, 50, 50);
    }
});

$(window).load(function () {
    console.log("inside load");
    var canvas = $("canvas");
    console.log(canvas);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas.css("border", "1px solid black");
});
