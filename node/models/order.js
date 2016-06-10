var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
    user: {
        type: String,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    products: [{ productName: String, productCategory: String, price: Number, addedDate: Date }],
    paymentType: {
        type: String,
        required: false
    }   
});


module.exports = mongoose.model('Order', OrderSchema);
