import { hash } from "bcryptjs"
import request from "supertest"
import { Connection } from "typeorm"
import { v4 as uuidV4 } from "uuid"
import { app } from "../../../../app"
import createConnection from "../../../../database"

let connection: Connection

describe("get balance controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    const id = uuidV4()
    const password = await hash("any_password", 8)

    await connection.query(`
      INSERT INTO users
        (id, name, email, password, created_at, updated_at)
      VALUES
        ('${id}', 'any_name', 'any_email', '${password}', 'NOW()', 'NOW()')
    `)
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("should be able to get balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
    .send({
      email: "any_email",
      password: "any_password"
    })

    const { token } = responseToken.body

    const response = await request(app).get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`,
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("balance")
  })

  it("should not be authorized to get balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
    .send({
      email: "wrong_email",
      password: "any_password"
    })

    const { token } = responseToken.body

    const response = await request(app).get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`,
    })

    expect(response.status).toBe(401)
  })

})
