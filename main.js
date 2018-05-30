//to store json result 
let result;

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


const rawFile = new XMLHttpRequest();
rawFile.open("GET","./assests/matches.csv", true);
rawFile.onreadystatechange = function () {
  if (rawFile.readyState === 4) {
    if (rawFile.status === 200 || rawFile.status == 0) {
      const allText = rawFile.responseText;
      result = toJson(allText);
    }
  }
}
rawFile.send(null);


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

        series: [{
            type: 'column',
            colorByPoint: true,
            data: Object.values(seasonMaches),
            showInLegend: false
        }]

    });
}

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
            text: 'Stacked bar chart'
        },
        xAxis: {
            categories: Object.keys(seasonWinning)
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total fruit consumption'
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
