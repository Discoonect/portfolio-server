const connection = require("../db/mysql_connection");
const path = require("path");
const { runInNewContext } = require("vm");
const { off } = require("../db/mysql_connection");

//@desc             팔로우 하기
//@route            POST/api/v1/follow/following
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
//@route            DELETE/api/v1/follow/deletefollow
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
//@desc             내가 팔로우 한 유저 목록 보기(팔로잉)
//@route            GET/api/v1/follow/myfollowing
//@request          user_id(auth)
//@response         success, items
exports.myfollowing = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!user_id || !offset || !limit) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
  }
  let query =
    "select u.user_name, f.user_id, \
              u.user_profilephoto, \
              f.following_id \
              from follow as f \
              join user as u \
              on f.following_id = u.id \
              where f.user_id = ? and f.user_id != f.following_id \
              order by u.user_name \
              limit ?,?";
  let data = [user_id, Number(offset), Number(limit)];
  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             나를 팔로우 한 유저 목록 보기(팔로워)
//@route            GET/api/v1/follow/myfollower
//@request          user_id(auth)
//@response         success, items
exports.myfollower = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!user_id || !offset || !limit) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
  }

  let query =
    "select u.user_name, f.user_id, \
                u.user_profilephoto, \
                f.following_id \
                from follow as f \
                join user as u \
                on u.id = f.user_id \
                where f.following_id = ? and f.user_id != f.following_id \
                order by u.user_name \
                limit ?,?";
  let data = [user_id, Number(offset), Number(limit)];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc             내가 팔로우 한 유저인지 표시
//@route            GET/api/v1/follow/checkfollow/:following_id
//@request          user_id(auth), following_id
//@response         success, items
exports.checkfollow = async (req, res, next) => {
  let user_id = req.user.id;
  let following_id = req.params.following_id;

  let query =
    "select if(following_id, 1, null)as follow from follow where user_id = ? and following_id = ?";

  let data = [user_id, following_id];
  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
