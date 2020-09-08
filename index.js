const express = require("express");
const app = express();
const db = require("./db");
const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const bc = require("./bc");

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

app.get("/register", (req, res) => {
    req.session.userId;
    res.render("register", {
        layout: "index",
    });
});

app.get("/profile", (req, res) => {
    // req.session.userId;
    res.render("profile", {
        layout: "index",
    });
});

app.post("/register", (req, res) => {
    const { fname, lname, email, pwd } = req.body;
    bc.hash(pwd)
        .then((hash) => {
            db.addUser(fname, lname, email, hash)
                .then(({ rows }) => {
                    req.session.userId = rows[0].id;
                    res.redirect(`/`);
                })
                .catch((err) => {
                    console.log(err);
                });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "index",
    });
});

app.post("/login", (req, res) => {
    const { email, pwd } = req.body;
    console.log(email);
    db.getUserEmail(email).then(({ rows }) => {
        // console.log(rows[0].hash, email, password);
        if (rows.length === 0) {
            return;
            //do something email doen't exist
        } else {
            bc.compare(pwd, rows[0].hash).then((result) => {
                if (!result) {
                    return;
                    //do somethin password is wrong
                } else {
                    req.session.userId = rows[0].id;
                    res.redirect(`/petition`);
                }
            });
        }
    });
});

app.get("/petition", (req, res) => {
    // req.session.userId
    //     ? res.redirect("/thanks")
    // :
    res.render("main", { layout: "index" });
});

app.get("/thanks", (req, res) => {
    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
        db.getSigTotal(req.session.userId)
            .then(({ rows }) => {
                res.render("thanks", {
                    total: rows[0].total,
                    signer: {
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
        db.getSignatures()
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
    const { signature } = req.body;

    db.addSignature(signature, req.session.userId)
        .then(({ rows }) => {
            req.session.signatureId = rows[0].id;
            res.redirect(`/thanks`);
        })
        .catch((err) => {
            console.log("error", err);
        });
});

app.listen(8080, () => console.log("Server is listening ...."));
