const express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    bodyparser = require('body-parser'),
    matches = require('./models/matches'),
    deliveries = require('./models/deliveries')

//connect to server
mongoose.connect('mongodb://localhost:27017/ipl');

mongoose.connection.once('open', () => {
    console.log('Database is now connected.');
}).on('error', (error) => {
    console.log('Error in connection');
});


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static('public'));

//task 1: played match by year
app.get('/playedMatches', (req, res) => {
    matches.aggregate([
        {
            $group: {
                _id: '$season',
                count: { $sum: 1 }
            }
        }, {
            $sort: { _id: 1 }
        }]
        , (err, data) => {
            if (err) console.log(err);
            else res.send(data);
        });
});

//task 2: Matches won by team per year
app.get('/winningmatches', (req, res) => {
    matches.aggregate([
        {
            $group: {
                _id: '$season'
                ,
                team: {
                    $push: {
                        $cond: [
                            { $eq: ['$winner', ''] }, 'No Result', { $cond: [{ $eq: ['$winner', 'Rising Pune Supergiants'] }, 'Rising Pune Supergiant', '$winner'] }
                        ]

                    }
                }
            }
        }, {
            $unwind: '$team'
        }, {
            $group: {
                _id: {
                    year: '$_id',
                    team: '$team'
                },
                count: { $sum: 1 }
            }
        }, {
            $project: {
                _id: 0,
                year: '$_id.year',
                team: '$_id.team',
                count: '$count'
            }
        }, {
            $group: {
                _id: '$year',
                winCount: {
                    $push: {
                        team: '$team',
                        count: '$count'
                    }
                }
            }
        }, {
            $project: {
                _id: 0,
                year: '$_id',
                winCount: '$winCount'
            }
        }, {
            $sort: { year: 1 }
        }

    ], (err, results) => {
        if (err) {
            console.log(err);
        } else {

            //logic for graph
            let years = results.map((result) => { return result.year })

            let teamNames = []
            results.forEach((result) => {
                (result.winCount).forEach((win) => {
                    if (!teamNames.includes(win.team))
                        teamNames.push(win.team)
                });
            });

            let seasonWinning = {};
            results.forEach((result) => {
                let teamWinArray = {};
                (result.winCount).forEach((teamObj) => {
                    teamWinArray[teamObj.team] = teamObj.count
                })
                seasonWinning[result.year] = teamWinArray;

            });

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

            //send response to server
            res.send({
                team: teamWinningByYear,
                season: Object.keys(seasonWinning)
            });

        }
    });
});

//task 3: For the year 2016 plot the extra runs conceded per team.
app.get('/extraRuns', (req, res) => {
    matches.aggregate([
        { $match: { season: 2016 } },
        { $project: { matchId: '$id' } }
    ], (err, result) => {
        deliveries.aggregate([
            {
                $match: {
                    match_id: {
                        $gte: result[0].matchId, $lte: result[result.length - 1].matchId
                    }
                }
            }
            , {
                $group: {
                    _id: '$bowling_team',
                    extra_runs: { $sum: '$extra_runs' }
                }
            }, {
                $sort: { extra_runs: 1 }
            }
        ], (err, deliveries) => {
            //Reading the deliveries data and calculating the extra runs
            let extraDeliveries = {};
            deliveries.forEach((delivery) => {
                extraDeliveries[delivery._id] = Number(delivery['extra_runs']);
            });

            res.send(extraDeliveries);
        });
    });
});

//Task 4: For the year 2015 plot the top economical bowlers.
app.get('/economyBowler', (req, res) => {
    matches.aggregate([
        { $match: { season: 2015 } },
        { $project: { matchId: '$id' } }
    ], (err, result) => {
        deliveries.aggregate([
            {
                $match: {
                    match_id: {
                        $gte: result[0].matchId, $lte: result[result.length -1].matchId
                    }
                }
            }
            , {
                $group: {
                    _id: '$bowler',
                    balls: { $sum: 1 },
                    runs: { $sum: { $add: ['$batsman_runs', '$wide_runs', '$noball_runs'] } }
                }
            }, {
                $match: {
                    balls: {$gte: 90}
                }
            },{
                $project:
                    {
                        _id: 0,
                        name: '$_id',
                        econ: {
                            $divide: [{ $multiply: ['$runs', 6] }, '$balls']
                        }

                    }
            }, {
                $sort: { econ: 1 }
            }, {
                $limit: 15
            }
        ], (err, results) => {
            
            let bowlers = {};

            results.forEach((result) => {
                bowlers[result.name] = result.econ;
            })

            res.send(bowlers);
        });
    });

});

//Task 5: Story
app.get('/story', (req, res) => {
    matches.aggregate([
        {
            $group: {
                _id: '$player_of_match',
                count: { $sum: 1 },
                team: { $push: '$winner' }
            }
        }, {
            $sort: { count: -1 }
        }
    ], (err, result) => {

        res.se
        let sortedTotalMOM = {}
        result.forEach((result) => {
            sortedTotalMOM[result._id] = result.count
        });

        graphArray = {}
        teams = {};

        (result[0].team).forEach((team) => {
            if (team in teams)
                teams[team] += 1
            else
                teams[team] = 1
        });

        let teamPlayedarr = [];
        for (team in teams) {
            let teamPlayed = {
                'name': team,
                'y': teams[team]
            };
            teamPlayedarr.push(teamPlayed);
        }


        graphArray = {
            name: result[0]._id,
            y: teamPlayedarr
        }

        res.send(
            {
                sortedTotalMOM: sortedTotalMOM,
                graphArray: graphArray
            });
    });
});

app.listen('3004', () => {
    console.log('Server is running at : http://localhost:3004/');
});
