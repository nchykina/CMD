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
    products: [{ name: String, category: String, price: Number, addedDate: Date }],
    status: {
        type: String,
        required: false
    }   
});


module.exports = mongoose.model('Order', OrderSchema);
