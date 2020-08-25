const connection = require("../db/mysql_connection");
const { post } = require("../routes/like");

//@desc             게시글 좋아요 하기
//@route            POST/api/v1/like/likepost
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
      res.status(500).json({ success: false, error: e });
    }
  }
};

//@desc             게시글 좋아요 취소
//@route            DELETE/api/v1/like/deletelikepost
//@request          post_id, user_id(auth)
//@response         success
exports.deletelikepost = async (req, res, next) => {
  let post_id = req.body.post_id;
  let user_id = req.user.id;

  if (!post_id || !user_id) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
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

//@desc             댓글 좋아요 하기
//@route            POST/api/v1/like/likecomment
//@request          comment_id, user_id(auth)
//@response         success
exports.likecomment = async (req, res, next) => {
  let comment_id = req.body.comment_id;
  let user_id = req.user.id;

  let query = "insert into commentlike (comment_id, user_id) values (?,?)";
  let data = [comment_id, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "이 댓글을 좋아합니다" });
    return;
  } catch (e) {
    //중복 좋아요 방지
    if (e.errno == 1062) {
      res
        .status(400)
        .json({ success: false, message: "이미 이 댓글을 좋아합니다" });
      return;
    } else {
      res.status(500).json({ success: false, error: e });
    }
  }
};

//@desc             댓글 좋아요 취소
//@route            DELETE/api/v1/like/deletelikecomment
//@request          commentlike_id, user_id(auth)
//@response         success
exports.deletelikecomment = async (req, res, next) => {
  let comment_id = req.body.comment_id;
  let user_id = req.user.id;

  if (!comment_id || !user_id) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
    return;
  }
  let query = "delete from commentlike where id = ? and user_id = ?";
  let data = [comment_id, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, message: "좋아요가 취소되었습니다" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
