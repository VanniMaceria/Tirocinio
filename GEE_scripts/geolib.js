/*
  questo file contiene funzioni per la creazione di indici di tipo geospaziale:
  - NDVI
  - EVI
  - LSWI
  - mNDWI
*/

//funzione di filtraggio per dati Landsat-8
function filterFromLandsat8(roi, startDate, endDate, cloudCover){
  var L8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
    .filterBounds(roi)  //filtro l'ImageCollection per area di interesse
    .filterDate(startDate, endDate) //per data
    .filter(ee.Filter.lte('CLOUD_COVER', cloudCover)) //per copertura nuvolosa
    .mean() //calcolo la media dei pixel di una collezione di immagini
    .clip(roi);
    
  return L8;
}

//funzione di filtraggio dati Sentinel-2
function filterFromSentinel2(roi, startDate, endDate, cloudCover){
  var S2 = ee.ImageCollection("COPERNICUS/S2")
    .filterBounds(roi)  //filtro l'ImageCollection per confini (Campania)
    .filterDate(startDate, endDate) //per data
    .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', cloudCover))
    .mean()
    .clip(roi);
  
  return S2;
}

//funzione che calcola l'NDVI utilizzando dati Landsat-8
exports.generateLandsatNDVI = function (roi, startDate, endDate, cloudCover){
  var L8 = filterFromLandsat8(roi, startDate, endDate, cloudCover);
  
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
};

//funzione che calcola l'NDVI utilizzando dati Sentinel-2
exports.generateSentinelNDVI = function(roi, startDate, endDate, cloudCover){
  var S2 = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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
};

//funzione che calcola l'EVI utilizzando dati Landsat-8
exports.generateLandsatEVI = function (roi, startDate, endDate, cloudCover){
  var L8 = filterFromLandsat8(roi, startDate, endDate, cloudCover);
  
  //calcolo la banda EVI
  var evi = L8.expression(
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
    'NIR': L8.select('B5'),  // Banda del vicino infrarosso
    'RED': L8.select('B4'),  // Banda del rosso
    'BLUE': L8.select('B2')  // Banda del blu
  }).rename('EVI');
  
  //definisco i parametri di visualizzazione
  var eviParams = {
    min: -1,
    max: 1, 
    palette: ['red', 'yellow', 'green'],
  };
  
  Map.centerObject(roi);
  Map.addLayer(evi, eviParams, "L8-EVI");
  
  return evi;  //ritorno la banda generata, nel caso in cui l'utente volesse usarla
};

//funzione che calcola l'EVI utilizzando dati Sentinel-2
exports.generateSentinelEVI = function (roi, startDate, endDate, cloudCover){
  var S2 = filterFromSentinel2(roi, startDate, endDate, cloudCover);
  
  //calcolo la banda EVI
  var evi = S2.expression(
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
    'NIR': S2.select('B8'),  // Banda del vicino infrarosso
    'RED': S2.select('B4'),  // Banda del rosso
    'BLUE': S2.select('B2')  // Banda del blu
  }).rename('EVI');
  
  //definisco i parametri di visualizzazione
  var eviParams = {
    min: -1,
    max: 1, 
    palette: ['red', 'yellow', 'green'],
  };
  
  Map.centerObject(roi);
  Map.addLayer(evi, eviParams, "S2-EVI");
  
  return evi;  //ritorno la banda generata, nel caso in cui l'utente volesse usarla
};

//funzione che calcola il LSWI utilizzando dati Landsat-8
exports.generateLandsatLSWI = function (roi, startDate, endDate, cloudCover){
  var L8 = filterFromLandsat8(roi, startDate, endDate, cloudCover);

  // Calcola il LSWI
  var lswi = L8.expression(
    '(NIR - SWIR) / (NIR + SWIR)', {
      'NIR': L8.select('B5'),  // Banda del vicino infrarosso
      'SWIR': L8.select('B6') // Banda del corto infrarosso termico
  }).rename('LSWI');
    
 
  var visParams = {
    min: -1,
    max: 1,
    palette: ['white', 'lightblue', 'blue'] //questa palette è temporanea, la visualizzazione sarà migliore con la classificazione
    /*
      Vedendo su internet una possibile classificazione è:
      LSWI <= - 0.1 (arido)
      -0.1 < LSWI >= 0
      0 < LSWI <= 0.1
      LSWI > 0.1
    */
  };

  
  Map.centerObject(roi);
  Map.addLayer(lswi, visParams, 'L8-LSWI');

  return lswi; 
};

//funzione che calcola il LSWI utilizzando dati Sentinel-2
exports.generateSentinelLSWI = function (roi, startDate, endDate, cloudCover){
  var S2 = filterFromSentinel2(roi, startDate, endDate, cloudCover);
  
  var lswi = S2.expression(
    '(NIR - SWIR) / (NIR + SWIR)', {
      'NIR': S2.select('B8'),  // Banda del vicino infrarosso
      'SWIR': S2.select('B11') // Banda del corto infrarosso termico
    }).rename('LSWI');
    
  var visParams = {
    min: -1,
    max: 1,
    palette: ['white', 'lightblue', 'blue']
  };

  Map.centerObject(roi);
  Map.addLayer(lswi, visParams, 'S2-LSWI');

  return lswi; 
};

// funzione che calcola l'MNDWI utilizzando dati Landsat-8
exports.generateLandsatMNDWI = function (roi, startDate, endDate, cloudCover){
  var image = filterFromLandsat8(roi, startDate, endDate, cloudCover);

  // Calcola mNDWI
  var mndwi = image.expression(
    '(GREEN - SWIR) / (GREEN + SWIR)', {
      'GREEN': image.select('B3'),  // Banda del verde
      'SWIR': image.select('B6')    // Banda del corto infrarosso termico
    }).rename('MNDWI');
    
  var visParams = {
    min: -1,
    max: 1,
    palette: ['green', 'white', 'blue']
  };

  Map.centerObject(roi);
  Map.addLayer(mndwi, visParams, 'L8-MNDWI');

  return mndwi; 
};

//funzione che calcola l'MNDVI utilizzando dati Sentinel-2
exports.generateSentinelMNDWI = function (roi, startDate, endDate, cloudCover){
  var S2 = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var mndwi = S2.expression(
    '(GREEN - SWIR) / (GREEN + SWIR)', {
      'GREEN': S2.select('B3'),  // Banda del verde
      'SWIR': S2.select('B11')   // Banda del corto infrarosso termico
    }).rename('MNDWI');
    
  var visParams = {
    min: -1,
    max: 1,
    palette: ['green', 'white', 'blue']
  };

  Map.centerObject(roi);
  Map.addLayer(mndwi, visParams, 'S2-MNDWI');

  return mndwi; 
};



