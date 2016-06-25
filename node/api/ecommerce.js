var models = require('../models');

var getProductList = function (req, res) {
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

var addToCart = function (req, res) {

    if (req.user) {
        var id = req.body.productId;

        models.User.findOne(
                {where: {'id': req.user.id}
                })
                .then(function (user) {
                    user.addProduct(id);
                    user.save().then(function (res) {
                        return res.json({success: true, msg: 'Added to cart'});
                    })
                            .catch(function (err) {
                                console.error('failed to save cart: ' + err);
                                return res.json({success: false, msg: 'User cart not saved'});
                            });

                })
                .catch(function (err) {
                    console.error('addToCart: ' + err);
                    return res.json({success: false, msg: 'Error adding to cart'});
                })
                .catch(function (err) {
                    console.error('addToCart: ' + err);
                    return res.json({success: false, msg: 'User not found'});
                }
                );
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var getItemsInCart = function (req, res) {
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
                    res.json({success: true, msg: "Items in cart", itemsInCart: user.cart});
                })
                .catch(function (err)
                {
                    console.error('getItemsInCart: ' + err);
                    return res.json({success: false, msg: 'Error'});
                }
                );

    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var removeItemFromCart = function (req, res) {
    if (req.user) {
        var productId = req.body.productId;

        models.User.findOne({'id': req.user.id})
                .then(function (user) {
                    user.removeProduct(productId)
                            .then(function (res) {
                                res.json({success: true, msg: 'Item deleted'});
                            })
                            .catch(function (err) {
                                console.error('error while removing item from cart: ' + err);
                                return res.json({success: false, msg: 'Error'});
                            });
                })
                .catch(function (err) {
                    return res.json({success: false, msg: 'User not found'});
                }
                );
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var getTotalForCart = function (req, res) {

    if (req.user) {
        var totalValue = 0;

        models.User.findOne(
                {where: {'id': req.user.id, },
                    include: [
                        {model: models.Product,
                            as: 'cart'}
                    ]})
                .then(function (user) {
                    var items = user.cart;
                    for (var key in items) {
                        totalValue = totalValue + items[key].price;
                    }
                    res.json({total: totalValue});
                })
                .catch(function (err) {
                    console.error('getTotalForCart: ' + err);
                    return res.json({success: false, msg: 'User not found'});
                })
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }

};

var getNumberOfItemsInCart = function (req, res) {

    if (req.user) {
        models.User.findOne(
                {where: {'id': req.user.id, },
                    include: [
                        {model: models.Product,
                            as: 'cart'}
                    ]})
                .then(function (user) {
                    res.json({total: user.cart.length});
                })
                .catch(function (err) {
                    return res.json({success: false, msg: 'User not found'});
                });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }

};

var clearCart = function (req, res) {
    if (req.user) {
        models.User.findOne({'id': req.user.id})
                .then(function (user) {
                    user.setProducts([])
                            .then(function (user2)
                            {
                                res.json({success: true, msg: 'Cart cleared'});
                            })
                            .catch(function (err) {
                                console.error('clearCart error: ' + err);
                                return res.json({success: false, msg: 'Error'});
                            });
                }
                )
                .catch(function (err) {
                    console.error('clearCart error: ' + err);
                    return res.json({success: false, msg: 'User not found'});
                });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var getOrders = function (req, res) {
    if (req.user) {
        models.User.findOne(
                {where: {'id': req.user.id, },
                    include: [
                        {model: models.Order,
                            as: 'orders'}
                    ]})
                .then(function (user) {
                    res.json({success: true, msg: "Orders", orders: user.orders});
                })
                .catch(function (err) {
                    console.error('getOrders: ' + err);
                    res.json({success: false, msg: "Database error"});
                });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var createOrder = function (req, res) {
    if (req.user) {
        var paymentType = req.body.paymentType;
        var itemsFromCart = req.user.cart;
        var orderId = crypto.randomBytes(Math.ceil(6)).toString('hex').slice(0, 6); // рандомный IDшник по-хорошему уникальным не является...
        var itemsInCart = req.user.cart;

        var orderAmount = 0;
        for (var key in itemsInCart) {
            orderAmount = orderAmount + itemsInCart[key].price;
        }

        var newOrder = new Order({
            userId: req.user._id,
            paymentType: 'Card',
            products: req.user.cart,
            orderId: orderId,
            orderDate: new Date(),
            totalAmount: orderAmount,
            status: 'Confirmed'
        });
        
        //create an order
        newOrder.save(function (err) {
            if (err) {
                return res.json({success: false, msg: 'Order not created'});
            }
            //after order is created, clear user cart
            User.findOne({'_id': req.user._id}, function (err, user) {
                if (err)
                    return res.json({success: false, msg: 'User not found'});
                user.cart = [];
                user.save(function (err) {
                    if (err)
                        return res.json({success: false, msg: 'Error'});
                    res.json({success: true, msg: 'Cart cleared, order created'});
                });
            }
            );
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
    router.post('/create_order', createOrder);
};

module.exports = {
    bind: bindFunction
};
