import pool from "../db.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  const [query] = await pool.query("select * from users");
  res.send(query);
};

export const getUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const [rows] = await pool.query("select * from users where id = ?", userId);
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
      const [query] = await pool.query(
        `
          insert into users(name,lastname,salary,type,email,password)
          values (?,?,?,?,?,?)
      `,
        [user.name, user.lastname, user.salary, user.type, user.email, hash]
      );
      res.status(204)
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

export const updateSalary = async (req, res) => {
  const { salary } = req.body;
  await pool.query(
    `
    update users
    set salary = ?
    where id = ?
    `,
    [salary, req.params.id]
  );
  res.sendStatus(204);
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
  const { id, name, salary, lastname, email, password, type } = req.body;
  const hash = encryptPassword(password)
  const user = {
    name: name,
    lastname: lastname,
    salary: salary,
    type: type,
    email: email,
    password: hash
  }
  try {
    await pool.query('UPDATE users SET ? WHERE id = ?', [user, id]);
    return res.sendStatus(204);
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};