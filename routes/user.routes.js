const { authJwt } = require("../middleware");
const controller = require("../controllers/user.controller");
const { fileUpload } = require("../middleware");


module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/userpurchase/upload",
        [authJwt.verifyToken],
        fileUpload.single("file"), controller.upload
    );

    app.post(
        "/api/userpurchase/createorder",
        [authJwt.verifyToken],
        controller.createOrder
    );

    app.post(
        "/api/userpurchase/updateorder",
        [authJwt.verifyToken],
        controller.updateOrder
    );

    app.post(
        "/api/userpurchase/cancelorder",
        [authJwt.verifyToken],
        controller.cancelOrder
    );

    app.post(
        "/api/userpurchase/listcustomerproduct",
        [authJwt.verifyToken],
        controller.listCustomerProduct
    );

    app.post(
        "/api/userpurchase/listorderprodcount",
        [authJwt.verifyToken],
        controller.listOrdProdCount
    );

    app.post(
        "/api/userpurchase/listcustprodcount",
        [authJwt.verifyToken],
        controller.listCustProdCount
    );

};