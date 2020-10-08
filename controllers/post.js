const connection = require("../db/mysql_connection");
const path = require("path");
const { runInNewContext } = require("vm");
const AWS = require("aws-sdk")

//@desc             사진과 내용 업로드
//@route            POST/api/v1/post/upload
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

  let file = photo.data
  const S3_BUCKET = process.env.S3_BUCKET
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
  const AWS_SECRET_ACCESS_ID = process.env.AWS_SECRET_ACCESS_ID

  AWS.config.update({
    accessKeyId : AWS_ACCESS_KEY_ID,
    secretAccessKey : AWS_SECRET_ACCESS_ID,
  })

  const s3 = new AWS.S3()
  let params = {
    Bucket : S3_BUCKET,
    Key : photo.name,
    Body : file,
    ContentType : path.parse(photo.name).ext.split(".")[1],
    ACL : "public-read"
  }

  s3.upload(params, async function(err, data){
    console.log(err, data)
    if(err == null){
      let query = "insert into post (user_id, photo_url, content) values (?,?,?)";

  let dbdata = [user_id, photo.name, content];

  try {
    [result] = await connection.query(query, dbdata);
    res.status(200).json({ success: true, message: "업로드 완료!" });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e, message: "업로드 실패" });
    return;
  }
    }else{
      res.status(403).json({ success: false, error: e, message: "S3 오류" })
    }
  })
};

//@desc                 친구들과 나의 게시글 불러오기(25개씩)
//@route                GET/api/v1/post/getallpost?offset=0&limit=25
//@request              user_id(auth)
//@response             success, items[], cnt
exports.all = async (req, res, next) => {
  let user_id = req.user.id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  if (!user_id || !offset || !limit) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
    return;
  }
  let query =
    "select p.id as post_id, p.user_id, u.user_name, u.user_profilephoto, \
    p.photo_url, p.content, p.created_at, \
    if(pl.id is null, 0, 1)as mylike, \
    count(distinct c.id)as comment_cnt, \
    count(distinct pl2.user_id)as like_cnt \
    from follow as f \
    join post as p \
    on f.user_id = ? and f.following_id = p.user_id \
    left join postlike as pl \
    on pl.user_id = ? and p.id = pl.post_id \
    left join postlike as pl2 \
    on p.id = pl2.post_id \
    left join comment as c \
    on p.id = c.post_id \
    join user as u \
    on p.user_id = u.id \
    where f.user_id = ? \
    group by p.id \
    order by p.created_at desc \
    limit ?,?";

  let data = [user_id, user_id, user_id, Number(offset), Number(limit)];
  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows, cnt: rows.length });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc                  게시글 내용 수정
//@route                 PUT/api/v1/post/:post_id
//@request               user_id(auth), photo, content
//@response              success
exports.update = async (req, res, next) => {
  let post_id = req.params.post_id;
  let user_id = req.user.id;
  let content = req.body.content;

  //본인 확인
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
  //본인이 맞으면 게시글 내용 수정
  try {
      query = "update post set content = ? where id = ?";
      data = [content, post_id];
    [result] = await connection.query(query, data)
    res.status(200).json({ success: true, message: "수정완료!" });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

//@desc                   게시글 삭제
//@route                  DELETE/api/v1/post/:post_id
//@request                user_id(auth), post_id
//@response               success
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

//@desc                   게시글 1개 보기
//@route                  GET/api/v1/post/:post_id
//@request                user_id(auth), post_id
//@response               success, items
exports.one = async (req, res, next) => {
  let user_id = req.user.id;
  let post_id = req.params.post_id;
  let query =
    "select p.id as post_id, p.user_id, \
    u.user_name, u.user_profilephoto, \
    p.photo_url, p.content, p.created_at, \
    if(pl.id is null, 0, 1)as mylike, \
    count(distinct c.id)as comment_cnt, \
    count(distinct pl2.user_id)as like_cnt \
    from post as p \
    left join postlike as pl \
    on pl.user_id = ? and p.id = pl.post_id \
    left join postlike as pl2 \
    on p.id = pl2.post_id \
    left join comment as c \
    on p.id = c.post_id \
    join user as u \
    on p.user_id = u.id \
    where p.id = ? \
    group by p.id";

  let data = [user_id, post_id];
  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc         피드에 게시된 사진 목록표시(25개씩)
//@route        GET/api/v1/post/photourl/:user_id?offset=0&limit=25
//@request      user_id, offset, limit
//@response     success, items
exports.photourl = async (req, res, next) => {
  let user_id = req.params.user_id;
  let offset = req.query.offset;
  let limit = req.query.limit;

  //error
  if (!user_id || !offset || !limit) {
    res.status(400).json({ success: false, message: "파라미터 오류" });
    return;
  }
  let query =
    "select p.id, p.photo_url, p.user_id \
              from post as p \
              where user_id = ? \
              order by p.created_at desc\
              limit ?,?";
  let data = [user_id, Number(offset), Number(limit)];

  try {
    [rows] = await connection.query(query, data);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

//@desc         인기게시물 표시
//@route        GET/api/v1/post/best?offset=0&limit=25
//@request      post_id
//@response     success, items
exports.best = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select p.user_id, count(pl.post_id)as cnt_like, \
                p.id as post_id, p.photo_url \
                from post as p \
                left join postlike as pl \
                on p.id = pl.post_id \
                group by p.id \
                order by cnt_like desc, p.created_at desc \
                limit ${offset}, ${limit}`;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
