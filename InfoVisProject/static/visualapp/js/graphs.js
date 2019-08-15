queue()
    .defer(d3.json, "canada_climate")
    .defer(d3.json, "static/visualapp/geojson/canada.json")
    .await(makeGraphs);

function makeGraphs(error, projectsJson, statesJson) {

    //Clean projectsJson data
    var canadaclimatProjects = projectsJson;
    console.log(projectsJson)
    console.log(statesJson)
    canadaclimatProjects.forEach(function (d) {
        //d["data_year"] = dateFormat.parse(d["data_year"]);
        // d["yearmon"].setDate(1);
        d["month_avg_precip"] = +d["month_avg_precip"];
    });


    //Create a Crossfilter instance
    var ndx = crossfilter(canadaclimatProjects);

    //Define Dimensions
    var yearDim = ndx.dimension(function (d) { return d["data_year"]; });
    var seasonTypeDim = ndx.dimension(function (d) { return d["season"]; });
    var monthDim = ndx.dimension(function (d) { return d["data_month"]; });
    var stateDim = ndx.dimension(function (d) { return d["province_name"]; });
    var totalPrecipitation = ndx.dimension(function (d) { return d["year_avg_precip"]; });

    //Calculate metrics
    var totalPrecPerYear = yearDim.group().reduceSum(function (d) {
        return d["month_avg_precip"];
    });
    var precipitationBySeason = seasonTypeDim.group().reduceSum(function (d) {
        return d["month_avg_precip"];
    });
    var precipitationByMonth = monthDim.group().reduceSum(function (d) {
        return d["month_avg_precip"];
    });
    var totalPreciptionsByState = stateDim.group().reduceSum(function (d) {
        return d["month_avg_precip"];
    });

    var all = ndx.groupAll();
    var totalPreciptions = ndx.groupAll().reduceSum(function (d) { return d["month_avg_precip"]; });

    var max_state = totalPreciptionsByState.top(1)[0].value;
    var max_season = precipitationBySeason.top(1)[0].value;
    //Define values (to be used in charts)
    var minDate = yearDim.bottom(1)[0]["data_year"];
    var maxDate = yearDim.top(1)[0]["data_year"];
    //Charts
    var timeChart = dc.lineChart("#time-chart");
    var seasonTypeChart = dc.barChart("#resource-type-row-chart");
    var monthlyPrecipitationChart = dc.lineChart("#poverty-level-row-chart");
    var canadaChart = dc.geoChoroplethChart("#canada-chart");
    var numberProjectsND = dc.numberDisplay("#number-projects-nd");
    var totalPreciptionND = dc.numberDisplay("#total-donations-nd");

    var pallet = ["#FF0000", "#FF6A00", "#FF8C00", "#FFA500", "#FFD700", "#FFFF00", "#DA70D6", "#BA55D3"];


    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) { return d; })
        .group(all);

    totalPreciptionND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) { return d; })
        .group(totalPreciptions)
        .formatNumber(d3.format(".3s"));

    timeChart
        .width(1500)
        .height(180)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(yearDim)
        .group(totalPrecPerYear)
        .transitionDuration(100)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Year")
        .xAxis().ticks(52).tickFormat(d3.format("d"));

    seasonTypeChart
        .width(400)
        .height(250)
        .x(d3.scale.ordinal().domain(seasonTypeDim))
        //.ordinalColors(pallet)
        .elasticX(true)
        .elasticY(true)
        .colors(["#ff8000", "#ff8c1a", "#ff9933", "#ffa64d"])
        //.colors(d3.scale.ordinal().domain(["fall","winter","1","2"]).range(["#ff8000", "#ff8c1a", "#ff9933", "#ffa64d"]))
        .colorDomain([0, max_season])
        //.colors(colorScale)
        .colorAccessor(d => d.key)
        /*.colorAccessor(function (d, i) {
            if (d.value = max_season) {
                return "fall";
            }
            return "2";
        })*/
        .xUnits(dc.units.ordinal)
        .dimension(seasonTypeDim)
        .group(precipitationBySeason)
        .xAxis().ticks(4)
        


    monthlyPrecipitationChart
        .width(400)
        .height(250)
        .x(d3.scale.ordinal().domain(monthDim))
        .xUnits(dc.units.ordinal)
        .dimension(monthDim)
        .group(precipitationByMonth)
        .xAxis().ticks(4);

    canadaChart.width(1100)
        .height(400)
        .dimension(stateDim)
        .group(totalPreciptionsByState)
        .colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
        .colorDomain([0, max_state])
        .overlayGeoJson(statesJson["features"], "state", function (d) {
            return d.properties.name;
        }).projection(d3.geo.albers()
            .scale(600).center([0, 60])
            .translate([350, 200]))
        .title(function (p) {
            return "Province: " + p["key"]
                + "\n"
                + "Total Precipitation: " + Math.round(p["value"]) + "mm";
        });

    dc.renderAll();

};