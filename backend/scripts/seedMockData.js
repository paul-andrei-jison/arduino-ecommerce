'use strict';

// Run with: PRODUCTS_TABLE=<table-name> node scripts/seedMockData.js
// Requires AWS credentials to be configured (AWS_PROFILE or env vars).

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.PRODUCTS_TABLE;
if (!TABLE_NAME) {
  console.error('Error: PRODUCTS_TABLE environment variable is not set.');
  process.exit(1);
}

const mockProducts = [
  {
    PK: 'PRODUCT#001',
    SK: 'METADATA',
    name: 'Arduino Uno R3',
    description: 'The classic microcontroller board based on the ATmega328P. Great for beginners.',
    category: 'Microcontrollers',
    price: 25.99,
    stock: 150,
    createdAt: new Date().toISOString(),
  },
  {
    PK: 'PRODUCT#002',
    SK: 'METADATA',
    name: 'Ultrasonic Distance Sensor HC-SR04',
    description: 'Measures distance from 2cm to 400cm with 3mm accuracy using ultrasonic waves.',
    category: 'Sensors',
    price: 3.49,
    stock: 500,
    createdAt: new Date().toISOString(),
  },
  {
    PK: 'PRODUCT#003',
    SK: 'METADATA',
    name: 'Arduino Nano Every',
    description: 'Compact board with ATMega4809. Ideal for space-constrained projects.',
    category: 'Microcontrollers',
    price: 14.99,
    stock: 200,
    createdAt: new Date().toISOString(),
  },
  {
    PK: 'PRODUCT#004',
    SK: 'METADATA',
    name: 'Micro Servo Motor SG90',
    description: '180-degree rotation servo motor, 9g weight. Compatible with all Arduino boards.',
    category: 'Actuators',
    price: 4.99,
    stock: 300,
    createdAt: new Date().toISOString(),
  },
];

async function seed() {
  console.log(`Seeding ${mockProducts.length} products into table: ${TABLE_NAME}\n`);

  for (const item of mockProducts) {
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    console.log(`  Inserted ${item.PK} -- ${item.name}`);
  }

  console.log('\nSeed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
