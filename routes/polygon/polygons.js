const express = require("express");
const Polygon = require("../../src/model/polygon");
const axios = require("axios");
const router = express.Router();
const host = "http://localhost:3000"

/* GET the polygons page */
router.get("/polygons", function (req, res) {
  var responsesFromOrm;
  axios
    .get(`${host}/polygons/json`)
    .then(function (response) {
      responsesFromOrm = prepareFeatureCollectionToRender(response.data);
      res.render("map", {
        title: "Express API",
        jsonData: responsesFromOrm,
      });
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      console.log("always executed");
    });
});

router.get("/polygons/json", function (req, res) {
  Polygon.getAllPolygons().then((response) => res.send(response));
});

router.get("/polygon/:id", function (req, res) {
  var id = req.params.id;
  Polygon.findPolygonById(id).then((response) => res.send(response));
});

//post with sequalizer ORM

router.post("/polygon", (req, res) => {
  var body = req.body;
  Polygon.createPolygonPost(body.name, body.polygon)
    .then(res.status(200))
    .catch((err) => res.send(err));
});

router.put("/polygon/:id", function (req, res) {
  const id = req.params.id;
  Polygon.updatePolygon(id, req.body.name, req.body.polygon).then((response) =>
    res.send(response)
  );
});

const prepareFeatureCollectionToRender = (response) => {
  const featureColletion = {
    type: "FeatureCollection",
    features: prepareFeaturesArray(response),
  };
  return featureColletion;
};

const prepareFeaturesArray = (response) => {
  var features = [];
  response.forEach((element) => {
    var feature = {
      type: "Feature",
      properties: {
        f1: element.id,
        f2: element.name,
      },
      geometry: element.polygon,
    };
    features.push(feature);
  });
  return features;
};

module.exports = router;
