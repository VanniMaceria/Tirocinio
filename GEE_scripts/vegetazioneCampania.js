/*
da Google Earth Engine bisogna importare:
- lo shape file della Campania;
- la seguente ImageCollection ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
*/

var dataInizio = "2022-01-01";  //YYYY-MM-DD
var dataFine = "2022-12-31";

var L8 = ee.ImageCollection(landsatTOA)
  .filterBounds(shapefileCampania)
  .filterDate(dataInizio, dataFine)
  .filter(ee.Filter.lt('CLOUD_COVER', 1)) // Filtra per copertura nuvolosa inferiore al 1%
  .mean()
  .clip(shapefileCampania);
  
  //mean() calcola la media dei pixel di una collezione di immagini
  //clip() ritaglia l'immagine in base ai limiti dell'area d'interesse
  
var nir = L8.select('B5');  //rappresenta l'immagine nella banda del vicino infrarosso
var red = L8.select('B4');  //rappresenta l'immagine nella banda del rosso

//calcolo del NDVI (Indice di Differenza Normalizzata di Vegetazione)
/*
Questa formula calcola l'NDVI utilizzando le bande NIR e Red.
Il risultato è un'immagine dove i valori più alti indicano una maggiore densità di vegetazione
*/
var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');

var ndviParams = {
  min: -1,  //i valori che vanno verso -1 indicano un'inferiore densità di vegetazione
  max: 1,   //i valori che vanno verso +1 indicano una maggiore densità di vegetazione
  palette: ['blue', 'white', 'green'] //-1 -> blu, 0 -> bianco, 1 -> verde
}

Map.centerObject(shapefileCampania, 8); //centro la mappa sul layer della Campania
Map.addLayer(ndvi, ndviParams);  //carico sulla mappa il layer che si trova negli assets del progetto
//devo fare una gif del timelaps