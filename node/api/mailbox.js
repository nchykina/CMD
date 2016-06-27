var models = require('../models');

var createMessage = function (req, res) {
    if (req.user) {

        return models.sequelize.transaction(function (t) {

            return models.User.findOne({where: {name: req.body.to}}, {transaction: t})
                    .then(function (userTo) {
                        if(!userTo){
                            throw new Error('target user not found');
                        }

                        return models.Message.create({
                            from_id: req.user.id,
                            to_id: userTo.id,
                            subject: req.body.subject,
                            content: req.body.content,
                            type: 'sent',
                            sentTime: new Date()
                        }, {transaction: t})
                                .then(function (msg1) {
                                    return models.Message.create({
                                        from_id: req.user.id,
                                        to: userTo.id,
                                        subject: req.body.subject,
                                        content: req.body.content,
                                        type: 'inbox',
                                        sentTime: new Date(),
                                        read: false // for read/unread messages
                                    });
                                });
                    });


        })
                .then(function (succ) {
                    res.status(200).json({success: true, msg: 'Email sent and received'});
                })
                .catch(function (err) {
                    console.error('createMessage: ' + err);
                    res.status(500).json({success: false, msg: 'Submission error'});
                });
    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};


var saveAsDraft = function (req, res) {
    if (req.user) {

        return models.sequelize.transaction(function (t) {

            models.User.findOne({name: req.body.to}, {transaction: t})
                    .then(function (userTo) {

                        return models.Message.create({
                            from_id: req.user.id,
                            to_id: userTo.id,
                            subject: req.body.subject,
                            content: req.body.content,
                            type: 'draft',
                            sentTime: new Date()
                        }, {transaction: t});
                    });
        })

                .then(function (succ) {
                    res.status(200).json({success: true, msg: 'Saved as draft'});
                })
                .catch(function (err) {
                    console.error('saveAsDraft: ' + err);
                    res.status(500).json({success: false, msg: ''});
                });


    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};


var getMessages = function (req, res) {
    var messagesForInbox = [];
    var messagesForDrafts = [];
    var messagesForSent = [];
    var messagesForTrash = [];


    if (req.user) {
        var userId = req.user.id;
        models.Message.find({
            $or: [
                {'type': 'inbox', 'to_id': userId},
                {'type': 'draft', 'from_id': userId},
                {'type': 'sent', 'from_id': userId},
                {'type': 'trash', 'owner_id': userId}
            ]}).then(function (messages) {

            for (var key in messages) {
                if (messages[key].type === 'inbox') {
                    messagesForInbox.push(messages[key]);
                }
                if (messages[key].type === 'draft') {
                    messagesForDrafts.push(messages[key]);
                }
                if (messages[key].type === 'sent') {
                    messagesForSent.push(messages[key]);
                }
                if (messages[key].type === 'trash') {
                    messagesForTrash.push(messages[key]);
                }
            }

            res.status(200).json({success: true, msg: "List of messages acquired",
                messagesForInbox: messagesForInbox,
                messagesForDrafts: messagesForDrafts,
                messagesForSent: messagesForSent,
                messagesForTrash: messagesForTrash,
                inbox: messagesForInbox.length,
                draft: messagesForDrafts.length,
                sent: messagesForSent.length,
                trash: messagesForTrash.length
            });
        })
                .catch(function (err) {
                    return res.status(404).json({success: false, msg: "No messages found for this user"});

                })
    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};

var getMessageDetails = function (req, res) {
    if (req.user) {

        return models.sequelize.transaction(function (t) {
            models.Message.findById({'id': req.query.message_id}, {transaction: t})
                    .then(function (message) {

                        message.read = true;
                        return message.save();

                    });
        })
                .then(function (message) {
                    return res.status(200).json({success: true, message: message});
                })
                .catch(function (err) {
                    return res.json({success: false, msg: 'Error'});
                })
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var moveToTrash = function (req, res) {
    if (req.user) {

        return models.sequelize.transaction(function (t) {
            var messages = req.body.ids;
            var movedToTrashFrom = req.body.source;

            var promises = [];

            for (var key in messages) {
                if (req.body.ids.hasOwnProperty(key)) {
                    messageId = req.body.ids[key];
                    console.log(messageId);
                    //console.log(message.selected);
                    promises.push(models.Message.findOne({'id': messageId}, {transaction: t})
                            .then(function (message) {
                                message.type = 'trash';
                                message.movedToTrashFrom = movedToTrashFrom;
                                message.owner = req.user.name;
                                return message.save({transaction: t});

                            }));


                }
            }

            return models.Sequelize.Promise.all(promises);
        })
                .then(function (ret) {
                    res.status(200).json({success: true, msg: 'Moved to trash'});
                })
                .catch(function (err) {
                    console.error('moveToTrash: ' + err);
                    res.status(500).json({success: false, msg: 'Internal error'});
                });
    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};

var deleteMessage = function (req, res) {
    if (req.user) {

        var messages = req.body;

        for (var key in messages) {
            if (req.body.hasOwnProperty(key)) {
                messageId = req.body[key];
                models.Message.remove({'id': messageId})
                        .then(function (ok) {
                            if (ok > 0) {
                                return res.status(200).json({success: true, msg: 'Ok'});
                            } else {
                                return res.status(500).json({success: false, msg: 'Not found'});
                            }
                        }
                        )
                        .catch(function (err) {

                            console.error('deleteMessage: ' + err);

                            return res.json({success: false, msg: 'Error'});


                        });

            }
        }
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }

};


var markAsRead = function (req, res) { // TBD
    if (req.user) {
        console.log("Marking as read/unread");

        var messages = req.body;


        return models.sequelize.transaction(function (t) {

            var promises = [];

            for (var key in messages) {
                if (req.body.hasOwnProperty(key)) {
                    messageId = req.body[key];

                    promises.push(models.Message.findOne({'id': messageId}, {transaction: t})
                            .then(function (message) {

                                if (message.read == true) {
                                    message.read = false;
                                } else {
                                    message.read = true;
                                }

                                return message.save({transaction: t});

                            }));

                }
            }

            return models.Sequelize.Promise.all(promises);
        })
                .then(function (succ) {
                    res.status(200).json({success: true, msg: 'Marked as read/unread'});
                })
                .catch(function (err) {
                    console.error('markAsRead: ' + err);
                    res.status(500).json({success: false, msg: 'Internal error'});
                });



    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};


var moveBackFromTrash = function (req, res) {
    if (req.user) {

        var messages = req.body;

        return models.sequelize.transaction(function (t) {

            var promises = [];

            for (var key in messages) {
                if (req.body.hasOwnProperty(key)) {
                    messageId = req.body[key];

                    //console.log(message.selected);
                    promises.push(models.Message.findOne({'id': messageId}, {transaction: t})
                            .then(function (message) {

                                message.type = message.movedToTrashFrom;
                                return message.save({transaction: t});
                            }));

                }
            }

        })
                .then(function (succ) {
                    res.status(200).json({success: true, msg: 'Moved back from trash'});
                })
                .catch(function (err) {
                    console.error('moveBackFromTrash: ' + err);
                    res.status(500).json({success: false, msg: 'Internal error'});
                });
    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
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
};