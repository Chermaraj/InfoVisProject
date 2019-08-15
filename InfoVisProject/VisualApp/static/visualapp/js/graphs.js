queue()
    .defer(d3.json, "canada_climate")
    .defer(d3.json, "static/visualapp/geojson/canada.json")
    .await(makeGraphs);

function makeGraphs(error, projectsJson, statesJson) {

    //Clean projectsJson data
    var canadaclimatProjects = projectsJson;
    console.log(projectsJson)
    canadaclimatProjects.forEach(function (d) {
        d["month_avg_precip"] = +d["month_avg_precip"];
    });


    //Create a Crossfilter instance
    var ndx = crossfilter(canadaclimatProjects);

    console.log("Find the value");


    //Define Dimensions
    var yearDim = ndx.dimension(function (d) { return d["data_year"]; });
    var seasonTypeDim = ndx.dimension(function (d) { return d["season"]; });
    var monthDim = ndx.dimension(function (d) { return d["data_month"]; });
    var monthLabel = ndx.dimension(function (d) { return d["month_label"] });
    var stateDim = ndx.dimension(function (d) { return d["province_name"]; });
    var totalPrecipitation = ndx.dimension(function (d) { return d["year_avg_precip"]; });

    //Calculate metrics
    var totalPrecPerYear = yearDim.group().reduce(function (p, v) {
        ++p.count;
        p.total += v.month_avg_precip;
        if (p.count == 0) {
            p.average = 0;
        } else {
            p.average = p.total / p.count;
        }
        return p;
    },
        // remove
        function (p, v) {
            --p.count;
            p.total -= v.month_avg_precip;
            if (p.count == 0) {
                p.average = 0;
            } else {
                p.average = p.total / p.count;
            }
            return p;
        },
        // initial
        function () {
            return {
                count: 0,
                total: 0,
                average: 0
            };
        }
    );
    var precipitationBySeason = seasonTypeDim.group().reduce(function (p, v) {
        ++p.count;
        p.total += v.month_avg_precip;
        if (p.count == 0) {
            p.average = 0;
        } else {
            p.average = p.total / p.count;
        }
        return p;
    },
        // remove
        function (p, v) {
            --p.count;
            p.total -= v.month_avg_precip;
            if (p.count == 0) {
                p.average = 0;
            } else {
                p.average = p.total / p.count;
            }
            return p;
        },
        // initial
        function () {
            return {
                count: 0,
                total: 0,
                average: 0
            };
        }
    );
    var precipitationByMonth = monthDim.group().reduce(function (p, v) {
        ++p.count;
        p.total += v.month_avg_precip;
        if (p.count == 0) {
            p.average = 0;
        } else {
            p.average = p.total / p.count;
        }
        return p;
    },
        // remove
        function (p, v) {
            --p.count;
            p.total -= v.month_avg_precip;
            if (p.count == 0) {
                p.average = 0;
            } else {
                p.average = p.total / p.count;
            }
            return p;
        },
        // initial
        function () {
            return {
                count: 0,
                total: 0,
                average: 0
            };
        }
    );
    var totalPreciptionsByState = stateDim.group().reduce(function (p, v) {
        ++p.count;
        p.total += v.month_avg_precip;
        if (p.count == 0) {
            p.average = 0;
        } else {
            p.average = p.total / p.count;
        }
        return p;
    },
        // remove
        function (p, v) {
            --p.count;
            p.total -= v.month_avg_precip;
            if (p.count == 0) {
                p.average = 0;
            } else {
                p.average = p.total / p.count;
            }
            return p;
        },
        // initial
        function () {
            return {
                count: 0,
                total: 0,
                average: 0
            };
        }
    );

    var all = ndx.groupAll();
    var total_years = yearDim.group()
    var totalDonations = ndx.groupAll().reduce(function (p, v) {
        ++p.count;
        p.total += v.month_avg_precip;
        if (p.count == 0) {
            p.average = 0;
        } else {
            p.average = p.total / p.count;
            //console.log("Average for : " + v.province_name + " is " + p.average);
        }
        return p;
    },
        // remove
        function (p, v) {
            --p.count;
            p.total -= v.month_avg_precip;
            if (p.count == 0) {
                p.average = 0;
            } else {
                p.average = p.total / p.count;
            }
            return p;
        },
        // initial
        function () {
            return {
                count: 0,
                total: 0,
                average: 0
            };
        }
    );

    var max_state = totalPreciptionsByState.top(1)[0].value.average;
    console.log(totalPreciptionsByState)
    //Define values (to be used in charts)
    var minDate = yearDim.bottom(1)[0]["data_year"];
    var maxDate = yearDim.top(1)[0]["data_year"];
    //Charts
    var timeChart = dc.lineChart("#time-chart");
    var seasonTypeChart = dc.rowChart("#season-level-row-chart");
    var monthlyPrecipitationChart = dc.lineChart("#month-level-line-chart");
    var canadaChart = dc.geoChoroplethChart("#canada-chart");
    var numberProjectsND = dc.numberDisplay("#precip-level");
    var totalPreciptionND = dc.numberDisplay("#avg-precip");

    numberProjectsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) { return d; })
        .group(all);

    totalPreciptionND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) { return d["average"]; })
        .group(totalDonations)
        .formatNumber(d3.format(".3s"));

    timeChart
        .width(1500)
        .height(180)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(yearDim)
        .group(totalPrecPerYear)
        .valueAccessor(function (p) { return p.value.count > 0 ? p.value.total / p.value.count : 0; })
        .transitionDuration(100)
        .x(d3.scaleTime().domain([minDate, maxDate]))
        .elasticY(true)
        .xAxisLabel("Year")
        .xAxis().ticks(52).tickFormat(d3.format("d"));

    seasonTypeChart
        .width(320)
        .height(250)
        .margins({ top: 20, left: 10, right: 10, bottom: 20 })
        .group(precipitationBySeason)
        .dimension(seasonTypeDim)
        .valueAccessor(function (p) { return p.value.count > 0 ? p.value.total / p.value.count : 0; })
        .colors('#6baed6')
        //Assign colors to each value in the x scale domain
        //.ordinalColors(['#ff4602', '#ff9c78', '#ff6229', '#ffd5c6'])
       // .ordinalColors(['#3182bd', '#6baed6', '#9ecae1','#dadaeb'])
        .label(function (d) {
            console.log("d.key",d.key)
            return d.key;
        })
        //Title sets the row text
        .title(function (p) {
            return "Average Precipitation: " + Math.round(p.value.average) + " mm";
        })
        .elasticX(true)
        .xAxis().ticks(4);

    monthlyPrecipitationChart
        .width(380)
        .height(250)
        .x(d3.scaleOrdinal().domain(monthLabel))
        .xUnits(dc.units.ordinal)
        //.xUnits(monthLabel)
        .dimension(monthLabel)
        .group(precipitationByMonth)
        .valueAccessor(function (p) { return p.value.count > 0 ? p.value.total / p.value.count : 0; })
        .elasticX(true)
        .elasticY(true)
        .xAxis().ticks(4);


    //var colors = d3.scaleLinear().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
    canadaChart.width(1100)
        .height(400)
        .dimension(stateDim)
        .group(totalPreciptionsByState)
        .valueAccessor(function (p) { return p.value.count > 0 ? p.value.total / p.value.count : 0; })
        //.colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
        //.colors(colors)
        //.colorDomain([0, max_state])
        //.colorAccessor(function (d, i) { return i; })
        //.colors(d3.scaleQuantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
        //.colors(d3.scaleQuantize().range(["#cae4fc", "#aad3fa", "#a2d0fa", "#95c7f5", "8fc5f7", "#79bdfc", "#64b1fa", "#4fa2f0", "#389fff", "#268ef0","#0275e0"]))
        .colors(d3.scaleQuantize().range(["#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#0056a1"]))
        .colorDomain([0, 130])
        .colorCalculator(function (d) { return d ? canadaChart.colors()(d) : '#ccc'; })
        .overlayGeoJson(statesJson["features"], "state", function (d) {
            return d.properties.name;
        }).projection(d3.geoAlbers()
            .scale(600).center([0, 60])
            .translate([350, 200]))
        .title(function (p) {
            return "Province: " + p["key"]
                + "\n"
                + "Average Precipitation: " + Math.round(p["value"]) + " mm";
        });

    dc.renderAll();

};

