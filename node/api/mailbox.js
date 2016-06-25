/* var Message = require('../models/message');


var createMessage = function (req, res) {
    if (req.user) {
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
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var saveAsDraft = function (req, res) {
    if (req.user) {
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
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var getMessages = function (req, res) {
    var messagesForInbox = [];
    var messagesForDrafts = [];
    var messagesForSent = [];
    var messagesForTrash = [];


    if (req.user) {
        var userName = req.user.name;
        Message.find({
            $or: [
                {'type': 'inbox', 'to': userName},
                {'type': 'draft', 'from': userName},
                {'type': 'sent', 'from': userName},
                {'type': 'trash', 'owner': userName}
            ]}, function (err, messages) {
            if (err)
                return res.json({success: false, msg: "No messages found for this user"});
            for (var key in messages) {
                if (messages[key].type == 'inbox') {
                    messagesForInbox.push(messages[key]);
                }
                if (messages[key].type == 'draft') {
                    messagesForDrafts.push(messages[key]);
                }
                if (messages[key].type == 'sent') {
                    messagesForSent.push(messages[key]);
                }
                if (messages[key].type == 'trash') {
                    messagesForTrash.push(messages[key]);
                }
            }
            res.json({success: true, msg: "List of messages acquired",
                messagesForInbox: messagesForInbox,
                messagesForDrafts: messagesForDrafts,
                messagesForSent: messagesForSent,
                messagesForTrash: messagesForTrash,
                inbox: messagesForInbox.length,
                draft: messagesForDrafts.length,
                sent: messagesForSent.length,
                trash: messagesForTrash.length
            });
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var getMessageDetails = function (req, res) {
    if (req.user) {
        console.log("MESSAGE ID", req.query.message_id);

        Message.findOne({'_id': req.query.message_id}, function (err, message) {
            if (err)
                return res.json({success: false, msg: 'Error'});
            message.read = true;
            message.save(function (err) {
                if (err) {
                    return res.json({success: false, msg: 'Error'});
                }
                res.json({success: true, message: message});
            });
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var moveToTrash = function (req, res) {
    if (req.user) {
        console.log("Moving items to trash");

        var messages = req.body.ids;
        var movedToTrashFrom = req.body.source;

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
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var deleteMessage = function (req, res) {
    if (req.user) {
        console.log("Deleting messages");

        var messages = req.body;
        //console.log(messages);


        for (var key in messages) {
            if (req.body.hasOwnProperty(key)) {
                messageId = req.body[key];
                console.log(messageId);
                Message.remove({'_id': messageId}, function (err) {
                    if (err) {
                        return res.json({success: false, msg: 'Error'});
                    }

                });

            }
        }
        res.json({success: true, msg: 'Messages deleted'});
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }

};


var markAsRead = function (req, res) { // TBD
    if (req.user) {
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
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var moveBackFromTrash = function (req, res) {
    if (req.user) {
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
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var bindFunction = function (router) {
    router.post('/create_message', createMessage);
    router.post('/save_as_draft', saveAsDraft);
    router.get('/get_message_details', getMessageDetails);
    router.post('/move_to_trash', moveToTrash);
    router.post('/delete_message', deleteMessage);
    router.post('/mark_as_read', markAsRead);
    router.post('/move_back_from_trash', moveBackFromTrash);
    router.get('/get_messages', getMessages);
};

module.exports = {
    bind: bindFunction
}; */