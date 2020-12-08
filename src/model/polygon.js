const { Sequelize, Model, DataTypes, GEOMETRY } = require("sequelize");
const sequelize = new Sequelize(
  "postgres://tomek:admin@localhost:5432/cambridge"
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

const createPolygon = async () => {
  await sequelize.sync();
  console.log("dupa2");

  var polygonST = {
    type: "Polygon",
    coordinates: [
      [
        [100.0, 0.0],
        [101.0, 0.0],
        [101.0, 1.0],
        [100.0, 1.0],
        [100.0, 0.0],
      ],
    ],
  };
  var insertedpolygon = {
    type: "Polygon",
    coordinates: [
      [
        [-62.0532486669848, 16.09192143412939],
        [-62.86394262924544, 17.36959167879405],
        [-61.58714703329128, 18.147417610639263],
        [-60.687173544412985, 16.879729961893045],
        [-62.0532486669848, 16.09192143412939],
      ],
    ],
  };
  const polygon = await Polygon.create({
    id: 102,
    name: "UY",
    polygon: insertedpolygon,
  }).finally(() => console.log("Finally"));
  console.log(polygon.toJSON());
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
