'use strict';

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// DynamoDBClient is the low-level client. Every attribute must be typed explicitly,
// e.g. { name: { S: 'Arduino Uno' }, price: { N: '25.99' } }.
const client = new DynamoDBClient({});

// DynamoDBDocumentClient wraps the raw client and automatically marshals plain
// JavaScript objects into DynamoDB's AttributeValue format on the way in, and
// unmarshals them back to plain objects on the way out — no manual type annotations needed.
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.PRODUCTS_TABLE;

module.exports = { docClient, TABLE_NAME };
