'use strict';

const { GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, TABLE_NAME } = require('../utils/db');

async function getUserByEmail(email) {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `USER#${email.toLowerCase()}`,
      SK: 'METADATA',
    },
  });

  const result = await docClient.send(command);
  return result.Item ?? null;
}

async function createUser({ name, email, passwordHash }) {
  const normalizedEmail = email.toLowerCase();

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `USER#${normalizedEmail}`,
      SK: 'METADATA',
      name,
      email: normalizedEmail,
      passwordHash,
      isVerified: false,
      createdAt: new Date().toISOString(),
    },
    // Guard against a race condition where two simultaneous registrations
    // slip past the getUserByEmail existence check.
    ConditionExpression: 'attribute_not_exists(PK)',
  });

  await docClient.send(command);
}

module.exports = { getUserByEmail, createUser };
