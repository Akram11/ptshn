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

// app.use("/auth", (req, res, next) => {
//     if (req.session.userId) {
//         res.redirect("/petition");
//     } else {
//         next();
//     }
// });

//
// const requireLoggedOut = (req, res, next) => {
//     if (req.session.userId) {
//         res.redirect("/petition");
//     } else {
//         next();
//     }
// };
// const requireSig = (req, res, next) => {
//     if (req.session.signatureId) {
//         res.redirect("/thanks");
//     } else {
//         next();
//     }
// };

app.use((req, res, next) => {
    if (!req.session.userId && req.url != "/login" && req.url != "/register") {
        res.redirect("/register");
    } else {
        next();
    }
});
app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/register", (req, res) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.render("register", {
            layout: "index",
        });
    }
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "index",
        name: req.session.name,
    });
});

app.post("/profile", (req, res) => {
    const { city, age, url } = req.body;
    if (isNotValidURL(url)) {
        res.render("profile", {
            layout: "index",
            msg: "Invalid url, please try again",
            name: req.session.name,
        });
    } else {
        db.updateProfile(age, city.trim(), url, req.session.userId)
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                res.render("profile", {
                    layout: "index",
                    msg: "something went wrong, please try again",
                    name: req.session.name,
                });
            });
    }
});

app.post("/register", (req, res) => {
    const { fname, lname, email, pwd } = req.body;
    if (isEmpty(fname, lname, email, pwd)) {
        res.render("register", {
            layout: "index",
            msg: "something went wrong, please try again",
        });
    } else {
        bc.hash(pwd)
            .then((hash) => {
                db.addUser(fname, lname, email.toLowerCase(), hash)
                    .then(({ rows }) => {
                        req.session.userId = rows[0].id;
                        req.session.name = fname;
                        res.redirect(`/profile`);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.render("register", {
                            layout: "index",
                            msg: "somthing went wrong!",
                        });
                    });
            })
            .catch((err) => {
                res.render("register", {
                    layout: "index",
                });
                console.log(err);
            });
    }
});

app.get("/login", (req, res) => {
    if (req.session.userId) {
        res.redirect("/profile");
    } else {
        res.render("login", {
            layout: "index",
        });
    }
});

app.post("/login", (req, res) => {
    const { email, pwd } = req.body;
    db.getUserEmail(email).then(({ rows }) => {
        if (rows.length === 0) {
            res.render("login", {
                layout: "index",
                msg: "user doesn't exist",
            });
        } else {
            bc.compare(pwd, rows[0].hash).then((result) => {
                if (!result) {
                    res.render("login", {
                        layout: "index",
                        msg: "pass is wrong",
                    });
                } else {
                    req.session.userId = rows[0].id;
                    db.isSigned(req.session.userId).then(({ rows }) => {
                        req.session.signed = rows.length == 0 ? false : true;
                        res.redirect(`/petition`);
                    });
                }
            });
        }
    });
});

app.get("/petition", (req, res) => {
    req.session.signed
        ? res.redirect("/thanks")
        : res.render("main", { layout: "index" });
});

app.get("/thanks", (req, res) => {
    if (!req.session.signed) {
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
    if (!req.session.userId || !req.session.signed) {
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
app.get("/signers/:city", (res, req) => {
    const city = req.req.params.city;
    if (!req.req.session.userId || !req.req.session.signed) {
        res.res.redirect("/petition");
    } else {
        db.getUsersByCity(city).then(({ rows }) => {
            res.res.render("signers", {
                layout: "index",
                rows,
                city,
            });
        });
    }
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    if (signature === "") {
        res.render("main", { layout: "index", msg: "signature is required" });
    }
    db.addSignature(signature, req.session.userId)
        .then(() => {
            req.session.signed = true;
            res.redirect(`/thanks`);
        })
        .catch((err) => {
            console.log("error", err);
        });
});

app.get("/profile/edit", (req, res) => {
    db.getUserInfo(req.session.userId).then(({ rows }) => {
        res.render("edit", {
            layout: "index",
            rows,
        });
    });
});

app.post("/profile/edit", (req, res) => {
    const { fname, lname, email, age, city, url, pwd } = req.body;
    if (isNotValidURL(url) || isEmpty(fname, lname, email)) {
        res.redirect("/profile/edit");
    } else {
        if (pwd) {
            bc.hash(pwd)
                .then((hash) => {
                    db.updateUserPwd(
                        fname,
                        lname,
                        email,
                        hash,
                        req.session.userId
                    ).then(() => {
                        db.updateProfile(
                            age,
                            city.toLowerCase(),
                            url,
                            req.session.userId
                        ).then(() => {
                            res.redirect("/petition");
                        });
                    });
                })
                .catch((err) => console.log(err));
        } else {
            db.updateUser(fname, lname, email, req.session.userId)
                .then(() => {
                    db.updateProfile(
                        age,
                        city.toLowerCase(),
                        url,
                        req.session.userId
                    ).then(() => {
                        res.redirect("/petition");
                    });
                })
                .catch((err) => {
                    console.err(err);
                    res.redirect("/profile/edit");
                });
        }
    }
});

app.post("/thanks", (req, res) => {
    db.deleteSig(req.session.userId)
        .then(() => {
            req.session.signed = false;
            res.redirect(`/petition`);
        })
        .catch((err) => console.log(err));
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/register");
});

app.get("/delete", (req, res) => {
    db.deleteSig(req.session.userId)
        .then(() => {
            db.deleteProfile(req.session.userId).then(() => {
                db.deleteUser(req.session.userId).then(() => {
                    req.session = null;
                    res.redirect("/register");
                });
            });
        })
        .catch((err) => console.log(err));
});

app.get("/how-does-it-work", (req, res) => {
    res.render("work", {
        layout: "index",
    });
});

app.use((req, res, next) => {
    res.status(404).render("lost", {
        layout: "index",
    });
});

app.listen(process.env.PORT || 8080, () =>
    console.log("Server is listening ....")
);

const isNotValidURL = (url) => {
    if (url.length == 0) {
        return false;
    } else if (
        !url.startsWith("http://") ||
        !url.startsWith("https://") ||
        url.includes(">") ||
        url.includes("<") ||
        url.includes(";")
    ) {
        return true;
    }
};

const isEmpty = (...args) => {
    return args.includes("");
};

//  TODO //////////////////////////////////////////////////////////////////
// ** HANDL ERRORS ON: **
//      -login
//      -register
//   -- render an error msg to the user --
//
// ** SERVER SIDE VALIDATION **// url field
// ** CLIENT SIDE VALIDATION **
