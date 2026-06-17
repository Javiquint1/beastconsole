# WordPress Stripe Checkout Integration

WordPress should start payment by calling the Beast Console Checkout API from
the signup or payment page:

```ts
const response = await fetch(`${NEXT_PUBLIC_APP_URL}/api/stripe/checkout`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    plan: "monthly", // or "annual"
    email,
    name,
    company,
    phone
  })
});

const { url } = await response.json();
window.location.href = url;
```

The API response is:

```json
{
  "url": "https://checkout.stripe.com/..."
}
```

Do not activate access from the WordPress page or the success page. Beast
Console only creates or activates accounts after the verified Stripe webhook
receives `checkout.session.completed` or a paid subscription/invoice event.
