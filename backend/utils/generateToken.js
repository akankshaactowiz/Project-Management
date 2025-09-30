import jwt from "jsonwebtoken";

const generateToken = (res, user) => {
  const role = user.roleId; // populated role object
  

  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      roleId: role?._id,
      roleName: role?.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export default generateToken;

