const spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    return db.query("SELECT first_name, last_name FROM signatures");
};

module.exports.addSignature = (signature, userId) => {
    return db.query(
        `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) returning id`,
        [signature, userId]
    );
};

module.exports.getSigTotal = (userId) => {
    return db.query(
        `SELECT signature, (select count(id) from signatures) as total
         FROM signatures where id = $1`,
        [userId]
    );
};

module.exports.addUser = (fname, lname, email, hpwd) => {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) returning id`,
        [fname, lname, email, hpwd]
    );
};

module.exports.getUserEmail = (mail) => {
    return db.query(
        `SELECT id, email, password AS hash FROM users WHERE email = $1`,
        [mail]
    );
};

module.exports.getUser = (id) => {
    return db.query(`SELECT first, last FROM users WHERE id = $1`, [id]);
};
