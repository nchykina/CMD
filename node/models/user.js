'use strict';

var q = require('Q');
var bcrypt = require('bcryptjs');

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define('User', {
        firstname: DataTypes.STRING,
        lastname: DataTypes.STRING,
        name:
                {
                    type: DataTypes.STRING,
                    unique: true
                },
        email:
                {
                    type: DataTypes.STRING,
                    unique: true
                },
        company: DataTypes.STRING,
        password: DataTypes.STRING,
        temp_password: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                User.belongsToMany(models.Role, {through: models.UserRole, foreignKey: 'user_id', as: 'roles'});
                User.belongsToMany(models.Product, {through: models.UserCart, foreignKey: 'user_id', as: 'cart'});
                User.hasMany(models.Order, {as: 'orders'});
            }
        },
        
        instanceMethods: {
            comparePassword: function (passw) {
                var defer = q.defer();

                bcrypt.compare(passw, this.password, function (err, isMatch) {
                    if (err) {
                        return defer.reject(err);
                    }

                    if (isMatch) {
                        defer.resolve();
                    } else {
                        defer.reject('Password mismatch');
                    }
                });

                return defer.promise;
            }
        },
        
        underscored: true
    });
    return User;
};
