const connection = require("../db/mysql_connection");
const path = require("path");
const { runInNewContext } = require("vm");

//@desc             팔로우 하기
//@route            POST/api/v1/follow
//@request          user_id(auth), following_id
//@response         success

exports.following = async (req, res, next) => {
  let user_id = req.user.id;
  let following_id = req.body.following_id;

  if (!user_id || !following_id) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
    return;
  }
  let query = "insert into follow (user_id, following_id) values (?,?)";
  let data = [user_id, following_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "WASSUP?" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             팔로우 취소
//@route            DELETE/api/v1/deletefollow
//@request          user_id(auth), following_id
//@response         success
exports.deletefollow = async (req, res, next) => {
  let user_id = req.user.id;
  let following_id = req.body.following_id;

  if (!user_id || !following_id) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
    return;
  }
  let query = "delete from follow where user_id=? and following_id=?";
  let data = [user_id, following_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "팔로우 취소" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
