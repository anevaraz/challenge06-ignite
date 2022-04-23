import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { OperationType } from "../../entities/Statement"

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase
let inMemoryStatementsRepository: InMemoryStatementsRepository

describe("create statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository)
  })
  it("should be able to get operation", async() => {
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

    const statement = await createStatementUseCase.execute({
      user_id: token.user.id as string,
      amount: 1,
      description: "any_deposit_description",
      type: OperationType.DEPOSIT,
    })

    const operation = await getStatementOperationUseCase.execute({
      statement_id: statement.id as string,
      user_id: token.user.id as string,
    })

    expect(operation).toHaveProperty("id")
    expect(operation.amount).toEqual(1)
  })

  it("should not be able to get operation if user not found", async() => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: "not_exist_statement",
        user_id: "not_exist_user"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to get operation if statement not found", async () => {
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

    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: "not_exist_statement",
        user_id: token.user.id as string
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
