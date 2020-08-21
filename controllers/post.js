const connection = require("../db/mysql_connection");
const path = require("path");
const { runInNewContext } = require("vm");

//@desc             사진과 내용 업로드
//@route            POST/api/v1/post
//@request          photo, content, user_id(auth)
//@response         success

exports.upload = async (req, res, next) => {
  let user_id = req.user.id;
  let photo = req.files.photo;
  let content = req.body.content;

  if (photo.mimetype.startsWith("image") == false) {
    res
      .status(400)
      .json({ success: false, message: "사진파일 형식이 아닙니다" });
    return;
  }
  if (photo.size > process.env.MAX_FILE_SIZE) {
    res.status(400).json({ success: false, message: "파일 크기가 큽니다" });
    return;
  }
  //사진파일이름 유저아이디와 현재 날짜로 생성
  photo.name = `photo_${user_id}_${Date.now()}${path.parse(photo.name).ext}`;

  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  let query = "insert into post (user_id, photo_url, content) values (?,?,?)";

  let data = [user_id, photo.name, content];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "업로드 완료!" });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e, message: "업로드 실패" });
    return;
  }
};

//@desc         내가 작성한 포스팅 가져오기
//@route        GET/api/v1/post/me
//@request      user_id(auth)
//@response     success, items[]

exports.myPost = async (req, res, next) => {
  let user_id = req.user.id;

  //error
  if (!user_id) {
    res.status(400).json({ success: false, error: e });
    return;
  }
  let query = "select * from post where user_id = ?";
  let data = [user_id];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, message: "불러올 수 없습니다" });
  }
};

//@desc                 친구들의 게시글 불러오기(25개씩)
//@route                GET/api/v1/post/getfollowerpost?offset=0&limit=25
//@request              user_id(auth)
//@response             success, items[], cnt
exports.getfollowerPost = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!user_id || !offset || !limit) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
    return;
  }
  let query =
    "select p.id as post_id, u.user_name, u.user_profilephoto, \
    p.photo_url, p.content, p.created_at \
    from follow as f \
    join post as p \
    on f.follower_id = p.user_id \
    join user as u \
    on p.user_id = u.id \
    where f.user_id = ? \
    order by p.created_at desc \
    limit ?,?";

  let data = [user_id, Number(offset), Number(limit)];
  let cnt;

  try {
    [rows] = await connection.query(query, data);
    cnt = rows.length;
    res.status(200).json({ success: true, items: rows, cnt: cnt });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
