module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    googleId: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    }
  });
  const Store = sequelize.define('store', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    location: DataTypes.GEOGRAPHY,
  });
  User.hasMany(Store);
  const UserStore = sequelize.define('userStore', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    }
  });
  User.belongsToMany(Store, {
    through: UserStore
  });
  Store.belongsToMany(User, {
    through: UserStore
  });
  const Product = sequelize.define('product', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true
      }
    },
    status: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
      }
    },
    sponsored: {
      type: DataTypes.BOOLEAN
    }
  });
  User.hasMany(Product);
  return {
    sequelize: sequelize,
    User: User,
    Store: Store,
    UserStore: UserStore,
    Product: Product
  };
};
