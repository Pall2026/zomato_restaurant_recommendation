import request from "supertest";
import { app } from "../index";

describe("Health API", () => {
    it("should return a 200 OK from the /health endpoint", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: "ok",
            message: "AI Restaurant Recommendation Service Backend running"
        });
    });
});
