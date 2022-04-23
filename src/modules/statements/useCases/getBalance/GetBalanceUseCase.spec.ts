import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { GetBalanceUseCase } from "./GetBalanceUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetBalanceError } from "./GetBalanceError"

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase
let getBalanceUseCase: GetBalanceUseCase
let inMemoryStatementsRepository: InMemoryStatementsRepository

describe("get balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
      )
  })
  it("should be able to get balance", async() => {
    const user: ICreateUserDTO = {
      email: "any_email",
      name: "any_name",
      password: "any_password"
    }
    await createUserUseCase.execute(user)

    const token = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    })

    const balance = await getBalanceUseCase.execute({
      user_id: token.user.id as string
    })

    expect(balance).toHaveProperty("statement")
  })

  it("should not be able to get balance if user not found", async() => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "not_exist_user"
      })
    }).rejects.toBeInstanceOf(GetBalanceError)
  })

})
