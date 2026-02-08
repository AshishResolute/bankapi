import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const fileName = fileURLToPath(import.meta.url);
const dirname = path.dirname(fileName);

dotenv.config({ path: path.join(dirname, "../dev.env") });

let verifyToken = (req, res, next) => {
  let auth = req.get("Authorization");
  if (!auth) return res.status(400).json({ Message: "Token not recieved" });
  let token = auth.split(' ')[1];
  jwt.verify(token, process.env.JWT_KEY, (err, decode) => {
    if (err) return res.status(400).json({ message: `token not verified` });
    req.user = decode;
    next();
  });
};

export default verifyToken;
