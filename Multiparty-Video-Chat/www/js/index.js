/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {

        //TODO request the session and a token from the cloud app
        function httpGetAsync(theUrl, callback)
        {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                    callback(xmlHttp.responseText);
            };
            xmlHttp.open("GET", theUrl, true); // true for asynchronous
            xmlHttp.send(null);
        }

        httpGetAsync(cloudURL + '/join-session', function(res){
            var self = this;
            console.log('raw res:', res);
            var body = JSON.parse(res);
            console.log('object res:', body);

            // console.log('statusCode:', response && response.statusCode);
            // console.log('body:', body);
            var sessionId = body.sessionId;
            var token = body.token;
            console.log('sessionId:', sessionId);
            console.log('token:', token);

            var publisher = OT.initPublisher('publisher');
            var session = OT.initSession(apiKey, body.sessionId);

            function createSubscriber(stream, streamId) {
                console.log(stream.name + ' just joined');
                var subscriberClassName = 'subscriber-' + streamId;
                var subscriber = document.createElement('div');
                subscriber.setAttribute('id', subscriberClassName);
                document.getElementById('subscribers').appendChild(subscriber);
                session.subscribe(stream, subscriberClassName);
            }

            session.on({
                streamCreated: function(event) {
                    createSubscriber(event.stream, event.stream.streamId);
                },
                streamDestroyed: function(event) {
                    console.log('Stream ' + event.stream.name + ' ended because ' + event.reason);
                }
            });

            session.connect(token, function() {
                console.log('Connected to session: ' + sessionId);
                session.publish(publisher);
            });

            //self.receivedEvent('deviceready');
        });
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);

        console.log('Received Event: ' + id);
    }
};

app.initialize();
