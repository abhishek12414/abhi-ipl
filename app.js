const   express         = require('express'),
        app             = express(),
        mongoose        = require('mongoose'),
        bodyparser      = require('body-parser'),
        matches         = require('./models/matches'),
        deliveries      = require('./models/deliveries')

//connect to server
mongoose.connect('mongodb://localhost:27017/ipl');

mongoose.connection.once('open', ()=>{
    console.log('Database is now connected.');
}).on('error', (error)=>{
    console.log('Error in connection');
});


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));
app.use(express.static('public'));

//get all matches
app.get('/matches', (req, res)=>{
    matches.find({}, (err, allmatches)=>{
        if(err) {
            res.status(404).send('NOt found')
        } else {
            res.status(200).send(allmatches);
        }
    });
});

//get all deliveries
app.get('/deliveries', (req, res)=>{
    deliveries.find({}, (err, alldeliveries)=>{
        if(err) {
            res.status(404).send('NOt found')
        } else {
            res.status(200).send(alldeliveries);
        }
    });
});

//task 1: played match by year
app.get('/playedMatches', (req, res)=>{
    let yearMatches = {};

    matches.aggregate([
        {
            $group: {
                _id: '$season',
                count: {$sum: 1}
            }
        }, {
            $sort: { _id: 1 }
        }]
    ,(err, data)=>{
        res.send(data);
    })
    
    // matches.distinct('season')
    
    // .then((years)=>{
    //     let result = years.map((year)=>{ return parseInt(year); });
            
    //     result.sort();

        
    //     console.log("Before");
    //     // result.forEach((year)=>{
    //     //     matches.count({season: year}).then((count)=>{
    //     //         yearMatches[year] = count;
    //     //         console.log(yearMatches)
    //     //     }).catch((error)=>{
    //     //         console.log(error);
    //     //     });
    //     // });
        
    //     console.log( result.map((year)=>{
    //         matches.count({season: year}).then((count)=>{
    //             yearMatches[year] = count;
    //             return count
    //         }).catch((error)=>{
    //             console.log(error);
    //         });
    //     }))
    //     // console.log(yearMatches)
    //     res.status(200).send({years: yearMatches})
    // })
    
    // .catch((error)=>{
    //     console.log(error);
    // });


});






app.listen('3002', ()=>{
    console.log('Server is running at : http://localhost:3002/');
});

display = () => {
    console.log('displayed')
}