var express = require("express");
var router = express.Router();

const conString = require("../../src/db/postgres");
/* PostgreSQL and PostGIS module and connection setup */
const { Client, Query } = require("pg");

var polygons_query =
  "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.polygon)::json As geometry, row_to_json((id, name)) As properties FROM areas As lg) As f) As fc";

/* GET the polygons page */
router.get("/polygons", function (req, res) {
  var client = new Client(conString); // Setup our Postgres Client
  client.connect(); // connect to the client
  var query = client.query(new Query(polygons_query)); // Run our Query
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  // Pass the result to the map page
  query.on("end", function (result) {
    var data = result.rows[0].row_to_json; // Save the JSON as variable data
    res.render("map", {
      title: "Express API", // Give a title to our page
      jsonData: data, // Pass data to the View
    });
  });
});

/* GET the filtered country */
router.get("/point*", function (req, res) {
  let lonlat = req.query.lonlat.trim();
  if (
    lonlat.indexOf("--") > -1 ||
    lonlat.indexOf("'") > -1 ||
    lonlat.indexOf(";") > -1 ||
    lonlat.indexOf("/*") > -1 ||
    lonlat.indexOf("xp_") > -1
  ) {
    console.log("Bad request detected");
    res.redirect("/polygons");
    return;
  } else {
    console.log("Request passed");

    var filtered_query =
      "SELECT ar.name, array_agg(ar.id ORDER BY ar.id) as area_list FROM areas ar WHERE ST_Contains(ar.polygon, ST_Point(" +
      lonlat +
      ")) GROUP BY ar.name";

    console.log("Looking for point" + lonlat);
    var client = new Client(conString);
    client.connect();
    var query = client.query(new Query(filtered_query));
    query.on("row", function (row, result) {
      result.addRow(row);
    });
    query.on("end", function (result) {
      var data = {
        type: "FeatureCollection",
        features: [],
      };
      var geometry = {
        type: "Point",
        coordinates: [],
      };

      geometry.coordinates.push(lonlat.split(",")[0]);
      geometry.coordinates.push(lonlat.split(",")[1]);
      var countryName = "";
      if (result.rows[0] !== undefined) {
        result.rows.forEach((row) => (countryName += row.name));
      }
      var feature = {
        type: "Feature",
        properties: {
          f2: countryName + " " + geometry.coordinates,
        },
        geometry: geometry,
      };
      data.features.push(feature);
      res.render("map", {
        title: "Express API",
        jsonData: data,
      });
    });
  }
});

router.post("/polygon", (req, res) => {
  var body = req.body;
  var insert_query =
    "INSERT INTO areas (name, polygon) VALUES (" +
    "'" +
    body.name +
    "'" +
    ",ST_GeometryFromText('POLYGON((" +
    body.polygon +
    "))'));";

  var client = new Client(conString);
  client.connect();
  var query = client.query(new Query(insert_query));
  query.on("end", function (result) {
    console.log("Inserted polygon" + result);
    res.send(200);
  });
});

router.put("/polygon/:id", function (req, res) {
  var body = req.body;
  var id = req.params.id;
  var update_query =
    "UPDATE areas SET polygon = st_geometryfromtext('POLYGON((" +
    body.polygon +
    "))') where id =" +
    id +
    ";";

  var client = new Client(conString);
  client.connect();
  var query = client.query(new Query(update_query));
  query.on("end", function (result) {
    console.log("Updated polygon" + result);
    res.send(200);
  });
});

module.exports = router;
