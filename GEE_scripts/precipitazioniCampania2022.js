var dataInizio = "2022-01-01";  //YYYY-MM-DD
var dataFine = "2022-12-31";

var campania = ee.FeatureCollection('FAO/GAUL/2015/level1') //featureCollection delle regioni mondiali
  .filter(ee.Filter.eq('ADM1_NAME', 'Campania')); //filtro per ottenere la Campania

var campaniaGeometry = campania.geometry(); //ottengo i vertici in coordinate della regione

var precipitazioniCampania2022 = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD') //raccolta di dati sulle precipitazioni su un periodo di 5 giorni
  .select('precipitation')  //filtro prendendo solo le immagini con una banda 'precipitation'
  .filterBounds(campaniaGeometry)
  .filterDate(dataInizio, dataFine)
  .sum()  //sum() restituisce una singola immagine dove ogni pixel conterrà la somma dei valori dei pixel corrispondenti in tutte le immagini
  .clip(campaniaGeometry);

var visParams = {
  min: 0,
  max: 1072.43,
  palette: ['red', 'white', 'blue']
  
}

Map.centerObject(campaniaGeometry);
Map.addLayer(precipitazioniCampania2022, visParams, "Precipitazioni Campania 2022");

//esporto l'immagine
Export.image.toDrive({
  image: precipitazioniCampania2022,
  description: "Precipitazioni Campania 2022",
  folder: "GEE_data",
  fileNamePrefix: "precipitazioni_campania_2022",
  region: campaniaGeometry,
  scale: 30,
  shardSize: 100,
  fileDimensions: 5000,
  fileFormat: "GeoTIFF"
});