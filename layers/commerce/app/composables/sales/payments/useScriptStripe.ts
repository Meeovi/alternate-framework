const { proxy } = useScriptStripe() as any

const stripe = await proxy.Stripe('pk_test_xxx')