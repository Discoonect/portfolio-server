const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connection = require("../db/mysql_connection");

//@desc             회원가입
//@route            POST/api/v1/user
//@request          user_email, user_passwd, user_phone
//@response
exports.createUser = async (req, res, next) => {
  let email = req.body.user_email;
  let passwd = req.body.user_passwd;
  let phone = req.body.user_phone;

  const hashedPasswd = await bcrypt.hash(passwd, 8);

  //이메일 형식에 안맞을 때
  if (!validator.isEmail(email)) {
    res
      .status(500)
      .json({ success: false, message: "이메일 형식이 맞지 않습니다" });
    return;
  }
  //이메일 형식에 맞을 때 유저 insert
  let query =
    "insert into user (user_email, user_passwd, user_phone) values (?,?,?)";
  let data = [email, hashedPasswd, phone];
  let user_id;

  try {
    //결과값에 insert된 값 출력
    [result] = await connection.query(query, data);
    user_id = result.insertId;

    //이메일 오류처리
  } catch (e) {
    //이메일 중복 오류
    if (e.errno == 1062) {
      res.status(400).json({
        success: false,
        message: "이미 사용되고 있는 이메일 또는 전화번호 입니다",
      });
      return;
    } else {
      //아니면 다른오류
      res.status(500).json({ success: false, error: e });
      return;
    }
  }
  //토큰생성
  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = "insert into token(token, user_id) values (?,?)";
  data = [token, user_id];

  try {
    [result] = await connection.query(query, data);
    //성공하면 토큰출력
    res.status(200).json({ success: true, token: token });
    //오류처리
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc             로그인
// @route            POST/api/v1/user/login
// @request          user_email, user_passwd
// @response         success
exports.login = async (req, res, next) => {
  let email = req.body.user_email;
  let passwd = req.body.user_passwd;

  let query = "select * from user where user_email = ? ";
  let data = [email];

  let user_id;
  try {
    [rows] = await connection.query(query, data);
    let hashedPasswd = rows[0].user_passwd;
    user_id = rows[0].id;
    console.log(rows);
    const isMatch = await bcrypt.compare(passwd, hashedPasswd);
    if (isMatch == false) {
      res
        .status(401)
        .json({ success: false, message: "비밀번호가 맞지 않습니다" });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
  const token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
  query = "insert into token (token, user_id) values (?, ?)";
  data = [token, user_id];
  try {
    [result] = await connection.query(query, data);
    res
      .status(200)
      .json({ success: true, token: token, message: "로그인 성공!" });
  } catch (e) {
    res.status(500).json({ success: false, error: "오류" });
  }
};

//@desc             로그아웃
//@route            DELETE/api/v1/user/logout
//@request          token(header), user_email(auth)
//@response         success
exports.logout = async (req, res, next) => {
  let user_id = req.user.id;
  let token = req.user.token;

  let query = "delete from token where user_id = ? and token = ?";
  let data = [user_id, token];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "로그아웃 되었습니다" });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};
