/*
  questo file contiene funzioni per la creazione di indici di tipo geospaziale:
  - NDVI

*/

//funzione che calcola l'NDVI utilizzando dati Landsat-8
function generateLandsatNDVI(roi, startDate, endDate, cloudCover){
  var L8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
  .filterBounds(roi)  //filtro l'ImageCollection per area di interesse
  .filterDate(startDate, endDate) //per data
  .filter(ee.Filter.lte('CLOUD_COVER', cloudCover)) //per copertura nuvolosa
  .mean() //calcolo la media dei pixel di una collezione di immagini
  .clip(roi);
  
  var nir = L8.select('B5');  //seleziono la banda del vicino infrarosso
  var red = L8.select('B4');  //seleziono la bande del rosso
  
  //calcolo l'Indice di Differenza Normalizzata di Vegetazione
  //(nir - red) / (nir + red)
  var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
  //print(ndvi);
  
  //definisco i parametri di visualizzazione
  var ndviParams = {
    min: -1,
    max: 1, 
    palette: ['blue', 'white', 'green']
  };
  
  Map.centerObject(roi);
  Map.addLayer(ndvi, ndviParams, "L8-NDVI");
  
  return ndvi;  //ritorno la banda generata, nel caso in cui l'utente volesse usarla
}

//funzione che calcola l'NDVI utilizzando dati Sentinel-2
function generateSentinelNDVI(roi, startDate, endDate, cloudCover){
 var S2 = ee.ImageCollection("COPERNICUS/S2")
  .filterBounds(roi)  //filtro l'ImageCollection per confini (Campania)
  .filterDate(startDate, endDate) //per data
  .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', cloudCover))
  .median()
  .clip(roi);
  
  var nir = S2.select('B8');  //B8 è la banda del vicino infrarosso in Sentinel-2
  var red = S2.select('B4');  //B4 è la banda del rosso in Sentinel-2
  
  var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
  //print(ndvi);
  
  //definisco i parametri di visualizzazione
  var ndviParams = {
    min: -1,
    max: 1, 
    palette: ['blue', 'white', 'green']
  };
  
  Map.centerObject(roi);
  Map.addLayer(ndvi, ndviParams, "S2-NDVI");
  
  return ndvi;  //ritorno la banda generata, nel caso in cui l'utente volesse usarla
}




