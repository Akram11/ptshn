DROP TABLE IF EXISTS signatures
CASCADE;
CREATE TABLE signatures
(
    id SERIAL primary key,
    signature TEXT NOT NULL CHECK (signature != ''),
    user_id INT NOT NULL REFERENCES users(id)
);



DROP TABLE IF EXISTS users
CASCADE;

CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL CHECK (first != ''),
    last VARCHAR NOT NULL CHECK (last != ''),
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);