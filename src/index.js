// import { express } from 'express'
const express = require('express')
const app = express()
app.use(express.json())

function verifyExistsAccountCPF(req, resp, next) {
  const { cpf } = req.headers
  const customer = customers.find(customer => customer.cpf === cpf)
  if (!customer) {
    return resp.status(404).json({ error: 'Customer not found' })
  }
  req.customer = customer
  return next()
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount
    } else {
      acc - operation.amount
    }
  }, 0)
  return balance
}
const { v4: uuidv4 } = require('uuid')
const customers = []
app.post('/account', (req, resp) => {
  const { cpf, name } = req.body
  const customerAlredyExist = customers.some(customer => customer.cpf === cpf)
  if (customerAlredyExist) {
    return resp.status(400).json({
      error: 'Customer already exists'
    })
  }
  // poderia usar send
  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: []
  })
  // console.log(customers)
  return resp.status(201).send(customers)
})
app.get('/statement', verifyExistsAccountCPF, (req, resp) => {
  const { customer } = req
  return resp.status(200).json(customer.statement)
})
app.post('/deposit', verifyExistsAccountCPF, (req, resp) => {
  const { description, amount } = req.body
  const { customer } = req
  const statementOperation = {
    description,
    amount,
    createAt: new Date(),
    type: 'credit'
  }
  customer.statement.push(statementOperation)
  return resp.status(201).json({
    message: 'Success'
  })
})
app.post('/withdraw', verifyExistsAccountCPF, (req, resp) => {
  const { amount } = req.body
  const { customer } = req
  const balance = getBalance(customer.statement)
  if (balance < amount) {
    return resp.status(400).json({
      error: 'Insufficient balance'
    })
  }
  const statementOperation = {
    amount,
    createAt: new Date(),
    type: 'debit'
  }
  customer.statement.push(statementOperation)
  return resp.status(201).json({
    message: 'Success'
  })
})
app.get('/statement/date', verifyExistsAccountCPF, (req, resp) => {
  const { customer } = req
  const { date } = req.query
  const dateFormat = new Date(date + ' 00:00')
  const statement = customer.statement.filter(
    statement =>
      statement.createAt.toDateString() === new Date(dateFormat).toDateString()
  )
  return resp.status(200).json(statement)
})
app.put('/account', verifyExistsAccountCPF, (req, resp) => {
  const { name } = req.body
  const { customer } = req
  customer.name = name
  return resp.status(201).json({
    message: 'Success'
  })
})
app.get('/account', verifyExistsAccountCPF, (req, resp) => {
  const { customer } = req
  return resp.status(201).json(customer)
})
app.delete('/account', verifyExistsAccountCPF, (req, resp) => {
  const { customer } = req
  customers.filter(item => {
    if (customer.cpf === item.cpf) {
      customers.splice(customers.indexOf(item), 1)
    }
  })
  return resp.json(customers)
})
app.get('/balance', verifyExistsAccountCPF, (req, resp) => {
  const { customer } = req
  const balance = getBalance(customer.statement)
  return resp.json(balance)
})
app.listen(3333)
