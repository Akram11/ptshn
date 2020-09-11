const spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.getSignatures = () => {
    // return db.query("SELECT * FROM signatures");
    return db.query(`SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url, users.created_at
     FROM signatures 
     LEFT JOIN users ON
     users.id = signatures.user_id 
     LEFT JOIN user_profiles ON 
     signatures.user_id = user_profiles.user_id 
     ORDER BY users.created_at
`);
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

module.exports.getUsersByCity = (city) => {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age, user_profiles.url
         FROM users join user_profiles 
         ON users.id = user_profiles.user_id 
         JOIN signatures 
         ON users.id = signatures.user_id 
         WHERE user_profiles.city = $1`,
        [city]
    );
};

module.exports.getUserInfo = (id) => {
    return db.query(
        `SELECT users.first, users.last, users.email, user_profiles.city, user_profiles.age, user_profiles.url from users join user_profiles on users.id = user_profiles.user_id
WHERE users.id = $1`,
        [id]
    );
};
