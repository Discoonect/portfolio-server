const connection = require("../db/mysql_connection");

//@desc             게시글 좋아요 하기
//@route            POST/api/v1/like/post
//@request          post_id, user_id(auth)
//@response         success
exports.likepost = async (req, res, next) => {
  let post_id = req.body.post_id;
  let user_id = req.user.id;

  let query = "insert into postlike (post_id, user_id) values (?,?)";
  let data = [post_id, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "이 게시글을 좋아합니다" });
    return;
  } catch (e) {
    //중복 좋아요 방지
    if (e.errno == 1062) {
      res
        .status(400)
        .json({ success: false, message: "이미 이 게시글을 좋아합니다" });
      return;
    } else {
      res.status(501).json({ success: false, error: e });
    }
  }
};

//@desc             게시글 좋아요 취소
//@route            DELETE/api/v1/like/post
//@request          post_id, user_id(auth)
//@response         success
exports.deletelikepost = async (req, res, next) => {
  let post_id = req.body.post_id;
  let user_id = req.user.id;

  if (!post_id || !user_id) {
    res
      .status(400)
      .json({ success: false, message: "요청을 찾을 수 없습니다" });
    return;
  }
  let query = "delete from postlike where post_id = ? and user_id = ?";
  let data = [post_id, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "좋아요가 취소되었습니다" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             게시글 1개의 총 좋아요 갯수 출력
//@route            GET/api/v1/like/countpost/:post_id
//@request          post_id
//@response         success, cnt
exports.countpost = async (req, res, next) => {
  let post_id = req.params.post_id;

  let query = `select count(pl.post_id) as cnt 
              from postlike as pl 
              join post as p 
              on pl.post_id = p.id 
              where pl.post_id = ${post_id}`;
  console.log(query);

  try {
    [result] = await connection.query(query);
    res.status(200).json({
      success: true,
      cnt: result[0].cnt,
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             게시물을 좋아요 한 유저의 목록 가져오기
//@route            GET/api/v1/like/user/:post_id
//@request          post_id
//@response         success, items : rows
exports.user = async (req, res, next) => {
  let post_id = req.params.post_id;
  let query =
    "select u.id, u.user_profilephoto, u.user_name, \
              pl.created_at as postliketime \
              from postlike as pl \
              join user as u \
              on pl.user_id = u.id \
              where pl.post_id = ? \
              order by pl.created_at desc";
  let data = [post_id];
  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

