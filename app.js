require('dotenv').config({path: __dirname + '/.env'})

const express = require('express')
const http = require('http');
const app = express()

const PORT = process.env.PORT || 3000

const eventsApi = require('@slack/events-api')
const slackEvents = eventsApi.createEventAdapter(process.env.SLACK_SIGNING_SECRET)

const token = process.env.SLACK_BOT_TOKEN

const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient(token, {
    logLevel: LogLevel.DEBUG
});

const options = {
    host: 'localhost',
    port: 3001,
    path: '/puppet/json',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

app.use('/', slackEvents.expressMiddleware())

slackEvents.on('message', async (event) => {
    console.log(event)
    const channel = event.channel
    if(!event.bot_profile){
        
        var menu = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Pozdrav, nadamo se da će Vam se današnja ponuda iz lokalnih restorana svidjeti.\n\n *Molimo odaberite restoran:*"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*R House*\n:star::star::star::star: 1528 reviews\n They do have some vegan options, like the roti and curry, plus they have a ton of salad stuff and noodles can be ordered without meat!! They have something for everyone here"
                },
                "accessory": {
                    "type": "image",
                    "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/c7ed05m9lC2EmA3Aruue7A/o.jpg",
                    "alt_text": "alt text for image"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Spare Ribs*\n:star::star::star::star: 2082 reviews\n I would really recommend the  Yum Koh Moo Yang - Spicy lime dressing and roasted quick marinated pork shoulder, basil leaves, chili & rice powder."
                },
                "accessory": {
                    "type": "image",
                    "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/DawwNigKJ2ckPeDeDM7jAg/o.jpg",
                    "alt_text": "alt text for image"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "R House",
                            "emoji": true
                        },
                        "value": "click_me_123"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Spare Ribs",
                            "emoji": true
                        },
                        "value": "click_me_123",
                        "url": "https://google.com"
                    }
                ]
            }
        ];


        if (event.text == "meni" || event.text == "Reminder: meni.") {
            const req = http.request(options, res => {
                console.log(`statusCode: ${res.statusCode}`)
                var str = "";
                res.on('data', function (chunk) {
                    str += chunk;
                  });
    
                res.on('end', d => {
                    var fetchedMenu = JSON.parse(str);
    
                    var rhouseMenu = "";
                    for (var i = 0; i < fetchedMenu.menuToday.rhouse.length; i++) {
                        rhouseMenu += fetchedMenu.menuToday.rhouse[i].replace(/\n/g, ", ") + "\n";
                    }
                    menu[2].text.text = "*R House*\n:star::star::star::star: 28 reviews\n" + rhouseMenu;
    
                    var spareribsMenu = "";
                    for (var i = 0; i < fetchedMenu.menuToday.spareribs.length; i++) {
                        spareribsMenu += (i+1) + ". " + capitalizeFirstLetter(fetchedMenu.menuToday.spareribs[i].replace(/\n/g, ", ").toLowerCase()) + "\n";
                    }
                    menu[3].text.text = "*Spare ribs*\n:star::star::star::star: 28 reviews\n" + spareribsMenu;
    
                    client.chat.postMessage({channel, token, blocks: menu})
                })
            });
    
            req.end();
        }

        
    }
})

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`)
})

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }