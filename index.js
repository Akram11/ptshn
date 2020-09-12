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
app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/register", (req, res) => {
    if (req.session.userId) {
        res.redirect("/profile");
    } else {
        res.render("register", {
            layout: "index",
        });
    }
});

app.get("/profile", (req, res) => {
    if (req.session.userId) {
        res.render("profile", {
            layout: "index",
        });
    } else {
        res.redirect("/register");
    }
});

app.post("/profile", (req, res) => {
    const { city, age, url } = req.body;
    console.log(req.session.userId, city, age, url);
    db.updateProfile(age, city, url, req.session.userId)
        .then(() => {
            res.redirect("/petition");
        })
        .catch((err) => {
            console.error(err);
        });
});

app.post("/register", (req, res) => {
    const { fname, lname, email, pwd } = req.body;
    bc.hash(pwd)
        .then((hash) => {
            db.addUser(fname, lname, email.toLowerCase(), hash)
                .then(({ rows }) => {
                    req.session.userId = rows[0].id;
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
    console.log(email);
    db.getUserEmail(email).then(({ rows }) => {
        // console.log(rows[0].hash, email, password);
        if (rows.length === 0) {
            // return;
            //do something email doen't exist
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
                        console.log(":req.session.signed", req.session.signed);
                        res.redirect(`/profile`);
                    });
                    //do a query to check if the user has signed
                }
            });
        }
    });
});

app.get("/petition", (req, res) => {
    req.session.userId
        ? req.session.signed
            ? res.redirect("/thanks")
            : res.render("main", { layout: "index" })
        : res.redirect("/register");
});

app.get("/thanks", (req, res) => {
    if (!req.session.userId) {
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
    if (!req.session.userId) {
        res.redirect("/petition");
    } else {
        db.getSignatures()
            .then(({ rows }) => {
                console.log(rows);
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
    db.getUsersByCity(city).then(({ rows }) => {
        // console.log(rows);
        res.res.render("signers", {
            layout: "index",
            rows,
            city,
        });
    });
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
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
    if (!req.session.userId) {
        res.redirect("/register");
    } else {
        db.getUserInfo(req.session.userId).then(({ rows }) => {
            res.render("edit", {
                layout: "index",
                rows,
            });
        });
    }
});

app.post("/profile/edit", (req, res) => {
    const { fname, lname, email, age, city, url, pwd } = req.body;
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
                    db.updateProfile(age, city, url, req.session.userId).then(
                        () => {
                            res.redirect("/profile/edit");
                        }
                    );
                });
            })
            .catch((err) => console.log(err));
    } else {
        db.updateUser(fname, lname, email, req.session.userId)
            .then(() => {
                db.updateProfile(age, city, url, req.session.userId).then(
                    () => {
                        res.redirect("/profile/edit");
                    }
                );
            })
            .catch((err) => console.log(err));
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

app.use((req, res, next) => {
    res.status(404).send("Unable to find the requested resource!");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("Server is listening ....")
);

//  TODO //////////////////////////////////////////////////////////////////
// ** HANDL ERRORS ON: **
//      -login
//      -register
//   -- render an error msg to the user --
//
// ** SERVER SIDE VALIDATION **// url field
// ** CLIENT SIDE VALIDATION **
// STORE FNAME IN A COOKIE
