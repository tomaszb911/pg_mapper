var express = require('express');
const axios = require("axios");
const config = require('../../config/config')
const router = express.Router();
const host = config.host

/* GET the polygons page */
router.get("/polygons", function (req, res) {
  axios
    .get(`${host}/polygons/json`)
    .then(function (response) {
      let responsesFromOrm = prepareFeatureCollectionToRender(response.data);
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