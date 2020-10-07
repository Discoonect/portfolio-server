const connection = require("../db/mysql_connection");
const { updatepost } = require("./post");

//@desc             댓글달기
//@route            POST/api/v1/comment/addcomment
//@request          post_id, user_id(auth), comment
//@response         success
exports.addcomment = async (req, res, next) => {
  let post_id = req.body.post_id;
  let user_id = req.user.id;
  let comment = req.body.comment;

  let query = "insert into comment (post_id, user_id, comment) values (?,?,?)";
  let data = [post_id, user_id, comment];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "댓글작성 완료" });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             댓글삭제
//@route            DELETE/api/v1/comment/deletecomment
//@request          user_id(auth), comment_id
//@response         success
exports.deletecomment = async (req, res, next) => {
  let comment_id = req.body.comment_id;
  let user_id = req.user.id;

  let query =
    "select c.id, c.user_id as comment_user_id, c.post_id, \
                p.user_id as post_user_id \
                from comment as c \
                join post as p \
                on c.post_id = p.id \
                join user as u \
                on u.id = p.user_id \
                where c.id = ?";
  let data = [comment_id];

  try {
    [rows] = await connection.query(query, data);
    //token의 user와 댓글 작성자 || 게시글 작성자와 token의 user가 맞으면 댓글 삭제 가능
    if (rows[0].comment_user_id == user_id || rows[0].post_user_id == user_id) {
      query = "delete from comment where id = ?";
      data = [comment_id];

      try {
        [result] = await connection.query(query, data);
        res.status(200).json({ success: true, message: "댓글삭제 완료" });
        return;
      } catch (e) {
        res.status(500).json({ success: false, error: e2 });
        return;
      }
    } else {
      //user가 아닐경우
      res.status(401).json({ success: false, message: "삭제할 수 없습니다" });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             게시글의 댓글 보기&총 댓글개수 가져오기(25개씩)
//@route            GET/api/v1/comment/getcomment/:post_id?offset=0&limit=25
//@request          post_id, offset, limit
//@response         success, items, cnt
exports.getcomment = async (req, res, next) => {
  let post_id = req.params.post_id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query =
    "select  p.user_id as post_user_id, c.id as comment_id, c.post_id as post_id,\
                u.id as user_id, u.user_profilephoto, u.user_name, \
                c.comment, c.created_at \
                from post as p \
                join comment as c \
                on p.id = c.post_id \
                join user as u \
                on c.user_id = u.id \
                where c.post_id = ? \
                group by c.id \
                order by c.created_at desc \
                limit ?,?";

  let data = [post_id, Number(offset), Number(limit)];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             게시글 1개의 총 댓글 갯수 출력
//@route            GET/api/v1/comment/countcomment/:post_id
//@request          post_id
//@response         success, cnt
exports.countcomment = async (req, res, next) => {
  let post_id = req.params.post_id;
  let query =
    "select count(c.post_id)as cnt \
              from comment as c \
              join post as p \
              on c.post_id = p.id \
              where c.post_id=?";
  let data = [post_id];
  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, cnt: result[0].cnt });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
