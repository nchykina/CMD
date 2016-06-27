'use strict';
module.exports = function(sequelize, DataTypes) {
  var Message = sequelize.define('Message', {
    subject: DataTypes.STRING,
    content: DataTypes.TEXT,
    type: DataTypes.STRING,
    sent_time: DataTypes.DATE,
    read: DataTypes.BOOLEAN,
    moved_to_trash_from: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
          Message.belongsTo(models.User,{as: 'from'});
          Message.belongsTo(models.User,{as: 'to'});
          Message.belongsTo(models.User,{as: 'owner'});
      }
    }
  });
  return Message;
};