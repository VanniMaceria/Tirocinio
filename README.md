# Tirocinio
My internship activity at University of Salerno.

```geolib.js``` is a **Google Earth Engine Javascript library** that contains functions for calculating and generating maps on geospatial indexes such as NDVI, NDB, etc...

Here a list of all indexes, for every of them are provided functions for mean and variance:
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
 - BUI


Moreover, ```landCoverRandomForest.js``` is a gee script, that uses Smile Random Forest algorithm to create a classified map of my region of interest (Province of Salerno).

All images used for the work are taken from the **Copernicus Sentinel-2** dataset.

## How to use it
1. First thing first, the functions are designed to work on Google Earth Engine platform, so, in order to use them, you must have a Google Earth Engine account:
   - If you don't have a Google Earth Engine account yet, please follow this [tutorial](https://developers.google.com/earth-engine/guides/access#a-role-in-a-cloud-project).
2. Once you are registered on the platform and have created your repository, you are ready to import the library.js file:
   - Go to ```geolib.js``` file, which is placed in GEE_scripts folder;
   - Copy the raw content and paste it to a file you created in your Google Earth Engine repository.
3. Now, all is set to use the functions that the library offers:
   - In the file you are working with, import the module you created just before;
   -  Then, call the functions in the following way: <br><br>
     ```javascript
     //import of the library module
     var geolib = require("users/your_user_name/repository_name:your_module_name");
     
     //define your region of interest...

     //how to call a function
     geolib.generateSentinelNDVI_mean(roi, startDate, endDate, cloudCover, legendVisibility);
     geolib.generateSentinelNDVI_mean(roi, '2022-01-01', '2022-04-01', 10, true);
     ```

   That's it!

   ## Let's have a look at parameters
   
   - ```roi``` defines your area of interest, it can be a shapefile, a **Polygon** object or any other **FeatureCollection** of geometries;
   - ```startDate``` and ```endDate``` represent the **temporal bounds** within images will be selected;
   - ```cloudCover``` indicates the **maximum cloudy percentage** of the images that will be selected;
   - ```legendVisibility``` is a boolean value that specifies whether the **legend** will be **displayed** or not.
   
   
   To get more details about it, please check Wiki section...
