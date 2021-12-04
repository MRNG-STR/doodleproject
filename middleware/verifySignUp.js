
const dbconfig = require("../config/db.config");

checkDuplicateUsernameOrEmail = async(req, res, next) => {
    // Username
    try {
        var pool = dbconfig.pool;
        pool.query('SELECT user_name as name, email_id as email FROM public.user_master where user_name=$1::text or email_id=$2', [req.body.username, req.body.email], (err, result) => {
            if (err) {
                return console.error('Error executing query', err.stack)
            }
            if (result.rowCount) {
                res.status(400).send({
                    message: "Failed! Username or Email id is already in use!"
                });
                return;
            } 
            next();
        })
    } catch (err) {

    } 

};


const verifySignUp = {
    checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
};

module.exports = verifySignUp;