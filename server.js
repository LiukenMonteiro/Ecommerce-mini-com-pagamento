import express from 'express';
import dotenv from 'dotenv';
import stripe from 'stripe';

const port = 3000;

// Carrega variaveis
dotenv.config();

// Inicia servidor
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Rota Home
app.get('/', (req, res) => {
    res.sendFile('index.html', {root: 'public'});
}); 

// Sucess
app.get('/success', (req, res) => {
    res.sendFile('success.html', {root: 'public'});
});
// Cancel
app.get('/cancel', (req, res) => {
    res.sendFile('cancel.html', {root: 'public'});
});
// Stripe
let stripeGateway = stripe(process.env.stripe_api);
let DOMAIN = process.env.DOMAIN;

app.post('/stripe-checkout', async (req, res) => {
    const lineItems = req.body.items.map((item) => {
        const unitAmaount = parseInt(item.price.replace(/[^0-9.-]+/g, "") * 100);
        console.log('item-price:', item.price);
        console.log('unitAmount:', unitAmaount);
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                    images: [item.productImg]
                },
                unit_amount: unitAmaount,
            },
            quantity: item.quantity, 
        }
    });
    console.log('LineItems:', lineItems);

    // Cria sessão de checkout
const session = await stripeGateway.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${DOMAIN}/success`,
    cancel_url: `${DOMAIN}/cancel`,
    line_items: lineItems,
    // Procura endereço no Stripe Checkout Page
    billing_address_collection: 'required'
  }); 
  res.json(session.url);
});



app.listen(port, () => {
    console.log(`rodando na porta ${port}`);
});