var express = require('express');
const router = express.Router();
const Polygon = require("../../src/model/polygon");

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
    .then(response => res.send(response))
    .catch((err) => res.send(err));
});

router.put("/polygon/:id", function (req, res) {
  const id = req.params.id;
  Polygon.updatePolygon(id, req.body.name, req.body.polygon).then((response) =>
    res.send(response)
  );
});

module.exports = router;
