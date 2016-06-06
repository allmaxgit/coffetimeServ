// app.js

var http = require('http');
var request = require('request');
var onesignal = require('node-opensignal-api');
var btoa = require('btoa');
var onesignal_client = onesignal.createClient();

//Lets define a port we want to listen to
const PORT = 8080;

var FeedsQuery = {
    test: "http://staging.orders.feedmytum.com/api/orders?type=new",
};
var StoreQuery = {
    test: [],
};
var keys = {
    appID: {
        // App ID/Key from onesignal:
        current: "3fc24ec7-4862-4f16-8f4e-d6496942f8a4"
    },
    API_Key: {
        //REST API Key from onesignal:
        current: "NTk4OWNmNzQtYmZkOC00MTZhLWI1YzAtMzJiZWViMzZkZmM5"
    }
};

var Utilities = {
    inArray: function (what, where) {
        for (var i = 0; i < where.length; i++) {
            if (what === where[i]) return true;
        }
        return false;
    },
    intersectionUnion: function (arr1, arr2) {
        /*
         * resultArr1 - общие элементы
         * resultArr2 - элементы отсутствующие в втором массиве
         */
        var resultArr1 = [],
            resultArr2 = [];
        arr1.map(function (elem) {
            if (arr2.indexOf(elem) >= 0) {
                resultArr1.push(elem);
            } else
                resultArr2.push(elem);
        });
        return {
            union: resultArr1,
            intersection: resultArr2
        }
    }

};


//We need a function which handles requests and send response
function handleRequest(request, response) {
    response.end('It Works!! Path Hit: ' + request.url);
}

var sendMessage = function (appID, API_Key, LN, message, segments, data) {
    var contentLN = {}
    if (LN == 'en') {
        contentLN = {'en': message};
    } else if (LN == 'es') {
        contentLN = {'es': message, 'en': message};
    }

    request(
        {
            method: 'POST',
            uri: 'https://onesignal.com/api/v1/notifications',
            headers: {
                "authorization": "Basic " + API_Key,
                "content-type": "application/json"
            },
            json: true,
            body: {
                'app_id': appID,
                'contents': contentLN,
                'data': data,
                'included_segments': segments,
                'ios_sound': "neworder.mp3",
                'android_sound': "neworder",
                'adm_sound': "neworder"

            }
        },
        function (error, response, body) {
            if (!body.errors) {
                console.log(body);
            } else {
                console.error('Error:', body.errors);
            }

        }
    );
};

function getContent(url, saveCategoryBlog) {

    var LN = saveCategoryBlog[0] + saveCategoryBlog[1] + '';

    request(
        {
            uri: url,
            method: 'GET',
            headers: {
                "Authorization": "Basic " + btoa("demo@coffeetimeapp.co.nz" + ":" + "12345678")
            },
            json: true,
        },
        function (error, response, body) {
           // if (!body.hasOwnProperty('errors')) {
                //console.log(body.orders);
                if (body.hasOwnProperty('orders')) {
                  //if ('orders'in body) {

                    if (body.orders.length !== 0) {
                        var NewOrders = body.orders, OrdersArrayIDs = [];
                        for (var key in NewOrders) {
                            if (NewOrders.hasOwnProperty(key) && /^0$|^[1-9]\d*$/.test(key) && key <= 4294967294) {
                                OrdersArrayIDs.push(NewOrders[key].id);
                            }
                        }
                        //console.log(OrdersArrayIDs);

                        if (StoreQuery[saveCategoryBlog].length === 0) {
                            StoreQuery[saveCategoryBlog] = OrdersArrayIDs;
                        } else {
                            if (Utilities.intersectionUnion(OrdersArrayIDs, StoreQuery[saveCategoryBlog]).intersection.length !== 0) {
                                StoreQuery[saveCategoryBlog] = OrdersArrayIDs;
                                switch (LN) {
                                    case 'te':
                                        //console.log('sendMessage');
                                        sendMessage(keys.appID.current, keys.API_Key.current, 'en', 'new Order', ["All", "Active Users"], {'ID': 'ds'});
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                        //sendMessage(keys.appID.current,keys.API_Key.current,'en','coffeetimeapp',["All", "Active Users"],{ 'ID':'ds'});
                    }

                }
            /*} else {
                console.error('Error:', body.errors);
            }*/

        }
    );
}


//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function () {
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
    setInterval(function () {
        console.log(new Date() + ':' + new Date().getTime());
        getContent(FeedsQuery.test, 'test');
        console.log(StoreQuery);
    }, 3000);
});
