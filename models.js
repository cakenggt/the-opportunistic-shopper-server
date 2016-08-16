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
  }, {
    scopes: {
      distance: function(location, radius){
        return {
          where: sequelize.where(
            sequelize.fn(
              'ST_Distance',
              sequelize.col('store.location'),
              sequelize.fn(
                'ST_GEOGFROMTEXT',
                'POINT(' + location.longitude + ' ' + location.latitude + ')'
              )
            ),
            '<=',
            radius
          )
        };
      }
    }
  });
  User.hasMany(Store, {as: 'CreatedStores'});
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
  const StoreProduct = sequelize.define('storeProduct', {});
  Product.belongsToMany(Store, {
    through: StoreProduct
  });
  Store.belongsToMany(Product, {
    through: StoreProduct
  });
  return {
    sequelize: sequelize,
    User: User,
    Store: Store,
    UserStore: UserStore,
    Product: Product,
    StoreProduct: StoreProduct
  };
};
