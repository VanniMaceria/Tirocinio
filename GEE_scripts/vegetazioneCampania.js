/*
Da Google Earth Engine bisogna importare:
- lo shape file della Campania;
- la seguente ImageCollection: ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
*/

var dataInizio = "2022-01-01";  //YYYY-MM-DD
var dataFine = "2022-12-31";

var L8 = ee.ImageCollection(landsatTOA)
  .filterBounds(shapefileCampania)  //filtro l'ImageCollection per confini (Campania)
  .filterDate(dataInizio, dataFine) //per data
  .filter(ee.Filter.lt('CLOUD_COVER', 1)) //per copertura nuvolosa inferiore al 1%
  .mean() //mean() calcola la media dei pixel di una collezione di immagini
  .clip(shapefileCampania); //clip() ritaglia l'immagine in base ai limiti dell'area d'interesse
  
  
var nir = L8.select('B5');  //seleziona dall'ImageCollection ottenuta le banda del vicino infrarosso
var red = L8.select('B4');  //seleziona dall'ImageCollection ottenuta le bande del rosso

/*
Questa formula calcola l'NDVI (Indice di Differenza Normalizzata di Vegetazione) utilizzando le bande NIR e Red.
Il risultato è un'immagine dove i valori più alti indicano una maggiore densità di vegetazione
*/
var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');

var ndviParams = {
  min: -1,  //i valori che vanno verso -1 indicano un'inferiore densità di vegetazione
  max: 1,   //i valori che vanno verso +1 indicano una maggiore densità di vegetazione
  palette: ['blue', 'white', 'green'] //-1 -> blu, 0 -> bianco, 1 -> verde
}

Map.centerObject(shapefileCampania, 8); //centro la mappa sul layer della Campania
Map.addLayer(shapefileCampania);
Map.addLayer(ndvi, ndviParams, "VegetazioneCampania");
