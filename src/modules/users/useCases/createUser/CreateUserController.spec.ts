import request from "supertest"
import { Connection } from "typeorm"
import { app } from "../../../../app"
import createConnection from "../../../../database"

let connection: Connection

describe("create user controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able to create a user", async () => {
    const response = await request(app).post("/api/v1/users")
    .send({
      name: "any_name",
      email: "any_email",
      password: "any_password"
    })

    expect(response.status).toBe(201)
  })

  it("should not be able to create a user if already exists", async () => {
    await request(app).post("/api/v1/users")
    .send({
      name: "any_name",
      email: "any_email",
      password: "any_password"
    })

    const response = await request(app).post("/api/v1/users")
    .send({
      name: "any_name",
      email: "any_email",
      password: "any_password"
    })

    expect(response.status).toBe(400)
  })
})
