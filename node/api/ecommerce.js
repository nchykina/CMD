var models = require('../models');

var product_list = function (req, res) {
    if (req.user) {
        models.Product.findAll()
                .then(function (products) {
                    res.json({success: true, products: products, msg: "Success"});
                })
                .catch(function (err) {
                    console.error("getProductList: " + err);
                    return res.json({success: false, msg: 'User not found'});
                });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var cart_add = function (req, res) {

    if (req.user) {
        var id = req.body.product_id;

        models.User.findOne(
                {where: {'id': req.user.id}
                })
                .then(function (user) {
                    user.addCart(id).then(function (instance) {
                        if (instance) {
                            return res.status(200).json({success: true, msg: 'Added to cart'});
                        } else {
                            return res.status(500).json({success: false, msg: 'Items added: ' + instance});
                        }
                    })
                            .catch(function (err) {
                                console.error('cart_add: ' + err);
                                return res.status(500).json({success: false, msg: 'User cart not saved'});
                            });

                })
                .catch(function (err) {
                    console.error('cart_add: ' + err);
                    return res.status(500).json({success: false, msg: 'User not found'});
                }
                );
    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};

var cart_list = function (req, res) {
    if (req.user) {
        models.User.findOne(
                {
                    where: {'id': req.user.id},
                    include: [
                        {
                            model: models.Product,
                            as: 'cart'
                        }
                    ]
                })
                .then(function (user) {
                    res.status(200).json({success: true, msg: "Items in cart", cart: user.cart});
                })
                .catch(function (err)
                {
                    console.error('cart_list: ' + err);
                    return res.status(500).json({success: false, msg: 'Error'});
                }
                );

    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};


var cart_remove = function (req, res) {
    if (req.user) {
        var productId = req.params.product_id;

        models.UserCart.destroy({where: {product_id: productId, user_id: req.user.id}})
                .then(function (num) {
                    if (num === 1) {
                        res.status(200).json({success: true, msg: 'Item deleted'});
                    } else {
                        console.error('cart_remove: cannot find product:' + productId + " user:" + req.user.id);
                        res.status(500).json({success: true, msg: 'Internal lookup error'});
                    }
                })
                .catch(function (err) {
                    console.error('cart_remove: ' + err);
                    return res.status(500).json({success: false, msg: 'Internal error'});
                });

    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};

var cart_clear = function (req, res) {
    if (req.user) {
        models.User.findOne({'id': req.user.id})
                .then(function (user) {
                    user.setCart([])
                            .then(function (num)
                            {
                                res.status(200).json({success: true, msg: 'Cart cleared'});
                            })
                            .catch(function (err) {
                                console.error('cart_clear: ' + err);
                                return res.status(500).json({success: false, msg: 'Error'});
                            });
                }
                )
                .catch(function (err) {
                    console.error('cart_clear: ' + err);
                    return res.status(500).json({success: false, msg: 'User not found'});
                });
    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};

var orders_list = function (req, res) {
    if (req.user) {
        models.User.findOne(
                {where: {'id': req.user.id, },
                    include: [
                        {model: models.Order,
                            as: 'orders',
                            include:
                                    [
                                        {
                                            model: models.OrderLine,
                                            as: 'lines',
                                            include: 
                                                    [
                                                {
                                                    model: models.Product,
                                                    as: 'product'
                                                }                                                
                                                    ]
                                        }
                                    ]}
                    ]})
                .then(function (user) {
                    res.status(200).json({success: true, msg: "Orders", orders: user.orders});
                })
                .catch(function (err) {
                    console.error('getOrders: ' + err);
                    res.status(500).json({success: false, msg: "Database error"});
                });
    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};

/* TODO: wrap all the SQL into single transaction */
var orders_create = function (req, res) {
    if (req.user) {

        models.User.findOne(
                {where: {'id': req.user.id},
                    include: [
                        {
                            model: models.Product,
                            as: 'cart'
                        }
                    ]
                })
                .then(function (user) {
                    var order_lines = [];

                    for (var product in user.cart) {
                        order_lines.push(
                                {
                                    product_id: user.cart[product].id,
                                    amount: user.cart[product].price
                                });
                    }

                    models.Order.create(
                            {
                                lines: order_lines,
                                user_id: user.id,
                                payment_type: req.body.payment_type,
                                status: 'Pending'
                            },
                            {
                                include: [models.User, 
                                    {model: models.OrderLine, as: 'lines'   }]
                            }
                    )
                            .then(function (order) {
                                //populate product field in orderline. ORM can't do that kind of magic but we need it in Angular
                                for(var ol in order.lines){
                                    for(var pr in user.cart){
                                        if(order.lines[ol].product_id===user.cart[pr].id){
                                            order.lines[ol].product = JSON.parse(JSON.stringify(user.cart[pr]));
                                        }
                                    }
                                }
                                
                                user.setCart([])
                                        .then(function (ok2) {
                                            return res.status(200).json({success: true, msg: 'Cart cleared, order created', order: order});
                                        })
                                        .catch(function (err) {
                                            console.error("createOrder: " + err);
                                            return res.status(500).json({success: false, msg: 'Order not created'});
                                        })
                            })
                            .catch(function (err) {
                                console.error("createOrder: " + err);
                                return res.status(500).json({success: false, msg: 'Order not created'});
                            });
                })
                .catch(function (err) {
                    console.error("createOrder: " + err);
                    return res.status(500).json({success: false, msg: 'Order not created'});
                });
    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};

var bindFunction = function (router) {
    router.get('/products', product_list);
    router.post('/cart', cart_add);
    router.get('/cart', cart_list);
    router.delete('/cart/:product_id', cart_remove);
    //router.get('/get_total_for_cart', getTotalForCart);
    //router.get('/get_number_of_items_in_cart', getNumberOfItemsInCart);
    router.delete('/cart', cart_clear);
    router.get('/orders', orders_list);
    router.post('/orders', orders_create);
};

module.exports = {
    bind: bindFunction
};
