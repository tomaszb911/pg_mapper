const { Sequelize, Model, DataTypes, GEOMETRY } = require("sequelize");
const sequelize = new Sequelize(
  "postgres://tomek:admin@localhost.com:5432/cambridge"
); // Example for postgres

class Polygon extends Model {}
Polygon.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    polygon: DataTypes.GEOMETRY,
  },
  { sequelize, modelName: "polygon" }
);

async ()=>{
try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  };
}
console.log('dupa');
async () => {
  await sequelize.sync();
  console.log('dupa2');
  const polygon = await Polygon.create({
    id: 100,
    name: "UY",
    polygon: new GEOMETRY({
      type: "Polygon",
      coordinates: [
        [-55.533983755764275 - 30.20250225922603],
        [-52.179804611647036 - 32.28855686574439],
        [-53.39266883139066 - 35.32705689944584],
        [-58.95530309281274 - 34.77933770222158],
        [-58.46975193045364 - 29.617364757236118],
        [-55.533983755764275 - 30.20250225922603],
      ],
    }),
  }).finally(()=> console.log("Finally"));
  console.log('Should be created')
  console.log(polygon.toJSON());
};
