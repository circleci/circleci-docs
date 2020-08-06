const Dynamo = require('../common/Dynamo');

test('Dynamo is an object', () => {
    expect(typeof Dynamo).toBe('object');
});

test('dynamo has get and write', () => {
    expect(typeof Dynamo.get).toBe('function');
    expect(typeof Dynamo.write).toBe('function');
});

const validTableName = 'player-points-table';
const data = { ID: '3081042', score: 25, name: 'Chris' };

test('Dynamo write works', async () => {
    expect.assertions(1);
    try {
        const res = await Dynamo.write(data, validTableName);
        expect(res).toBe(data);
    } catch (error) {
        console.log('error in dynamo write test', error);
    }
});

test('dynamo get works', async () => {
    expect.assertions(1);
    try {
        const res = await Dynamo.get(data.ID, validTableName);
        expect(res).toEqual(data);
    } catch (error) {
        console.log('error in dynamo get', error);
    }
});
