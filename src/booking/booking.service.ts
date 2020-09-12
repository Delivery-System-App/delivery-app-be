import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantRepository } from 'src/restaurant/restaurant.repository';
import { BookingRepository } from './booking.repository';
import { MenuRepository } from 'src/menu/menu.repository';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { UserRepository } from 'src/auth/user.repository';
import { User } from 'src/auth/entities/User.entity';
import { CreateBookingDto } from './dto';
const ObjectId = require('mongodb').ObjectID;
@Injectable()
export class BookingService {
  private logger = new Logger('BookingService');
  constructor(
    @InjectRepository(MenuRepository)
    @InjectRepository(UserRepository)
    @InjectRepository(RestaurantRepository)
    private readonly menuRepository: MenuRepository,
    private readonly userRepository: UserRepository,
    private readonly restaurantRepository: RestaurantRepository,
    private readonly bookingRepository: BookingRepository,
    private readonly restaurantService: RestaurantService,
  ) {}

  async getAllBookingOfRestuarant(user: User, id): Promise<any> {
    if (await this.restaurantService.findHotel(user, id)) {
      const booking = await this.bookingRepository.find({ restaurantId: id });
      let user;
      if (booking.length > 0) {
        for (var i = 0; i < booking.length; i++) {
          user = await this.userRepository.findOne(ObjectId(booking[i].userId));
          delete user.password;

          booking[i]['user'] = user;
        }
        return {
          status: true,
          message: 'booking retrieved',
          data: booking,
        };
      } else {
        return {
          status: false,
          message: 'no bookings exist',
        };
      }
    } else {
      return {
        status: false,
        message: 'Unauthorized',
      };
    }
  }

  async createBooking(user: User, data: CreateBookingDto): Promise<any> {
    const users = await this.userRepository.findOne(ObjectId(user.id));
    console.log(users);
    if (users.type == 'customer') {
      return await this.bookingRepository.createBooking(
        users,
        data,
        this.menuRepository,
      );
    } else {
      return {
        status: false,
        message: 'Unauthorized',
      };
    }
  }

  async getBookingById(user: User, id): Promise<any> {
    const booking = await this.bookingRepository.findOne(ObjectId(id));
    
    if (booking) {
      if (user.type == 'customer') {
        const restaurant = await this.restaurantRepository.findOne(ObjectId(booking.restaurantId))
        booking['restaurant']=restaurant
        return {
          success: true,
          message: 'retrived booking',
          data: booking,
        };
      } else {
        if (
          await this.restaurantService.findHotel(user, booking.restaurantId)
        ) {
          const user = await this.userRepository.findOne(ObjectId(booking.userId))
          delete user.password;
          booking['user']=user;
          return {
            success: true,
            message: 'retiriving booking',
            data: booking,
          };
        } else {
          return {
            success: false,
            message: 'unauthorized',
          };
        }
      }
    } else {
      return {
        success: false,
        message: 'No Such Booking Exist',
      };
    }
  }
  async getAllBookingOfUser(user: User): Promise<any> {
    const bookings = await this.bookingRepository.find({ userId: user.id });
    if (bookings.length > 0) {
      for (var i = 0; i < bookings.length; i++) {
        const restaurant = await this.restaurantRepository.findOne(ObjectId(bookings[i].restaurantId))
        bookings[i]['restaurantName']=restaurant.name;
      }
      return {
        status: true,
        message: 'bookings retrieved',
        data: bookings,
      };
    } else {
      return {
        status: false,
        message: 'no bookings exist',
      };
    }
  }
}
