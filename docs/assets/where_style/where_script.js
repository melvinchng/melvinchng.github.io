// Get data from Google Drive in JSON
var spData = null;
function doData(json) {
  spData = json.feed.entry;
}

// JS to HTML
function toHTML(variableName, data) {
  return document.getElementById(variableName).innerHTML = data;
}

// Check location
function checkLocation(rowDataAtPos){
  const penangLocation = ["Queensbay Mall", "Sungai Nibong", "Penang", "Prangin Mall", "Komtar"];
  const klLocation = ["Sunway Pyramid", "KL Sentral", "Bandar Utama", "Glomac", "Kota Damansara", "KLSCAH", "TBS", "Kuala Lumpur", "Rawang", "Hentian Duta", "One Utama"]

  if(penangLocation.indexOf(rowDataAtPos) > -1)
    return "Penang";
  else if(klLocation.indexOf(rowDataAtPos) > -1)
    return "Kuala Lumpur";
  else
    return "Somewhere else";
}

// Process data into array
var arrayData = [];
function getData() {
  var data = spData;
  var rowData = [];

  for(var r=0; r<data.length; r++) {
    var cell = data[r]["gs$cell"];
    var val = cell["$t"];
  
    if (cell.col == 1 && (cell.row != 1)) {
      arrayData.push(rowData);
      var rowData = [];
    }

    rowData.push(val); //Everything but not last row
  }
  arrayData.push(rowData); //Last row
}

// Get the most recent data
function getLatestData() {
  var length = arrayData.length - 1 //Start from 0
  var curLoc = length

  while (Date.parse(arrayData[curLoc][3]) > Date.now()) //Check if departure time is future
    curLoc--; //Get most recent one
  
  if(Date.now() > (Date.parse(arrayData[curLoc][3])) && (Date.now() < Date.parse(arrayData[curLoc][4])))
    toHTML('currentLocation', "Somewhere in between Penang and Kuala Lumpur"); //In between departure and arrival city
  else 
    toHTML('currentLocation', checkLocation(arrayData[curLoc][2])); //Present location
    
  if (length > curLoc){
    toHTML('nextTrip', "Next Planned Trip");
    toHTML('nextTripCity', checkLocation(arrayData[curLoc+1][2]));
    toHTML('nextTripDate', `Expected departure on ${arrayData[curLoc+1][0]}`);
  }

  var time = new Date();
  toHTML('currentTime', "As of "+time.toLocaleString('en-US', { weekday: 'long', day: 'numeric', month:'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }));
}

function stringToFloat(input) {
  if(parseFloat(input) >= 0)
    return parseFloat(input)
  else
    return 0
}

function contains(arr, key, val) {
  for (var i = 0; i < arr.length; i++) {
    if(arr[i][key] === val) return true;
  }
  return false;
}

function getKeyIndex(arr, key, val) {
  for (var i = 0; i < arr.length; i++) {
    if(arr[i][key] === val) return i;
  }
}

function getAdditionalInfo() {
  var totalCostPreMay2018 = 0
  var totalCostPostMay2018 = 0
  var totalTripsPreMay2018 = 0
  var totalTripsPostMay2018 = 0

  for(var curLoc = 0; curLoc < arrayData.length; curLoc++){
    if(new Date(arrayData[curLoc][0]) < new Date("May 1, 2018")) { // Check departing time
      totalTripsPreMay2018 += 1
      totalCostPreMay2018 += stringToFloat(arrayData[curLoc][6])
    } else if (new Date(arrayData[curLoc][0]) <= new Date()) {
      totalTripsPostMay2018 += 1
      totalCostPostMay2018 += stringToFloat(arrayData[curLoc][6])
    }
  }

  const totalDistancePreMay2018 = totalTripsPreMay2018 * 357; // km
  const totalDistancePostMay2018 = totalTripsPostMay2018 * 357; // km

  toHTML('totalTripsPostMay2018', `Total of ${totalTripsPostMay2018} one way trips`);
  toHTML('totalDistancePostMay2018', `Travelled ${totalDistancePostMay2018} Kilometer (~${Math.round(totalDistancePostMay2018/1.609344)} miles)`);
}

var groupedData = {};
var processedDataByYear = [];
var processedDataByMonth = [];
var valueToTextMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function generateDataForChart() {
  // Group data by year
  for(var curLoc = 0; curLoc < arrayData.length; curLoc++){
    var year = new Date(arrayData[curLoc][0]).getFullYear()
    var month = new Date(arrayData[curLoc][0]).getMonth()

    if (year) {
      if (!groupedData[year]) {
        groupedData[year] = {}

        for(var i = 0; i < valueToTextMonth.length; i++) {
          groupedData[year][valueToTextMonth[i]] = [];
        }
      }

      groupedData[year][valueToTextMonth[month]].push(arrayData[curLoc]);
    }
  }

  // Create top level chart
  var years = Object.keys(groupedData)
  var topLevelData = [];

  for(var i = 0; i < years.length; i++) {
    var drillDownLevelSeriesData = []
    var counter = 0
    var months = Object.keys(groupedData[years[i]]) 
  
    // Sum up top level
    for(var j = 0; j < months.length; j++) {
      counter += groupedData[years[i]][months[j]].length;

      drillDownLevelSeriesData.push([ months[j], groupedData[years[i]][months[j]].length ])
    }

    // Setup top level data portion
    topLevelData.push({
      name: years[i],
      drilldown: years[i],
      y: counter
    })

    // Setup drill down level data portion
    processedDataByMonth.push({
      name: years[i],
      id: years[i],
      data: drillDownLevelSeriesData
    })
  }

  // Setup top level
  processedDataByYear.push({
    name: "Year",
    colorByPoint: true,
    data: topLevelData
  })
}

$(document).ready(function(){
  getData();
  getLatestData();
  getAdditionalInfo();
  generateDataForChart();
});