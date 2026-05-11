import axios from "axios";
import { pool } from "../db/client";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

interface RawRestaurant {
    name: string;
    address: string;
    online_order: string;
    book_table: string;
    rate: string;
    votes: number;
    location: string;
    cuisines: string;
    "approx_cost(for two people)": string;
    "listed_in(city)": string;
}

interface NormalizedRestaurant {
    name: string;
    city: string;
    address: string;
    locality: string;
    cuisines: string;
    cuisine_type: string;
    average_cost_for_two: number | null;
    price_range: number;
    rating: number | null;
    rating_text: string;
    votes: number;
    has_online_delivery: boolean;
    has_table_booking: boolean;
    raw_data: any;
}

const HF_API_URL = "https://datasets-server.huggingface.co/rows?dataset=ManikaSaini%2Fzomato-restaurant-recommendation&config=default&split=train";
const BATCH_SIZE = 100;
const MAX_ROWS = 51000;

async function runSchema() {
    console.log("[seed]: Initializing database schema...");
    const schemaPath = path.join(__dirname, "../db/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schema);
    console.log("[seed]: Schema initialized successfully.");
}

function normalize(row: any): NormalizedRestaurant | null {
    const raw = row as RawRestaurant;
    
    if (!raw.name) return null;

    // Extract primary cuisine (first one in the list)
    const cuisinesList = raw.cuisines || "";
    const primaryCuisine = cuisinesList.split(",")[0].trim();

    // Parse rating: "4.1/5" or "4.1 /5"
    const rateStr = raw?.rate?.toString().trim() || '';
    const ratePart = rateStr.split('/')[0].trim();
    const parsedRating = parseFloat(ratePart);
    const rating = isNaN(parsedRating) || parsedRating === 0 ? null : parsedRating;

    // Parse approx_cost(for two people): "1,200" -> 1200
    const rawCost = raw["approx_cost(for two people)"];
    let average_cost_for_two: number | null = null;
    if (rawCost && rawCost !== "NA") {
        const costString = rawCost.replace(/,/g, "");
        average_cost_for_two = parseInt(costString) || null;
    }

    // Price range logic
    let price_range = 4;
    if (average_cost_for_two === null) {
        price_range = 1;
    } else if (average_cost_for_two < 300) {
        price_range = 1;
    } else if (average_cost_for_two < 600) {
        price_range = 2;
    } else if (average_cost_for_two < 1200) {
        price_range = 3;
    }

    return {
        name: raw.name,
        city: raw["listed_in(city)"] || raw.location || "Unknown",
        locality: raw.location || "Unknown",
        address: raw.address || "",
        cuisines: cuisinesList,
        cuisine_type: primaryCuisine || "Other",
        average_cost_for_two,
        price_range,
        rating,
        rating_text: raw.rate || "Not Rated",
        votes: Number(raw.votes) || 0,
        has_online_delivery: raw.online_order === "Yes",
        has_table_booking: raw.book_table === "Yes",
        raw_data: row
    };
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.get(url);
        } catch (error: any) {
            const is502 = error.response?.status === 502;
            if (is502 && i < retries - 1) {
                console.log(`[seed]: Received 502, retrying in 2s... (Attempt ${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
            }
            throw error;
        }
    }
}

async function seed() {
    try {
        await runSchema();

        let offset = 0;
        let totalInserted = 0;

        console.log(`[seed]: Starting data ingestion from HuggingFace (Target: Full Dataset)`);

        while (true) {
            console.log(`[seed]: Fetching batch at offset ${offset}...`);
            
            const response = await fetchWithRetry(`${HF_API_URL}&offset=${offset}&limit=${BATCH_SIZE}`);
            const rows = response.data.rows;

            if (!rows || rows.length === 0) {
                console.log("[seed]: No more rows found. Ingestion complete.");
                break;
            }

            const client = await pool.connect();
            try {
                await client.query("BEGIN");

                for (const item of rows) {
                    const normalized = normalize(item.row);
                    if (!normalized) continue;

                    const query = `
                        INSERT INTO restaurants (
                            name, city, address, locality, cuisines, cuisine_type, 
                            average_cost_for_two, price_range, rating, rating_text, 
                            votes, has_online_delivery, has_table_booking, raw_data
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    `;

                    const values = [
                        normalized.name, normalized.city, normalized.address, normalized.locality,
                        normalized.cuisines, normalized.cuisine_type, normalized.average_cost_for_two,
                        normalized.price_range, normalized.rating, normalized.rating_text,
                        normalized.votes, normalized.has_online_delivery, normalized.has_table_booking,
                        JSON.stringify(normalized.raw_data)
                    ];

                    await client.query(query, values);
                    totalInserted++;
                }

                await client.query("COMMIT");
                console.log(`[seed]: Batch committed. Total inserted: ${totalInserted}`);
            } catch (err) {
                await client.query("ROLLBACK");
                console.error("[seed]: Batch failed, rolling back.", err);
                throw err;
            } finally {
                client.release();
            }

            offset += BATCH_SIZE;
            
            // 500ms delay between batches to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`[seed]: Seeding complete. Total restaurants: ${totalInserted}`);
    } catch (error) {
        console.error("[seed]: Critical error during seeding:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
