const express = require("express");
const app = express();
const db = require("./db");
const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");

app.set("view engine", "hbs");
app.engine(
    "hbs",
    handlebars({
        layoutsDir: __dirname + "/views/layouts",
        extname: "hbs",
    })
);

app.use(
    cookieSession({
        secret: "oh la la, very secretive line",
        maxAge: 24 * 60 * 60 * 1000,
    })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    console.log("req.session: ", req.session.secret);

    res.render("main", { layout: "index" });
});

app.get("/thanks", (req, res) => {
    console.log(req.session.signatureId);
    const fname = req.query.fname;
    db.getSigTotal(req.session.signatureId)
        .then(({ rows }) => {
            console.log("_++++++++++>>>>>", rows);
            res.render("thanks", {
                total: rows[0].total,
                signer: {
                    fname: rows[0].first_name,
                    signature: rows[0].signature,
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
        .then(({ rows }) => {
            req.session.signatureId = rows[0].id;
            res.redirect(`/thanks?fname=${fname}`);
        })
        .catch((err) => {
            console.log("error", err);
        });
});

app.listen(8080, () => console.log("Server is listening ...."));
