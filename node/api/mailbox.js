var Message = require('../models/message');


var createMessage = function (req, res) {
    var newMessage = new Message({
        from: req.user.name,
        to: req.body.to,
        subject: req.body.subject,
        content: req.body.content,
        type: 'sent',
        sentTime: new Date()
    });
    var receivedMessage = new Message({
        from: req.user.name,
        to: req.body.to,
        subject: req.body.subject,
        content: req.body.content,
        type: 'inbox',
        sentTime: new Date(),
        read: false // for read/unread messages
    });
    newMessage.save(function (err) {
        if (err) {
            return res.json({success: false, msg: 'Error'});
        }
        receivedMessage.save(function (err) {
            if (err) {
                return res.json({success: false, msg: 'Error'});
            }
            res.json({success: true, msg: 'Email sent and received'});
        });
    });
};


var saveAsDraft = function (req, res) {
    var newMessage = new Message({
        from: req.user.name,
        to: req.body.to,
        subject: req.body.subject,
        content: req.body.content,
        type: 'draft',
        sentTime: new Date()
    });
    newMessage.save(function (err) {
        if (err) {
            return res.json({success: false, msg: 'Error'});
        }
        res.json({success: true, msg: 'Saved as draft'});
    });
};


var getMessagesForInbox = function (req, res) {

    Message.find({'type': 'inbox', 'to': req.user.name}, function (err, messages) {
        if (err)
            return console.error(err);
        res.json({messages: messages, length: messages.length});
    });
};

var getMessagesForDrafts = function (req, res) {

    Message.find({'type': 'draft', 'from': req.user.name}, function (err, messages) {
        if (err)
            return console.error(err);
        res.json({messages: messages});
    });
};

var getMessagesForSent = function (req, res) {

    Message.find({'type': 'sent', 'from': req.user.name}, function (err, messages) {
        if (err)
            return console.error(err);
        res.json({messages: messages});
    });
};

var getMessagesForTrash = function (req, res) {

    Message.find({'type': 'trash', 'owner': req.user.name}, function (err, messages) {
        if (err)
            return console.error(err);
        res.json({messages: messages});
    });
};

var getNumberOfMessages = function (req, res) {

    Message.find({'type': 'inbox', 'to': req.user.name}, function (err, inboxMessages) {
        if (err)
            return console.error(err);
        Message.find({'type': 'draft', 'from': req.user.name}, function (err, draftMessages) {
            if (err)
                return console.error(err);
            Message.find({'type': 'sent', 'from': req.user.name}, function (err, sentMessages) {
                if (err)
                    return console.error(err);
                Message.find({'type': 'trash', 'owner': req.user.name}, function (err, trashMessages) { //фильтр по пользователю???
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
        message.read = true;
        message.save(function (err) {
            if (err) {
                return res.json({success: false, msg: 'Error'});
            }
            res.json({message: message});
        });       
    });
};

var moveToTrash = function (req, res) {
    console.log("Moving items to trash");

    var messages = req.body.ids;
    var movedToTrashFrom = req.body.source;
   // console.log("MESSAGE", messages);
   // console.log("MOVED", movedToTrashFrom);


    for (var key in messages) {
        if (req.body.ids.hasOwnProperty(key)) {
            messageId = req.body.ids[key];
            console.log(messageId);
            //console.log(message.selected);
            Message.findOne({'_id': messageId}, function (err, message) {
                if (err)
                    return console.error(err);
                message.type = 'trash';
                message.movedToTrashFrom = movedToTrashFrom;
                message.owner = req.user.name;
                message.save(function (err) {
                    if (err) {
                        return res.json({success: false, msg: 'Error'});
                    }

                });
            });

        }
    }
    res.json({success: true, msg: 'Moved to trash'});
};

var deleteMessage = function (req, res) {
    console.log("Deleting messages");

    var messages = req.body;
    //console.log(messages);


    for (var key in messages) {
        if (req.body.hasOwnProperty(key)) {
            messageId = req.body[key]; 
            console.log(messageId);
            //console.log(message.selected);
            Message.remove({'_id': messageId}, function (err) {
                if (err) {
                    return res.json({success: false, msg: 'Error'});
                }

            });

        }
    }
    res.json({success: true, msg: 'Messages deleted'});

};


var markAsRead = function (req, res) { // TBD
    console.log("Marking as read/unread");

    var messages = req.body;

    for (var key in messages) {
        if (req.body.hasOwnProperty(key)) {
            messageId = req.body[key];
            console.log(messageId);
            Message.findOne({'_id': messageId}, function (err, message) {
                if (err)
                    return console.error(err);
                if (message.read == true) {
                    message.read = false;
                } else {
                    message.read = true;
                }
                message.save(function (err) {
                    if (err) {
                        return res.json({success: false, msg: 'Error'});
                    }

                });
            });

        }
    }
    res.json({success: true, msg: 'Marked as read/unread'});
};


var moveBackFromTrash = function (req, res) {
    console.log("Moving items back from trash");

    var messages = req.body;

    for (var key in messages) {
        if (req.body.hasOwnProperty(key)) {
            messageId = req.body[key];
            console.log(messageId);
            //console.log(message.selected);
            Message.findOne({'_id': messageId}, function (err, message) {
                if (err)
                    return console.error(err);
                message.type = message.movedToTrashFrom;
                message.save(function (err) {
                    if (err) {
                        return res.json({success: false, msg: 'Error'});
                    }
                });
            });

        }
    }
    res.json({success: true, msg: 'Moved back from trash'});
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
    router.post('/move_to_trash', moveToTrash);
    router.post('/delete_message', deleteMessage);
    router.post('/mark_as_read', markAsRead);
    router.post('/move_back_from_trash', moveBackFromTrash);
};

module.exports = {
    bind: bindFunction
};