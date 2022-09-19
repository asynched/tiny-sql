-- Sample create table
CREATE TABLE users (id INTEGER PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, admin BOOLEAN NOT NULL DEFAULT false, balance FLOAT NOT NULL DEFAULT 0.0);

-- Sample insert with keys
INSERT INTO users (name, email, admin, balance) VALUES ('John', 'john@mail.com', FALSE, 0.0), ('Jane', 'jane@mail.com', FALSE, 100.0), ('Foo', 'foo@mail.com', FALSE, 10.0), ('Bar', 'bar@mail.com', FALSE, 20.0);

-- Sample select
SELECT id, name, email, balance FROM users WHERE id BETWEEN 1 AND 10 LIMIT 1, 10;

-- Sample select with ORDER BY
SELECT id, name, email, balance FROM users WHERE id BETWEEN 1 AND 10 ORDER BY balance DESC LIMIT 1, 10;

-- Sample select with wildcard
SELECT * FROM users;

-- Sample update
UPDATE users SET balance = 100.0;

-- Sample update with WHERE clause
UPDATE users SET balance = 100.0 WHERE admin = FALSE;
