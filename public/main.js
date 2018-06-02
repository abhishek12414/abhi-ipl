//to store json result
let matches;
let deliveries;
getJsonFromCSV();
getJsonFromCSVDeliveries();

//CSV conversion
function toJson(csvData) {
    var lines = csvData.split("\n");
    var colNames = lines[0].split(",");
    var records=[];
    for(var i = 1; i < lines.length-1; i++) {
      var record = {};
      var bits = lines[i].split(",");
      for (var j = 0 ; j < bits.length ; j++) {
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

    let seasonMaches = {};   

    for (let match of matches) {
        const season = match.season;
        if(season in seasonMaches) {
            seasonMaches[season] = seasonMaches[season] + 1
        } else {
            seasonMaches[season] = 1;
        }
    }
    
    Highcharts.chart('container', {

        title: { text: 'IPL Data Analysis' },
        subtitle: { text: 'Matches played per year of all the years in IPL' },
        xAxis: { 
            title: {text: 'Years'},
            categories: Object.keys(seasonMaches) 
        },
        yAxis: { title: {text: 'No. of Maches'}},
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
            data: Object.values(seasonMaches),
            showInLegend: false
        }]

    });
    $('#container1').hide();
}

//Task 2: Plot a stacked bar chart of matches won of all teams over all the years of IPL.
function winningMatchesPerYear() {
    let seasonWinning = {};

    for(let match of matches) {
                
        let winner;

        if(match.winner == 'Rising Pune Supergiants')
            winner = 'Rising Pune Supergiant';
        else if(match.winner == "")
            winner = 'No Result';
        else 
            winner = match.winner;

        if(match.season in seasonWinning) {
            if( seasonWinning[match.season][winner] )
                seasonWinning[match.season][winner] += 1;
            else 
                seasonWinning[match.season][winner] = 1            
        } else {
            let teamObj = {};
            teamObj[winner] = 1;
            seasonWinning[match.season]= teamObj;
        }
    }

    //print teamnames
    let teamNames = [];

    for (let year in seasonWinning) {
        for(let team in seasonWinning[year]) {
            if(!teamNames.includes(team))
                teamNames.push(team);
        }
    }

    let teamWinningByYear = [];

    //finding winning of each year
    for(let teamName of teamNames) {
        let win = [];
        for(let year in seasonWinning) {
            if(teamName in seasonWinning[year]) {
                win.push(seasonWinning[year][teamName])
            } else {
                win.push(0)
            }
        }
        let obj = {
            name : teamName,
            data : win
        }
        teamWinningByYear.push(obj);
    }

        
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
    $('#container1').hide();
}

//Task 3: For the year 2016 plot the extra runs conceded per team.
function extraRunPerTeam() {

    //finding the match ids of particular year
    let yearMatches = {};
    for(let match of matches) {
        //read season/year
        const season = match.season;

        if(season in yearMatches) {
            let ids = yearMatches[season];
            ids.push(match.id)
            yearMatches[season] = ids
        } else {
            let ids= [];
            ids.push(match.id)
            yearMatches[season] = ids;
        }
    }

    // filtering match ids of particular year
    const matchYear = 2016;
    const matchIds =  yearMatches[matchYear];

    const minMatchId = matchIds[0];
    const maxMatchId = matchIds[matchIds.length - 1]

    //Reading the deliveries data and calculating the extra runs
    let extraDeliveries = {};

    for(const delivery of deliveries) {
        if( Number(delivery.match_id) >= minMatchId && Number(delivery.match_id) <= maxMatchId) {
            const bowling_team = delivery['bowling_team']
            if(bowling_team in extraDeliveries) {
                extraDeliveries[bowling_team] += Number(delivery['extra_runs']);
            } else {
                extraDeliveries[bowling_team] = Number(delivery['extra_runs']);
            }
        }
    }

    Highcharts.chart('container', {

        title: { text: 'IPL Data Analysis' },
        subtitle: { text: 'Extra runs conceded per team @2016' },
        xAxis: { 
            title: {text: 'Teams'},
            categories: Object.keys(extraDeliveries) 
        },
        yAxis: { 
            title: {text: 'No. of extra runs'}
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

//Task 4: For the year 2015 plot the top economical bowlers.
function topEconomyBowlers() {
    //finding the match ids of particular year
    let yearMatches = {};

    for(const match of matches) {
        //read season/year
        const season = match.season;

        if(season in yearMatches) {
            (yearMatches[season]).push(match.id)
        } else {
            let ids= [];
            ids.push(match.id)
            yearMatches[season] = ids;
        }
    }
    
    // filtering match ids of particular year
    const matchYear = 2015;
    const matchIds =  yearMatches[matchYear];

    const minMatchId = matchIds[0];
    const maxMatchId = matchIds[matchIds.length - 1];

    let economicalBowlers = {};

    for(const delivery of deliveries) {
        
        if( Number(delivery.match_id) >= minMatchId && Number(delivery.match_id) <= maxMatchId) {
            const bowlerName = delivery['bowler']
            const extraRuns = Number(delivery['wide_runs']) + 
                              Number(delivery['noball_runs']) +
                              Number(delivery['batsman_runs']);

            if(bowlerName in economicalBowlers) {
                economicalBowlers[bowlerName]['runs'] += extraRuns;
                economicalBowlers[bowlerName]['no_of_balls'] += 1; 
            } else {
                let bowler = {}
                bowler['runs'] = extraRuns;
                bowler['no_of_balls'] = 1;
                economicalBowlers[bowlerName] = bowler;
            }
        }
    }

    let bowlersEconomy = {}

    for(bowler in economicalBowlers) {
        if((economicalBowlers[bowler]['no_of_balls']) >= 90)
        bowlersEconomy[bowler] = ( Number(economicalBowlers[bowler]['runs']) * 6 / Number(economicalBowlers[bowler]['no_of_balls']));
    }

    let sortedBowlerName = Object.keys(bowlersEconomy).sort(function(a,b){
        return bowlersEconomy[a]-bowlersEconomy[b]
    });
    
    let sortBowlers = {};

    for(const name of sortedBowlerName) {
        sortBowlers[name] = bowlersEconomy[name]
    }
    
    //Display chart
    Highcharts.chart('container', {

        title: { text: 'IPL Data Analysis' },
        subtitle: { text: 'Top 15 Economical Bowlers @2015, Min Over 15' },
        xAxis: { 
            title: {text: 'Bolwer Name'},
            categories: (Object.keys(sortBowlers)).slice(0, 15)
        },
        yAxis: { title: {text: 'Economy'}},
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

//Task 5: Story
function myStory() {
    
    let manOfTheMatch = {};

    for(const match of matches) {
        let mom = match.player_of_match;

        if(mom === "")
            continue;

        if( mom in manOfTheMatch) {

            if(manOfTheMatch[mom][match.winner])
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
        let sum = (Object.values(player)).reduce(function(acc, val) { return acc + val; });
        totalMom[playerName] = sum;
    }

    let sortedPlayerName = Object.keys(totalMom).sort(function(a,b){
        return totalMom[b]-totalMom[a]
    });

    let sortedTotalMOM = {}
    sortedPlayerName.forEach((playerName)=>{
        sortedTotalMOM[playerName] = totalMom[playerName]
    })
    
    //Display chart
    Highcharts.chart('container', {

        title: { text: 'IPL Data Analysis' },
        subtitle: { text: 'Top 15 MOM all years' },
        xAxis: { 
            title: {text: 'Player Name'},
            categories: (Object.keys(sortedTotalMOM)).slice(0, 15)
        },
        yAxis: { title: {text: 'Total Count'}},
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
            data: (Object.values(sortedTotalMOM)).slice(0, 15),
            showInLegend: false
        }]

    });


    //Player by team graph
    graphArray = []
    for(const team in manOfTheMatch[sortedPlayerName[0]]) {
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