const spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSigners = () => {
    return db.query("SELECT * FROM signers");
};

module.exports.addSign = (fname, lname, signiture) => {
    return db.query(
        `INSERT INTO signers (first_name, last_name, signiture) VALUES ($1, $2, $3)`,
        [fname, lname, signiture]
    );
};
