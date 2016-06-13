var Order = require('../models/order');
var User = require('../models/user');
var productList = require('../config/productList');

var getProductList = function (req, res) {

    if (req.user) {
        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'User not found'});
            var resp = [];
            for (var key in productList) {
                
                var contains = false;
                
                for (var key2 in user.cart) {                   
                     if (user.cart[key2].productName === productList[key].productName) {
                         contains = true;
                         break;                         
                     }
                 }
                 if(contains){                     
                     resp.push({'productName': productList[key].productName,
                        'productCategory': productList[key].productCategory,
                        'price': productList[key].price,
                        'inCart': true
                    });
                 } else{
                     resp.push({'productName': productList[key].productName,
                        'productCategory': productList[key].productCategory,
                        'price': productList[key].price,
                        'inCart': false});                                         
                 }

            }            
            res.json({success: true, products: resp, msg: "Success"});
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var addToCart = function (req, res) {

    if (req.user) {

        var id = req.body.productId;

        var item = {productName: productList[id].productName, productCategory: productList[id].productCategory,
            price: productList[id].price, addedDate: new Date(), productId: id};

        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'User not found'});
            user.cart.push(item);
            user.save(function (err) {
                if (err) {
                    return res.json({success: false, msg: 'User cart not saved'});
                }
                res.json({success: true, msg: 'Added to cart'});
            });
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var getItemsInCart = function (req, res) {
    if (req.user) {
        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'Error'});
            var items = user.cart;
            res.json({success: true, msg: "Items in cart", itemsInCart: items});
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var removeItemFromCart = function (req, res) {
    if (req.user) {
        var productId = req.body.productId;
        var productName = productList[productId].productName;
        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'User not found'});
            var items = user.cart;
            for (var key in items) {
                if (items[key].productName == productName) {
                    user.cart.splice(key, 1);
                    user.save(function (err) {
                        if (err) {
                            return res.json({success: false, msg: 'Error'});
                        }
                        res.json({success: true, msg: 'Item deleted'});
                    });
                }
            }
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var getTotalForCart = function (req, res) {

    if (req.user) {
        var totalValue = 0;

        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'User not found'});
            var items = user.cart;
            for (var key in items) {
                totalValue = totalValue + items[key].price;
            }
            res.json({total: totalValue});
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }

};

var getNumberOfItemsInCart = function (req, res) {

    if (req.user) {
        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'User not found'});
            res.json({total: user.cart.length});
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }

};

var clearCart = function (req, res) {
    if (req.user) {
        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'User not found'});
            user.cart = [];
            user.save(function (err) {
                if (err) {
                    return res.json({success: false, msg: 'Error'});
                }
                res.json({success: true, msg: 'Cart cleared'});
            });
        }
        );
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var getOrders = function (req, res) {
    if (req.user) {
        Order.find({'userId': req.user._id}, function (err, orders) {
            if (err)
                return res.json({success: false, msg: 'Error'});
            res.json({success: true, msg: "Orders", orders: orders});
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var bindFunction = function (router) {
    router.get('/get_product_list', getProductList);
    router.post('/add_to_cart', addToCart);
    router.get('/get_items_in_cart', getItemsInCart);
    router.post('/remove_item_from_cart', removeItemFromCart);
    router.get('/get_total_for_cart', getTotalForCart);
    router.get('/get_number_of_items_in_cart', getNumberOfItemsInCart);
    router.post('/clear_cart', clearCart);
    router.get('/get_orders', getOrders);
};

module.exports = {
    bind: bindFunction
};