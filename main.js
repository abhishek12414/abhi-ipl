//to store json result
let matches;
let deliveries;

const operations = (operation) => {
    $('#container1').hide();
    switch (operation) {
        case 'matchesPerYear': matchesPerYear(); break;
        case 'winningMatchesPerYear': winningMatchesPerYear(); break;
        case 'extraRunPerTeam': extraRunPerTeam(); break;
        case 'topEconomyBowlers': topEconomyBowlers(); break;
        case 'myStory': myStory();
    }
}

//Task 1: Plot the number of matches played per year of all the years in IPL.
function matchesPerYear() {

    let seasonMatches = matches.reduce((acc, match) => {
        acc[match.season] = (acc[match.season]) ? ++acc[match.season] : 1
        return acc
    }, {})

    drawHighChart({
        tiltle: 'IPL Data Analysis',
        subtitle: 'Matches played per year of all the years in IPL',
        xAxis : {
            title: 'Years',
            data: Object.keys(seasonMatches),
        },
        yAxis: { tiltle: 'No. of Maches' },
        plotOptions: { name: 'Total Matches ', format: ".f" },
        series: { data: Object.values(seasonMatches) }
    });    
}

//Task 2: Plot a stacked bar chart of matches won of all teams over all the years of IPL.
function winningMatchesPerYear() {

    matches = matches.reduce((acc, match) => {
        if (match.winner === 'Rising Pune Supergiants')
            match.winner = 'Rising Pune Supergiant';
        else if (match.winner === "")
            match.winner = "No Result"
        acc.push(match)
        return acc
    }, []);

    let seasonWinning = {};

    seasonWinning = matches.reduce((acc, match) => {
        if (acc[match.season]) {
            acc[match.season][match.winner] = (acc[match.season][match.winner]) ? ++(acc[match.season][match.winner]) : 1
        } else {
            acc[match.season] = { [match.winner]: 1 }
        }
        return acc;
    }, [])

    console.log(seasonWinning);

    //print teamnames
    let teamNames = seasonWinning.reduce((acc, season) => {
        Object.keys(season).reduce((ac, team) => {
            if (!acc.includes(team)) acc.push(team)
        })
        return acc;
    }, []);

    console.log(teamNames)
    let teamWinningByYear = [];

    //finding winning of each year
    for (let teamName of teamNames) {
        let win = [];
        for (let year in seasonWinning) {
            if (teamName in seasonWinning[year]) {
                win.push(seasonWinning[year][teamName])
            } else {
                win.push(0)
            }
        }
        let obj = {
            name: teamName,
            data: win
        }
        teamWinningByYear.push(obj);
    }

    console.log(teamWinningByYear)

    Highcharts.chart('container', {

        title: { text: 'IPL Data Analysis' },
        subtitle: { text: 'Matches won of all teams over all the years of IPL' },
        chart: {
            type: 'bar'
        },
        xAxis: {
            categories: Object.keys(seasonWinning),
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
        series: teamWinningByYear
    });
}

//Task 3: For the year 2016 plot the extra runs conceded per team.
function extraRunPerTeam() {
    
    const matchYear = 2016;

    //finding the match ids of particular year
    // let yearMatches = matches.reduce((acc, match)=>{
    //     if(acc[match.season]){
    //         acc[match.season].push(match.id)
    //     } else {
    //         acc[match.season] = [match.id]
    //     }
    //     return acc
    // }, {});

    let yearMatches = matches.filter((match)=> {
        if( Number(match.season) === matchYear) return match
    }).reduce((acc, match)=>{
        if(acc[match.season]){
                acc[match.season].push(match.id)
            } else {
                acc[match.season] = [match.id]
            }
            return acc
    }, {});

    // filtering match ids of particular year
    const matchIds = yearMatches[matchYear];

    const minMatchId = Number(matchIds[0]);
    const maxMatchId = Number(matchIds[matchIds.length - 1])
    
    //Reading the deliveries data and calculating the extra runs
    let extraDeliveries = deliveries.filter(delivery => {
        return (delivery.match_id >= minMatchId && delivery.match_id <= maxMatchId) 
    }).reduce((acc, eachDelivery)=>{
        if(acc[eachDelivery.bowling_team])
            acc[eachDelivery.bowling_team] += Number(eachDelivery.extra_runs)
        else
            acc[eachDelivery.bowling_team] = Number(eachDelivery.extra_runs)
        return acc
    }, {});

    drawHighChart({
        tiltle: 'IPL Data Analysis',
        subtitle: 'Extra runs conceded per team @2016',
        xAxis : {
            title: 'Teams',
            data: Object.keys(extraDeliveries),
        },
        yAxis: {
            tiltle: 'No. of extra runs'
        },
        plotOptions: {
            name: 'Extra Runs ',
            format: ".f"
        },
        series: {
            data: Object.values(extraDeliveries),
        }
    });
}

//Task 4: For the year 2015 plot the top economical bowlers.
function topEconomyBowlers() {
    //finding the match ids of particular year
    let yearMatches = {};

    for (const match of matches) {
        //read season/year
        const season = match.season;

        if (season in yearMatches) {
            (yearMatches[season]).push(match.id)
        } else {
            let ids = [];
            ids.push(match.id)
            yearMatches[season] = ids;
        }
    }

    // filtering match ids of particular year
    const matchYear = 2015;
    const matchIds = yearMatches[matchYear];

    const minMatchId = matchIds[0];
    const maxMatchId = matchIds[matchIds.length - 1];

    let economicalBowlers = {};

    for (const delivery of deliveries) {

        if (Number(delivery.match_id) >= minMatchId && Number(delivery.match_id) <= maxMatchId) {
            const bowlerName = delivery['bowler']
            const extraRuns = Number(delivery['wide_runs']) +
                Number(delivery['noball_runs']) +
                Number(delivery['batsman_runs']);

            const ball = (!(Number(delivery['noball_runs']) || Number(delivery['wide_runs']))) ? 1 : 0;

            if (bowlerName in economicalBowlers) {
                economicalBowlers[bowlerName]['runs'] += extraRuns;
                if (ball != 0)
                    economicalBowlers[bowlerName]['no_of_balls'] += ball;
            } else {
                let bowler = {}
                bowler['runs'] = extraRuns;
                if (ball != 0)
                    bowler['no_of_balls'] = ball;
                economicalBowlers[bowlerName] = bowler;
            }
        }
    }

    let bowlersEconomy = {}

    for (bowler in economicalBowlers) {
        if ((economicalBowlers[bowler]['no_of_balls']) >= 90)
            bowlersEconomy[bowler] = (Number(economicalBowlers[bowler]['runs']) * 6 / Number(economicalBowlers[bowler]['no_of_balls']));
    }

    let sortedBowlerName = Object.keys(bowlersEconomy).sort(function (a, b) {
        return bowlersEconomy[a] - bowlersEconomy[b]
    });

    let sortBowlers = {};

    for (const name of sortedBowlerName) {
        sortBowlers[name] = bowlersEconomy[name]
    }

    drawHighChart({
        tiltle: 'IPL Data Analysis',
        subtitle: 'Top 15 Economical Bowlers @2015, Min Over 15',
        xAxis : {
            title: 'Bolwer Name',
            data: (Object.keys(sortBowlers)).slice(0, 15),
        },
        yAxis: {
            tiltle: 'Economy'
        },
        plotOptions: {
            name: 'Economy ',
            format: ".2f"
        },
        series: {
            data: (Object.values(sortBowlers)).slice(0, 15),
        }
    });
}

//Task 5: Story
function myStory() {

    let manOfTheMatch = {};

    for (const match of matches) {
        let mom = match.player_of_match;

        if (mom === "")
            continue;

        if (mom in manOfTheMatch) {

            if (manOfTheMatch[mom][match.winner])
                manOfTheMatch[mom][match.winner] += 1;
            else
                manOfTheMatch[mom][match.winner] = 1;

        } else {
            let player = {};
            player[match['winner']] = 1;
            manOfTheMatch[mom] = player;
        }
    }

    let totalMom = {}

    for (const playerName in manOfTheMatch) {
        const player = manOfTheMatch[playerName];
        let sum = (Object.values(player)).reduce(function (acc, val) { return acc + val; });
        totalMom[playerName] = sum;
    }

    let sortedPlayerName = Object.keys(totalMom).sort(function (a, b) {
        return totalMom[b] - totalMom[a]
    });

    let sortedTotalMOM = {}
    sortedPlayerName.forEach((playerName) => {
        sortedTotalMOM[playerName] = totalMom[playerName]
    })

    //Display chart
    drawHighChart({
        tiltle: 'IPL Data Analysis',
        subtitle: 'Top 15 MOM all years',
        xAxis : {
            title: 'Player Name',
            data: (Object.keys(sortedTotalMOM)).slice(0, 15),
        },
        yAxis: {
            tiltle: 'Total Count'
        },
        plotOptions: {
            name: 'Total Matches',
            format: ".f"
        },
        series: {
            data: (Object.values(sortedTotalMOM)).slice(0, 15),
        }
    });
    
    //Player by team graph
    graphArray = []
    for (const team in manOfTheMatch[sortedPlayerName[0]]) {
        let obj = {
            name: team,
            y: manOfTheMatch[sortedPlayerName[0]][team]
        }
        graphArray.push(obj);
    }

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
            text: `Maximum MOM @ ${sortedPlayerName[0]} by teams`
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
            name: sortedPlayerName[0],
            data: graphArray
        }]
    });
}

//highchart plot
const drawHighChart = (data) => {
    Highcharts.chart('container', {

        title: { text: data.title },
        subtitle: { text: data.subtitle },
        xAxis: {
            title: { text: data.xAxis.tiltle },
            categories: data.xAxis.data
        },
        yAxis: { title: { text: data.yAxis.tiltle } },
        plotOptions: {
            series: {
                borderWidth: 0,
                name: data.plotOptions.name,
                dataLabels: {
                    enabled: true,
                    format: `{point.y:${data.plotOptions.format}}`
                }
            }
        },
        series: [{
            type: 'column',
            colorByPoint: true,
            data: data.series.data,
            showInLegend: false
        }]

    });
}

//to convert csv to json data
async function getJson(csvData) {
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

// load the file on script load
$(() => {

    $('#mainContainer').hide();
    fetch('./assests/matches.csv')
        .then((response) => {
            return response.text();
        }).then((text) => {
           return getJson(text).then((jsonText)=>{
                matches = jsonText;
           })
        })

    fetch('./assests/deliveries.csv')
        .then((response) => {
            return response.text();
        }).then((text) => {
            getJson(text).then((jsonText) => {
                deliveries = jsonText;
            })
        })
    $('#mainContainer').show();
})
