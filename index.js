const express = require("express");
const app = express();
const db = require("./db");
const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

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
        secret: "TOP SECRET STUFF",
        maxAge: 24 * 60 * 60 * 1000,
    })
);

app.use(express.urlencoded({ extended: false }));
app.use(csurf());
app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    res.setHeader("x-frame-options", "deny");
    next();
});
app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    req.session.signatureId
        ? res.redirect("/thanks")
        : res.render("main", { layout: "index" });
});

app.get("/thanks", (req, res) => {
    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
        db.getSigTotal(req.session.signatureId)
            .then(({ rows }) => {
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
                console.error("Erro", err);
            });
    }
});

app.get("/signers", (req, res) => {
    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
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
    }
});

app.post("/petition", (req, res) => {
    const { fname, lname, signature } = req.body;
    db.addSignature(fname, lname, signature)
        .then(({ rows }) => {
            req.session.signatureId = rows[0].id;
            res.redirect(`/thanks`);
        })
        .catch((err) => {
            console.log("error", err);
        });
});

app.listen(8080, () => console.log("Server is listening ...."));
