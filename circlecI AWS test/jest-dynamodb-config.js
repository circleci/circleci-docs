module.exports = {
    tables: [
        {
            TableName: 'player-points-table',
            KeySchema: [
                {
                    AttributeName: 'ID',
                    KeyType: 'HASH',
                },
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'ID',
                    AttributeType: 'S',
                },
            ],
            BillingMode: 'PAY_PER_REQUEST',
        },
    ],
};
