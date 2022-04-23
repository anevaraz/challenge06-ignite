import { hash } from "bcryptjs"
import request from "supertest"
import { Connection } from "typeorm"
import { v4 as uuidV4 } from "uuid"
import { app } from "../../../../app"
import createConnection from "../../../../database"

let connection: Connection

describe("create statement controller", () => {
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

  it("should be able to create a deposit statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
    .send({
      email: "any_email",
      password: "any_password"
    })

    const { token } = responseToken.body

    const response = await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 1,
      description: "any_description",
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
  })

  it("should be able to create a withdraw statement", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
    .send({
      email: "any_email",
      password: "any_password"
    })

    const { token } = responseToken.body

    const response = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 1,
      description: "any_description",
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
  })

  it("should not be able to create a withdraw statement if insufficient balance", async () => {
    const responseToken = await request(app).post("/api/v1/sessions")
    .send({
      email: "any_email",
      password: "any_password"
    })

    const { token } = responseToken.body

    const response = await request(app).post("/api/v1/statements/withdraw")
    .send({
      amount: 1,
      description: "any_description",
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    expect(response.status).toBe(400)
  })
})
