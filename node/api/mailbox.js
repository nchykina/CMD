var Message = require('../models/message');


var createMessage = function (req, res) {
    var newMessage = new Message({
        from: req.body.from,
        to: req.body.to,
        subject: req.body.subject,
        content: req.body.content,
        type: 'sent'
    });
    newMessage.save(function (err) {
        if (err) {
            return res.json({success: false, msg: 'Error'});
        }
        res.json({success: true, msg: 'Email sent'});
    });
};


var saveAsDraft = function (req, res) {
    var newMessage = new Message({
        from: req.body.from,
        to: req.body.to,
        subject: req.body.subject,
        content: req.body.content,
        type: 'draft'
    });
    newMessage.save(function (err) {
        if (err) {
            return res.json({success: false, msg: 'Error'});
        }
        res.json({success: true, msg: 'Saved as draft'});
    });
};


var getMessagesForInbox = function (req, res) {

    Message.find({'type': 'inbox'}, function (err, messages) {
        if (err)
            return console.error(err);
        res.json({messages: messages, length: messages.length});
    });
};

var getMessagesForDrafts = function (req, res) {

    Message.find({'type': 'draft'}, function (err, messages) {
        if (err)
            return console.error(err);
        res.json({messages: messages});
    });
};

var getMessagesForSent = function (req, res) {

    Message.find({'type': 'sent'}, function (err, messages) {
        if (err)
            return console.error(err);
        res.json({messages: messages});
    });
};

var getMessagesForTrash = function (req, res) {

    Message.find({'type': 'trash'}, function (err, messages) {
        if (err)
            return console.error(err);
        res.json({messages: messages});
    });
};

var getNumberOfMessages = function (req, res) {

    Message.find({'type': 'inbox'}, function (err, inboxMessages) {
        if (err)
            return console.error(err);
        Message.find({'type': 'draft'}, function (err, draftMessages) {
            if (err)
                return console.error(err);
            Message.find({'type': 'sent'}, function (err, sentMessages) {
                if (err)
                    return console.error(err);
                Message.find({'type': 'trash'}, function (err, trashMessages) {
                    if (err)
                        return console.error(err);
                    res.json({inbox: inboxMessages.length, draft: draftMessages.length,
                        sent: sentMessages.length, trash: trashMessages.length});
                });
            });
        });
    });
};


var getMessageDetails = function (req, res) {
    console.log(req.query.message_id);

    Message.findOne({'_id': req.query.message_id}, function (err, message) {
        if (err)
            return console.error(err);
         //console.log(message);
        res.json({message: message});
    });
};



var bindFunction = function (router) {
    router.post('/create_message', createMessage);
    router.post('/save_as_draft', saveAsDraft);
    router.get('/get_messages_for_inbox', getMessagesForInbox);
    router.get('/get_messages_for_drafts', getMessagesForDrafts);
    router.get('/get_messages_for_sent', getMessagesForSent);
    router.get('/get_messages_for_trash', getMessagesForTrash);
    router.get('/get_number_of_messages', getNumberOfMessages);
    router.get('/get_message_details', getMessageDetails);
};

module.exports = {
    bind: bindFunction
};