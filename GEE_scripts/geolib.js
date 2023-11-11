/*
  questo file contiene funzioni per la creazione di indici di tipo geospaziale usando dati Sentinel-2:
  - NDVI
  - EVI
  - LSWI
  - mNDWI
  - NDBI
  - NDSI
  - TDVI
  - CMR
  - CIgreen
*/

//funzione di filtraggio dati Sentinel-2
function filterFromSentinel2(roi, startDate, endDate, cloudCover){
  var S2 = ee.ImageCollection("COPERNICUS/S2")
    .filterBounds(roi)  //filtro l'ImageCollection per confini (Campania)
    .filterDate(startDate, endDate) //per data
    .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', cloudCover));
  
  return S2;
}

//funzione che calcola l'NDVI medio utilizzando dati Sentinel-2
exports.generateSentinelNDVI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  // Calcola l'NDVI per ogni immagine nella collezione
  var ndviCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8');
    var red = image.select('B4');
    var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
    return ndvi;
  });

  // Calcola la media dell'NDVI
  var ndviMean = ndviCollection.mean().rename('NDVI_mean');

  // Clip dell'NDVI medio sulla ROI
  var ndviMeanClipped = ndviMean.clip(roi);

  // Definisci i parametri di visualizzazione per l'NDVI medio
  var ndviMeanParams = {
    min: -1,
    max: 1,
    palette: ['blue', 'white', 'green']
  };

  // Aggiungi l'NDVI medio clipato alla mappa
  Map.centerObject(roi);
  Map.addLayer(ndviMeanClipped, ndviMeanParams, "S2-NDVI Mean Clipped");

  return ndviMeanClipped; // Ritorna l'immagine dell'NDVI medio clipato
};

// Funzione per calcolare la varianza dell'NDVI utilizzando dati Sentinel-2
exports.generateSentinelNDVI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  // Calcola l'NDVI per ogni immagine nella collezione
  var ndviCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8');
    var red = image.select('B4');
    var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
    return ndvi;
  });

  // Calcola la varianza dell'NDVI
  var ndviVariance = ndviCollection.reduce(ee.Reducer.variance()).rename('NDVI_variance');

  // Clip dell'NDVI variance sulla ROI
  var ndviVarianceClipped = ndviVariance.clip(roi);

  // Aggiungi la varianza dell'NDVI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(ndviVarianceClipped, {}, "S2-NDVI Variance Clipped");

  return ndviVarianceClipped; // Ritorna l'immagine della varianza dell'NDVI clipata
};

// Funzione per calcolare l'EVI medio utilizzando dati Sentinel-2
exports.generateSentinelEVI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  // Calcola l'EVI per ogni immagine nella collezione
  var eviCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8');
    var red = image.select('B4');
    var blue = image.select('B2');
    var evi = image.expression(
      '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
        'NIR': nir,
        'RED': red,
        'BLUE': blue
      }).rename('EVI');
    return evi;
  });

  // Calcola la media dell'EVI
  var eviMean = eviCollection.mean().rename('EVI_mean');

  // Clip dell'EVI medio sulla ROI
  var eviMeanClipped = eviMean.clip(roi);

  // Definisci i parametri di visualizzazione per l'EVI medio
  var eviMeanParams = {
    min: -1,
    max: 1,
    palette: ['red', 'yellow', 'green'],
  };

  // Aggiungi l'EVI medio clipato alla mappa
  Map.centerObject(roi);
  Map.addLayer(eviMeanClipped, eviMeanParams, "S2-EVI Mean Clipped");

  return eviMeanClipped; // Ritorna l'immagine dell'EVI medio clipato
};

// Funzione per calcolare la varianza dell'EVI utilizzando dati Sentinel-2
exports.generateSentinelEVI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  // Calcola l'EVI per ogni immagine nella collezione
  var eviCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8');
    var red = image.select('B4');
    var blue = image.select('B2');
    var evi = image.expression(
      '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
        'NIR': nir,
        'RED': red,
        'BLUE': blue
      }).rename('EVI');
    return evi;
  });

  // Calcola la varianza dell'EVI
  var eviVariance = eviCollection.reduce(ee.Reducer.variance()).rename('EVI_variance');

  // Clip dell'EVI variance sulla ROI
  var eviVarianceClipped = eviVariance.clip(roi);

  // Definisci i parametri di visualizzazione per la varianza dell'EVI
  var eviVarianceParams = {
    min: 0,
    max: 0.1,
    palette: ['red', 'yellow', 'green'],
  };

  // Aggiungi la varianza dell'EVI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(eviVarianceClipped, eviVarianceParams, "S2-EVI Variance Clipped");

  return eviVarianceClipped; // Ritorna l'immagine della varianza dell'EVI clipata
};

// Funzione per calcolare il LSWI medio utilizzando dati Sentinel-2
exports.generateSentinelLSWI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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

  // Calcola la media del LSWI
  var lswiMean = lswiCollection.mean().rename('LSWI_mean');

  // Clip del LSWI medio sulla ROI
  var lswiMeanClipped = lswiMean.clip(roi);

  // Definisci i parametri di visualizzazione per il LSWI medio
  var lswiMeanParams = {
    min: -1,
    max: 1,
    palette: ['blue', 'white', 'green'],
  };

  // Aggiungi il LSWI medio clipato alla mappa
  Map.centerObject(roi);
  Map.addLayer(lswiMeanClipped, lswiMeanParams, "S2-LSWI Mean Clipped");

  return lswiMeanClipped; // Ritorna l'immagine del LSWI medio clipato
};

// Funzione per calcolare la varianza del LSWI utilizzando dati Sentinel-2
exports.generateSentinelLSWI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  // Calcola il LSWI per ogni immagine nella collezione
  var lswiCollection = sentinelImages.map(function (image) {
    var nir = image.select('B8');
    var swir1 = image.select('B11');
    var lswi = image.expression('(NIR - SWIR1) / (NIR + SWIR1)', {
      'NIR': nir,
      'SWIR1': swir1
    }).rename('LSWI');
    return lswi;
  });

  // Calcola la varianza del LSWI
  var lswiVariance = lswiCollection.reduce(ee.Reducer.variance()).rename('LSWI_variance');

  // Clip della varianza del LSWI sulla ROI
  var lswiVarianceClipped = lswiVariance.clip(roi);

  // Definisci i parametri di visualizzazione per la varianza del LSWI
  var lswiVarianceParams = {
    min: 0,
    max: 0.1,
    palette: ['blue', 'white', 'green'],
  };

  // Aggiungi la varianza del LSWI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(lswiVarianceClipped, lswiVarianceParams, "S2-LSWI Variance Clipped");

  return lswiVarianceClipped; // Ritorna l'immagine della varianza del LSWI clipata
};

// Funzione per calcolare la media del mNDWI utilizzando dati Sentinel-2
exports.generateSentinelMNDWI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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

  // Calcola la media del mNDWI
  var mndwiMean = mndwiCollection.mean().rename('MNDWI_mean');

  // Clip della media del mNDWI sulla ROI
  var mndwiMeanClipped = mndwiMean.clip(roi);

  // Definisci i parametri di visualizzazione per la media del mNDWI
  var mndwiMeanParams = {
    min: -0.5,
    max: 0.5,
    palette: ['blue', 'white', 'green'],
  };

  // Aggiungi la media del mNDWI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(mndwiMeanClipped, mndwiMeanParams, "S2-mNDWI Mean Clipped");

  return mndwiMeanClipped; // Ritorna l'immagine della media del mNDWI clipata
};

// Funzione per calcolare la varianza del mNDWI utilizzando dati Sentinel-2
exports.generateSentinelMNDWI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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

  // Calcola la varianza del mNDWI
  var mndwiVariance = mndwiCollection.reduce(ee.Reducer.variance()).rename('MNDWI_variance');

  // Clip della varianza del mNDWI sulla ROI
  var mndwiVarianceClipped = mndwiVariance.clip(roi);

  // Definisci i parametri di visualizzazione per la varianza del mNDWI
  var mndwiVarianceParams = {
    min: 0,
    max: 0.1,
    palette: ['blue', 'white', 'green'],
  };

  // Aggiungi la varianza del mNDWI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(mndwiVarianceClipped, mndwiVarianceParams, "S2-mNDWI Variance Clipped");

  return mndwiVarianceClipped; // Ritorna l'immagine della varianza del mNDWI clipata
};

// Funzione per calcolare la media del NDBI utilizzando dati Sentinel-2
exports.generateSentinelNDBI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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

  // Calcola la media del NDBI
  var ndbiMean = ndbiCollection.mean().rename('NDBI_mean');

  // Clip della media del NDBI sulla ROI
  var ndbiMeanClipped = ndbiMean.clip(roi);

  // Definisci i parametri di visualizzazione per la media del NDBI
  var ndbiMeanParams = {
    min: -1,
    max: 1,
    palette: ['green', 'yellow', 'red'],
  };

  // Aggiungi la media del NDBI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(ndbiMeanClipped, ndbiMeanParams, "S2-NDBI Mean Clipped");

  return ndbiMeanClipped; // Ritorna l'immagine della media del NDBI clipata
};

// Funzione per calcolare la varianza del NDBI utilizzando dati Sentinel-2
exports.generateSentinelNDBI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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

  // Calcola la varianza del NDBI
  var ndbiVariance = ndbiCollection.reduce(ee.Reducer.variance()).rename('NDBI_variance');

  // Clip della varianza del NDBI sulla ROI
  var ndbiVarianceClipped = ndbiVariance.clip(roi);

  // Definisci i parametri di visualizzazione per la varianza del NDBI
  var ndbiVarianceParams = {
    min: 0,
    max: 0.1,
    palette: ['green', 'yellow', 'red'],
  };

  // Aggiungi la varianza del NDBI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(ndbiVarianceClipped, ndbiVarianceParams, "S2-NDBI Variance Clipped");

  return ndbiVarianceClipped; // Ritorna l'immagine della varianza del NDBI clipata
};

// Funzione per calcolare la media del NDSI utilizzando dati Sentinel-2
exports.generateSentinelNDSI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  // Calcola il NDSI per ogni immagine nella collezione
  var ndsiCollection = sentinelImages.map(function (image) {
    var swir1 = image.select('B11');
    var swir2 = image.select('B12');
    var ndsi = image.expression('(SWIR1 - SWIR2) / (SWIR1 + SWIR2)', {
      'SWIR1': swir1, 
      'SWIR2': swir2
    }).rename('NDSI');
    return ndsi;
  });

  // Calcola la media del NDSI
  var ndsiMean = ndsiCollection.mean().rename('NDSI_mean');

  // Clip del NDSI medio sulla ROI
  var ndsiMeanClipped = ndsiMean.clip(roi);

  // Definisci i parametri di visualizzazione per il NDSI medio
  var ndsiMeanParams = {
    min: -1,
    max: 1,
    palette: ['blue', 'white', 'green'],
  };

  // Aggiungi il NDSI medio clipato alla mappa
  Map.centerObject(roi);
  Map.addLayer(ndsiMeanClipped, ndsiMeanParams, "S2-NDSI Mean Clipped");

  return ndsiMeanClipped; // Ritorna l'immagine del NDSI medio clipato
};

// Funzione per calcolare la varianza del NDSI utilizzando dati Sentinel-2
exports.generateSentinelNDSI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

  // Calcola il NDSI per ogni immagine nella collezione
  var ndsiCollection = sentinelImages.map(function (image) {
    var swir1 = image.select('B11');
    var swir2 = image.select('B12');
    var ndsi = image.expression('(SWIR1 - SWIR2) / (SWIR1 + SWIR2)', {
      'SWIR1': swir1, 
      'SWIR2': swir2
    }).rename('NDSI');
    return ndsi;
  });


  // Calcola la varianza del NDSI
  var ndsiVariance = ndsiCollection.reduce(ee.Reducer.variance()).rename('NDSI_variance');

  // Clip della varianza del NDSI sulla ROI
  var ndsiVarianceClipped = ndsiVariance.clip(roi);

  // Definisci i parametri di visualizzazione per la varianza del NDSI
  var ndsiVarianceParams = {
    min: 0,
    max: 0.1,
    palette: ['blue', 'white', 'green'],
  };

  // Aggiungi la varianza del NDSI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(ndsiVarianceClipped, ndsiVarianceParams, "S2-NDSI Variance Clipped");

  return ndsiVarianceClipped; // Ritorna l'immagine della varianza del NDSI clipato
};

// Funzione per calcolare il TDVI medio utilizzando dati Sentinel-2
exports.generateSentinelTDVI_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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

  // Calcola la media del TDVI
  var tdviMean = tdviCollection.mean().rename('TDVI_mean');

  // Clip del TDVI medio sulla ROI
  var tdviMeanClipped = tdviMean.clip(roi);

  // Definisci i parametri di visualizzazione per il TDVI medio
  var tdviMeanParams = {
    min: -1,
    max: 1,
    palette: ['blue', 'white', 'green'],
  };

  // Aggiungi il TDVI medio clipato alla mappa
  Map.centerObject(roi);
  Map.addLayer(tdviMeanClipped, tdviMeanParams, "S2-TDVI Mean Clipped");

  return tdviMeanClipped; // Ritorna l'immagine del TDVI medio clipato
};

// Funzione per la varianza del TDVI da Sentinel-2
exports.generateSentinelTDVI_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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

  // Calcola la varianza del TDVI
  var tdviVariance = tdviCollection.reduce(ee.Reducer.variance()).rename('TDVI_variance');

  // Clip della varianza del TDVI sulla ROI
  var tdviVarianceClipped = tdviVariance.clip(roi);

  // Definisci i parametri di visualizzazione per la varianza del TDVI
  var tdviVarianceParams = {
    min: 0,
    max: 0.1,
    palette: ['blue', 'white', 'green'],
  };

  // Aggiungi la varianza del TDVI clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(tdviVarianceClipped, tdviVarianceParams, "S2-TDVI Variance Clipped");

  return tdviVarianceClipped; // Ritorna l'immagine della varianza del TDVI clipato
};

// Funzione per calcolare il CMR medio utilizzando dati Sentinel-2
exports.generateSentinelCMR_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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

  // Calcola la media del CMR
  var cmrMean = cmrCollection.mean().rename('CMR_mean');

  // Clip del CMR medio sulla ROI
  var cmrMeanClipped = cmrMean.clip(roi);

  // Definisci i parametri di visualizzazione per il CMR medio
  var cmrMeanParams = {
    min: 0,
    max: 2,
    palette: ['white', 'orange', 'brown'],
  };

  // Aggiungi il CMR medio clipato alla mappa
  Map.centerObject(roi);
  Map.addLayer(cmrMeanClipped, cmrMeanParams, "S2-CMR Mean Clipped");

  return cmrMeanClipped; // Ritorna l'immagine del CMR medio clipato
};

// Funzione per la varianza del CMR da Sentinel-2
exports.generateSentinelCMR_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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

  // Calcola la varianza del CMR
  var cmrVariance = cmrCollection.reduce(ee.Reducer.variance()).rename('CMR_variance');

  // Clip della varianza del CMR sulla ROI
  var cmrVarianceClipped = cmrVariance.clip(roi);

  // Definisci i parametri di visualizzazione per la varianza del CMR
  var cmrVarianceParams = {
    min: 0,
    max: 0.1,
    palette: ['blue', 'white', 'green'],
  };

  // Aggiungi la varianza del CMR clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(cmrVarianceClipped, cmrVarianceParams, "S2-CMR Variance Clipped");

  return cmrVarianceClipped; // Ritorna l'immagine della varianza del CMR clipato
};

// Funzione per calcolare la media del CIgreen utilizzando dati Sentinel-2
exports.generateSentinelCIgreen_mean = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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

  // Calcola la media del CIgreen
  var ciGreenMean = ciGreenCollection.mean().rename('CIgreen_mean');

  // Clip della media del CIgreen sulla ROI
  var ciGreenMeanClipped = ciGreenMean.clip(roi);

  // Definisci i parametri di visualizzazione per la media del CIgreen
  var ciGreenMeanParams = {
    min: -0.5,
    max: 0.5,
    palette: ['blue', 'white', 'green'],
  };

  // Aggiungi la media del CIgreen clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(ciGreenMeanClipped, ciGreenMeanParams, "S2-CIgreen Mean Clipped");

  return ciGreenMeanClipped; // Ritorna l'immagine della media del CIgreen clipata
};

// Funzione per calcolare la varianza del CIgreen utilizzando dati Sentinel-2
exports.generateSentinelCIgreen_variance = function (roi, startDate, endDate, cloudCover) {
  // Filtra le immagini Sentinel-2
  var sentinelImages = filterFromSentinel2(roi, startDate, endDate, cloudCover);

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

  // Calcola la varianza del CIgreen
  var ciGreenVariance = ciGreenCollection.reduce(ee.Reducer.variance()).rename('CIgreen_variance');

  // Clip della varianza del CIgreen sulla ROI
  var ciGreenVarianceClipped = ciGreenVariance.clip(roi);

  // Definisci i parametri di visualizzazione per la varianza del CIgreen
  var ciGreenVarianceParams = {
    min: 0,
    max: 0.002, // Imposta i valori di scala in base ai tuoi dati
    palette: ['blue', 'white', 'green'],
  };

  // Aggiungi la varianza del CIgreen clipata alla mappa
  Map.centerObject(roi);
  Map.addLayer(ciGreenVarianceClipped, ciGreenVarianceParams, "S2-CIgreen Variance Clipped");

  return ciGreenVarianceClipped; // Ritorna l'immagine della varianza del CIgreen clipata
};

