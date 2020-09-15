DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  u_id SERIAL PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255)
);

INSERT INTO users (username,password) VALUES ('aya.ak@hotmail.com','0000');
INSERT INTO users (username,password) VALUES ('hamzh78@gmail.com','0000');