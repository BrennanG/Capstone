README

Back End:
  -The models folder contains the Mongo schema, which are used to define models which store the web application's data
  -The routes folder contains the API, which allows the front end to access the data stored in the Mongo models
    
Front End:
  -The public folder contains all the front end javascript to handle the logic of the web application
    -Includes the CytoScape Web library
    -The javascripts folder contains the Angular components of the web application
        -The states folder contains states which handle transitioning between pages and initial setup of pages
        -The controllers folder contains the code that handles the logic for each individual page
        -The factories folder contains factory files which interface with the API and make the data available to the controllers
  -The views folder contains the web application's html
  
Graphing Portal:
  -Capstone/public/javascripts/Factories/documentsFctry.js is used to load the javascript for the graphing portal
