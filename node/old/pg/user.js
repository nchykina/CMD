var sequelize = require('../../config/pg');
var Sequelize = require('sequelize');
var Role = require('../../models/pg/role');
var Product = require('../../models/pg/product');
var q = require('Q');
var bcrypt = require('bcryptjs');

var User = sequelize.define('user', {
    firstname: Sequelize.STRING,
    lastname: Sequelize.STRING,
    name: Sequelize.STRING,        
    email: Sequelize.STRING,
    company: Sequelize.STRING,
    password: Sequelize.STRING,
    temp_password: Sequelize.STRING

}, {
    freezeTableName: true, // Model tableName will be the same as the model name
    paranoid: true,
    instanceMethods: {
        setPassword: function (password) {
            var defer = q.defer();

            bcrypt.genSalt(10, function (err, salt) {
                if (err) {
                    return defer.reject(err);
                }

                bcrypt.hash(password, salt, function (err, hash) {
                    if (err) {
                        return defer.reject(err);
                    }

                    this.password = hash;
                    return defer.resolve(this);
                });
            });

            return defer.promise();

        },
        comparePassword: function (passw) {
            var defer = q.defer();
            
            bcrypt.compare(passw, this.password, function (err, isMatch) {
                if (err) {
                    return defer.reject(err);
                }
                
                if(isMatch){
                    defer.resolve();
                }
                else {
                    defer.reject('Password mismatch');
                }
            });
            
            return defer.promise();
        }
    },
   indexes: [
       {
       unique: true,
       fields: ['email']
    },
    {
       unique: true,
       fields: ['name']
    }
   ]
});

User.belongsToMany(Role, {through: 'user_role'});
Role.belongsToMany(User, {through: 'user_role'});

module.exports = User;

