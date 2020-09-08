const spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSigners = (id = 0) => {
    if (id === 0) {
        return db.query(
            "SELECT first_name, last_name FROM signers"
            // "SELECT first_name, last_name, (select count(id) from signers) as total FROM signers"
        );
    } else {
        return db.query(
            `SELECT first_name, signature FROM signers WHERE id = ${id}`
            // "SELECT first_name, last_name, (select count(id) from signers) as total FROM signers"
        );
    }
};

module.exports.addSignature = (fname, lname, signature) => {
    return db.query(
        `INSERT INTO signers (first_name, last_name, signature) VALUES ($1, $2, $3) returning id`,
        [fname, lname, signature]
    );
};

module.exports.getSigTotal = (id) => {
    return db.query(
        `SELECT first_name, signature, (select count(id) from signers) as total FROM signers where id = ${id}`
    );
};

module.exports.addUser = (fname, lname, email, hpwd) => {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) returning id`,
        [fname, lname, email, hpwd]
    );
};
