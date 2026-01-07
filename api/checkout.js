import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { country } = req.body;

    // Shipping price by country
    let shippingAmount = 500; // US default $5

    if (country === 'CA') shippingAmount = 1200;
    if (['FR','DE','IT','ES','NL','BE','AT'].includes(country)) {
      shippingAmount = 1500;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      shipping_address_collection: {
        allowed_countries: ['US','CA','FR','DE','IT','ES','NL','BE','AT'],
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Your Product',
            },
            unit_amount: 5000, // product price $50
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Shipping',
            },
            unit_amount: shippingAmount,
          },
          quantity: 1,
        },
      ],
      success_url: 'https://your-readymag-site/success',
      cancel_url: 'https://your-readymag-site/cancel',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
