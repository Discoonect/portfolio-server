const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connection = require("../db/mysql_connection");

//@desc             회원가입
//@route            POST/api/v1/user
//@request          user_name, user_passwd, user_phone, user_nickname
//@response
exports.signup = async (req, res, next) => {
  let name = req.body.user_name;
  let passwd = req.body.user_passwd;
  let phone = req.body.user_phone;

  const hashedPasswd = await bcrypt.hash(passwd, 8);

  let query =
    "insert into user (user_name, user_passwd, user_phone) values (?,?,?)";
  let data = [name, hashedPasswd, phone];
  let user_id;

  try {
    //결과값에 insert된 값 출력
    [result] = await connection.query(query, data);
    user_id = result.insertId;

    //유저네임 오류처리
  } catch (e) {
    //중복 오류
    if (e.errno == 1062) {
      res.status(400).json({
        success: false,
        message: "이미 사용되고 있는 아이디 입니다",
      });
      return;
    } else {
      //아니면 다른오류
      res.status(500).json({ success: false, error: e, message: "1" });
      return;
    }
  }
  //나를 팔로우에 추가(모든 게시물(홈화면)에 내 글도 표시해야 하므로)
  query = "insert into follow (user_id, following_id) values (?,?)";
  data = [user_id, user_id];
  try {
    [result] = await connection.query(query, data);
  } catch (e) {
    res.status(500).json({ success: false, error: e, message: "오류" });
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
    res.status(500).json({ success: false, error: e, message: "2" });
  }
};

// @desc             유저네임 중복체크
// @route            POST/api/v1/user/checkid
// @request          user_name
// @response         success
exports.checkid = async (req, res, next) => {
  let name = req.body.user_name;
  let query = "select count(user_name) as count from user where user_name=?";
  let data = [name];

  try {
    [result] = await connection.query(query, data);
    if (result[0].count == 0) {
      res
        .status(200)
        .json({ success: true, message: "사용가능한 아이디 입니다" });
    } else {
      res
        .status(200)
        .json({ success: false, message: "이미 사용중인 아이디 입니다" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e });
  }
};

// @desc             로그인
// @route            POST/api/v1/user/login
// @request          user_name, user_passwd
// @response         success
exports.login = async (req, res, next) => {
  let name = req.body.user_name;
  let passwd = req.body.user_passwd;

  let query = "select * from user where user_name = ? ";
  let data = [name];

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
//@request          token(header), user_name(auth)
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

//@desc             회원 탈퇴
//@route            DELETE/api/v1/user/adios
//@request          user_name(auth)
//@response         success

exports.adios = async (req, res, next) => {
  let user_id = req.user.id;
  let query = `delete from user where id = ${user_id}`;
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    // 첫번째 테이블에서 정보 삭제
    [result] = await conn.query(query);
    // 두번째 테이블에서 정보 삭제
    query = `delete from token where user_id = ${user_id}`;
    [result] = await conn.query(query);

    await conn.commit();

    res.status(200).json({ success: true, message: "탈퇴되었습니다" });
  } catch (e) {
    await conn.rollback();

    res.status(500).json({ success: false, error: e });
  } finally {
    conn.release();
  }
};
