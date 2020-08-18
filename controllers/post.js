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
