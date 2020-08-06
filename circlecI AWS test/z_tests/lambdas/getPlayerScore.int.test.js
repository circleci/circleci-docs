const getPlayerScore = require('../../lambdas/endpoints/getPlayerScore');
const eventGenerator = require('../testUtils/eventGenerator');
const validators = require('../testUtils/validators');
const Dynamo = require('../../lambdas/common/Dynamo');

describe('get player score integration tests', () => {
    test('it shoudl take an ID and return an API Gateway response', async () => {
        const event = eventGenerator({
            pathParametersObject: {
                ID: 'sdfsdf3re',
            },
        });

        const res = await getPlayerScore.handler(event);

        expect(res).toBeDefined();
        expect(validators.isApiGatewayResponse(res)).toBe(true);
    });

    test('it should return 400 if we dont pass an ID', async () => {
        const event = eventGenerator({});
        const res = await getPlayerScore.handler(event);
        expect(res.statusCode).toBe(400);
    });

    test('it should return 204 if it is an incorrect ID', async () => {
        const event = eventGenerator({
            pathParametersObject: {
                ID: 'sdfsdf3re',
            },
        });

        const res = await getPlayerScore.handler(event);

        expect(res.statusCode).toBe(204);
    });

    test('returns a 200 and the player data when a valid ID', async () => {
        const ID = '328resnrr4sd';

        const user = {
            ID,
            name: 'Anna',
            score: 78,
        };
        await Dynamo.write(user, process.env.tableName);

        const event = eventGenerator({
            pathParametersObject: {
                ID,
            },
        });

        const res = await getPlayerScore.handler(event);

        expect(res.statusCode).toBe(200);
        const body = JSON.parse(res.body);
        expect(body).toEqual({ user });
    });
});
