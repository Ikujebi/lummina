import bcrypt from "bcryptjs";

const password = "Ayanfe@2013";

bcrypt.hash(password, 10).then((hash) => {
  console.log("Hashed password:");
  console.log(hash);
});