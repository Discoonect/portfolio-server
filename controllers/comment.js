const connection = require("../db/mysql_connection");

//@desc             댓글달기
//@route            POST/api/v1/comment/addcomment
//@request          post_id, user_id(auth), comment
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

//@desc             댓글수정
//@route            PUT/api/v1/comment/updatecomment
//@request          user_id(auth), comment
//@response         success
exports.updatecomment = async (req, res, next) => {
  let user_id = req.user.id;
  let comment_id = req.body.comment_id;
  let comment = req.body.comment;

  let query = "select * from comment where id = ?";
  let data = [comment_id];

  //댓글 작성자인지 확인
  try {
    [rows] = await connection.query(query, data);
    if (rows[0].user_id != user_id) {
      res.status(401).json({ success: false, message: "수정할 수 없습니다" });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
  //댓글 작성자가 맞을 시
  query = "update comment set comment = ? where id = ?";
  data = [comment, comment_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "댓글수정 완료" });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e2 });
    return;
  }
};
