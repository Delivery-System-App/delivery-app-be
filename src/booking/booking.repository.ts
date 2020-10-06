import { EntityRepository, MongoRepository } from 'typeorm';
import { Booking } from './entities/Booking.entity';
import { CreateBookingDto } from './dto';
import { User } from 'src/auth/entities/User.entity';
import { MenuRepository } from 'src/menu/menu.repository';
const ObjectId = require('mongodb').ObjectID;
const Razorpay = require('razorpay');
require('dotenv').config();
var razorPay = new Razorpay({
  key_id: process.env.RazorKey,
  key_secret: process.env.RazorKeySecret,
});
@EntityRepository(Booking)
export class BookingRepository extends MongoRepository<Booking> {
  async createBooking(
    user: User,
    data: CreateBookingDto,
    repo: MenuRepository,
  ): Promise<any> {
    console.log(user);
    const { dishIds, qty, restaurantId, deliveryAdd, deliveryDate } = data;
    const booking = new Booking();
    booking.restaurantId = restaurantId;
    booking.userId = user.id.toString();
    if (deliveryAdd) {
      booking.deliveryAdd = deliveryAdd;
    } else {
      booking.deliveryAdd = 'Ernakulam';
    }
    booking.updatedAt = new Date();
    booking.cancelStatus = 'Pending';
    booking.deliveryDate = deliveryDate;
    booking.createdAt = new Date();
    const menu = await repo.find({ restaurantId: restaurantId });
    booking.dish = [];
    booking.totalAmount = 0;
    if (menu.length > 0) {
      for (var i = 0; i < dishIds.length; i++) {
        for (var j = 0; j < menu.length; j++) {
          for (var z = 0; z < menu[j].dishes.length; z++) {
            if (dishIds[i] == menu[j].dishes[z].dishId) {
              menu[j].dishes[z]['quantity'] = qty[i];
              booking.dish.push(menu[j].dishes[z]);
              booking.totalAmount += qty[i] * menu[j].dishes[z].price;
            }
          }
        }
      }
      const payment_capture = 1;
      const currency = 'INR';
      const options = {
        amount: booking.totalAmount * 100,
        currency,
        receipt: booking.bookId,
        payment_capture,
      };
      try {
        const response = await razorPay.orders.create(options);
        console.log(response);
        booking.payStatus = 'Pending';
        booking.paymentDetail = null;
        booking.deliveryId = null;
        booking.deliveryStatus = 'Pending';
        await this.save(booking);
        return {
          id: response.id,
          currency: response.currency,
          amount: response.amount,
        };
      } catch (error) {
        console.log(error);
      }

      return booking;
    } else {
      return 'no menu';
    }
  }
}
