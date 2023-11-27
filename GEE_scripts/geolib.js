/*
  questo file contiene funzioni per la creazione di indici di tipo geospaziale usando dati Sentinel-2:
  - NDVI
  - EVI
  - LSWI
  - mNDWI
  - NDBI
  - TDVI
  - CMR
  - CIgreen
  - MSAVI
  - NBR
*/

//funzione di filtraggio dati Sentinel-2
function filterFromSentinel2(roi, startDate, endDate, cloudCover){
  var S2 = ee.ImageCollection("COPERNICUS/S2")
    .filterBounds(roi)  //filtro l'ImageCollection per confini (Campania)
    .filterDate(startDate, endDate) //per data
    .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', cloudCover));
  
  return S2;
}

function calculateNDVI(sentinelImages){
  // Calcola l'NDVI per ogni immagine nella collezione
  var ndviCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8');
    var red = image.select('B4');
    var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
    return ndvi;
  });

  return ndviCollection;
}

//funzione che calcola l'NDVI medio utilizzando dati Sentinel-2
exports.generateSentinelNDVI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var ndviCollection = calculateNDVI(sentinelImages);
  
  // Calcola la media dell'NDVI
  var ndviMean = ndviCollection.mean().rename('NDVI_mean');
  var ndviClipped = ndviMean.clip(roi);
  
  //creo le classi per i valori dell'ndvi
  var ndviClass = ee.Image(0)
                  .where(ndviMean.gte(-1).and(ndviMean.lte(0.1)), 1)
                  .where(ndviMean.gt(0.1).and(ndviMean.lte(0.2)), 2)
                  .where(ndviMean.gt(0.2).and(ndviMean.lte(0.3)), 3)
                  .where(ndviMean.gt(0.3).and(ndviMean.lte(0.4)), 4)
                  .where(ndviMean.gt(0.4).and(ndviMean.lte(0.5)), 5)
                  .where(ndviMean.gt(0.5).and(ndviMean.lte(0.6)), 6)
                  .where(ndviMean.gt(0.6).and(ndviMean.lte(0.7)), 7)
                  .where(ndviMean.gt(0.7).and(ndviMean.lte(0.8)), 8)
                  .where(ndviMean.gt(0.8).and(ndviMean.lte(0.9)), 9)
                  .where(ndviMean.gt(0.9).and(ndviMean.lte(1)), 10);
                  
    ndviClass = ndviClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['-1 - 0.1', '0.1 - 0.2', '0.2 - 0.3', '0.3 - 0.4', '0.4 - 0.5', '0.5 - 0.6', '0.6 - 0.7', '0.7 - 0.8', '0.8 - 0.9', '0.9 - 1'];
  var colors = ['white', '#CEE8C0', '#B9DFA5', '#AED996', '#96CE78', '#7FC45A', '#69B441', '#589636', '#2C4B1B', '#233C16'];
  
  // Definisci i parametri di visualizzazione per l'NDVI medio
  var ndviMeanParams = {
    min: 1,
    max: 10,
    palette: colors 
  };

  // Aggiungi l'NDVI medio clipato alla mappa
  Map.centerObject(roi);
  Map.addLayer(ndviClipped, {min: -1, max: 1, palette: ['blue', 'white', 'green']}, "S2-NDVI Mean");
  Map.addLayer(ndviClass, ndviMeanParams, "S2-NDVI Mean Classified");
  addLegend(classes, colors);

  return {
    ndviClassified: ndviClass, //ndvi classificato
    ndviUnclassified: ndviClipped //ndvi non classificato
  };
};

// Funzione per calcolare la varianza dell'NDVI utilizzando dati Sentinel-2
exports.generateSentinelNDVI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var ndviCollection = calculateNDVI(sentinelImages);
  
  // Calcola la varianza dell'NDVI
  var ndviVariance = ndviCollection.reduce(ee.Reducer.variance()).rename('NDVI_variance');
  var ndviClipped = ndviVariance.clip(roi);
  
  var ndviClass = ee.Image(0)
                  .where(ndviVariance.gte(0).and(ndviVariance.lte(0.0001)), 1)
                  .where(ndviVariance.gt(0.0001).and(ndviVariance.lte(0.009)), 2)
                  .where(ndviVariance.gt(0.009).and(ndviVariance.lte(0.01)), 3)
                  .where(ndviVariance.gt(0.01).and(ndviVariance.lte(0.02)), 4)
                  .where(ndviVariance.gt(0.02).and(ndviVariance.lte(0.03)), 5)
                  .where(ndviVariance.gt(0.03), 6);
                  
  ndviClass = ndviClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['0 - 0.0001', '0.0001 - 0.009', '0.009 - 0.01', '0.01 - 0.02', '0.02 - 0.03', '> 0.03'];
  var colors = ['white', '#B9DFA5', '#AED996', '#7FC45A', '#589636', '#2C4B1B'];
  
  var ndviVarianceParams = {
    min: 1,
    max: 6,
    palette: colors
  };
  
  // Aggiungi la varianza dell'NDVI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(ndviClipped, {}, "S2-NDVI Variance");
  Map.addLayer(ndviClass, ndviVarianceParams, "S2-NDVI Variance Classified");
  addLegend(classes, colors);

  return {
    ndviClassified: ndviClass, //ndvi classificato
    ndviUnclassified: ndviClipped //ndvi non classificato
  };
};

function calculateEVI(sentinelImages){
 // Calcola l'EVI per ogni immagine nella collezione
  var eviCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8');
    var red = image.select('B4');
    var blue = image.select('B2');
    var redEdge2 = image.select('B6');
    var evi = image.expression(
      '2.5 * (NIR - RED) / ((NIR + 6 * RED_EDGE2 - 7.5 * BLUE + 1))', {
        'NIR': nir,
        'RED': red,
        'BLUE': blue,
        'RED_EDGE2': redEdge2
      }).rename('EVI');
    return evi;
  });
  
  return eviCollection;
}

// Funzione per calcolare l'EVI medio utilizzando dati Sentinel-2
exports.generateSentinelEVI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var eviCollection = calculateEVI(sentinelImages);
  
  // Calcola la media dell'EVI
  var eviMean = eviCollection.mean().rename('EVI_mean');

  var eviClass = ee.Image(0)
                  .where(eviMean.gte(-1).and(eviMean.lte(0.0)), 1)
                  .where(eviMean.gt(0.0).and(eviMean.lte(0.39)), 2)
                  .where(eviMean.gt(0.39).and(eviMean.lte(0.61)), 3)
                  .where(eviMean.gt(0.61).and(eviMean.lte(0.74)), 4)
                  .where(eviMean.gt(0.74).and(eviMean.lte(0.83)), 5)
                  .where(eviMean.gt(0.83).and(eviMean.lte(1)), 6);
                  
  eviClass = eviClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['-1 - 0.0', '0.0 - 0.39', '0.39 - 0.61', '0.61 - 0.74', '0.74 - 0.83', '0.83 - 1'];
  var colors = ['white', '#B9DFA5', '#AED996', '#7FC45A', '#589636', '#2C4B1B'];
  
  var eviMeanParams = {
    min: 1,
    max: 6,
    palette: colors
  };

  // Aggiungi l'EVI medio clipato alla mappa
  Map.centerObject(roi);
  Map.addLayer(eviClass, eviMeanParams, "S2-EVI Mean Classified");
  addLegend(classes, colors);

  return eviClass; // Ritorna l'immagine dell'EVI medio classificato
};

// Funzione per calcolare la varianza dell'EVI utilizzando dati Sentinel-2
exports.generateSentinelEVI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var eviCollection = calculateEVI(sentinelImages);
  
  // Calcola la varianza dell'EVI
  var eviVariance = eviCollection.reduce(ee.Reducer.variance()).rename('EVI_variance');

  //MI SERVA UNA CLASSIFICAZIONE PER LA VARIANZA - QUESTA E' UNA PROVA
  var eviClass = ee.Image(0)
                  .where(eviVariance.gte(0).and(eviVariance.lte(0.0107)), 1)
                  .where(eviVariance.gt(0.0).and(eviVariance.lte(0.39)), 2)
                  .where(eviVariance.gt(0.39).and(eviVariance.lte(0.61)), 3)
                  .where(eviVariance.gt(0.61).and(eviVariance.lte(0.74)), 4)
                  .where(eviVariance.gt(0.74).and(eviVariance.lte(0.83)), 5)
                  .where(eviVariance.gt(0.83).and(eviVariance.lte(1)), 6);
                  
  eviClass = eviClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['-1 - 0.0', '0.0 - 0.39', '0.39 - 0.61', '0.61 - 0.74', '0.74 - 0.83', '0.83 - 1'];
  var colors = ['white', '#B9DFA5', '#AED996', '#7FC45A', '#589636', '#2C4B1B'];
  
  var eviVarianceParams = {
    min: 1,
    max: 6,
    palette: colors
  };

  // Aggiungi la varianza dell'EVI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(eviClass, eviVarianceParams, "S2-EVI Variance Clipped");

  return eviClass; // Ritorna l'immagine della varianza dell'EVI clipata
};

function calculateLSWI(sentinelImages){
  // Calcola il LSWI per ogni immagine nella collezione
  var lswiCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8');
    var swir1 = image.select('B11');
    var lswi = image.expression('(NIR - SWIR1) / (NIR + SWIR1)', {
      'NIR': nir,
      'SWIR1': swir1,
    }).rename('LSWI');
    return lswi;
  });

  return lswiCollection;
}

// Funzione per calcolare il LSWI medio utilizzando dati Sentinel-2
exports.generateSentinelLSWI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);
  
  var lswiCollection = calculateLSWI(sentinelImages);
  
  // Calcola la media del LSWI
  var lswiMean = lswiCollection.mean().rename('LSWI_mean');

  var lswiClass = ee.Image(0)
                  .where(lswiMean.gte(-1).and(lswiMean.lte(-0.50)), 1)
                  .where(lswiMean.gt(-0.50).and(lswiMean.lte(-0.10)), 2)
                  .where(lswiMean.gt(-0.10).and(lswiMean.lte(0)), 3)
                  .where(lswiMean.gt(0).and(lswiMean.lte(0.10)), 4)
                  .where(lswiMean.gt(0.10).and(lswiMean.lte(1)), 5);
                  
  lswiClass = lswiClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['-1 - (-0.5)', '(-0.5) - (-0.10)', '(-0.10) - 0', '0 - 0.10', '0.10 - 1'];
  var colors = ['white', '#ADD8E6', '#87CEEB', '#0000FF', '#00008B'];
  
  var lswiMeanParams = {
    min: 1,
    max: 5,
    palette: colors
  };

  // Aggiungi il LSWI medio clipato alla mappa
  Map.centerObject(roi);
  Map.addLayer(lswiClass, lswiMeanParams, "S2-LSWI Mean Classified");
  addLegend(classes, colors);

  return lswiClass; // Ritorna l'immagine del LSWI medio classificato
};

// Funzione per calcolare la varianza del LSWI utilizzando dati Sentinel-2
exports.generateSentinelLSWI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var lswiCollection = calculateLSWI(sentinelImages);
  
  // Calcola la varianza del LSWI
  var lswiVariance = lswiCollection.reduce(ee.Reducer.variance()).rename('LSWI_variance');

  var lswiClass = ee.Image(0)
                  .where(lswiVariance.gte(0).and(lswiVariance.lte(0.0003)), 1)
                  .where(lswiVariance.gt(0.0003).and(lswiVariance.lte(0.0091)), 2)
                  .where(lswiVariance.gt(0.0091).and(lswiVariance.lte(0.0180)), 3)
                  .where(lswiVariance.gt(0.0180).and(lswiVariance.lte(0.0269)), 4)
                  .where(lswiVariance.gt(0.0269).and(lswiVariance.lte(0.0357)), 5)
                  .where(lswiVariance.gt(0.0357), 6);
                  
  lswiClass = lswiClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['0 - 0.0003', '0.0003 - 0.0091', '0.0091 - 0.0180', '0.0180 - 0.0269', '0.0269 - 0.0357', '> 0.0357'];
  var colors = ['white', '#ADD8E6', '#87CEEB',  '#7070FF', '#0000FF', '#00008B'];
  
  var lswiVarianceParams = {
    min: 1,
    max: 6,
    palette: colors
  };

  Map.centerObject(roi);
  Map.addLayer(lswiClass, lswiVarianceParams, "S2-LSWI Variance Classified");
  addLegend(classes, colors);

  return lswiClass; // Ritorna l'immagine della varianza del LSWI classificata
};

function calculateMNDWI(sentinelImages){
  // Calcola il mNDWI per ogni immagine nella collezione
  var mndwiCollection = sentinelImages.map(function (image) {
    var green = image.select('B3');
    var swir1 = image.select('B11');
    var swir2 = image.select('B12');
    var mndwi = image.expression('(GREEN - SWIR1) / (GREEN + SWIR2)', {
      'GREEN': green, 
      'SWIR1': swir1,
      'SWIR2': swir2
    }).rename('MNDWI');
    return mndwi;
  });

  return mndwiCollection;
}

// Funzione per calcolare la media del mNDWI utilizzando dati Sentinel-2
exports.generateSentinelMNDWI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var mndwiCollection = calculateMNDWI(sentinelImages);
  
  // Calcola la media del mNDWI
  var mndwiMean = mndwiCollection.mean().rename('MNDWI_mean');

  var mndwiClass = ee.Image(0)
                  .where(mndwiMean.gte(-1).and(mndwiMean.lte(-0.15)), 1)
                  .where(mndwiMean.gt(-0.15).and(mndwiMean.lte(-0.10)), 2)
                  .where(mndwiMean.gt(-0.10).and(mndwiMean.lte(-0.03)), 3)
                  .where(mndwiMean.gt(-0.03).and(mndwiMean.lte(0.05)), 4)
                  .where(mndwiMean.gt(0.05).and(mndwiMean.lte(1)), 5);
                  
  mndwiClass = mndwiClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['-1 - (-0.15)', '(-0.15) - (-0.10)', '(-0.10) - (-0.03)', '(-0.03) - 0.05', '0.05 - 1'];
  var colors = ['white', '#ADD8E6', '#87CEEB', '#0000FF', '#00008B'];
  
  var mndwiMeanParams = {
    min: 1,
    max: 5,
    palette: colors
  };

  // Aggiungi la media del mNDWI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(mndwiClass, mndwiMeanParams, "S2-mNDWI Mean Classified");
  addLegend(classes, colors);

  return mndwiClass; // Ritorna l'immagine della media del mNDWI classificata
};

// Funzione per calcolare la varianza del mNDWI utilizzando dati Sentinel-2
exports.generateSentinelMNDWI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var mndwiCollection = calculateMNDWI(sentinelImages);
  
  // Calcola la varianza del mNDWI
  var mndwiVariance = mndwiCollection.reduce(ee.Reducer.variance()).rename('MNDWI_variance');

 var mndwiClass = ee.Image(0)
                  .where(mndwiVariance.gte(0).and(mndwiVariance.lte(0.0012)), 1)
                  .where(mndwiVariance.gt(0.0012).and(mndwiVariance.lte(0.0148)), 2)
                  .where(mndwiVariance.gt(0.0148).and(mndwiVariance.lte(0.0283)), 3)
                  .where(mndwiVariance.gt(0.0283).and(mndwiVariance.lte(0.0418)), 4)
                  .where(mndwiVariance.gt(0.0418).and(mndwiVariance.lte(0.0553)), 5)
                  .where(mndwiVariance.gt(0.0553), 6);
                  
  mndwiClass = mndwiClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['0 - 0.0012', '0.0012 - 0.0148', '0.0148 - 0.0283', '0.0283 - 0.00418', '0.0418 - 0.0552', '> 0.0553'];
  var colors = ['white', '#ADD8E6', '#87CEEB',  '#7070FF', '#0000FF', '#00008B'];

  var mndwiVarianceParams = {
    min: 1,
    max: 6,
    palette: colors
  };
 
  Map.centerObject(roi);
  Map.addLayer(mndwiClass, mndwiVarianceParams, "S2-mNDWI Variance Classified");
  addLegend(classes, colors);
  
  return mndwiClass; // Ritorna l'immagine della varianza del mNDWI classificata
};

function calculateNDBI(sentinelImages){
  // Calcola il NDBI per ogni immagine nella collezione
  var ndbiCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8');
    var swir1 = image.select('B11');
    var ndbi = image.expression('(SWIR1 - NIR) / (SWIR1 + NIR)', {
      'SWIR1': swir1, 
      'NIR': nir
    }).rename('NDBI');
    return ndbi;
  });
  
  return ndbiCollection;
}

// Funzione per calcolare la media del NDBI utilizzando dati Sentinel-2
exports.generateSentinelNDBI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var ndbiCollection = calculateNDBI(sentinelImages);
  
  // Calcola la media del NDBI
  var ndbiMean = ndbiCollection.mean().rename('NDBI_mean');

  var ndbiClass = ee.Image(0)
                  .where(ndbiMean.gte(-1).and(ndbiMean.lte(0)), 1)
                  .where(ndbiMean.gt(0.02).and(ndbiMean.lte(0.04)), 2)
                  .where(ndbiMean.gt(0.04).and(ndbiMean.lte(0.06)), 3)
                  .where(ndbiMean.gt(0.06).and(ndbiMean.lte(0.08)), 4)
                  .where(ndbiMean.gt(0.08).and(ndbiMean.lte(0.1)), 5)
                  .where(ndbiMean.gt(0.1).and(ndbiMean.lte(0.2)), 6)
                  .where(ndbiMean.gt(0.2).and(ndbiMean.lte(1)), 7);
                  
  ndbiClass = ndbiClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['-1 - 0', '0.02 - 0.04', '0.04 - 0.06', '0.06 - 0.08', '0.08 - 0.1', '0.1 - 0.2', '0.2 - 1'];
  var colors = ['white', '#FFCCCC', '#FF9999', '#FF6666', '#FF3333', '#FF0000', '#CC0000'];

  var ndbiMeanParams = {
    min: 1,
    max: 7,
    palette: colors
  };
 
  // Aggiungi la media del NDBI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(ndbiClass, ndbiMeanParams, "S2-NDBI Mean Classified");
  addLegend(classes, colors);
  
  return ndbiClass; // Ritorna l'immagine della media del NDBI classificata
};

// Funzione per calcolare la varianza del NDBI utilizzando dati Sentinel-2
exports.generateSentinelNDBI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var ndbiCollection = calculateNDBI(sentinelImages);
  
  // Calcola la varianza del NDBI
  var ndbiVariance = ndbiCollection.reduce(ee.Reducer.variance()).rename('NDBI_variance');

  var ndbiClass = ee.Image(0)
                  .where(ndbiVariance.gte(0).and(ndbiVariance.lte(0.0003)), 1)
                  .where(ndbiVariance.gt(0.0003).and(ndbiVariance.lte(0.0091)), 2)
                  .where(ndbiVariance.gt(0.0091).and(ndbiVariance.lte(0.0180)), 3)
                  .where(ndbiVariance.gt(0.0180).and(ndbiVariance.lte(0.0269)), 4)
                  .where(ndbiVariance.gt(0.0269).and(ndbiVariance.lte(0.0357)), 5)
                  .where(ndbiVariance.gt(0.0357), 6);
                  
  ndbiClass = ndbiClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['0 - 0.0003', '0.0003 - 0.0091', '0.0091 - 0.0180', '0.0180 - 0.0269', '0.0269 - 0.0357', '> 0.0357'];
  var colors = ['white', '#FF9999', '#FF6666', '#FF3333', '#FF0000', '#CC0000'];

  var ndbiVarianceParams = {
    min: 1,
    max: 6,
    palette: colors
  };
  
  Map.centerObject(roi);
  Map.addLayer(ndbiClass, ndbiVarianceParams, "S2-NDBI Variance Classified");
  addLegend(classes, colors)

  return ndbiClass; // Ritorna l'immagine della varianza del NDBI classificata
};

function calculateTDVI(sentinelImages){
  // Calcola il TDVI per ogni immagine nella collezione
  var tdviCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8');
    var red = image.select('B4');
    var tdvi = image.expression('1.5 * ((NIR - RED) / (2 * NIR + RED + 0.5))', {
      'NIR': nir, 
      'RED': red
    }).rename('TDVI');
    return tdvi;
  });
  
  return tdviCollection;
}

// Funzione per calcolare il TDVI medio utilizzando dati Sentinel-2
exports.generateSentinelTDVI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);
  
  var tdviCollection = calculateTDVI(sentinelImages);
  
  // Calcola la media del TDVI
  var tdviMean = tdviCollection.mean().rename('TDVI_mean');

  var tdviClass = ee.Image(0)
                  .where(tdviMean.gte(0).and(tdviMean.lte(0.25)), 1)
                  .where(tdviMean.gt(0.25).and(tdviMean.lte(0.50)), 2)
                  .where(tdviMean.gt(0.50).and(tdviMean.lte(0.75)), 3)
                  .where(tdviMean.gt(0.75).and(tdviMean.lte(1)), 4);
  tdviClass = tdviClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['0 - 0.25', '0.25 - 0.50', '0.50 - 0.75', '0.75 - 1'];
  var colors = ['white', '#AED996', '#589636', '#2C4B1B'];

  var tdviMeanParams = {
    min: 1,
    max: 4,
    palette: colors
  };
  
  // Aggiungi il TDVI medio clipato alla mappa
  Map.centerObject(roi);
  Map.addLayer(tdviClass, tdviMeanParams, "S2-TDVI Mean Classified");
  addLegend(classes, colors);

  return tdviClass; // Ritorna l'immagine del TDVI medio classificato
};

// Funzione per la varianza del TDVI da Sentinel-2
exports.generateSentinelTDVI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var tdviCollection = calculateTDVI(sentinelImages);

  // Calcola la varianza del TDVI
  var tdviVariance = tdviCollection.reduce(ee.Reducer.variance()).rename('TDVI_variance');

  var tdviClass = ee.Image(0)
                  .where(tdviVariance.gte(0).and(tdviVariance.lte(0.0001)), 1)
                  .where(tdviVariance.gt(0.0001).and(tdviVariance.lte(0.0066)), 2)
                  .where(tdviVariance.gt(0.0066).and(tdviVariance.lte(0.0131)), 3)
                  .where(tdviVariance.gt(0.0131).and(tdviVariance.lte(0.0196)), 4)
                  .where(tdviVariance.gt(0.0196).and(tdviVariance.lte(0.0262)), 5)
                  .where(tdviVariance.gt(0.0262), 6);
                  
  tdviClass = tdviClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['0 - 0.0001', '0.0001 - 0.0066', '0.0066 - 0.0131', '0.0131 - 0.0196', '0.0196 - 0.0262', '> 0.0262'];
  var colors = ['white', '#B9DFA5', '#AED996', '#7FC45A', '#589636', '#2C4B1B'];
  
  var tdviVarianceParams = {
    min: 1,
    max: 6,
    palette: colors
  };
  
  // Aggiungi la varianza del TDVI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(tdviClass, tdviVarianceParams, "S2-TDVI Variance Classified");
  addLegend(classes, colors);

  return tdviClass; // Ritorna l'immagine della varianza del TDVI classificata
};

function calculateCMR(sentinelImages){
  // Calcola il CMR per ogni immagine nella collezione
  var cmrCollection = sentinelImages.map(function (image) {
    var swir1 = image.select('B11');
    var swir2 = image.select('B12');
    var cmr = image.expression('(SWIR1 / SWIR2)', {
      'SWIR1': swir1, 
      'SWIR2': swir2
    }).rename('CMR');
    return cmr;
  });
  
  return cmrCollection;
}

// Funzione per calcolare il CMR medio utilizzando dati Sentinel-2
exports.generateSentinelCMR_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var cmrCollection = calculateCMR(sentinelImages);

  // Calcola la media del CMR
  var cmrMean = cmrCollection.mean().rename('CMR_mean');

  var cmrClass = ee.Image(0)
                  .where(cmrMean.gte(0).and(cmrMean.lte(0.4)), 1)
                  .where(cmrMean.gt(0.4).and(cmrMean.lte(0.8)), 2)
                  .where(cmrMean.gt(0.8).and(cmrMean.lte(1)), 3)
                  .where(cmrMean.gt(1).and(cmrMean.lte(1.5)), 4)
                  .where(cmrMean.gt(1.5).and(cmrMean.lte(2)), 5);
                  
  cmrClass = cmrClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['0 - 0.4', '0.4 - 0.8', '0.8 - 1', '1 - 1.5', '1.5 - 2'];
  var colors = ['red', 'pink', 'white', 'grey', 'black'];

  var cmrMeanParams = {
    min: 1,
    max: 5,
    palette: colors
  };
  
  // Aggiungi il CMR medio clipato alla mappa
  Map.centerObject(roi);
  Map.addLayer(cmrClass, cmrMeanParams, "S2-CMR Mean Classified");
  addLegend(classes, colors);
  
  return cmrClass; // Ritorna l'immagine del CMR medio classificato
};

// Funzione per la varianza del CMR da Sentinel-2
exports.generateSentinelCMR_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var cmrCollection = calculateCMR(sentinelImages);
  
  // Calcola la varianza del CMR
  var cmrVariance = cmrCollection.reduce(ee.Reducer.variance()).rename('CMR_variance');

  var cmrClass = ee.Image(0)
                  .where(cmrVariance.gte(0).and(cmrVariance.lte(0.0009)), 1)
                  .where(cmrVariance.gt(0.0009).and(cmrVariance.lte(0.0484)), 2)
                  .where(cmrVariance.gt(0.0484).and(cmrVariance.lte(0.0958)), 3)
                  .where(cmrVariance.gt(0.0958).and(cmrVariance.lte(0.1433)), 4)
                  .where(cmrVariance.gt(0.1433).and(cmrVariance.lte(0.1907)), 5)
                  .where(cmrVariance.gt(0.1907), 6);
                  
  cmrClass = cmrClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['0 - 0.0009', ' 0.0009 - 0.0484', '0.0484 - 0.0958', '0.0958 - 0.1433', '0.1433 - 0.1907', '> 0.1907'];
  var colors = ['#C2290A', 'red', 'pink', 'white', 'grey', 'black'];

  var cmrVarianceParams = {
    min: 1,
    max: 6,
    palette: colors
  };
  
  // Aggiungi la varianza del CMR clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(cmrClass, cmrVarianceParams, "S2-CMR Variance Classified");
  addLegend(classes, colors);

  return cmrClass; // Ritorna l'immagine della varianza del CMR classificata
};

function calculateCIgreen(sentinelImages){
  // Calcola il CIgreen per ogni immagine nella collezione
  var ciGreenCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8'); // Banda del vicino infrarosso
    var green = image.select('B3'); // Banda del verde
    var ciGreen = image.expression('(NIR / green) - 1', {
      'NIR': nir, 
      'green': green
    }).rename('CIgreen');
    return ciGreen;
  });
  
  return ciGreenCollection;
}

// Funzione per calcolare la media del CIgreen utilizzando dati Sentinel-2
exports.generateSentinelCIgreen_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var ciGreenCollection = calculateCIgreen(sentinelImages);
  
  // Calcola la media del CIgreen
  var ciGreenMean = ciGreenCollection.mean().rename('CIgreen_mean');

  var ciGreenClass = ee.Image(0)
                  .where(ciGreenMean.gte(0).and(ciGreenMean.lte(0.7)), 1)
                  .where(ciGreenMean.gt(0.7).and(ciGreenMean.lte(1.01)), 2)
                  .where(ciGreenMean.gt(1.01).and(ciGreenMean.lte(1.48)), 3)
                  .where(ciGreenMean.gt(1.48).and(ciGreenMean.lte(2.5)), 4);
                  
  ciGreenClass = ciGreenClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['0 - 0.7', '0.7 - 1.01', '1.01 - 1.48', '1.48 - 2.5'];
  var colors = ['white', '#AED996', '#7FC45A', '#2C4B1B'];

  var ciGreenMeanParams = {
    min: 1,
    max: 4,
    palette: colors
  };
  
  // Aggiungi la media del CIgreen clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(ciGreenClass, ciGreenMeanParams, "S2-CIgreen Mean Classified");
  addLegend(classes, colors);

  return ciGreenClass; // Ritorna l'immagine della media del CIgreen classificata
};

// Funzione per calcolare la varianza del CIgreen utilizzando dati Sentinel-2
exports.generateSentinelCIgreen_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var ciGreenCollection = calculateCIgreen(sentinelImages);
  
  // Calcola la varianza del CIgreen
  var ciGreenVariance = ciGreenCollection.reduce(ee.Reducer.variance()).rename('CIgreen_variance');

  var ciGreenClass = ee.Image(0)
                  .where(ciGreenVariance.gte(0).and(ciGreenVariance.lte(0.0005)), 1)
                  .where(ciGreenVariance.gt(0.0005).and(ciGreenVariance.lte(0.1733)), 2)
                  .where(ciGreenVariance.gt(0.1733).and(ciGreenVariance.lte(0.346)), 3)
                  .where(ciGreenVariance.gt(0.346).and(ciGreenVariance.lte(0.5188)), 4)
                  .where(ciGreenVariance.gt(0.5188).and(ciGreenVariance.lte(0.6915)), 5)
                  .where(ciGreenVariance.gt(0.691), 6);
                  
  ciGreenClass = ciGreenClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['0 - 0.0005', '0.0005 - 0.1733', '0.1733 - 0.346', '0.346 - 0.5188', '0.5188 - 0.6915', '> 0.6915'];
  var colors = ['white', '#B9DFA5', '#AED996', '#7FC45A', '#589636', '#2C4B1B'];

  var ciGreenVarianceParams = {
    min: 1,
    max: 6,
    palette: colors
  };
  
  // Aggiungi la varianza del CIgreen clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(ciGreenClass, ciGreenVarianceParams, "S2-CIgreen Variance Classified");
  addLegend(classes, colors);
  
  return ciGreenClass; // Ritorna l'immagine della varianza del CIgreen classificata
};

function calculateMSAVI(sentinelImages){
  // Calcola il MSAVI per ogni immagine nella collezione
  var msaviCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8'); // Banda del vicino infrarosso
    var red = image.select('B4'); // Banda del rosso
    var redEdge2 = image.select('B6');
    // Calcola l'indice MSAVI 
    var msavi = image.expression(
      '((2 * NIR + 1) - sqrt((2 * NIR + 1)*(2 * NIR + 1) - 8 * (NIR - RED_EDGE2))) / 2', {
      'NIR': nir,
      'RED': red,
      'RED_EDGE2': redEdge2
    }).rename('MSAVI');

    return msavi;
  });

  return msaviCollection;
}

// Funzione per calcolare la media del MSAVI utilizzando dati Sentinel-2
exports.generateSentinelMSAVI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var msaviCollection = calculateMSAVI(sentinelImages);
  
  // Calcola la media del MSAVI
  var msaviMean = msaviCollection.mean().rename('MSAVI_mean');

  var msaviClass = ee.Image(0)
  .where(msaviMean.gte(-1).and(msaviMean.lte(-0.8)), 1)
  .where(msaviMean.gt(-0.8).and(msaviMean.lte(-0.6)), 2)
  .where(msaviMean.gt(-0.6).and(msaviMean.lte(-0.4)), 3)
  .where(msaviMean.gt(-0.4).and(msaviMean.lte(-0.2)), 4)
  .where(msaviMean.gt(-0.2).and(msaviMean.lte(0)), 5)
  .where(msaviMean.gt(0).and(msaviMean.lte(0.2)), 6)
  .where(msaviMean.gt(0.2).and(msaviMean.lte(0.4)), 7)
  .where(msaviMean.gt(0.4).and(msaviMean.lte(0.6)), 8)
  .where(msaviMean.gt(0.6).and(msaviMean.lte(0.8)), 9)
  .where(msaviMean.gt(0.8).and(msaviMean.lte(1)), 10);
                  
  msaviClass = msaviClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
var classes = [
  '-1 - (-0.8)',
  '(-0.8) - (-0.6)',
  '(-0.6) - (-0.4)',
  '(-0.4) - (-0.2)',
  '(-0.2) - 0',
  '0 - 0.2',
  '0.2 - 0.4',
  '0.4 - 0.6',
  '0.6 - 0.8',
  '0.8 - 1'
];
  var colors = ['red', 'orange', '#EA8052', '#EBB552', '#E5BF79', 'yellow', '#BFE579', '#A7DD45', 'green', '#5F8B0C'];

  var msaviMeanParams = {
    min: 1,
    max: 10,
    palette: colors
  };
  
  // Aggiungi la media del MSAVI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(msaviClass, msaviMeanParams, "S2-MSAVI Mean Classificata");
  addLegend(classes, colors);
  
  return msaviClass; // Ritorna l'immagine della media del MSAVI classificata
};

// Funzione per calcolare la varianza del MSAVI utilizzando dati Sentinel-2
exports.generateSentinelMSAVI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var msaviCollection = calculateMSAVI(sentinelImages);
  
  // Calcola la varianza del MSAVI
  var msaviVariance = msaviCollection.reduce(ee.Reducer.variance()).rename('MSAVI_variance');
  
  
  var msaviClass = ee.Image(0)
                  .where(msaviVariance.gte(0).and(msaviVariance.lte(0.0001)), 1)
                  .where(msaviVariance.gt(0.0001).and(msaviVariance.lte(0.0103)), 2)
                  .where(msaviVariance.gt(0.0103).and(msaviVariance.lte(0.0205)), 3)
                  .where(msaviVariance.gt(0.0205).and(msaviVariance.lte(0.0306)), 4)
                  .where(msaviVariance.gt(0.0306).and(msaviVariance.lte(0.0408)), 5)
                  .where(msaviVariance.gt(0.0408), 6);
                  
  msaviClass = msaviClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['0 - 0.0001', '0.0001 - 0.0103', '0.0103 - 0.0205', '0.0205 - 0.0306', '0.0306 - 0.0408', '> 0.0408'];
  var colors = ['white', '#B9DFA5', '#AED996', '#7FC45A', '#589636', '#2C4B1B'];

  var msaviVarianceParams = {
    min: 1,
    max: 6,
    palette: colors
  };
  
  // Aggiungi la varianza del MSAVI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(msaviClass, msaviVarianceParams, "S2-MSAVI Variance Classified");
  addLegend(classes, colors);
  
  return msaviClass; // Ritorna l'immagine della varianza del MSAVI classificata
};

//funzione che calcola il Normalized Burn Radio (NBR)
function calculateNBR(sentinelImages){
  // Calcola l'NBR per ogni immagine nella collezione
  var nbrCollection = sentinelImages.map(function (image) {
    var swir2 = image.select('B12'); // Banda del corto infrarosso 2
    var nir = image.select('B8'); // Banda del vicino infrarosso
   
    // Calcola l'indice NBR
    var nbr = image.expression(
      '(NIR - SWIR2) / (NIR + SWIR2)', {
        'SWIR2': swir2,
        'NIR': nir,
      }).rename('NBR');
    return nbr;
  });
  
  return nbrCollection;
}

// Funzione per calcolare l'NBR e la sua media utilizzando dati Sentinel-2
exports.generateSentinelNBR_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var nbrCollection = calculateNBR(sentinelImages);
  
  // Calcola la media dell'NBR
  var nbrMean = nbrCollection.mean().rename('NBR_mean');

  var nbrClass = ee.Image(0)
                  .where(nbrMean.gte(-1).and(nbrMean.lte(-0.30)), 1)
                  .where(nbrMean.gt(-0.30).and(nbrMean.lte(-0.15)), 2)
                  .where(nbrMean.gt(-0.15).and(nbrMean.lte(0)), 3)
                  .where(nbrMean.gt(0).and(nbrMean.lte(0.15)), 4)
                  .where(nbrMean.gt(0.15).and(nbrMean.lte(0.30)), 5)
                  .where(nbrMean.gt(0.30).and(nbrMean.lte(1)), 6);
                  
  nbrClass = nbrClass.clip(roi);
                  
  //lista delle classi e dei i rispettivi colori
  var classes = ['-1 - (-0.30)', '(-0.30) - (-0.15)', '(-0.15) - 0', '0 - 0.15', '0.15 - 0.30', '0.30 - 1'];
  var colors = ['black', '#474973', '#7F055F', '#F1743F', '#B88A00', 'yellow'];

  var nbrMeanParams = {
    min: 1,
    max: 6,
    palette: colors
  };
  
  // Aggiungi la media dell'NBR clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(nbrClass, nbrMeanParams, "S2-NBR Mean Classified");
  addLegend(classes, colors);
  
  return nbrClass; // Ritorna l'immagine dell'NBR medio classificato
};

// Funzione per calcolare l'NBR e la sua media utilizzando dati Sentinel-2
exports.generateSentinelNBR_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  var nbrCollection = calculateNBR(sentinelImages);
  
  // Calcola la varianza dell'NBR
  var nbrVariance = nbrCollection.reduce(ee.Reducer.variance()).rename('NBR_variance');

  var nbrClass = ee.Image(0)
                    .where(nbrVariance.gte(0).and(nbrVariance.lte(0.0003)), 1)
                    .where(nbrVariance.gt(0.0003).and(nbrVariance.lte(0.0091)), 2)
                    .where(nbrVariance.gt(0.0091).and(nbrVariance.lte(0.0180)), 3)
                    .where(nbrVariance.gt(0.0180).and(nbrVariance.lte(0.0269)), 4)
                    .where(nbrVariance.gt(0.0269).and(nbrVariance.lte(0.0357)), 5)
                    .where(nbrVariance.gt(0.0357), 6);
                    
    nbrClass = nbrClass.clip(roi);
                    
    //lista delle classi e dei i rispettivi colori
    var classes = ['0 - 0.0003', '0.0003 - 0.0091', '0.0091 - 0.0180', '0.0180 - 0.0269', '0.0269 - 0.0357', '> 0.0357'];
    var colors = ['black', '#474973', '#7F055F', '#F1743F', '#B88A00', 'yellow'];
  
    var nbrVarianceParams = {
      min: 1,
      max: 6,
      palette: colors
    };
  // Aggiungi la media dell'NBR clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(nbrClass, nbrVarianceParams, "S2-NBR Mean Classified");
  addLegend(classes, colors);

  return nbrClass; 
};

//creo la legenda delle classi
function addLegend(classes, colors){
  //creo un pannello per la legenda
  var legend = ui.Panel({
    style: {
      position: 'bottom-right',
      padding: '8px 15px',
    }
  });

  for (var i = 0; i < classes.length; i++) {
    //creo un pannello orizzontale per ogni classe
    var classPanel = ui.Panel({
      layout: ui.Panel.Layout.flow('horizontal')
    });

    var label = ui.Label(classes[i], {
      margin: '0px 8px 15px 15px' //top, right, bottom, left
    });

    var colorBox = ui.Label({
      style: {
        backgroundColor: colors[i],
        padding: '8px',
        margin: '0 0 4px 0'
      }
    });

    classPanel.add(colorBox).add(label);

    legend.add(classPanel);
  }

  Map.add(legend);
}
