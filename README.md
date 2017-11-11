# hellochess

Not under active development anymore!

Setup:
Create a config directory inside of the project root. Inside that folder create a config.js file.

Place similar content as below inside config.js:

    module.exports = {
        secret: 'placeRandomStringHere',
        facebookAuth: {
            clientID: '',
            clientSecret: '',
            callbackURL: '',
            profileFields: ['id', 'email', 'name', 'picture', 'friends'],
            fields: "id, email, name, picture"
        },
        googleAuth: {
            GoogleClientID: '',
            GoogleClientSecret: ''
        }
    }

npm install


Make sure you have MongoDB installed and run
mongod

For development purposes I run the webpack dev server on localhost:8080
to run the webpack dev server:

npm start

The backend runs on localhost:3000 which I run as below:

nodemon server/server.js

visit localhost:8080 and hope everything works!
