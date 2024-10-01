'use server';

import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export const getPaymentStatus = async ({ orderId }: { orderId: string }) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id || !user.email) {
    throw new Error('You need to be logged in to view this page.');
  }

  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId: user.id,
    },
    include: {
      billingAddress: true,
      configuration: true,
      shippingAddress: true,
      user: true,
    },
  });

  if (!order) throw new Error('This order does not exist.');

  return order.isPaid ? order : false;

};
