import { db } from '@/db';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { OrderReceivedEmail } from '@/components/emails/OrderReceivedEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) return new Response('Invalid signature', { status: 400 });

    // ウェブフックリクエストがStripeから送信されたものであることを確認;
    const event = stripe.webhooks.constructEvent(
      body, // payload
      signature, //  Stripeが生成した署名
      process.env.STRIPE_WEBHOOK_SECRET! // Stripeダッシュボードで設定したウェブフックシークレット
    );

    // チェックアウトセッション成功時;
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session.customer_details?.email) {
        throw new Error('Missing user email.');
      }

      const { userId, orderId } = session.metadata || {
        userId: null,
        orderId: null,
      };

      if (!userId || !orderId) throw new Error('Invalid request metadata');

      if (!session.shipping_details?.address) {
        throw new Error('Missing user shipping address.');
      }
      const shippingAddress = session.shipping_details.address;

      if (!session.customer_details?.address) {
        throw new Error('Missing user billing address.');
      }
      const billingAddress = session.customer_details.address;

      const updatedOrder = await db.order.update({
        where: {
          id: orderId,
        },
        data: {
          isPaid: true,
          shippingAddress: {
            create: {
              name: session.customer_details.name!,
              city: shippingAddress.city!,
              country: shippingAddress.country!,
              postalCode: shippingAddress.postal_code!,
              street: shippingAddress.line1!,
              state: shippingAddress.state!,
            },
          },
          billingAddress: {
            create: {
              name: session.customer_details.name!,
              city: billingAddress.city!,
              country: billingAddress.country!,
              postalCode: billingAddress.postal_code!,
              street: billingAddress.line1!,
              state: billingAddress.state!,
            },
          },
        },
      });

      await resend.emails.send({
        from: 'CaseCobra<sanaevvv@gmail.com>',
        to: [event.data.object.customer_details?.email!],
        subject: 'Thanks for your order!',
        react: OrderReceivedEmail({
          orderId,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          // @ts-ignore
          shippingAddress: {
            name: session.customer_details.name!,
            city: shippingAddress.city!,
            country: shippingAddress.country!,
            postalCode: shippingAddress.postal_code!,
            street: shippingAddress.line1!,
            state: shippingAddress.state!,
          },
        }),
      });
    }

    // return NextResponse.json({ received: true }, { status: 200 });
    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: 'Something went wrong', ok: false },
      { status: 500 }
    );
  }
}
