//Land Surface Temperature
var dataInizio = "2022-01-01";  //YYYY-MM-DD
var dataFine = "2022-12-31";

var campania = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Campania'));

var campaniaGeometry = campania.geometry();

var campaniaLST = ee.ImageCollection('MODIS/061/MOD21C2')
  .filterBounds(campaniaGeometry)
  .filter(ee.Filter.date(dataInizio, dataFine))
  .select('LST_Day')  //seleziono le immagini con banda 'LST_day'
  .mean() //calcolo la media dei pixel di una collezione di immagini
  .clip(campaniaGeometry);

var campaniaLSTVis = {
  //273.15 Kelvin == 0 Celsius
  min: 216.0, //216 Kelvin -> -57.15 Celsius
  max: 348.0, //348 Kelvin -> 74.85 Celsius
  palette: [
    '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
    '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
    '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
    'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
    'ff0000', 'de0101', 'c21301', 'a71001', '911003'
  ],
  scale: 30
};

Map.centerObject(campaniaGeometry, 8);
Map.addLayer(campaniaLST, campaniaLSTVis, 'Media LST Campania');

//esporto l'immagine
Export.image.toDrive({
  image: campaniaLST,
  description: "LST_medio_Campania 2022",
  folder: "GEE_data",
  fileNamePrefix: "LST_medio_campania_2022",
  region: campaniaGeometry,
  scale: 30,
  shardSize: 100,
  fileDimensions: 5000,
  fileFormat: "GeoTIFF"
});
