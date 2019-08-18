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
    var yearDim = ndx.dimension(function (d) {
        return d["data_year"];
    });
    //var seasonTypeDim = ndx.dimension(function (d) { return d["season"]; });
    var seasonTypeDim = ndx.dimension(function (d) {
        var season = d["season"];
        switch (season) {
            case "Winter":
                return "0.Winter";
            case "Spring":
                return "2.Spring";
            case "Summer":
                return "3.Summer";
            case "Fall":
                return "4.Fall";
        }
    });
    var seasonGroup = seasonTypeDim.group();
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
    var averagePrecip = ndx.groupAll().reduce(function (p, v) {
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

    function orderValue(p) {
        return p.average;
    }

    //Define max_state and min_state
    var topaverage = totalPreciptionsByState.order(orderValue).top(15);
    var max_state = topaverage[0].value.average;
    var min_state = topaverage[13].value.average;
    console.log("min_state", min_state)
    console.log("max_state", min_state)

    //Define values (to be used in charts)
    var minDate = yearDim.bottom(1)[0]["data_year"];
    var maxDate = yearDim.top(1)[0]["data_year"];
    //Charts
    var timeChart = dc.lineChart("#time-chart");
    var seasonTypeChart = dc.rowChart("#season-level-row-chart");
    var monthlyPrecipitationChart = dc.lineChart("#month-level-line-chart");
    var canadaChart = dc.geoChoroplethChart("#canada-chart");
    var fromYearND = dc.numberDisplay("#from-year");
    var toYearND = dc.numberDisplay("#to-year");
    var avgPrecipitationND = dc.numberDisplay("#avg-preciption");

    function dim_max_groupAll(dim, field) {
        return {
            value: function () {
                return dim.top(1)[0][field];
            }
        };
    }

    function dim_min_groupAll(dim, field) {
        return {
            value: function () {
                return dim.bottom(1)[0][field];
            }
        };
    }

    toYearND
        .formatNumber(d3.format("d"))
        .group(dim_max_groupAll(yearDim, 'data_year'))
        .valueAccessor(x => x);

    fromYearND
        .width(320)
        .height(150)
        .formatNumber(d3.format("d"))
        .group(dim_min_groupAll(yearDim, 'data_year'))
        .valueAccessor(x => x);

    avgPrecipitationND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) { return d["average"]; })
        .group(averagePrecip)
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
        .colors('#3182bd')
        //Assign colors to each value in the x scale domain
        //.ordinalColors(['#ff4602', '#ff9c78', '#ff6229', '#ffd5c6'])
       // .ordinalColors(['#3182bd', '#6baed6', '#9ecae1','#dadaeb'])
        .label(function (d) {
            return d.key.split(".")[1];
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
        //.colors(d3.scaleQuantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0056a1"]))
        .colors(d3.scaleQuantize().range(["#d3ebff", "#84c6ff", "#4aabff", "#0f90ff", "#007ce7", "#005298"]))
        .colorDomain([min_state, max_state])
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

