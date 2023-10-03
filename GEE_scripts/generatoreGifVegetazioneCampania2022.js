/*
  Tutorial: https://developers.google.com/earth-engine/tutorials/community/modis-ndvi-time-series-animation
  Il codice seguente genera una gif della vegetazione nella regione Campania nell'anno 2022
*/

var dataInizio = "2022-01-01";  //YYYY-MM-DD
var dataFine = "2022-12-31";

var campania = ee.FeatureCollection('FAO/GAUL/2015/level1') //featureCollection delle regioni mondiali
  .filter(ee.Filter.eq('ADM1_NAME', 'Campania')); //filtro per ottenere la Campania

var campaniaGeometry = campania.geometry(); //ottengo i vertici in coordinate della regione

print(campaniaGeometry);  //stampa le coordinate del poligono

var col = ee.ImageCollection('MODIS/061/MOD13A2').select('NDVI'); //seleziono l'ndice di Differenza Normalizzata di Vegetazione

col = col.map(function(img) {
  var doy = ee.Date(img.get('system:time_start')).getRelative('day', 'year'); //ottengo la data di acquisizione dell'immagine
  return img.set('doy', doy); //calcolo il giorno dell'anno
});

var distinctDOY = col.filterDate(dataInizio, dataFine); //filtro la collezione di immagini e prendo solo quelle che rientrano tra le due date

var filter = ee.Filter.equals({leftField: 'doy', rightField: 'doy'});
var join = ee.Join.saveAll('doy_matches');
var joinCol = ee.ImageCollection(join.apply(distinctDOY, col, filter));
var comp = joinCol.map(function(img) {
  var doyCol = ee.ImageCollection.fromImages(
    img.get('doy_matches')
  );
  return doyCol.reduce(ee.Reducer.median());
});

//definisco i parametri di visualizzazione delle immagini con valori min, max e palette
var visParams = {
  min: 0.0,
  max: 9000.0,
  palette: [
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
    '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
    '012E01', '011D01', '011301'
  ],
};

var rgbVis = comp.map(function(img) {
  return img.visualize(visParams).clip(campaniaGeometry);
});

var gifParams = {
  'region': campaniaGeometry,
  'dimensions': 600,
  'crs': 'EPSG:3857',
  'framesPerSecond': 2
};

//Esporto la gif sul drive associato all'account di Google Earth Engine
Export.video.toDrive({
  collection: rgbVis,
  description: "NDVI_Campania",
  dimensions: 720,
  framesPerSecond: 2,
  region: campaniaGeometry,
  folder: "GEE_data", //se non esiste, la cartella viene creata automaticamente
});
