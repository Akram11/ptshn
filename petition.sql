DROP TABLE IF EXISTS signers;

CREATE TABLE signers
(
    id SERIAL primary key,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    signiture TEXT NOT NULL
);

INSERT INTO signers
    (first_name, last_name, signiture)
VALUES
    ('Atlas', 'bida', 'fsfeslfksjlfkjasldfjs;lkfj');

