export const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  jwtExpiresIn: "24h",
  database: {
    filename: "./banking.db",
  },
  bcrypt: {
    saltRounds: 10,
  },
};
