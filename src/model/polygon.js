const { conString } = require('../db/postgres');
const { Sequelize, Model, DataTypes, GEOMETRY } = require("sequelize");
const sequelize = new Sequelize(
  conString
); // Example for postgres

class Polygon extends Model {}
Polygon.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    polygon: DataTypes.GEOMETRY,
  },
  { sequelize, modelName: "polygon" }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

const syncDB = async () => {
  Polygon.sync({ force: true });
  console.log("DB synchronized");
};


const createPolygonPost = async (bodyName, bodyPolygon) => {
  await sequelize.sync();
  var postPolygon = { type: "Polygon", coordinates: [bodyPolygon] };
  const polygon = await Polygon.create({
    name: bodyName,
    polygon: postPolygon,
  })
    .catch((error) => console.error(error))
    .finally(() => console.log("Finally"));
  console.log(polygon.toJSON());
};

const getAllPolygons = async () => {
  var response;
  return await Polygon.findAll().then((res) => (response = res));
};

const findPolygonById = async (id) => {
  var response;
  return await Polygon.findByPk(id).then((res) => (response = res));
};

const updatePolygon = async (id, name, polygon) => {
  await sequelize.sync();
  var postPolygon = { type: "Polygon", coordinates: [polygon] };
  const updatedPolygon = await Polygon.update(
    { name: name, polygon: postPolygon },
    {
      where: { id: id },
    }
  )
    .catch((error) => console.error(error))
    .finally(() => console.log("Polygon updated"));
  console.log(updatePolygon);
};
module.exports = {
  createPolygonPost,
  getAllPolygons,
  findPolygonById,
  updatePolygon
};
