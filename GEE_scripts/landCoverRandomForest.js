//importa la feature collection per la provincia di Salerno
var salerno = ee.FeatureCollection('FAO/GAUL/2015/level2')
  .filter(ee.Filter.eq('ADM1_NAME', 'Campania'))
  .filter(ee.Filter.eq('ADM2_NAME', 'Salerno'));
var roi = salerno.geometry();

//filtra l'immagine Sentinel-2 per la provincia di Salerno e un periodo di tempo specifico
var dataset = ee.ImageCollection("COPERNICUS/S2")
  .filterBounds(roi)
  .filterDate('2022-01-01', '2022-12-31')
  .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', 10));

//calcola la mediana dell'immagine collezionata
var immagine = dataset.median();

//parametri per la visualizzazione RGB dell'immagine
var rgbParams = {
  min: 0,
  max: 3000,
  bands: ['B4', 'B3', 'B2'],
  gamma: 0.5
};

//visualizza l'immagine sulla mappa
Map.centerObject(roi);
Map.addLayer(immagine.clip(roi), rgbParams, "Satellite - S2");

//crea un insieme di addestramento unendo le varie classi di uso del suolo
var training = water.merge(urban).merge(vegetation).merge(cropland).merge(bareland);

//seleziona le bande dell'immagine per l'addestramento
var label = "Class";
var bands = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'];
var input = immagine.select(bands);

//esegui il campionamento dei punti per l'addestramento
var trainImage = input.sampleRegions({
  collection: training,
  properties: [label],
  scale: 30
});

//suddividi l'insieme di addestramento in set di addestramento e test
var trainingData = trainImage.randomColumn();
//sottoinsieme del mio training data, che serve per addestrare il modello
var trainSet = trainingData.filter(ee.Filter.lessThan('random', 0.8));
//sottoinsieme del mio training data, che il modello non conosce e serve per valutare la capacità di apprendimento del modello
var testSet = trainingData.filter(ee.Filter.greaterThanOrEquals('random', 0.8));  

//crea e allena il classificatore Random Forest
var classifier = ee.Classifier.smileRandomForest(10).train({
  features: trainSet,
  classProperty: label,
  inputProperties: bands
});

//classifica l'immagine usando il classificatore addestrato
var classified = input.classify(classifier);

//palette dei colori per la visualizzazione della classificazione
var landCoverPalette = [
  '#51BBFE', // 0 - water
  '#D00000', // 1 - urban
  '#228B22', // 2 - vegetation
  '#FDDA0D', // 3 - cropland
  '#B1B695', // 4 - bare soil
];

//parametri di visualizzazione per la mappa classificata
var visParams = {
  min: 0,
  max: 4,
  palette: landCoverPalette
};

//aggiungi la mappa classificata alla mappa
Map.addLayer(classified.clip(roi), visParams, "Land-Cover-S2");

//valutazione della precisione del classificatore
var confusionMatrix = ee.ConfusionMatrix(testSet.classify(classifier).errorMatrix({
  actual: "Class",
  predicted: "classification"
}));

//stampa la matrice di confusione e le metriche di accuratezza
print("Confusion Matrix: ", confusionMatrix);
print("Overall Accuracy: ", confusionMatrix.accuracy());
print("Producers Accuracy: ", confusionMatrix.producersAccuracy());
print("Consumers Accuracy: ", confusionMatrix.consumersAccuracy());

addLegend();


//creo la legenda delle classi
function addLegend(){
  //creo un pannello per la legenda
  var legend = ui.Panel({
    style: {
      position: 'bottom-right',
      padding: '8px 15px',
    }
  });

  //lista delle classi di uso del suolo e i rispettivi colori
  var classes = ['Water', 'Urban', 'Vegetation', 'Cropland', 'Bare Soil'];
  var colors = ['#51BBFE', '#D00000', '#228B22', '#FDDA0D', '#B1B695'];

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
