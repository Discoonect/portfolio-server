const connection = require("../db/mysql_connection");

//@desc             내 게시물을 좋아요 했을때 알림 표시
//@route            GET/api/v1/alarm/postlike?offset=0&limit=25
//@request          user_id(auth), offset, limit
//@response         success, items
exports.postlike = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if(!user_id || !offset || !limit){
    res.status(400).json({success : false, message : "파라미터 오류"})
  }

  let query =
    "select u.id as user_id, u.user_profilephoto, u.user_name as user_name, \
    p.id as post_id, p.photo_url, pl.created_at \
    from postlike as pl \
    join post as p \
    on pl.post_id = p.id \
    join user as u \
    on pl.user_id = u.id \
    where p.user_id = ? and u.id != p.user_id \
    order by pl.created_at desc \
    limit ?, ?";

  let data = [user_id, Number(offset), Number(limit)];
  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             내 게시물에 댓글 달렸을때 알림 표시
//@route            GET/api/v1/alarm/comment?offset=0&limit=25
//@request          user_id(auth), offset, limit
//@response         success, items
exports.comment = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if(!user_id || !offset || !limit){
    res.status(400).json({success : false, message : "파라미터 오류"})
  }

  let query =
    "select c.id as comment_id, \
              u.id as user_id, u.user_profilephoto, u.user_name, \
              c.comment, c.created_at, \
              c.post_id as post_id, p.photo_url \
              from post as p \
              join comment as c \
              on p.id = c.post_id \
              join user as u \
              on c.user_id = u.id \
              where p.user_id = ? and c.user_id != p.user_id \
              order by c.created_at desc \
              limit ?,?";
  let data = [user_id, Number(offset), Number(limit)];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             나를 팔로우 했을때 알림 표시
//@route            GET/api/v1/alarm/follow?offset=0&limit=25
//@request          user_id(auth), offset, limit
//@response         success, items
exports.follow = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if(!user_id || !offset || !limit){
    res.status(400).json({success : false, message : "파라미터 오류"})
  }

  let query =
    "select u.id as user_id, u.user_profilephoto, u.user_name, \
              f.created_at \
              from follow as f \
              join user as u \
              on f.user_id = u.id \
              where f.following_id = ? \
              and f.user_id != f.following_id \
              order by f.created_at desc \
              limit ?,?";
  let data = [user_id, Number(offset), Number(limit)];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
