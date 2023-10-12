var dataInizio = "2020-01-01";  //YYYY-MM-DD
var dataFine = "2022-12-31";

var campania = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Campania'));

var campaniaGeometry = campania.geometry();

var L8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterDate(dataInizio, dataFine)
  .filterBounds(campaniaGeometry)
  .filter(ee.Filter.lt('CLOUD_COVER', 1));

//calcolo e applico l'ndvi per ogni immagine passata alla funzione
L8 = L8.map(function(image) {
  var nir = image.select('B5'); //banda vicino infrarosso (LANDSAT)
  var red = image.select('B4'); //banda infrarosso
  var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
  return image.addBands(ndvi);
});

var NDVI = L8.select(['NDVI']); //seleziona la banda NDVI
var NDVImed = NDVI.median();  //calcolo la mediana di tutti i valori in ciascun pixel nello stack di tutte le bande corrispondenti

var plotNDVI = ui.Chart.image.seriesByRegion(L8, campaniaGeometry, ee.Reducer.mean(),
  'NDVI', 500, 'system:time_start', 'system:index')
  .setChartType('LineChart').setOptions({
    title: 'NDVI from ' + dataInizio + ' to ' + dataFine,
    hAxis: {title: 'Date'}, //asse x
    vAxis: {
      title: 'NDVI',  //asse y
      viewWindow: {
        min: -1,
        max: 1
      }
    }
  });

print(plotNDVI);    //stampo il grafico

var stats = NDVImed.reduceRegion({
  reducer: ee.Reducer.mean(), //calcola il valore medio
  geometry: campaniaGeometry, //specifica la regione di interesse
  scale: 60 //risoluzione in metri
});

//calcolo il valore medio dell'NDVI
var meanNDVI = stats.getNumber('NDVI');

print('Valore medio dell\'NDVI:', meanNDVI);

