const Responses = require('../common/API_Responses');
const Dynamo = require('../common/Dynamo');

const tableName = process.env.tableName;

exports.handler = async event => {
    // console.log('event', event);

    if (!event.pathParameters || !event.pathParameters.ID) {
        // failed without an ID
        return Responses._400({ message: 'missing the ID from the path' });
    }

    let ID = event.pathParameters.ID;
    const user = JSON.parse(event.body);
    user.ID = ID;

    const newUser = await Dynamo.write(user, tableName).catch(err => {
        console.log('error in dynamo write', err);
        return null;
    });

    if (!newUser) {
        return Responses._400({ message: 'Failed to write user by ID' });
    }

    return Responses._200({ newUser });
};
