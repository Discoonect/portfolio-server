const connection = require("../db/mysql_connection");

//@desc             댓글달기
//@route            POST/api/v1/comment
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
