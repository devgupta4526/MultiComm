import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: ["d2tu9mb5kjamjdmua3v0.any.us-east-1.mpx.prd.cloud.redpanda.com:9092"],
  ssl: { rejectUnauthorized: false },
  sasl: {
    mechanism: "scram-sha-256",
    username: process.env.KAFKA_API_KEY!,
    password: process.env.KAFKA_API_SECRET!,
  },
  connectionTimeout: 30000,  // ⏱️ increase to 30 seconds (default is 1000ms)
  requestTimeout: 30000, 
});