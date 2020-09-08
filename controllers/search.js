const connection = require("../db/mysql_connection");
const validator = require("validator");

//@desc             유저 검색
//@route            GET/api/v1/searchuser?keyword=@a&offset=0&limit=25
//@request          user_id
//@response         success, items
exports.searchuser = async (req, res, next) => {
  let keyword = req.query.keyword;
  let offset = req.query.offset;
  let limit = req.query.limit;

  let query = `select u.user_name, u.user_profilephoto \
                from user as u \ 
                where u.user_name like "%${keyword}%" \
                limit ${offset}, ${limit}`;

  try {
    //let search = keyword.split("@");
    //let search_array = keyword.split("@");
    //keyword = search_array[1];
    [rows] = await connection.query(query, keyword);
    res.status(200).json({ success: true, items: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
