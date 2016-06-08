var Message = require('../models/message');


var createMessage = function (req, res) {
    var newMessage = new Message({
        from: req.body.from,
        to: req.body.to,
        subject: req.body.subject,
        content: req.body.content
    });
    newMessage.save(function (err) {
        if (err) {
            return res.json({success: false, msg: 'Error'});
        }
        res.json({success: true, msg: 'Email sent'});
    });
};

var bindFunction = function (router) {
    router.post('/create_message', createMessage);
};

module.exports = {
    bind: bindFunction
};