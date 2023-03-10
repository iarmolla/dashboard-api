import pool from "../db.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  const [query] = await pool.query("select * from users");
  res.status(200).send(query);
};

export const getUser = async (req, res) => {
  try {
    const query = [...req.params.query]
    query[0] = query[0] + '%'
    const [rows] = await pool.query("select * from users where email like ? or name like ? or lastname like ?", [query[0], query[0], query[0]]);
    res.send(rows);
  } catch {
    res.status(404).json({ message: "Not found" });
  }
};

export const insertUser = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "select * from users where email = ?",
      req.body.email
    );
    if (rows.length === 0) {
      const user = req.body;
      const hash = await encryptPassword(user.password)
      await pool.query(
        `
          insert into users(name,lastname,salary,type,email,password)
          values (?,?,?,?,?,?)
      `,
        [user.name, user.lastname, user.salary, user.type, user.email, hash]
      );
      res.status(204).send()

    } else {
      res.status(401).json({
        error: 'email exist',
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

export const update = async (req, res) => {
  try {
    const user = req.body
    await pool.query('UPDATE users SET ? WHERE id = ?', [user, req.body.id]);
    return res.sendStatus(204);
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

export const deleteUser = async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query("delete from users where id = ?", [id]);
    res.sendStatus(204);
  } catch (error) {
    return res.json({ error: error.message })
  }
}

export const updateUser = async (req, res) => {
  const hash = await encryptPassword(req.body.password)
  const user = {
    name: req.body.name,
    lastname: req.body.lastname,
    salary: req.body.salary,
    type: req.body.type,
    email: req.body.email,
    password: hash
  }
  try {
    await pool.query('UPDATE users SET ? WHERE id = ?', [user, req.body.id]);
    return res.sendStatus(204);
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};