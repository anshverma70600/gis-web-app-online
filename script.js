require([
  "esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Sketch",
  "esri/widgets/DistanceMeasurement2D",
  "esri/widgets/AreaMeasurement2D",
  "esri/Graphic",
  "esri/geometry/geometryEngine",
  "esri/layers/GeoJSONLayer"
], function (
  Map, MapView, SceneView, FeatureLayer, GraphicsLayer,
  Sketch, DistanceMeasurement2D, AreaMeasurement2D,
  Graphic, geometryEngine, GeoJSONLayer
) {

  // INITIAL MAP + VIEW
  const graphicsLayer = new GraphicsLayer();

  let map = new Map({
    basemap: "arcgis-topographic",
    layers: [graphicsLayer]
  });

  let view = new MapView({
    container: "map",
    map: map,
    center: [-98, 38],
    zoom: 4
  });

  // ADD USA STATES LAYER
  let statesLayer;
  document.getElementById("btnAddLayer").onclick = () => {
    statesLayer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_States_Generalized/FeatureServer/0",
      outFields: ["*"],
      popupTemplate: {
        title: "{STATE_NAME}",
        content: "Population: {POPULATION}<br>FIPS: {STATE_FIPS}"
      }
    });
    map.add(statesLayer);
    alert("USA States Layer Added!");
  };

  // ATTRIBUTE SEARCH
  document.getElementById("btnSearch").onclick = async () => {
    const query = prompt("Enter State Name (e.g., Texas)");

    if (!statesLayer) return alert("Please add the layer first.");

    const result = await statesLayer.queryFeatures({
      where: `STATE_NAME LIKE '%${query}%'`,
      returnGeometry: true,
      outFields: ["*"]
    });

    if (result.features.length === 0)
      return alert("No match found!");

    view.goTo(result.features[0].geometry.extent.expand(2));
  };

  // DRAW TOOL
  document.getElementById("btnDraw").onclick = () => {
    const sketch = new Sketch({
      view: view,
      layer: graphicsLayer,
      creationMode: "update"
    });
    view.ui.add(sketch, "top-right");
  };

  // MEASURE TOOL
  document.getElementById("btnMeasure").onclick = () => {
    let distance = new DistanceMeasurement2D({ view: view });
    view.ui.add(distance, "top-right");
  };

  // BUFFER (5 km)
  document.getElementById("btnBuffer").onclick = () => {
    if (graphicsLayer.graphics.length === 0)
      return alert("Draw something first!");

    const geom = graphicsLayer.graphics.items[0].geometry;

    const buffer = geometryEngine.geodesicBuffer(geom, 5, "kilometers");

    graphicsLayer.add(new Graphic({
      geometry: buffer,
      symbol: {
        type: "simple-fill",
        color: [0, 0, 255, 0.2],
        outline: { color: "blue", width: 2 }
      }
    }));
  };

  // UPLOAD GEOJSON
  document.getElementById("btnUpload").onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".geojson";

    input.onchange = (e) => {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);

      const geojsonLayer = new GeoJSONLayer({ url });
      map.add(geojsonLayer);
    };

    input.click();
  };

  // HEATMAP
  document.getElementById("btnHeatmap").onclick = () => {
    const heatLayer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Cities/FeatureServer/0",
      renderer: {
        type: "heatmap",
        colorStops: [
          { ratio: 0, color: "blue" },
          { ratio: 0.5, color: "yellow" },
          { ratio: 1, color: "red" }
        ],
        maxPixelIntensity: 60,
        minPixelIntensity: 0
      }
    });
    map.add(heatLayer);
  };

  // SWITCH TO 3D VIEW
  document.getElementById("btn3D").onclick = () => {
    view = new SceneView({
      container: "map",
      map: map,
      center: [-98, 38],
      zoom: 4
    });
  };

  // BASEMAP CHANGE
  document.getElementById("basemapSelect").onchange = (e) => {
    map.basemap = e.target.value;
  };

  // CLEAR EVERYTHING
  document.getElementById("btnClear").onclick = () => {
    graphicsLayer.removeAll();
    if (statesLayer) map.remove(statesLayer);
    alert("Cleared!");
  };
});
