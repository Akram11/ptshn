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
        `SELECT *
         FROM users JOIN
         user_profiles ON
         users.id = user_profiles.user_id
         WHERE users.id = $1`,
        [id]
    );
};

module.exports.updateUser = (first, last, email, id) => {
    return db.query(
        `UPDATE users
         SET first = $1, last = $2, email = $3
         WHERE id = $4`,
        [first, last, email, id]
    );
};

module.exports.updateUser = (first, last, email, id) => {
    return db.query(
        `UPDATE users
         SET first = $1, last = $2, email = $3
         WHERE id = $4`,
        [first, last, email, id]
    );
};

module.exports.updateUserPwd = (first, last, email, pwd, id) => {
    return db.query(
        `UPDATE users
         SET first = $1, last = $2, email = $3, password = $4
         WHERE id = $5`,
        [first, last, email, pwd, id]
    );
};

module.exports.updateProfile = (age, city, url, user_id) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id)
        values ($1, $2, $3, $4)
        on conflict (user_id)
        DO UPDATE set age = $1, city = $2, url = $3 
    `,
        [age || null, city || null, url || null, user_id]
    );
};

module.exports.deleteSig = (user_id) => {
    return db.query(
        `
        DELETE FROM signatures where user_id = $1`,
        [user_id]
    );
};

//*********************** TODO********************************
// nice to have : adding, updating a user can be done with an upsert!
