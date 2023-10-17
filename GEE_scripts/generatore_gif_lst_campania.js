var dataInizio = "2022-01-01";  //YYYY-MM-DD
var dataFine = "2022-12-31";

var campania = ee.FeatureCollection('FAO/GAUL/2015/level1') //featureCollection delle regioni mondiali
  .filter(ee.Filter.eq('ADM1_NAME', 'Campania')); //filtro per ottenere la Campania

var campaniaGeometry = campania.geometry(); //ottengo i vertici in coordinate della regione

var col = ee.ImageCollection('MODIS/061/MOD21C2').select('LST_Day'); //seleziono la banda LST_day

col = col.map(function(img) {
  var doy = ee.Date(img.get('system:time_start')).getRelative('day', 'year'); //ottengo la data di acquisizione dell'immagine
  return img.set('doy', doy); //calcolo il giorno dell'anno
});

var distinctDOY = col.filterDate(dataInizio, dataFine); //filtro la collezione di immagini e prendo solo quelle che rientrano tra le due date

var filter = ee.Filter.equals({leftField: 'doy', rightField: 'doy'});
var join = ee.Join.saveAll('doy_matches');  //salvo le immagini che hanno lo stesso valore di 'doy'
var joinCol = ee.ImageCollection(join.apply(distinctDOY, col, filter));
var comp = joinCol.map(function(img) {
  var doyCol = ee.ImageCollection.fromImages(
    img.get('doy_matches')
  );
  return doyCol.reduce(ee.Reducer.median());
});

//definisco i parametri di visualizzazione delle immagini con valori min, max e palette
var visParams = {
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
};

var lst = comp.map(function(img) { //map prende una funzione che aggiunge i parametri di visualizzazione e clippa sulla geometria scelta
  return img.visualize(visParams).clip(campaniaGeometry);
});

Map.addLayer(lst);

//esporto la gif sul drive associato all'account di Google Earth Engine
Export.video.toDrive({
  collection: lst,
  description: "LST_Campania",
  dimensions: 720,
  framesPerSecond: 2,
  region: campaniaGeometry,
  folder: "GEE_data", //se non esiste, la cartella viene creata automaticamente
});




