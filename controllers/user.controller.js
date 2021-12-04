const dbconfig = require("../config/db.config");
const fs = require("fs");
const csv = require("fast-csv");
var format = require('pg-format');
const { CANCELLED } = require("dns");

exports.upload = async (req, res) => {
    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload a CSV file!");
        }

        let tutorials = [];
        let path = __basedir + "/app/assets/uploads/" + req.file.filename;

        fs.createReadStream(path)
            .pipe(csv.parse({ headers: true }))
            .on("error", (error) => {
                throw error.message;
            })
            .on("data", (row) => {
                tutorials.push(row);
            })
            .on("end", () => {
                // console.log(tutorials[0],"tutorials")
                var Result = [];
                for (i = 0; i < tutorials.length; i++) {
                    const propertyNames = Object.values(tutorials[i]);
                    Result.push(propertyNames)
                }
                var pool = dbconfig.pool;
                const text = 'INSERT INTO public.product_info (product_name, product_category, product_desc) VALUES %L ON CONFLICT (product_name, product_category) DO UPDATE SET product_desc = EXCLUDED.product_desc';
                const values = Result;
                pool.query(format(text, values), (err, result) => {
                    if (err) {
                        console.log(err.stack)
                    } else {
                        res.send({ message: "Product details uploaded successfully" });
                    }
                    
                })
            });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
};

exports.createOrder = (req, res) => {
    // Save User to Database
    try {
        var pool = dbconfig.pool;
        var postdata = req.body;
        const text = 'INSERT INTO public.order_detail(product_name, product_id, quantity, user_id, status, created_date , updated_date) VALUES ($1, $2, $3, $4, $5, now(),now());'
        const values = [postdata.productname, postdata.productid, postdata.quantity, postdata.userid, 'ORDERED']

        pool.query(text, values, (err, result) => {
            if (err) {
                console.log(err.stack)
            } else {
                res.send({ message: "Your order created successfully!" });
            }
            
        })

    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }

};

exports.updateOrder = (req, res) => {
    // Save User to Database
    try {
        var pool = dbconfig.pool;
        var postdata = req.body;
        const text = 'UPDATE public.order_detail SET product_id= $1 , product_name= $2, quantity = $3,updated_date=now() WHERE order_id= $4 AND user_id =$5 ;'
        const values = [postdata.productid, postdata.productname, postdata.quantity, postdata.orderid, postdata.userid]

        pool.query(text, values, (err, result) => {
            if (err) {
                console.log(err.stack)
            } else {
                res.send({ message: "Your order updated successfully!" });
            }
            
        })

    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }

};

exports.cancelOrder = (req, res) => {
    // Save User to Database
    try {
        var pool = dbconfig.pool;
        var postdata = req.body;
        const text = 'UPDATE public.order_detail SET status = $1, updated_date=now() WHERE order_id= $2 AND user_id = $3 ;'
        const values = ['CANCELLED', postdata.orderid, postdata.userid]

        pool.query(text, values, (err, result) => {
            if (err) {
                console.log(err.stack)
            } else {
                res.send({ message: "Your order cancelled successfully!" });
            }
           
        })

    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }

};

exports.listCustomerProduct = (req, res) => {
    // Save User to Database
    try {
        var pool = dbconfig.pool;
        var postdata = req.body;
        var cond = [], condFor = "", sort = [];

        var text = "SELECT order_id, product_name, quantity, status,created_date, updated_date, user_id, product_id,um.user_name FROM public.order_detail as od " +
            "LEFT JOIN public.user_master as um on od.user_id = um.id "

        if (postdata.searchcustomer) {
            cond.push("um.user_name LIKE '%" + postdata.searchcustomer + "%' ");
        }
        if (postdata.searchproduct) {
            cond.push("od.product_name LIKE '%" + postdata.searchproduct + "%' ");
        }
        if (postdata.sort) {
            sort.push("ORDER BY um.user_name " + postdata.sort);
        }
        if (cond.length != 0) {
            condFor = "where " + cond.join(" AND ");
        }
        text += condFor + sort;

        pool.query(text, (err, result) => {
            if (err) {
                console.log(err.stack)
            } else {
                res.send({
                    message: "list products ordered based on the customer fetched successfully!",
                    rowcount: result.rowCount,
                    result: result.rows
                });
            }

        })

    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }

};

exports.listOrdProdCount = (req, res) => {
    // Save User to Database
    try {
        var pool = dbconfig.pool;
        var postdata = req.body;
        var cond = [], condFor = "", sort = [], group = [];

        var text = "SELECT date(created_date),sum(quantity) as count,product_name,um.user_name FROM public.order_detail as od " +
            "LEFT JOIN public.user_master as um on od.user_id = um.id "

        if (postdata.searchcustomer) {
            cond.push("um.user_name LIKE '%" + postdata.searchcustomer + "%' ");
        }
        if (postdata.searchproduct) {
            cond.push("od.product_name LIKE '%" + postdata.searchproduct + "%' ");
        }
        if (postdata.fromdate) {
            cond.push("od.created_date::date >= '" + postdata.fromdate + "' AND created_date::date <='" + postdata.todate +"'");
        }
        if (postdata.sort) {
            sort.push("ORDER BY um.user_name " + postdata.sort);
        }
        if (cond.length != 0) {
            condFor = "where " + cond.join(" AND ");
        }
        group.push(" GROUP BY od.quantity,od.product_name,od.created_date,um.user_name ");

        text += condFor + group + sort;
        
        pool.query(text, (err, result) => {
            if (err) {
                console.log(err.stack)
            } else {
                res.send({
                    message: "list ordered product count based on date fetched successfully!",
                    rowcount: result.rowCount,
                    result: result.rows
                });
            }

        })

    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }

};

exports.listCustProdCount = (req, res) => {
    // Save User to Database
    try {
        var pool = dbconfig.pool;
        var postdata = req.body;
        var cond = [], condFor = "", sort = [], group = [];

        var text = "SELECT sum(quantity) as count,um.user_name FROM public.order_detail as od " +
            "LEFT JOIN public.user_master as um on od.user_id = um.id "

        if (postdata.searchcustomer) {
            cond.push("um.user_name LIKE '%" + postdata.searchcustomer + "%' ");
        }
        if (postdata.searchproduct) {
            cond.push("od.product_name LIKE '%" + postdata.searchproduct + "%' ");
        }
        if (postdata.sort) {
            sort.push("ORDER BY um.user_name " + postdata.sort);
        }
        if (cond.length != 0) {
            condFor = "where " + cond.join(" AND ");
        }
        group.push("GROUP BY um.user_name ");

        text += condFor + group + sort;
        
        pool.query(text, (err, result) => {
            if (err) {
                console.log(err.stack)
            } else {
                res.send({
                    message: "list customers based on the number of products purchased fetched successfully!",
                    rowcount: result.rowCount,
                    result: result.rows

                });
            }

        })

    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }

};