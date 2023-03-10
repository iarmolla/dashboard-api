import jwt from "jsonwebtoken";
import { secret } from '../config.js'
import pool from "../db.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    const encoded = jwt.verify(token, secret)
    const id = parseInt(encoded.id)
    const [rows] = await pool.query(
      "select * from users where id = ?",
      id
    );
    next()
  } catch (error) {
    res.status(404).json({ error: error?.message })
  }
};
