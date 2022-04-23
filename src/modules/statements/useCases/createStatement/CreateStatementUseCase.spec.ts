import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO"
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { OperationType } from "../../entities/Statement"
import { CreateStatementError } from "./CreateStatementError"

let createUserUseCase: CreateUserUseCase
let inMemoryUsersRepository: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase
let createStatementUseCase: CreateStatementUseCase
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
  })
  it("should be able to create a deposit", async() => {
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

    expect(statement).toHaveProperty("id")
    expect(statement.amount).toEqual(1)
  })

  it("should be able to create a withdraw", async() => {
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

    await createStatementUseCase.execute({
      user_id: token.user.id as string,
      amount: 10,
      description: "any_deposit_description",
      type: OperationType.DEPOSIT,
    })

    const statement = await createStatementUseCase.execute({
      user_id: token.user.id as string,
      amount: 5,
      description: "any_withdraw_description",
      type: OperationType.WITHDRAW,
    })

    expect(statement).toHaveProperty("id")
    expect(statement.amount).toEqual(5)
  })

  it("should not be able to create a deposit if user not found", async() => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "not_exist_user",
        amount: 10,
        description: "any_deposit_description",
        type: OperationType.DEPOSIT,
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("should not be able to create a withdraw if user insufficient balance", async () => {
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

    await createStatementUseCase.execute({
      user_id: token.user.id as string,
      amount: 5,
      description: "any_deposit_description",
      type: OperationType.DEPOSIT,
    })

    await expect(createStatementUseCase.execute({
      user_id: token.user.id as string,
      amount: 10,
      description: "any_withdraw_description",
      type: OperationType.WITHDRAW,
    })).rejects.toEqual(new CreateStatementError.InsufficientFunds())
  })
})
