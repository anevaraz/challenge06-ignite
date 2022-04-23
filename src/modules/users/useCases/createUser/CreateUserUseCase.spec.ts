import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase"
import { CreateUserError } from "./CreateUserError"

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository

describe("create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })
  it("should be able to create a user", async() => {
    const user = await createUserUseCase.execute({
      email: "any_email",
      name: "any_name",
      password: "any_password"
    })

    expect(user).toHaveProperty("id")
  })

  it("should not be able to create a user if already exists", async() => {
    await createUserUseCase.execute({
      email: "any_email",
      name: "any_name",
      password: "any_password"
    })

    await expect(createUserUseCase.execute({
      email: "any_email",
      name: "any_name",
      password: "any_password"
    })).rejects.toEqual(new CreateUserError())
  })
})
