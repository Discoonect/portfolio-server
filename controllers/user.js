const validator = require("validator");
const bcrypt = require("bcryptjs");
const path = require("path");
const jwt = require("jsonwebtoken");

const connection = require("../db/mysql_connection");

//@desc             회원가입
//@route            POST/api/v1/user/signup
//@request          user_name, user_passwd, user_phone
//@response         success, token
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
    //등록한 아이디의 갯수가 0이면 사용가능
    if (result[0].count == 0) {
      res
        .status(200)
        .json({ success: true, message: "사용가능한 아이디 입니다" });
    } else {
      //갯수가 0이 아닌 1이면 사용 불가능(중복오류)
      res
        .status(400)
        .json({ success: false, message: "이미 사용중인 아이디 입니다" });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: e });
  }
};

// @desc             로그인
// @route            POST/api/v1/user/login
// @request          user_id, user_passwd
// @response         success
exports.login = async (req, res, next) => {
  let name = req.body.user_name;
  let passwd = req.body.user_passwd;

  let query = "select * from user where user_name = ? ";
  let data = [name];

  let user_id;
  try {
    //비밀번호 맞는지 체크
    [rows] = await connection.query(query, data);
    let hashedPasswd = rows[0].user_passwd;
    user_id = rows[0].id;
    console.log(rows);
    const isMatch = await bcrypt.compare(passwd, hashedPasswd);
    //맞지 않는 오류
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
    res.status(200).json({
      success: true,
      token: token,
      user_id: user_id,
      message: "로그인 성공!",
    });
  } catch (e) {
    res.status(500).json({ success: false, error: "오류" });
  }
};

//@desc             로그아웃
//@route            DELETE/api/v1/user/logout
//@request          token(header), user_id(auth)
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
//@request          user_id(auth)
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

//@desc             내 피드에서 이름, 사진, 팔로워, 한줄소개 표시
//@route            GET/api/v1/user/mypage
//@request          user_id(auth)
//@response         success, items
exports.mypage = async (req, res, next) => {
  let user_id = req.user.id;
  let query =
    "select u.user_name, u.user_profilephoto, \
              count(f.following_id)-1 as follower, \
              u.introduce \
              from user as u \
              join follow as f \
              on u.id = f.following_id \
              where f.following_id = ?";

  let data = [user_id];
  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             내 피드에서 게시글, 팔로잉 표시 가져오기
//@route            GET/api/v1/user/mypage2
//@request          user_id(auth)
//@response         success, items
exports.mypage2 = async (req, res, next) => {
  let user_id = req.user.id;
  let query =
    "select \
              (select count(*)from post where post.user_id = ?)as cnt_post, \
              count(distinct f.following_id)as following \
              from follow as f \
              join user as u \
              on f.user_id = u.id \
              where f.user_id = ? and f.user_id != f.following_id";

  let data = [user_id, user_id];
  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             한줄소개 작성
//@route            POST/api/v1/user/myintroduce
//@request          user_id(auth), introduce
//@response         success
exports.myintroduce = async (req, res, next) => {
  let user_id = req.user.id;
  let introduce = req.body.introduce;
  let query = `update user set introduce= "${introduce}" where id=${user_id}`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, message: "작성되었습니다!" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             프로필사진 등록
//@route            POST/api/v1/user/profilephoto
//@request          photo, user_id(auth)
//@response         success
exports.profilephoto = async (req, res, next) => {
  let user_id = req.user.id;
  let photo = req.files.photo;

  //이미지 파일이 아닐 때 오류
  if (photo.mimetype.startsWith("image") == false) {
    res
      .status(400)
      .json({ success: false, message: "사진파일 형식이 아닙니다" });
    return;
  }
  //이미지 파일 크기가 클 때 오류
  if (photo.size > process.env.MAX_FILE_SIZE) {
    res
      .status(400)
      .json({ success: false, error: e, message: "파일 크기가 큽니다" });
    return;
  }
  //파일이름 설정
  photo.name = `photo_${user_id}_${Date.now()}${path.parse(photo.name).ext}`;
  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });
  let query = "update user set user_profilephoto = ? where id = ?";
  let data = [photo.name, user_id];

  try {
    [result] = await connection.query(query, data);
    res
      .status(200)
      .json({ success: true, message: "프로필 사진이 등록되었습니다" });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e, message: "업로드 실패" });
    return;
  }
};

//@desc             프로필사진 삭제(기본이미지로 변경)
//@route            DELETE/api/v1/user/profilephoto
//@request          user_id(auth)
//@response         success
exports.deleteprofilephoto = async (req, res, next) => {
  let user_id = req.user.id;

  let query = "update user set user_profilephoto = null where id = ?";
  let data = [user_id];

  try {
    [result] = await connection.query(query, data);
    res
      .status(200)
      .json({ success: true, message: "기본이미지로 변경되었습니다" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             다른유저 피드에서 이름, 사진, 팔로워, 한줄소개 표시
//@route            GET/api/v1/user/userpage/:user_id
//@request          user_id
//@response         success, items
exports.userpage = async (req, res, next) => {
  let user_id = req.params.user_id;
  let query =
    "select u.user_name, u.user_profilephoto, \
              count(f.following_id)-1 as follower, \
              introduce \
              from user as u \
              join follow as f \
              on u.id = f.following_id \
              where f.following_id = ?";

  let data = [user_id];
  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             다른유저 피드에서 게시글, 팔로잉 표시 가져오기
//@route            GET/api/v1/user/userpage2/:user_id
//@request          user_id
//@response         success, items
exports.userpage2 = async (req, res, next) => {
  let user_id = req.params.user_id;
  let query =
    "select \
              (select count(*)from post where post.user_id = ?)as cnt_post, \
              count(distinct f.following_id)as following \
              from follow as f \
              join user as u \
              on f.user_id = u.id \
              where f.user_id = ? and f.user_id != f.following_id";

  let data = [user_id, user_id];
  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
