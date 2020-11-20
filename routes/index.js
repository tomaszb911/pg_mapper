var express = require('express');
var router = express.Router();

/* PostgreSQL and PostGIS module and connection setup */
const { Client, Query } = require('pg')

// Setup connection
var username = "tomek" // sandbox username
var password = "admin" // read only privileges on our table
var host = "localhost:5432"
var database = "cambridge" // database name
var conString = "postgres://" + username + ":" + password + "@" + host + "/" + database; // Your Database Connection

// Set up your database query to display GeoJSON
var coffee_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((id, name)) As properties FROM coffee_shops As lg) As f) As fc";
var polygons_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.polygon)::json As geometry, row_to_json((id, name)) As properties FROM areas As lg) As f) As fc";

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});


/* GET Postgres JSON data */
router.get('/data', function (req, res) {
    var client = new Client(conString);
    client.connect();
    var query = client.query(new Query(coffee_query));
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        res.send(result.rows[0].row_to_json);
        res.end();
    });
});

/* GET the map page */
router.get('/map', function (req, res) {
    var client = new Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client
    var query = client.query(new Query(coffee_query)); // Run our Query
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    // Pass the result to the map page
    query.on("end", function (result) {
        var data = result.rows[0].row_to_json // Save the JSON as variable data
        res.render('map', {
            title: "Express API", // Give a title to our page
            jsonData: data // Pass data to the View
        });
    });
});

/* GET the polygons page */
router.get('/polygons', function (req, res) {
    var client = new Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client
    var query = client.query(new Query(polygons_query)); // Run our Query
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    // Pass the result to the map page
    query.on("end", function (result) {
        var data = result.rows[0].row_to_json // Save the JSON as variable data
        res.render('map', {
            title: "Express API", // Give a title to our page
            jsonData: data // Pass data to the View
        });
    });
});

/* GET the filtered page */
router.get('/filter*', function (req, res) {
    var name = req.query.name;
    if (name.indexOf("--") > -1 || name.indexOf("'") > -1 || name.indexOf(";") > -1 || name.indexOf("/*") > -1 || name.indexOf("xp_") > -1) {
        console.log("Bad request detected");
        res.redirect('/map');
        return;
    } else {
        console.log("Request passed")
        var filter_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((id, name)) As properties FROM coffee_shops As lg WHERE lg.name = \'" + name + "\') As f) As fc";
        var client = new Client(conString);
        client.connect();
        var query = client.query(new Query(filter_query));
        query.on("row", function (row, result) {
            result.addRow(row);
        });
        query.on("end", function (result) {
            var data = result.rows[0].row_to_json
            res.render('map', {
                title: "Express API",
                jsonData: data
            });
        });
    };
});


/* GET the filtered country */
router.get('/point*', function (req, res) {
    let name = req.query.point;
    if (name.indexOf("--") > -1 || name.indexOf("'") > -1 || name.indexOf(";") > -1 || name.indexOf("/*") > -1 || name.indexOf("xp_") > -1) {
        console.log("Bad request detected");
        res.redirect('/polygons');
        return;
    } else {
        console.log("Request passed")
        var filter_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((id, name)) As properties FROM coffee_shops As lg WHERE lg.name = \'" + name + "\') As f) As fc";
        var filtered_query = "SELECT ar.name, array_agg(ar.id ORDER BY ar.id) as area_list FROM areas ar WHERE ST_Contains(ar.polygon, ST_Point(" + name + ")) GROUP BY ar.name"

        console.log("Looking for point" + name)
        var client = new Client(conString);
        client.connect();
        var query = client.query(new Query(filtered_query));
        query.on("row", function (row, result) {
            result.addRow(row);
        });
        query.on("end", function (result) {
            // console.log("Point is in the country " + result.rows[0].name)
            var data = {
                type: "FeatureCollection",
                features: []
            };
            var geometry = {
                type: 'Point',
                coordinates: []
            };

            geometry.coordinates.push(name.split(",")[0])
            geometry.coordinates.push(name.split(",")[1])
            var feature = {
                type: "Feature",
                properties: 'Searched point',
                geometry: geometry
            }
            data.features.push(feature)
            res.render('map', {
                title: "Express API",
                jsonData: data
            });
        });
    };
});


module.exports = router;
