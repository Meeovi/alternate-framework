export const useCustomerAuth = () => {
  const { query } = useMagento()

  const login = async (email: string, password: string) => {
    const res = await query(`
      mutation Login($email: String!, $password: String!) {
        generateCustomerToken(email: $email, password: $password) {
          token
        }
      }
    `, { email, password })
    return res.data.generateCustomerToken.token
  }

  const register = async (email: string, password: string, firstname: string, lastname: string) => {
    const res = await query(`
      mutation Register($email: String!, $password: String!, $firstname: String!, $lastname: String!) {
        createCustomer(input: {
          email: $email,
          firstname: $firstname,
          lastname: $lastname,
          password: $password
        }) {
          customer { id email firstname lastname }
        }
      }
    `, { email, password, firstname, lastname })
    return res.data.createCustomer.customer
  }

  return { login, register }
}
