import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase

describe("authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
  })
  it("should be able to authenticate a user", async() => {
    await createUserUseCase.execute({
      email: "any_email",
      name: "any_name",
      password: "any_password"
    })

    const token = await authenticateUserUseCase.execute({
      email: "any_email",
      password: "any_password",
    })

    expect(token).toHaveProperty("token")
  })

  it("should not be able to authenticate if incorret email", async() => {
    await createUserUseCase.execute({
      email: "any_email",
      name: "any_name",
      password: "any_password"
    })

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "wrong_email",
        password: "any_password"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("should not be able to authenticate if incorret password", async() => {
    await createUserUseCase.execute({
      email: "any_email",
      name: "any_name",
      password: "any_password"
    })

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "any_email",
        password: "wrong_password"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
