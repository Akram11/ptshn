const spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/cities");

module.exports.getCities = () => {
    return db.query("SELECT * FROM cities");
};

module.exports.addCity = (city, pop, country) => {
    return db.query(
        `INSERT INTO cities (city, population, country) VALUES ($1, $2, $3)`,
        [city, pop, country]
    );
};
