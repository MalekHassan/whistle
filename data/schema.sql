DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS matches;

CREATE TABLE
IF NOT EXISTS users
(
  u_id SERIAL PRIMARY KEY,
  first_name VARCHAR
(255),
  last_name VARCHAR
(255),
  email VARCHAR
(255),
gender VARCHAR
(255),
phone_number VARCHAR
(255),
  password VARCHAR
(255)
);

CREATE TABLE
IF NOT EXISTS matches
(
  id SERIAL PRIMARY KEY,
  match_id VARCHAR
(255),
  u_id integer REFERENCES users
(u_id)
);

INSERT INTO users
  (first_name,last_name,email,password)
VALUES
  ('malek', 'hassan', 'malek@hotmail.com', '0000');


  