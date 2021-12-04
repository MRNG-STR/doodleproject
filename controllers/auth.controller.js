const config = require("../config/auth.config");
const dbconfig = require("../config/db.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");


exports.signup = (req, res) => {
  // Save User to Database
  try {
    var pool = dbconfig.pool;

    const text = 'INSERT INTO public.user_master(user_name, email_id, password) VALUES($1, $2, $3)'
    const values = [req.body.username, req.body.email, bcrypt.hashSync(req.body.password, 8)]

    pool.query(text, values, (err, result) => {
      if (err) {
        console.log(err.stack)
      } else {
        res.send({ message: "User was registered successfully!" });
      }
      console.log(result)
    })

  }
  catch (err) {
    res.status(500).send({ message: err.message });
  }

};


exports.signin = (req, res) => {
  try {
    var pool = dbconfig.pool;

    pool.query('SELECT id,user_name as username,email_id as email , password FROM public.user_master where user_name=$1::text', [req.body.username], (err, result) => {
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      if (!result.rowCount) {
        return res.status(404).send({ message: "User Not found." });
      } else {

        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          result.rows[0].password
        );

        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
          });
        }

        var token = jwt.sign({ id: result.rows[0].id }, config.secret, {
          expiresIn: 600 // 10 Mins
        });

        res.status(200).send({
          username: result.rows[0].username,
          email: result.rows[0].email,
          accessToken: token
        });

      }
    })

  } catch (err) {
    res.status(500).send({ message: err.message });
  }

};

