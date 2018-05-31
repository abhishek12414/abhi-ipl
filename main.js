//to store json result
let result;
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

//test code of toJson()
// csv="author,title,publishDate\nDan Simmons,Hyperion,1989\nDouglas Adams,The Hitchhiker's Guide to the Galaxy,1979";
// json = toJson(csv);
// console.log(JSON.stringify(json));

function getJsonFromCSV() {
    const rawFile = new XMLHttpRequest();
    rawFile.open("GET", "./assests/matches.csv", true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                const allText = rawFile.responseText;
                result = toJson(allText);
                // return toJson(allText);
                // console.log(result);
            }
        }
    }
    rawFile.send(null);
};

function getJsonFromCSVDeliveries() {
    const rawFile = new XMLHttpRequest();
    rawFile.open("GET", "./assests/deliveries.csv", true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                const allText = rawFile.responseText;
                deliveries = toJson(allText);
                console.log(deliveries)
                // return toJson(allText);
            }
        }
    }
    rawFile.send(null);
};


//Task 1: Plot the number of matches played per year of all the years in IPL.
function matchesPerYear() {
    // console.log(result.length)
    // console.log(result[0].season)
    // console.log(Object.keys(result[0]))

    let seasonMaches = {};

    for(let i=0; i<result.length; i++) {
        const season = result[i].season;
        if(season in seasonMaches) {
            seasonMaches[season] = seasonMaches[season] + 1
        } else {
            seasonMaches[season] = 1;
        }
    }

    //test code
    // let seasonMaches = {a: 3, b:5};
    // console.log(Object.keys(seasonMaches));
    // console.log(Object.values(seasonMaches));

    // if('b' in seasonMaches) {
    //     let value = seasonMaches['b']
    //     seasonMaches['b'] = value+1;
    // } else {
    //     console.log('not here')
    //     seasonMaches['c'] = 3;
    // }

    // console.log(Object.keys(seasonMaches));
    // console.log(Object.values(seasonMaches));

    // console.log('Season 2016 : ' + season2016);
    // console.log('Season 2017 : ' + season2017);
    // for(let i)

    Highcharts.chart('container', {

        title: { text: 'IPL Match Analysis' },
        subtitle: { text: 'By Year' },
        xAxis: { 
            title: {text: 'Years'},
            categories: Object.keys(seasonMaches) 
        },
        yAxis: { title: {text: 'Maches'}},
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
}

//Task 2: Plot a stacked bar chart of matches won of all teams over all the years of IPL.
function winningMatchesPerYear() {
    let seasonWinning = {};

    for(let i=0; i<result.length; i++) {
        
        let row = result[i];
        
        let winner;

        if(row.winner == 'Rising Pune Supergiants')
            winner = 'Rising Pune Supergiant';
        else if(row.winner == "")
            winner = 'No Result';
        else 
            winner = row.winner;

        if(row.season in seasonWinning) {
            if( seasonWinning[row.season][winner] )
                seasonWinning[row.season][winner] += 1;
            else 
                seasonWinning[row.season][winner] = 1            
        } else {
            let teamObj = {};
            teamObj[winner] = 1;
            seasonWinning[row.season]= teamObj;
        }
    }

    // console.log(seasonWinning);

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
        chart: {
            type: 'bar'
        },
        title: {
            text: 'IPL, Per year winning matches'
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
                text: 'Wins per year'
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

    //finding the match ids of particular year
    let yearMatches = {};
    for(let i=0; i<result.length; i++) {
        //read season/year
        const season = result[i].season;

        if(season in yearMatches) {
            let ids = yearMatches[season];
            ids.push(result[i].id)
            yearMatches[season] = ids
        } else {
            let ids= [];
            ids.push(result[i].id)
            yearMatches[season] = ids;
        }
    }

    // console.log(yearMatches);

    // filtering match ids of particular year
    const matchYear = 2016;
    const matchIds =  yearMatches[matchYear];

    // console.log(matchIds);
    const minMatchId = matchIds[0];
    const maxMatchId = matchIds[matchIds.length - 1]

    //Reading the deliveries data and calculating the extra runs
    let extraDeliveries = {};

    for(let i=0; i<deliveries.length; i++) {
        let delivery = deliveries[i];
        if( Number(delivery.match_id) >= minMatchId && Number(delivery.match_id) <= maxMatchId) {
            const bowling_team = delivery['bowling_team']
            if(bowling_team in extraDeliveries) {
                extraDeliveries[bowling_team] += Number(delivery['extra_runs']);
            } else {
                extraDeliveries[bowling_team] = Number(delivery['extra_runs']);
            }
        }
    }

    // console.log(extraDeliveries);

    Highcharts.chart('container', {

        title: { text: 'IPL Match Analysis' },
        subtitle: { text: 'By Year' },
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
}

//Task 4: For the year 2015 plot the top economical bowlers.
function topEconomyBowlers() {
    //finding the match ids of particular year
    let yearMatches = {};
    for(let i=0; i<result.length; i++) {
        //read season/year
        const season = result[i].season;

        if(season in yearMatches) {
            let ids = yearMatches[season];
            ids.push(result[i].id)
            yearMatches[season] = ids
        } else {
            let ids= [];
            ids.push(result[i].id)
            yearMatches[season] = ids;
        }
    }

    // filtering match ids of particular year
    const matchYear = 2015;
    const matchIds =  yearMatches[matchYear];

    const minMatchId = matchIds[0];
    const maxMatchId = matchIds[matchIds.length - 1];

    let economicalBowlers = {};

    for(let i=0; i<deliveries.length; i++) {
        let delivery = deliveries[i];
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

    // console.log(economicalBowlers);

    let bowlersEconomy = {}

    for(bowler in economicalBowlers) {
        bowlersEconomy[bowler] = ( Number(economicalBowlers[bowler]['runs']) * 6 / Number(economicalBowlers[bowler]['no_of_balls']));
    }

    // console.log(bowlersEconomy);

    let sortedBowlerName = Object.keys(bowlersEconomy).sort(function(a,b){

        return bowlersEconomy[a]-bowlersEconomy[b]
    });
    // console.log(sorted);

    
    let top15Bowlers = {}
    let bowlerCount = 15;

    for(let i=0; i<bowlerCount; i++) {
        top15Bowlers[sortedBowlerName[i]] = Number((bowlersEconomy[sortedBowlerName[i]]).toFixed(2));
    }
    console.log(top15Bowlers);
    
    //Display chart
    Highcharts.chart('container', {

        title: { text: 'IPL Match Analysis' },
        subtitle: { text: 'By Year' },
        xAxis: { 
            title: {text: 'Years'},
            categories: Object.keys(top15Bowlers) 
        },
        yAxis: { title: {text: 'Maches'}},
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
            data: Object.values(top15Bowlers),
            showInLegend: false
        }]

    });
}