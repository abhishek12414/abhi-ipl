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
      console.log(JSON.stringify(result));
    }
  }
}
rawFile.send(null);


function matchesPerYear() {
    // console.log(result.length)
    // console.log(result[0].season)
    // console.log(Object.keys(result[0]))

    let seasonMaches = {};
    let seasonYear = [];
    let totalMaches = [];

    for(let i=0; i<result.length; i++) {
        const season = result[i].season;
        if(season in seasonMaches) {
            seasonMaches[season] = seasonMaches[season] + 1
        } else {
            seasonMaches[season] = 1;
        }
    }

    // console.log(seasonMaches.length)
    for ( let match in seasonMaches) {
        console.log(match + " : " + seasonMaches[match])
        seasonYear.push(match);
        totalMaches.push(seasonMaches[match])
    }

    console.log(Object.keys(seasonMaches));
    console.log(typeof(Object.values(seasonMaches)));


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


    

    var chart = Highcharts.chart('container', {

        title: { text: 'IPL Match Analysis' },
        subtitle: { text: 'By Year' },
        xAxis: { categories: seasonYear },

        series: [{
            type: 'column',
            colorByPoint: true,
            data: totalMaches,
            showInLegend: false
        }]

    });

console.log(result[0])
}