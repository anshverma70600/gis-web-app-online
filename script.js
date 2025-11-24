require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Sketch"
], function (Map, MapView, FeatureLayer, GraphicsLayer, Sketch) {

  const graphicsLayer = new GraphicsLayer();

  const map = new Map({
    basemap: "arcgis-topographic",
    layers: [graphicsLayer]
  });

  const view = new MapView({
    container: "map",
    map: map,
    center: [-98, 38],
    zoom: 4
  });

  console.log("MapView Loaded!");

  document.getElementById("btnAddLayer").onclick = () => {
    const statesLayer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_States_Generalized/FeatureServer/0"
    });
    map.add(statesLayer);
    alert("USA States Layer Added!");
  };

  document.getElementById("btnDraw").onclick = () => {
    const sketch = new Sketch({
      view: view,
      layer: graphicsLayer
    });
    view.ui.add(sketch, "top-right");
  };

  document.getElementById("btnClear").onclick = () => {
    graphicsLayer.removeAll();
  };

  document.getElementById("basemapSelect").onchange = (e) => {
    map.basemap = e.target.value;
  };

});
