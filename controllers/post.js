const connection = require("../db/mysql_connection");
const path = require("path");
const { runInNewContext } = require("vm");

//@desc             사진과 내용 업로드
//@route            POST/api/v1/post
//@request          photo, content, user_id(auth)
//@response         success

exports.uploadpost = async (req, res, next) => {
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

//@desc         내가 작성한 포스팅 가져오기(25개씩)
//@route        GET/api/v1/post/me?offset=0&limit=25
//@request      user_id(auth), offset, limit
//@response     success, items[], cnt

exports.mypost = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  //error
  if (!user_id || !offset || !limit) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
    return;
  }
  let query = "select * from post where user_id = ? limit ?,?";
  let data = [user_id, Number(offset), Number(limit)];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, message: "불러올 수 없습니다" });
  }
};

//@desc                 친구들의 게시글 불러오기(25개씩)
//@route                GET/api/v1/post/getfollowerpost?offset=0&limit=25
//@request              user_id(auth)
//@response             success, items[], cnt
exports.getallpost = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!user_id || !offset || !limit) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
    return;
  }
  let query =
    "select p.id as post_id, u.user_name, u.user_profilephoto, \
    p.photo_url, p.content, p.created_at, \
    case when pl.post_id is null then 0 \
    else 1 end as 'mylike' \
    count(distinct c.id) AS comment_cnt, \
    count(distinct pl.id) AS like_cnt \
    from follow as f \
    join post as p \
    on f.following_id = p.user_id \
    join user as u \
    on p.user_id = u.id \
    left join postlike as pl \
    on pl.post_id = p.id \
    left join comment as c \
    on p.id = c.post_id \
    where f.user_id = ? \
    group by p.id, u.user_name, u.user_profilephoto, p.photo_url, p.content, p.created_at \
    order by p.created_at desc \
    limit ?,?;";

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

//@desc         게시글 수정
//@route        PUT/api/v1/updatepost/:post_id
//@request      user_id(auth), photo, content
//@response     success
exports.updatepost = async (req, res, next) => {
  let post_id = req.params.post_id;
  let user_id = req.user.id;
  let photo = req.files.photo;
  let content = req.body.content;

  //본인의 게시글 수정인지 확인
  let query = "select * from post where id = ?";
  let data = [post_id];

  try {
    [rows] = await connection.query(query, data);
    if (rows[0].user_id != user_id) {
      res.status(400).json({ success: false, message: "권한이 없습니다" });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
  //본인의 게시글 수정
  if (photo.mimetype.startsWith("image") == false) {
    res
      .status(400)
      .json({ success: false, message: "사진파일 형식이 아닙니다" });
    return;
  }
  //사진파일 이름 생성(유저아이디 & 현재날짜)
  photo.name = `photo_${user_id}_${Date.now()}&${path.parse(photo.name).ext}`;

  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;

  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  query = "update post set photo_url = ?, content = ? where id = ?";
  data = [photo.name, content, post_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "수정완료!" });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

//@desc         게시글 삭제
//@route        DELETE/api/v1/deletepost/:post_id
//@request      user_id(auth), post_id
//@response     success
exports.deletepost = async (req, res, next) => {
  let post_id = req.params.post_id;
  let user_id = req.user.id;

  if (!post_id || !user_id) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
    return;
  }
  //본인확인
  let query = "select * from post where id = ?";
  data = [post_id];
  let photo_url;

  try {
    [rows] = await connection.query(query, data);
    if (rows[0].user_id != user_id) {
      req.status(401).json({ success: false, message: "삭제할 수 없습니다" });
      return;
    }
    photo_url = rows[0].photo_url;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
  query = "delete from post where id = ?";
  data = [post_id];
  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "삭제되었습니다" });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e2 });
    return;
  }
};
