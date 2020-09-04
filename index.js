const express = require("express");
const app = express();
const db = require("./db");
const handlebars = require("express-handlebars");

app.set("view engine", "hbs");
app.engine(
    "hbs",
    handlebars({
        layoutsDir: __dirname + "/views/layouts",
        extname: "hbs",
    })
);
app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("main", { layout: "index" });
    // res.send("petition");
});

app.get("/thanks", (req, res) => {
    console.log("thanks");
});

app.get("/signers", (req, res) => {
    db.getSigners()
        .then(({ rows }) => {
            console.log(rows);
        })
        .catch((err) => {
            console.log("error", err);
        });
});

app.post("/add", (req, res) => {
    // res.redirect("/");
    // req.body.id (name)
    db.addSign("mark", "john", "sfsfsfsfsfsfsf")
        .then(() => {
            console.log("signer Added");
        })
        .catch((err) => {
            console.log("error", err);
        });
});

app.post("/add", (req, res) => {
    console.log("POST");
});

app.listen(8080, () => console.log("Server is listening ...."));
