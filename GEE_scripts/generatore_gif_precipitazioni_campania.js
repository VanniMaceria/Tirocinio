var dataInizio = "2022-01-01";  //YYYY-MM-DD
var dataFine = "2022-12-31";

var campania = ee.FeatureCollection('FAO/GAUL/2015/level1') //featureCollection delle regioni mondiali
  .filter(ee.Filter.eq('ADM1_NAME', 'Campania')); //filtro per ottenere la Campania

var campaniaGeometry = campania.geometry(); //ottengo i vertici in coordinate della regione

var col = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD').select('precipitation'); //seleziono la banda precipitation

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
  min: 0.0,
  max: 15,
  palette: ['red', 'white', 'blue']
};

var precipitazioni = comp.map(function(img) { //map prende una funzione che aggiunge i parametri di visualizzazione e clippa sulla geometria scelta
  return img.visualize(visParams).clip(campaniaGeometry);
});

Map.addLayer(precipitazioni);

//esporto la gif sul drive associato all'account di Google Earth Engine
Export.video.toDrive({
  collection: rgbVis,
  description: "precipitazioni_Campania",
  dimensions: 720,
  framesPerSecond: 2,
  region: campaniaGeometry,
  folder: "GEE_data", //se non esiste, la cartella viene creata automaticamente
});



