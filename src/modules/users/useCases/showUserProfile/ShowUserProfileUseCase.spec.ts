import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"
import { ShowUserProfileError } from "./ShowUserProfileError"

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let showUserProfileUseCase: ShowUserProfileUseCase

describe("show profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
  })
  it("should be able to show user profile", async() => {
    const user = await createUserUseCase.execute({
      email: "any_email",
      name: "any_name",
      password: "any_password"
    })

    const profile = await showUserProfileUseCase.execute(user.id as string)

    expect(profile).toHaveProperty("id")
  })

  it("should not be able to show user profile if user not found", async() => {
    expect(async () => {
      await showUserProfileUseCase.execute("not_exist_user")
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
