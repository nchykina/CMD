var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    products: [{ productName: String, productCategory: String, price: Number, addedDate: Date, productId: Number}],
    paymentType: { // 1. credit card/paypal or 2. wire transfer
        type: String,
        required: false
    },
    totalAmount: {
        type: Number,
        required: false
    },
    status: { // Confirmed, pending, cancelled
        type: String,
        required: false
    }
    //статус ордера (подтвержден - в процессе - отменен)
    //button "record a payment" -- admin only
    //IPN
    //product list for order list
});


module.exports = mongoose.model('Order', OrderSchema);
