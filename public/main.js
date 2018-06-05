//to store json result
let matches;
let deliveries;
getJsonFromCSV();
getJsonFromCSVDeliveries();

//CSV conversion
function toJson(csvData) {
    var lines = csvData.split("\n");
    var colNames = lines[0].split(",");
    var records = [];
    for (var i = 1; i < lines.length - 1; i++) {
        var record = {};
        var bits = lines[i].split(",");
        for (var j = 0; j < bits.length; j++) {
            record[colNames[j]] = bits[j];
        }
        records.push(record);
    }
    return records;
}

function getJsonFromCSV() {
    const rawFile = new XMLHttpRequest();
    rawFile.open("GET", "./assets/matches.csv", true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                const allText = rawFile.responseText;
                matches = toJson(allText);
            }
        }
    }
    rawFile.send(null);
};

function getJsonFromCSVDeliveries() {
    const rawFile = new XMLHttpRequest();
    rawFile.open("GET", "./assets/deliveries.csv", true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                const allText = rawFile.responseText;
                deliveries = toJson(allText);
            }
        }
    }
    rawFile.send(null);
};

//Task 1: Plot the number of matches played per year of all the years in IPL.
function matchesPerYear() {

    $.ajax({
        url: '/playedmatches',
        success: (response) => {
            let seasonMatches = {};
            response.forEach((row) => {
                seasonMatches[row._id] = row.count;
            });

            Highcharts.chart('container', {
                title: { text: 'IPL Data Analysis' },
                subtitle: { text: 'Matches played per year of all the years in IPL' },
                xAxis: {
                    title: { text: 'Years' },
                    categories: Object.keys(seasonMatches)
                },
                yAxis: { title: { text: 'No. of Maches' } },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y:.f}'
                        }
                    }
                },
                series: [{
                    type: 'column',
                    colorByPoint: true,
                    data: Object.values(seasonMatches),
                    showInLegend: false
                }]

            });
            $('#container1').hide();
        }
    });
}

//Task 2: Plot a stacked bar chart of matches won of all teams over all the years of IPL.
function winningMatchesPerYear() {
    $.ajax({
        url: '/winningmatches',
        success: (result) => {

            Highcharts.chart('container', {

                title: { text: 'IPL Data Analysis' },
                subtitle: { text: 'Matches won of all teams over all the years of IPL' },
                chart: {
                    type: 'bar'
                },
                xAxis: {
                    categories: result.season,
                    title: {
                        text: 'Years'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Total Wins of year'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {

                    series: {
                        stacking: 'normal',
                        dataLabels: {
                            // enabled: true
                        }
                    }
                },
                series: result.team
            });
            $('#container1').hide();

        }
    });
}

//Task 3: For the year 2016 plot the extra runs conceded per team.
function extraRunPerTeam() {

    $.ajax({
        url: '/extraRuns',
        success: (extraDeliveries) => {
            Highcharts.chart('container', {

                title: { text: 'IPL Data Analysis' },
                subtitle: { text: 'Extra runs conceded per team @2016' },
                xAxis: {
                    title: { text: 'Teams' },
                    categories: Object.keys(extraDeliveries)
                },
                yAxis: {
                    title: { text: 'No. of extra runs' }
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y:.f}'
                        }
                    }
                },
                series: [{
                    type: 'column',
                    colorByPoint: true,
                    data: Object.values(extraDeliveries),
                    showInLegend: false
                }]

            });
            $('#container1').hide();
        }
    });
}

//Task 4: For the year 2015 plot the top economical bowlers.
function topEconomyBowlers() {
    $.ajax({
        url: '/economyBowler',
        success: (sortBowlers) => {
            //Display chart
            Highcharts.chart('container', {

                title: { text: 'IPL Data Analysis' },
                subtitle: { text: 'Top 15 Economical Bowlers @2015, Min Over 15' },
                xAxis: {
                    title: { text: 'Bolwer Name' },
                    categories: (Object.keys(sortBowlers)).slice(0, 15)
                },
                yAxis: { title: { text: 'Economy' } },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y:.2f}'
                        }
                    }
                },
                series: [{
                    type: 'column',
                    colorByPoint: true,
                    data: (Object.values(sortBowlers)).slice(0, 15),
                    showInLegend: false
                }]

            });
            $('#container1').hide();
        }
    });
}

//Task 5: Story
function myStory() {

    $.ajax({
        url: '/story',
        success: (response) => {
            //Display chart
            Highcharts.chart('container', {

                title: { text: 'IPL Data Analysis' },
                subtitle: { text: 'Top 15 MOM all years' },
                xAxis: {
                    title: { text: 'Player Name' },
                    categories: (Object.keys(response.sortedTotalMOM)).slice(0, 15)
                },
                yAxis: { title: { text: 'Total Man of the match' } },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y:.f}'
                        }
                    }
                },
                series: [{
                    type: 'column',
                    colorByPoint: true,
                    data: (Object.values(response.sortedTotalMOM)).slice(0, 15),
                    showInLegend: false
                }]

            });

            // Build the chart
            $('#container1').show();
            Highcharts.chart('container1', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: `Maximum MOM @ ${response.graphArray.name} by teams`
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y:.f}</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y:.f}',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            },
                            connectorColor: 'silver'
                        }
                    }
                },
                series: [{
                    name: response.graphArray.name,
                    data: response.graphArray.y
                }]
            });

        }
    });
}