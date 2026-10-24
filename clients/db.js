import { Sequelize, DataTypes } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'app.db',
  logging: false,
});

export const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
});

await sequelize.sync();

// Seed once
if ((await Product.count()) === 0) {
  await Product.bulkCreate(
    Array.from({ length: 100 }, (_, i) => ({ name: `Product ${i + 1}`, price: (i + 1) * 10 })),
  );
}
