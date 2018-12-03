const express = require('express');
const exphbs = require('express-handlebars');
const fs = require('fs');
const request = require('request-promise-native');
const MongoClient = require('mongodb').MongoClient;
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');

const app = express();
const port = 4200;

const dburl = 'mongodb://127.0.0.1:27017';

const dbname = 'wherethefuckisxur';

let config = JSON.parse(fs.readFileSync('config.json'));
    
if (config.token.expires < (new Date).getTime() / 1000) {
    throw "Refresh token expired, please get a new one!";
}

MongoClient.connect(dburl, (err, client) => {
    const db = client.db(dbname);

    if (!fs.existsSync('config.json')) {
        throw "No config.json, can't run";
    }
    
    bungiefetch().then((bungiedata) => {

        app.use(bodyParser.json());
        
        app.use(session({
            store: new MongoStore({
                db: db
            }),
            secret: 'supersecretsecret'
        }))
    
        app.engine('handlebars', exphbs({
            defaultLayout: 'main'
        }));
    
        app.set('view engine', 'handlebars');
    
        console.log(bungiedata);
    
        app.get('/', (req, res) => {
            res.render('index', bungiedata);
            req.session.test = true;
        });
    
        app.get('/index', (req, res) => {
            res.render('index', bungiedata);
        });
    
        app.get('/spider', (req, res) => {
            res.render('spider', bungiedata);
        })
    
        app.get('/guides', (req, res) => {
            res.render('guides', bungiedata);
        })

        app.get('/todo', (req, res) => {
            if (req.session.membershipId) {
                db.collection('memberships').findOne({membershipId: req.session.membershipId}).then(doc => {
                    tododata = {
                        activetodos: [],
                        inactivetodos: []
                    }

                    let originDate = 1536080400;
                    let currentTime = Math.floor((new Date()).getTime() / 1000);
                    let secondsSinceFirst = currentTime - originDate;
                    let weeksSinceFirst = Math.floor(secondsSinceFirst / 604800);     
                    
                    doc.todos.forEach(todo => {
                        if (weeksSinceFirst % todo.interval == todo.offset) {
                            tododata.activetodos.push({
                                text: todo.text,
                                weeksUntilNext: todo.interval,
                                inactive: false
                            })
                        } else {
                            tododata.inactivetodos.push({
                                text: todo.text,
                                weeksUntilNext: (todo.interval - (weeksSinceFirst % todo.interval) + todo.offset) % todo.interval,
                                inactive: true
                            })
                        }
                    })
                    
                    res.render('todo', tododata);
                })
            } else {
                res.render('login', {
                    clientid: config.api.id
                });
            }
        })

        app.post('/newtodo', (req, res) => {
            if (req.session.membershipId) {
                db.collection('memberships').findOne({membershipId: req.session.membershipId}).then(doc => {
                    let contains = false;
                    doc.todos.forEach(todo => {
                        if (todo.text == req.body.text) {
                            contains = true;
                        }
                    })
                    if (contains) {
                        res.status(409).send();
                    } else {
                        db.collection('memberships').updateOne({membershipId: req.session.membershipId},
                            {
                                $push: {todos: req.body}
                            }, (err, result) => {
                                if (err) {
                                    res.status(500).send();
                                } else {
                                    res.status(200).send();
                                }
                            })        
                    }
                })
            } else {
                res.status(401).send();
            }
        })

        app.delete('/deletetodo', (req, res) => {
            if (req.session.membershipId) {
                db.collection('memberships').updateOne({membershipId: req.session.membershipId}, {
                    $pull: {
                        todos: {
                            text: req.body.text
                        }
                    }
                }, (err, result) => {
                    res.status(200).send();
                })
            } else {
                res.status(401).send();
            }
        })

        app.get('/redirect', (req, res) => {
            let code = req.query.code;

            let headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }

            let tokenurl = 'https://www.bungie.net/platform/app/oauth/token/';
            let tokenopts = {
                headers: headers,
                form: {
                    grant_type: 'authorization_code',
                    code: code,
                    client_id: config.api.id,
                    client_secret: config.api.secret
                },
                json: true
            };

            request.post(tokenurl, tokenopts).then(token => {
                req.session.membershipId = token.membership_id;

                db.collection('memberships').findOne({membershipId: token.membership_id}).then(doc => {
                    if (!doc) {
                        db.collection('memberships').insertOne({
                            membershipId: token.membership_id,
                            todos: [
                                {
                                    text: "Shattered Throne is open!",
                                    interval: 3,
                                    offset: 0
                                },
                                {
                                    text: "Beat Ascendant Challenge #2's time trial",
                                    interval: 6,
                                    offset: 1
                                },
                                {
                                    text: "Beat Ascendant Challenge #1's time trial",
                                    interval: 6,
                                    offset: 0
                                },
                                {
                                    text: 'Escalation Protocol boss drops the Shotgun!',
                                    interval: 5,
                                    offset: 3
                                }
                            ]
                        })
                    }
                });

                res.redirect('/todo');
            }).catch(err => {
                console.log(err);

                res.redirect('/todo');
            });
        })

        app.get('/logout', (req, res) => {
            delete req.session.membershipId;
            res.redirect('/todo');
        })
    
        app.get('/archives', (req, res) => {
            res.render('archives', bungiedata);
        })
    
        app.get('/faq', (req, res) => {
            res.render('faq', bungiedata);
        })
    
        app.get('/privacy-policy', (req, res) => {
            res.render('privacy-policy', bungiedata);
        })
                
        var options = {
            root: __dirname + '/public/'
        }    
    
        app.get('/🤔', (req, res) => {
            res.sendFile('/🤔.html', options);
        })
    
        app.use(express.static('public'));

        app.get('*', (req, res) => {
            res.status(404).render('404');
        })
    
        app.listen(port, () => console.log(`Example app listening on port ${port}!`));
    }, (err) => {
        console.log(err);
    })    
})


async function bungiefetch() {
    let refreshurl = 'https://www.bungie.net/platform/app/oauth/token/';
    let refreshopts = {
        form: {
            'grant_type': 'refresh_token',
            'refresh_token': config.token.refresh,
            'client_id': config.api.id,
            'client_secret': config.api.secret
        },
        json: true
    };
    let refresh = await request.post(refreshurl, refreshopts);
    let token = refresh.access_token;
    config.token.refresh = refresh.refresh_token;
    config.token.expires = ((new Date).getTime() / 1000) + 7776000;

    fs.writeFileSync('config.json', JSON.stringify(config));

    let headers = {
        'X-API-Key': config.api.key,
        'Authorization': 'Bearer ' + token
    };

    let bungiedata = {
        'spiderinventory': [],
        'bansheeinventory': [],
        'activenightfalls': []
    };

    let vendorparams = {
        'components': '401,402'
    }

    let spiderurl = 'https://www.bungie.net/platform/Destiny2/' + config.charinfo.platform + '/Profile/' + config.charinfo.membershipid + '/Character/' + config.charinfo.charid + '/Vendors/863940356';
    let spideropts = {
        headers: headers,
        qs: vendorparams,
        json: true
    }
    let spiderresp = await request.get(spiderurl, spideropts);
    let spidercats = spiderresp.Response.categories.data.categories;
    let spidersales = spiderresp.Response.sales.data;

    let itemstoget = spidercats[0]['itemIndexes'];

    for (let keyindex in itemstoget) {
        let key = itemstoget[keyindex];
        let item = spidersales[key];
        let itemhash = item.itemHash;
        if (itemhash != 1812969468) {
            let currency = item.costs[0];
            let itemdefurl = 'https://www.bungie.net/platform/Destiny2/Manifest/DestinyInventoryItemDefinition/' + itemhash + '/';
            let itemdefopts = {
                headers: headers,
                json: true
            };
            let itemdef = await request.get(itemdefurl, itemdefopts);
            let currencydefurl = 'https://www.bungie.net/platform/Destiny2/Manifest/DestinyInventoryItemDefinition/' + currency.itemHash + '/';
            let currencydefopts = {
                headers: headers,
                json: true
            }
            let currencydef = await request.get(currencydefurl, currencydefopts)
            let itemname = itemdef.Response.displayProperties.name;
            itemname = itemname.substr(itemname.indexOf(" ") + 1)
            let currencycost = currency.quantity.toString();
            let currencyname = currencydef.Response.displayProperties.name;

            let itemdata = {
                name: itemname,
                cost: currencycost + ' ' + currencyname
            }
            bungiedata.spiderinventory.push(itemdata);    
        }
    }

    let xururl = 'https://www.bungie.net/platform/Destiny2/' + config.charinfo.platform + '/Profile/' + config.charinfo.membershipid + '/Character/' + config.charinfo.charid + '/Vendors/2190858386';
    let xuropts = {
        headers: headers,
        qs: vendorparams,
        json: true
    }
    let xurresp = await request.get(xururl, xuropts);
    if (xurresp.ErrorCode != 1627) {
        bungiedata.xur = {
            'xurweapon': '',
            'xurarmor': []
        }
        let xursales = xurresp.Response.sales.data;
        for (let key in xursales) {
            let itemhash = xursales[key].itemHash;
            if (itemhash != 4285666432) {
                let itemdefurl = 'https://www.bungie.net/platform/Destiny2/Manifest/DestinyInventoryItemDefinition/' + itemhash + '/';
                let itemdefopts = {
                    headers: headers,
                    json: true
                }
                let itemresp = await request.get(itemdefurl, itemdefopts);
                let itemname = itemresp.Response.displayProperties.name;
                if (itemresp.Response.itemType == 2) {
                    let itemsockets = itemresp.Response.sockets.socketEntries;
                    let plugs = [];
                    for (let skey in itemsockets) {
                        let s = itemsockets[skey];
                        if (s.reusablePlugItems.length > 0 && s.plugSources == 2) {
                            plugs.push(s.reusablePlugItems[0].plugItemHash);
                        }
                    }

                    plugs = plugs.splice(2);

                    let perks = [];

                    for (let pkey in plugs) {
                        let p = plugs[pkey];
                        let plugurl = 'https://www.bungie.net/platform/Destiny2/Manifest/DestinyInventoryItemDefinition/' + p + '/';
                        let plugopts = {
                            headers: headers,
                            json: true
                        }
                        let plugresp = await request.get(plugurl, plugopts);
                        let perk = {
                            name: plugresp.Response.displayProperties.name,
                            desc: plugresp.Response.displayProperties.description
                        }
                        perks.push(perk);
                    }

                    let exotic = {
                        name: itemname,
                        perks: perks
                    }

                    if (itemresp.Response.classType == 0) {
                        exotic.class = 'Titan';
                    } else if (itemresp.Response.classType == 1) {
                        exotic.class = 'Hunter';
                    } else if (itemresp.Response.classType == 2) {
                        exotic.class = 'Warlock';
                    }

                    bungiedata.xur.xurarmor.push(exotic);
                } else {
                    bungiedata.xur.xurweapon = itemname;
                }
            }
        }
    }

    let bansheeurl = 'https://www.bungie.net/platform/Destiny2/' + config.charinfo.platform + '/Profile/' + config.charinfo.membershipid + '/Character/' + config.charinfo.charid + '/Vendors/672118013';
    let bansheeopts = {
        headers: headers,
        qs: vendorparams,
        json: true
    }
    let bansheeresp = await request.get(bansheeurl, bansheeopts);
    let bansheesales = bansheeresp.Response.sales.data;

    for (let key in bansheesales) {
        let itemhash = bansheesales[key].itemHash;
        if (itemhash != 2731650749) {
            let itemdefurl = 'https://www.bungie.net/platform/Destiny2/Manifest/DestinyInventoryItemDefinition/' + itemhash + '/';
            let itemdefopts = {
                headers: headers,
                json: true
            }
            let itemresp = await request.get(itemdefurl, itemdefopts);

            let itemname = itemresp.Response.displayProperties.name;
            let itemperkhash = itemresp.Response.perks[0].perkHash;
            let perkdefurl = 'https://www.bungie.net/platform/Destiny2/Manifest/DestinySandboxPerkDefinition/' + itemperkhash + '/'; 
            let perkdefopts = {
                headers: headers,
                json: true
            }
            let perkresp = await request.get(perkdefurl, perkdefopts);
            let itemdesc = perkresp.Response.displayProperties.description;

            let mod = {
                name: itemname,
                desc: itemdesc
            }

            bungiedata.bansheeinventory.push(mod);
        }
    }

    let nightfallurl = 'https://www.bungie.net/platform/Destiny2/Milestones';
    let nightfallopts = {
        headers: headers,
        json: true
    }
    let nightfallresp = await request.get(nightfallurl, nightfallopts);
    let nightfallactivities = nightfallresp.Response['2171429505'].activities;

    for (let activitykey in nightfallactivities) {
        let activity = nightfallactivities[activitykey];
        let activitydefurl = 'https://www.bungie.net/platform/Destiny2/Manifest/DestinyActivityDefinition/' + activity['activityHash'] + '/'; 
        let activitydefopts = {
            headers: headers,
            json: true
        }
        let activityresp = await request.get(activitydefurl, activitydefopts);
        if ('modifierHashes' in activity) {
            let nightfallname = activityresp.Response.displayProperties.name;
            nightfallname = nightfallname.substr(nightfallname.indexOf(" ") + 1);
            bungiedata.activenightfalls.push(nightfallname);
        }
    }

    let firstResetTime = 1539709200;
    let currentTime = Math.floor((new Date()).getTime() / 1000);
    let secondsSinceFirst = currentTime - firstResetTime;
    let daysSinceFirst = Math.floor(secondsSinceFirst / 86400);
    let weeksSinceFirst = Math.floor(secondsSinceFirst / 604800);

    let dailies = ['Crucible', 'Heroic Adventure', 'Strikes', 'Gambit'];
    let challenges = ['#1: Ouroborea', '#2: Forfeit Shrine', '#3: Shattered Ruins', '#4: Keep of Honed Edges', '#5: Agonarch Abyss', '#6: Cimmerian Garrison'];
    let epbosses = ['Naksud, the Famine', 'Bok Litur, Hunger of Xol', 'Nur Abath, Crest of Xol', 'Kathok, Roar of Xol', 'Damkath, the Mask'];
    let epguns = ['Every IKELOS gun', 'Every IKELOS gun', 'IKELOS_SG_v1.0.1 (Shotgun)', 'IKELOS_SMG_v1.0.0 (SMG)', 'IKELOS_SR_v1.0.1 (Sniper)'];
    let wellbosses = ['Sikariis and Varkuuriis, Plagues of the Well', 'Cragur, Plague of the Well', 'Inomia, Plague of the Well'];

    bungiedata.dailies = {
        current: dailies[daysSinceFirst % 4],
        next: [dailies[(daysSinceFirst + 1) % 4], dailies[(daysSinceFirst + 2) % 4], dailies[(daysSinceFirst + 3) % 4]]
    }

    bungiedata.dailies.next.push({
        daily: dailies[(daysSinceFirst + 1) % 4]
    })
    bungiedata.dailies.next.push({
        daily: dailies[(daysSinceFirst + 2) % 4]
    })
    bungiedata.dailies.next.push({
        daily: dailies[(daysSinceFirst + 3) % 4]
    })

    bungiedata.ac = {
        text: challenges[weeksSinceFirst % 6],
        id: weeksSinceFirst % 6
    }
    bungiedata.ep = {
        boss: epbosses[weeksSinceFirst % 5],
        gun: epguns[weeksSinceFirst % 5],
        id: weeksSinceFirst % 5
    }
    bungiedata.bw = {
        text: wellbosses[weeksSinceFirst % 3],
        id: weeksSinceFirst % 3
    }

    return bungiedata;
}

