var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InvoiceSchema = new Schema({
    userId:{
        type: String,
        required: true        
    },
    id: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    template_id: {
        type: String,
        required: true
    },
    merchant_info: {
        email: {
            type: String,
            required: true
        },
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        },
        business_name: {
            type: String,
            required: true
        },
        phone: {
            country_code: {
                type: String,
                required: true
            },
            national_number: {
                type: String,
                required: true
            }
        },
        address: {
            line1: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            postal_code: {
                type: String,
                required: true
            },
            country_code: {
                type: String,
                required: true
            }
        }
    },
    billing_info: {
        email: {
            type: String,
            required: false
        }
    },
    items: [{
            name: {
                type: String,
                required: false
            },
            quantity: {
                type: Number,
                required: false
            },
            unit_price: {
                currency: {
                    type: String,
                    required: false
                },
                value: {
                    type: Number,
                    required: false
                }

            }
        }],
    invoice_date: {
        type: Date,
        required: false
    },
    payment_term: {
        term_type: {
            type: String,
            required: false
        },
        due_date: {
            type: Date,
            required: false
        }
    }
});


module.exports = mongoose.model('Invoice', InvoiceSchema);
