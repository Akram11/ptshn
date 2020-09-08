const spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    return db.query("SELECT first_name, last_name FROM signatures");
};

module.exports.addSignature = (fname, lname, signature) => {
    return db.query(
        `INSERT INTO signatures (first_name, last_name, signature) VALUES ($1, $2, $3) returning id`,
        [fname, lname, signature]
    );
};

module.exports.getSigTotal = (id) => {
    return db.query(
        `SELECT first_name, signature, (select count(id) from signatures) as total
         FROM signatures where id = $1`,
        [id]
    );
};

module.exports.addUser = (fname, lname, email, hpwd) => {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) returning id`,
        [fname, lname, email, hpwd]
    );
};

module.exports.getUser = (mail) => {
    return db.query(
        `SELECT id, email, password AS hash FROM users WHERE email = $1`,
        [mail]
    );
};
