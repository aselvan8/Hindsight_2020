// add light tile layer 
var light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
});


// grayscale layer
var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/dark-v10',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
});

// map boundary styling
function style(feature) {
    return {
        fillColor: "white",
        weight: 2,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.1
    };
}

// variable initialize
var datetoPass;
var contained_fires = [];
var active_fires = [];
var previously_active_fires = [];
var total_active_fires = [];
var protestMarkers = [];
var protest_icons = [];
var slider_div = d3.select("#slider-date");
var dateSlider = document.getElementById('slider-date');
slider_div.attr("current_time", 1577854861000);
d3.select("#date_select").text(`Date selected: January 1, 2020`);
var stategeoJson;
var map_component = d3.select('#map');
map_component.attr("state_name", "None");
var contained_fires_counter = 0;
var active_fires_counter = 0;
var protest_counter = 0;
var state = null;


// / create map object
var myMap = L.map("map", {
    // center of the United States
    center: [39.8, -98.6],
    zoom: 4,
    layers: light
});

// set basemaps
var baseMaps = {
    Light: light,
    Grayscale: grayscale
};

// initialize overlay maps
var overlayMaps = {};

// adding layer control to map
var layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);;

// contained fire icon
var contained_fire_icon = L.divIcon({
    html: '<i class="fas fa-fire-extinguisher fa-lg"></i>',
    iconSize: [20, 20],
    className: 'containedFireIcon'
});

// active fire icon
var fire_icon = L.divIcon({
    html: '<i class="fas fa-fire fa-lg"></i>',
    iconSize: [20, 20],
    className: 'fireIcon'
});

// protest icon
var protest_icon = L.divIcon({
    html: '<i class="fas fa-bullhorn fa-lg"></i>',
    iconSize: [20, 20],
    className: 'protestIcon'
});

// create map function
function makeMap(layer1, layer2, layer3, layer4) {

    // heat map information
    var heat = L.heatLayer(layer2, {
        radius: 35,
        blur: 15,
    });

    //   remove previous layer control box
    layerControl.remove(overlayMaps);

    // adding overlay layers for user to select
    var overlayMaps = {
        "Active Fires": layer3,
        "Fires Contained": layer1,
        Protests: layer4,
        "Protests heat map": heat
    };

    layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

}

// call init function when page loads with 1/1/20
init(1577923200000);

function init(date) {
    // set date to pass to other functions (from slider handle read)
    datetoPass = date;
    // clearing previous contained fire data
    contained_fires.length = 0;

    // convert date for use in contained fire API call
    date_start = timeConverter(date / 1000)
    
    // add one day to handle slider for use in contained fire API call
    var plus_one_day = parseInt(date) + (60 * 60 * 24 * 1000);
    date_end = timeConverter(plus_one_day / 1000);

    // contained fire data API call
    var contained_fire_url = `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Archived_Wildfire_Perimeters2/FeatureServer/0/query?where=GDB_TO_DATE%20%3E%3D%20TIMESTAMP%20'${date_start}%2000%3A00%3A00'%20AND%20GDB_TO_DATE%20%3C%3D%20TIMESTAMP%20'${date_end}%2000%3A00%3A00'&outFields=*&outSR=4326&f=json`;
    d3.json(contained_fire_url).then(function (data) {
       
        for (var i = 0; i < data.features.length; i++) {
            try {
                // push all contained fire points to array
                contained_fires.push(
                    L.marker([data.features[i].geometry.rings[0][0][1], data.features[i].geometry.rings[0][0][0]], { icon: contained_fire_icon })
                )
            }
            // if no contained fires, catch error
            catch (err) {
                console.log("no contained fires");
            }

        }
        // update index.html with total contained fires for selected date
        d3.select(".total_containted_fires").text(contained_fires.length);

        // active fires API call

        // clearing active fire data
        active_fires.length = 0;
        var active_fire_url = `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Public_Wildfire_Perimeters_View/FeatureServer/0/query?where=CreateDate%20%3E%3D%20TIMESTAMP%20'2020-01-01%2000%3A00%3A00'%20AND%20CreateDate%20%3C%3D%20TIMESTAMP%20'${date_end}%2000%3A00%3A00'&outFields=*&outSR=4326&f=json`;
        d3.json(active_fire_url).then(function (response) {

            for (var i = 0; i < response.features.length; i++)
                try {
                     // push all active fire points to array
                    active_fires.push(
                        L.marker([response.features[i].geometry.rings[0][0][1], response.features[i].geometry.rings[0][0][0]], { icon: fire_icon })
                    )
                }
                // if no active fires, catch error
                catch (err) {
                    console.log("no active fires_active page");
                }

            // clearing previously active fire data
            previously_active_fires.length = 0;

            // previously active fires API call
            var previously_active_fire_url = `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Archived_Wildfire_Perimeters2/FeatureServer/0/query?where=CreateDate%20%3E%3D%20TIMESTAMP%20'2020-01-01%2000%3A00%3A00'%20AND%20CreateDate%20%3C%3D%20TIMESTAMP%20'${date_end}%2000%3A00%3A00'%20AND%20GDB_TO_DATE%20%3E%3D%20TIMESTAMP%20'${date_end}%2000%3A00%3A00'%20AND%20GDB_TO_DATE%20%3C%3D%20TIMESTAMP%20'2021-01-01%2000%3A00%3A00'&outFields=*&outSR=4326&f=json`;
            d3.json(previously_active_fire_url).then(function (data2) {
                
                for (var i = 0; i < data2.features.length; i++)
                    try {
                        // push all previously active fire points to array
                        previously_active_fires.push(
                            L.marker([data2.features[i].geometry.rings[0][0][1], data2.features[i].geometry.rings[0][0][0]], { icon: fire_icon })
                        )
                    }
                    // if no previously active fires, catch error
                    catch (err) {
                        console.log("no previosuly active fires_archive page");
                    }

                // clearing previous total fire data
                total_active_fires.length = 0;
                //    concat active fire and previously active fire arrays
                total_active_fires = active_fires.concat(previously_active_fires);
                // update index.html with total active fires for selected date
                d3.select(".total_active_fires").text(total_active_fires.length);

                // protest data

                // clearing previous protest data
                protestMarkers.length = 0;
                protest_icons.length = 0;

                // convert date into csv date format
                var csv_date = timeConverter_csv(date / 1000);

                //  Bring in protest data
                d3.csv("../static/Resources/USA_2020_Sep19.csv").then(function (data) {
                    // filter for user selected date
                    // source: https://stackoverflow.com/questions/23156864/d3-js-filter-from-csv-file-using-multiple-columns
                    var filteredData = data.filter(function (d) {
                        if (d["EVENT_DATE"] == csv_date) {
                            return d;
                        }
                    })

                    for (var i = 0; i < filteredData.length; i++) {

                        // push protest markers to arrays (one for heat map and one for icons)
                        protestMarkers.push(
                            ([filteredData[i]["LATITUDE"], filteredData[i]["LONGITUDE"]]))
                        protest_icons.push(
                            L.marker([filteredData[i]["LATITUDE"], filteredData[i]["LONGITUDE"]], { icon: protest_icon }).bindPopup(filteredData[i]["LOCATION"]))
                    }

                   // update index.html with total protests for selected date
                    d3.select(".total_protests").text(protestMarkers.length);

                    // creating protest layers
                    var protestLayer = L.layerGroup(protestMarkers);
                    var protestLayer_icon = L.layerGroup(protest_icons);

                    // creating contained fire layer
                    var containedFireLayer = L.layerGroup(contained_fires);

                    // creating active fire layer
                    var activeFireLayer = L.layerGroup(total_active_fires);

                    // call makeMap function
                    makeMap(containedFireLayer, protestMarkers, activeFireLayer, protestLayer_icon);

                    // make map interactive 
                    // source: https://leafletjs.com/examples/choropleth/

                    // function to zoom into a state when the user clicks the state
                    function zoomToFeature(e) {

                        // reset counters;
                        contained_fires_counter = 0;
                        active_fires_counter = 0;
                        protest_counter = 0;
                        // zoom to map
                        myMap.fitBounds(e.target.getBounds());
                        // update html state name
                        state = e.target.feature.properties.name;
                        map_component.attr("state_name", state);

                        // call state functions

                        stateUnemployment(state, datetoPass);
                        single_state_fxn(state, datetoPass);
                        optionChanged(state, datetoPass);

                        // getting state polygon coordinates using state dictionary
                        var state_index = state_dict[state];
                        var polygon_coords = statesData.features[state_index].geometry.coordinates;
                        var final_coords = [];
                        // switching lat and long for final coords
                        for (i = 0; i < polygon_coords[0].length; i++) {
                            var update_coord = [polygon_coords[0][i][1], polygon_coords[0][i][0]];
                            final_coords.push(update_coord);
                        }
                        
                        var state_check = L.polygon(final_coords);
                        
                        // find markers within clicked state 
                        // contained fires
                        for (var i = 0; i < contained_fires.length; i++) {
                            // special requirements for Alaska (multipolygon)
                            if (state_index == 1) {
                                if (contained_fires[i]._latlng.lat > 52) {
                                    contained_fires_counter = contained_fires_counter + 1;
                                }
                            }
                            // special requirements for Hawaii (multipolygon)
                            if (state_index == 11) {
                                if ((contained_fires._latlng.lng < -126) && (contained_fires._latlng.lat < 50)) {
                                    contained_fires_counter = contained_fires_counter + 1;
                                }
                            }
                            // special requirements for Michigan (multipolygon)
                            if (state_index == 22) {
                                if ((contained_fires[i]._latlng.lng > -87) && (contained_fires[i]._latlng.lat > 41.8) && (contained_fires[i]._latlng.lng < -82.5)) {
                                    contained_fires_counter = contained_fires_counter + 1;
                                }
                            }
                            // all other states check
                            else {
                                var marker_inside_polygon = state_check.contains(contained_fires[i].getLatLng());
                                
                                if (marker_inside_polygon) {
                                    contained_fires_counter = contained_fires_counter + 1;
                                }
                            }
                        }

                        // active fires
                        for (var i = 0; i < total_active_fires.length; i++) {
                            if (state_index == 1) {
                                if (total_active_fires[i]._latlng.lat > 52) {
                                    active_fires_counter = active_fires_counter + 1;
                                }
                            }
                            if (state_index == 11) {
                                if ((total_active_fires._latlng.lng < -126) && (total_active_fires._latlng.lat < 50)) {
                                    active_fires_counter = active_fires_counter + 1;
                                }
                            }

                            if (state_index == 22) {
                                if ((total_active_fires[i]._latlng.lng > -87) && (total_active_fires[i]._latlng.lat > 41.8) && (total_active_fires[i]._latlng.lng < -82.5)) {
                                    active_fires_counter = active_fires_counter + 1;
                                }
                            }

                            else {
                                var marker_inside_polygon1 = state_check.contains(total_active_fires[i].getLatLng());
                                if (marker_inside_polygon1) {
                                    active_fires_counter = active_fires_counter + 1;
                                }
                            }
                        }

                        // protest data
                        for (var i = 0; i < protest_icons.length; i++) {
                            if (state_index == 1) {
                                if (protest_icons[i]._latlng.lat > 52) {
                                    protest_counter = protest_counter + 1;
                                }
                            }
                            if (state_index == 11) {
                                if ((protest_icons._latlng.lng < -126) && (protest_icons._latlng.lat < 50)) {
                                    protest_counter = protest_counter + 1;
                                }
                            }

                            if (state_index == 22) {
                                if ((protest_icons[i]._latlng.lng > -87) && (protest_icons[i]._latlng.lat > 41.8) && (protest_icons[i]._latlng.lng < -82.5)) {
                                    protest_counter = protest_counter + 1;
                                }
                            }

                            else {
                                var marker_inside_polygon2 = state_check.contains(protest_icons[i].getLatLng());
                                if (marker_inside_polygon2) {
                                    protest_counter = protest_counter + 1;
                                }
                            }
                        }
                     
                        // update the national and state information on html when state is clicked
                        d3.select(".contained_fires").text(contained_fires_counter);
                        d3.select(".active_fires").text(active_fires_counter);
                        d3.select(".protests").text(protest_counter);
                        d3.select(".total_containted_fires").text(contained_fires.length);
                        d3.select(".total_active_fires").text(total_active_fires.length);
                        d3.select(".total_protests").text(protestMarkers.length);
                        d3.select(".state").text(state);
                    }


                    // function when user mouses over feature
                    // source:  https://leafletjs.com/examples/choropleth/
                    function highlightFeature(e) {
                        var layer = e.target;

                        layer.setStyle({
                            weight: 5,
                            color: 'black',
                            dashArray: '',
                            fillOpacity: 0.3
                        });

                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                            layer.bringToFront();
                        }
                    }

                    // function when user mouses out of a feature
                    // source: https://leafletjs.com/examples/choropleth/
                    function resetHighlight(e) {
                        stategeoJson.resetStyle(e.target);
                    }


                    // use onEachFeature function to call event functions
                    // source: https://leafletjs.com/examples/choropleth/
                    function onEachFeature(feature, layer) {

                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: zoomToFeature,

                        });
                    }

                    // add state boundaries
                    // source: https://leafletjs.com/examples/choropleth/
                    stategeoJson = L.geoJson(statesData, {
                        style: style,
                        onEachFeature: onEachFeature
                    }).addTo(myMap);


                })
            })
        })
    })
}


// slider
// =======================================================================

// source: https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript

// convert time for protest data
function timeConverter_csv(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var dates = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
    var date = dates[a.getDate()];
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var csv_time = String(parseInt(date) - 1) + '-' + month + '-' + year;
    return csv_time;
}

// convert time for fire API call
function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = year + '-' + month + '-' + date;
    return time;

}

// convert time for html page display
function timeConverter_display(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months_display = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var year = a.getFullYear();
    var month = months_display[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var display_date = month + ' ' + date + ', ' + year;
    return display_date;

}

// Create a new date from a string, return as a timestamp.
// source: https://refreshless.com/nouislider/examples/
function timestamp(str) {
    return new Date(str).getTime();
}

// create slider
noUiSlider.create(dateSlider, {
    // Create two timestamps to define a range.
    range: {
        min: timestamp('2020-01-02'),
        max: timestamp('2020-09-12')
    },

    // Steps of one day
    step: 24 * 60 * 60 * 1000,

    //  indicate the handle starting positions.
    start: timestamp('2020-01-02'),

    // No decimals
    format: wNumb({
        decimals: 0
    })
});


// after user selects date with mouse, return date
dateSlider.noUiSlider.on('end', function (values, handle) {

    var date_select = values[handle];
    //   user date in human readable format
    user_selected_date = timeConverter(date_select / 1000);
    var display_date_main_page = timeConverter_display(date_select / 1000);
    // update date shown on index.html
    d3.select("#date_select").text(`Date selected: ${display_date_main_page}`);
    slider_div.attr("current_time", date_select);

});

// allowing user to use keyboard to change slider
dateSlider.noUiSlider.on('change', function (values, handle) {
    var date_select = values[handle];
    //   user date in human readable format
    user_selected_date = timeConverter(date_select / 1000);
    var plus_one_day = parseInt(date_select) + (60 * 60 * 24 * 1000);
    var display_date_main_page = timeConverter_display(date_select / 1000);
     // update date shown on index.html
    d3.select("#date_select").text(`Date selected: ${display_date_main_page}`);
    slider_div.attr("current_time", date_select);

    // remove all layers from the map
    // source: https://stackoverflow.com/questions/45185205/leaflet-remove-all-map-layers-before-adding-a-new-one
    myMap.eachLayer(function (layer) {
        if ((layer !== grayscale)) {
            if (layer !== light) {
                myMap.removeLayer(layer);
            }
        }
    });

    // call map update
    init(date_select);
    // call state functions
    if (!(state === null)) {
        stateUnemployment(state, datetoPass);
        optionChanged(state, datetoPass);
        single_state_fxn(state, datetoPass);
    };
});

// allow dates to change when handle is dragged
dateSlider.noUiSlider.on('slide', function (values, handle) {
    var date_select = values[handle];
    user_selected_date = timeConverter(date_select / 1000);
    var display_date_main_page = timeConverter_display(date_select / 1000);
    // update date shown on index.html
    d3.select("#date_select").text(`Date selected: ${display_date_main_page}`);

});

// create state dictionary for use when user clicks on state (zoomToFeature function)

var state_dict =

{
    "Alabama": 0,
    "Alaska": 1,
    "Arizona": 2,
    "Arkansas": 3,
    "California": 4,
    "Colorado": 5,
    "Connecticut": 6,
    "Delaware": 7,
    "District of Columbia": 8,
    "Florida": 9,
    "Georgia": 10,
    "Hawaii": 11,
    "Idaho": 12,
    "Illinois": 13,
    "Indiana": 14,
    "Iowa": 15,
    "Kansas": 16,
    "Kentucky": 17,
    "Louisiana": 18,
    "Maine": 19,
    "Maryland": 20,
    "Massachusetts": 21,
    "Michigan": 22,
    "Minnesota": 23,
    "Mississippi": 24,
    "Missouri": 25,
    "Montana": 26,
    "Nebraska": 27,
    "Nevada": 28,
    "New Hampshire": 29,
    "New Jersey": 30,
    "New Mexico": 31,
    "New York": 32,
    "North Carolina": 33,
    "North Dakota": 34,
    "Ohio": 35,
    "Oklahoma": 36,
    "Oregon": 37,
    "Pennsylvania": 38,
    "Rhode Island": 39,
    "South Carolina": 40,
    "South Dakota": 41,
    "Tennessee": 42,
    "Texas": 43,
    "Utah": 44,
    "Vermont": 45,
    "Virginia": 46,
    "Washington": 47,
    "West Virginia": 48,
    "Wisconsin": 49,
    "Wyoming": 50,
    "Puerto Rico": 51
};
