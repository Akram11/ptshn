DROP TABLE IF EXISTS signers;

CREATE TABLE signers
(
    id SERIAL primary key,
    first_name VARCHAR(255) NOT NULL CHECK (first_name != ''),
    last_name VARCHAR(255) NOT NULL CHECK (last_name != ''),
    signature TEXT NOT NULL CHECK (signature != '')
);

INSERT INTO signers
    (first_name, last_name, signature)
VALUES
    ('Atlas', 'bida', 'fsfeslfksjlfkjasldfjs;lkfj');

