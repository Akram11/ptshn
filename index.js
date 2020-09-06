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

app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("main", { layout: "index" });
});

app.get("/thanks", (req, res) => {
    const fname = req.query.fname;
    db.getTotal()
        .then(({ rows }) => {
            console.log("Total", rows[0].count);
            res.render("thanks", {
                total: rows[0].count,
                signer: {
                    fname: fname,
                },
                layout: "index",
            });
        })
        .catch((err) => {
            console.error(err);
        });
});

app.get("/signers", (req, res) => {
    db.getSigners()
        .then(({ rows }) => {
            res.render("signers", {
                layout: "index",
                rows,
            });
        })
        .catch((err) => {
            console.log("error", err);
        });
});

app.post("/petition", (req, res) => {
    const { fname, lname, signature } = req.body;
    db.addSignature(fname, lname, signature)
        .then(() => {
            console.log("signer Added");
        })
        .catch((err) => {
            console.log("error", err);
        });
    res.redirect(`/thanks?fname=${fname}`);
});

app.listen(8080, () => console.log("Server is listening ...."));
