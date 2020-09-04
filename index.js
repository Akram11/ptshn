const express = require("express");
const app = express();
const db = require("./db");

app.use(express.static("./public"));

app.get("/", (req, res) => {
    console.log("running");
});

app.get(/)

// app.get("/cities", (req, res) => {
//     db.getCities()
//         .then(({ rows }) => {
//             console.log(rows);
//         })
//         .catch((err) => {
//             console.log("error", err);
//         });
// });

// app.get("/add-city", (req, res) => {
//     db.addCity("Damas", 109000, "SYR")
//         .then(() => {
//             console.log("City Added");
//         })
//         .catch((err) => {
//             console.log("error", err);
//         });
// });

app.listen(8080, () => console.log("Server is listening ...."));
