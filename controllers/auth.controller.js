const { Users } = require("../models");
const bcrypt = require("bcrypt");
const path = require("path");
const jsonwebtoken = require("jsonwebtoken");
const { mailTransporter } = require("../lib");
const multer = require("multer");
const crypto = require("crypto");
const config = require("../config/config");

const profile = async (req, res, next) => {
  const user = await Users.findOne({
    where: {
      id: req.user.id,
    },
  });

  return res.status(200).json({
    message: "Sukses",
    data: user,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(200).json({
      message: "pastikan semua form yang dibutuhkan terisi",
    });
  }

  const user = await Users.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(200).json({
      message: "nama pengguna atau kata sandi salah",
    });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(200).json({
      message: "nama pengguna atau kata sandi salah",
    });
  }

  if (user.status === "pending") {
    return res.status(200).json({
      message: "silahkan lakukan aktivasi terlebih dahulu",
    });
  }

  return res.status(200).json({
    token: jsonwebtoken.sign(
      {
        id: user.id,
        email: user.email,
      },
      config.jwtKey,
      {
        expiresIn: "1h",
      }
    ),
  });
};

const register = async (req, res, next) => {
  try {
    const { fullname, username, email, password } = req.body;

    if (!fullname || !username || !email || !password) {
      return res.status(200).json({
        message: "pastikan semua form yang dibutuhkan terisi dan valid",
      });
    }

    const { Op } = require("sequelize");

    const user = await Users.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    });


    if (user) {
      return res.status(200).json({
        message: "user dengan email tersebut sudah terdaftar, gunakan email lain",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const token = crypto.randomUUID();

    await Users.create({
      fullname,
      username,
      email,
      password: hashedPassword,
      status: "pending",
      token,
    });

    const mailOptions = {
      from: config.smtp.sender,
      to: email,
      subject: "Pendaftaran Pengguna",
      text: "Pergi ke link berikut untuk melakukan aktivasi pengguna http://localhost:3001/api/activation?token=" + token,
    };

    const mailerInfo = await mailTransporter.sendMail(mailOptions);
    console.log(mailerInfo);

    return res.status(201).json({
      message: "user terdaftar",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const activation = async (req, res, next) => {
  try {
    const { token } = req.query;
    const user = await Users.findOne({
      where: {
        token,
      },
    });

    if (!user) {
      return res.status(200).json({
        message: "token tidak valid",
      });
    }

    user.token = null;
    user.status = "active";
    user.save();
    return res.status(200).json({
      message: "aktivasi user berhasil",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const upload = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Pastikan masukkan file gambar",
    });
  }

  const user = await Users.findOne({
    where: {
      id: req.user.id,
    },
  });

  if (!user) {
    return res.status(200).json({
      message: "user tidak ditemukan",
    });
  }

  user.photo = req.file.filename;
  await user.save();

  return res.status(200).json({
    message: "gambar berhasil di-upload",
  });
};

module.exports = {
  login,
  register,
  activation,
  upload,
  profile,
};
