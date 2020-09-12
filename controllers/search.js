const connection = require("../db/mysql_connection");
const validator = require("validator");

//@desc             검색(@가 붙으면 유저검색, 아니면 검색단어가 포함된 게시글 표시)
//@route            GET/api/v1/search/search?keyword=@a&offset=0&limit=25
//@request          user_id
//@response         success, items
exports.search = async (req, res, next) => {
  let keyword = req.query.keyword;
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query;

  if (keyword.substring(keyword.length0, 1) == "@") {
    let search_array = keyword.split("@");
    keyword = search_array[1];
    query = `select u.id,u.user_name, u.user_profilephoto \
                from user as u \ 
                where u.user_name like "%${keyword}%" \
                limit ${offset}, ${limit}`;
  } else {
    query = `select p.id, p.photo_url, p.content from post as p \
              where p.content like "%${keyword}%" limit ${offset}, ${limit}`;
  }

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
