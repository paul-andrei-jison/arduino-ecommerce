'use strict';

const { randomUUID } = require('crypto');
const { ScanCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
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

async function createProduct(productData) {
  const productId = randomUUID();
  const { name, description, category, price, stock } = productData;

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      PK: `PRODUCT#${productId}`,
      SK: 'METADATA',
      name,
      description,
      category,
      price,
      stock,
      createdAt: new Date().toISOString(),
    },
  });

  await docClient.send(command);
  return productId;
}

async function updateProduct(productId, updateAttributes) {
  const expressionParts = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  for (const [key, value] of Object.entries(updateAttributes)) {
    expressionParts.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  }

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `PRODUCT#${productId}`,
      SK: 'METADATA',
    },
    UpdateExpression: `SET ${expressionParts.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  await docClient.send(command);
}

async function deleteProduct(productId) {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      PK: `PRODUCT#${productId}`,
      SK: 'METADATA',
    },
  });

  await docClient.send(command);
}

module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct };
