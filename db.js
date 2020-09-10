const spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.getSignatures = () => {
    return db.query("SELECT * FROM signatures");
};

module.exports.addSignature = (signature, userId) => {
    return db.query(
        `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) returning user_id`,
        [signature, userId]
    );
};

module.exports.getSigTotal = (userId) => {
    return db.query(
        `SELECT signature, (select count(id) from signatures) as total
         FROM signatures where user_id = $1`,
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

module.exports.insertProfile = (age, city, url, userId) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) returning id`,
        [age || null, city || null, url || null, userId]
    );
};

module.exports.isSigned = (user_id) => {
    return db.query(`SELECT id FROM signatures where user_id = $1`, [user_id]);
};

// select users.id, users.first, users.last, user_profiles.city, user_profiles.age, user_profiles.url, user_profiles.user_id, signatures.user_id as sigid from users join signatures on users.id = signatures.user_id left JOIN user_profiles on users.id = user_profiles.user_id;
