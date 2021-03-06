# Hindsight
#### Created by Maria Dong, Ryan Jones, Rebecca Leeds, & Amber Pizzo.

An interactive dashboard looking back at events and occurrences in the United States that made 2020 so unique.

![screenshot](/static/img/screenshot_crop.png)

## Background
From a stock market crash to a highly infectious pandemic to nationwide protests and wildfires, 2020 has been an erratic year to say the least. We wanted to visualize the year on one dashboard to quantify and analyze some major trends and their relationships over time.

## Getting Started
1. Download the repo in your preferred manner.
2. Create a file called `config.py` in the `/static/js/GT-project` folder. This file should contain two API keys (that can be obtained for free):
<br>  _a._ On [Finnhub Stock API](https://finnhub.io/), go to the [Pricing](https://finnhub.io/pricing) page and select "Start Free". Set this key equal to `finnhub_API_Key`.
<br>  _b._ Sign up for an account on [Mapbox](https://www.mapbox.com/) and confirm your email. Set this key equal to `API_KEY`.
3. Set up your SQL database.
<br>  _a._ Setup for database schemata is located in `/SQL_Queries/table_schemata.sql`.
<br>  _b._ SQL queries are also available in `/SQL_Queries/alchemy_queries.sql` for what you may need for various visualizations.
4. The Flask application is currently linked to a local PostgreSQL pgAdmin db. Use `dictBuilder()` to pass keys to `db` response to format manipulable data.
5. Run `app.py` in your terminal by using the following command:
```
$ python app.py
```

## Resources, Libraries, & Tools

**Data sources:**
* [The COVID Tracking Project](https://covidtracking.com/) for national data on COVID-19
* [FiveThirtyEight](https://projects.fivethirtyeight.com/trump-approval-ratings/) for President Trump's approval ratings
* [Getty Images](https://www.gettyimages.com/editorial-images) for a brief slideshow
* The [New York Times](https://www.nytimes.com/) (NYT) for front page headlines & images
* [ACLED](https://acleddata.com/special-projects/us-crisis-monitor/) for protest location and times
* [NIFC](https://data-nifc.opendata.arcgis.com/) for data on the spread of wildfires
* [Economic Recovery Tracker](https://github.com/OpportunityInsights/EconomicTracker) for the mobility data
* [U.S. Bureau of Labor Statistics, retrieved from FRED, Federal Reserve Bank of St. Louis](https://fred.stlouisfed.org/) for all unemployment data
* [Finnhub Stock API](https://finnhub.io/) for the stock data

**Libraries:**
* [noUIslider](https://refreshless.com/nouislider/), [wNumb](https://github.com/leongersen/wnumb/releases) for slider build & optimization
* [Leaflet](https://leafletjs.com/index.html), [Leaflet PointInPolygon](https://github.com/hayeswise/Leaflet.PointInPolygon), [Leaflet Heat Map](https://github.com/Leaflet/Leaflet.heat), [Leaflet US Choropleth](https://leafletjs.com/examples/choropleth/us-states.js), [Mapbox](https://docs.mapbox.com/api/maps/#styles) for mapping
* [Font Awesome](https://fontawesome.com/) for map icon symbols
* [Plotly for JavaScript](https://plotly.com/javascript/), [jQuery Sparklines](https://omnipotent.net/jquery.sparkline/) for charting visualizations
* [moment.js](https://momentjs.com/) for time manipulation

**Tools & languages:** JavaScript, HTML, CSS, Python Flask, Jupyter Notebook, PostgreSQL

**Website layout:** Built from [Material Kit](https://github.com/creativetimofficial/material-kit)

## Features
After running the Flask application, begin exploring the data by dragging the timeline slider and selecting a date at the upper-right corner of the page. This slider will continue to be available at the top of the page even after scrolling down. Below, you should see the visualizations respond.

The image at the top of the page and the headline will reflect the front page article of the **New York Times**. The images (courtesy of Getty Images) in the slideshow are static; just a glimpse of major photos from the year.

**Presidential approval and disapproval ratings** are fully visible and interactive, and the selected date is emphasized.

**Ongoing wildfires, contained wildfires, and protests** can be viewed and toggled on the interactive map. State borders are also visible and hoverable. If you click on a state, the panel next to it will populate state-specific values on COVID-19 growth, unemployment, and baseline changes in mobility, all specific to the selected date. A table below will display the total contained/active fires and total protests on the selected date, both nationally as well as for the selected state.

**National COVID-19 data** can be viewed by daily case increases or total cases and deaths up to the selected date. The mixed bar/line graph can be hovered over for details.

**National average change in mobility** is displayed in a polar area chart. The radial axis corresponds to the factor of increase in activity from baseline. For example, a  section with a radial value of _0.7_ represents a _70% increase_ in activity, while a value of _0_ represents _no change_ in activity.

**Select stock prices** are displayed in a line graph with the selected date highlighted, where they can be compared with up to two other stocks via dropdown menus.

Finally, **national unemployment rates** are displayed by month. Data is highlighted from the beginning of 2020 to the selected date. The national average can be compared to other populations selected from a dropdown menu.

## Analyses & Discussion
As a whole, our dashboard is equipped for you to draw numerous observations about interrelations among each of our featured sections. Given the vast amount of available trends, it is impractical to analyze every significant pattern. As such, we've only listed a handful of noteworthy examples of interrelations that we observed, but we encourage you all to go through the timeline and explore the data yourselves.

* On **March 4**, the NYT headline discusses the limitation of U.S. travel to Europe, while we can also see that the stocks for Boeing, Delta Airlines, & Southwest Airlines (all aviation-related) begin to sharply decrease. A slight recovery in these stocks can be observed on **March 22**, while the NYT headline contains the announcement of a federal bond-buying plan.
* The coronavirus stimilus relief bill was passed on **March 12** as indicated by the NYT headline, which among other things, distributed $1,200 to all American citizens. This date correlates with a peak in President Trump's approval rating.
* On **April 12**, the NYT headline highlights Governor Andrew Cuomo of New York announcing that "the worst is over", referring to COVID-19 in his state. His statement does correlate with the beginning of a continuing downward trend of COVID cases in New York, as well as the downward trend of the first peak in US cases. Later, towards **July 15**, we can see that the U.S. COVID cases reach a much higher second peak in growth, while NY has no discernible peak in its sparkline at that time.
* The impact of the events in the **May 28** NYT headline, "Ex-Officer Charged in Death of George Floyd in Minneapolis", can be seen in the map when viewing the protests on that day, specifically in Minnesota. On dates & states with higher volumes of protests, we can also see a higher increase in park mobility, confirming consistency in our data.
* **September 1** shows an increase in President Trump's approval rating, just as the CDC promises a COVID vaccine by November 2020, as seen in the NYT headline.

## Future Considerations
Some tasks we'd like to build on in future commits:
* Making Getty image carousel dynamic based on the slider date
* Making a loading screen for better transition when data is loading
* Incorporating animation using anime.js
* Optimizing SQL databases to integrate data more effectively and to pull data more efficiently
* Incorporating media queries to make the dashboard responsive to different screen sizes
* Allowing the user to select how to view the national unemployment data 
* Finding more quantifiable/manageable data for tags trending online, air pollution (to add to our map), hate crimes, & other possibly interesting items
* Broadening our scope of observation by allowing users to select a range of dates (rather than a single date), & exploring global data 
