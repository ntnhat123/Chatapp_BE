import jwt from "jsonwebtoken";
export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const isCustomAuth = token.length < 500;
    if (token && isCustomAuth) {
      const decodedData = jwt.verify(token, process.env.TOKEN);
      req.userId = decodedData.id;
    }

    next();
  } catch (err) {
    console.log(err);
  }
};
