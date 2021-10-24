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
                    "text": "*R House*\n:star::star::star::star: 163 reviews <tel:0996579184|:iphone:>\n"
                },
                "accessory": {
                    "type": "image",
                    "image_url": "https://cdn.website.dish.co/media/71/61/1117573/R-HOUSE-56980876-2002585373201963-1412179298395095040-o.jpg",
                    "alt_text": "R House image"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Spare Ribs*\n:star::star::star::star: 1404 reviews <tel:013861919|:iphone:>\n"
                },
                "accessory": {
                    "type": "image",
                    "image_url": "https://gastro.24sata.hr/media/img/28/96/1b52429fe25a69ca44e1.jpeg",
                    "alt_text": "Spare Ribs image"
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
                        "value": "click_me_123",
                        "url": "https://www.facebook.com/rhousezg/"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Spare Ribs",
                            "emoji": true
                        },
                        "value": "click_me_123",
                        "url": "https://www.spareribsgrill.hr/dnevna-jela/"
                    }
                ]
            }
        ];

        if (event.text == "test") {
            client.chat.postMessage({channel, token, text: "Test i tebi!"})
        }

/*         if (event.text == "menuu") {
            client.chat.postMessage({channel, token, blocks: menu})
        } */

        if (event.text == "meni" || event.text == "Reminder: meni.") {
            var date = new Date();
/*             if (date.getDate() == 5 && (date.getMonth() + 1) == 10) {
                client.chat.postMessage({channel, token, text : "Custom message"});
            } */

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

                    menu[2].text.text = "*R House*\n:star::star::star::star: 163 reviews <tel:0996579184|:iphone:>\n";
                    if (rhouseMenu && rhouseMenu.length > 0) {
                        menu[2].text.text += rhouseMenu;
                    } else {
                        menu[2].text.text += "Oops, zasad nema menija. Provjerite na web stranici ili odite u Spare Ribs.";
                    }
                    
    
                    var spareribsMenu = "";
                    for (var i = 0; i < fetchedMenu.menuToday.spareribs.length; i++) {
                        spareribsMenu += (i+1) + ". " + capitalizeFirstLetter(fetchedMenu.menuToday.spareribs[i].replace(/\n/g, ", ").toLowerCase()) + "\n";
                    }

                    menu[3].text.text = "*Spare ribs*\n:star::star::star::star: 1404 reviews <tel:013861919|:iphone:>\n";
                    if (spareribsMenu && spareribsMenu.length > 0) {
                        menu[3].text.text += spareribsMenu;
                    } else {
                        menu[3].text.text += "Oops, zasad nema menija. Provjerite na web stranici ili odite u R House.";
                    }
    
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