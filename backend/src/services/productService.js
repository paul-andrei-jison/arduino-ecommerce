'use strict';

const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLE_NAME } = require('../utils/db');

// Scans the entire table and filters to items whose PK begins with "PRODUCT#".
// In production at larger scale this should be replaced with a Query using a GSI,
// but Scan is correct for a single-table design without a dedicated products index.
async function getAllProducts() {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    // begins_with is a DynamoDB filter function; it cannot be used in a KeyConditionExpression
    // without a GSI, so we use FilterExpression on the Scan instead.
    FilterExpression: 'begins_with(PK, :pkPrefix)',
    ExpressionAttributeValues: {
      ':pkPrefix': 'PRODUCT#',
    },
  });

  const result = await docClient.send(command);
  return result.Items ?? [];
}

module.exports = { getAllProducts };
