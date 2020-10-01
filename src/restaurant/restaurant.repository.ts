import { EntityRepository, MongoRepository } from 'typeorm';
import { Restaurant } from './entities/Restaurant.entity';
import { ObjectID } from 'mongodb';
import { AddBanner } from './dto/AddBannerDto.dto';
import { User } from 'src/auth/entities/User.entity';
import { AddReview } from './dto/addreviewsdto.dto';
import { AddReviews } from './dto/AddReviewDto.dto';
const ObjectId = require('mongodb').ObjectID;

@EntityRepository(Restaurant)
export class RestaurantRepository extends MongoRepository<Restaurant> {
  async createRestaurant(restaurantregisterDto: any, id): Promise<any> {
    const {
      name,
      address,
      contact,
      photos,
      location,
      timings,
      openStatus,
    } = restaurantregisterDto;
    const restaurant = new Restaurant();
    restaurant.name = name.toLowerCase();
    (restaurant.timings = timings), (restaurant.address = address);
    restaurant.contact = contact;
    restaurant.ownerID = id;
    restaurant.photos = photos;
    restaurant.status = 'ACTIVE';
    restaurant.openStatus = openStatus;
    restaurant.location = location.toLowerCase();
    restaurant.noofdishes = 0;
    restaurant.totaldishprice = 0;
    restaurant.rating = 0;
    restaurant.approved = 0;
    restaurant.banner = 'NULL';
    restaurant.review = [];
    await this.save(restaurant);
    console.log(restaurant);

    return restaurant;
  }
  async addBanner(
    addbanner: AddBanner,

    user: User,
    id,
  ): Promise<any> {
    const { banner } = addbanner;

    const restaurant = await this.findOne(ObjectId(id));
    for (var i = 0; i < banner.length; i++) {
      banner[i] = {
        banner: banner[i],
      };
      banner[i]['bannerId'] = new ObjectID();
    }
    restaurant.banner = banner;
    await this.save(restaurant);
    console.log(restaurant);
    return restaurant;
  }

  async updateBanner(
    addbanner: AddBanner,

    user: User,
    id,
  ): Promise<any> {
    const { banner } = addbanner;

    const restaurant = await this.findOne(ObjectId(id));
    for (var i = 0; i < banner.length; i++) {
      banner[i] = {
        banner: banner[i],
      };
      banner[i]['bannerId'] = new ObjectID();
      restaurant.banner.push(banner[i]);
    }

    await this.save(restaurant);
    console.log(restaurant);
    return restaurant;
  }
  async addReview(reviews: AddReviews, user: User, resid): Promise<any> {
    const restaurant = await this.findOne(ObjectId(resid));
    console.log(restaurant);
    reviews['reviewId'] = new ObjectID();
    reviews['userId'] = user.id;
    if (restaurant.review) {
      restaurant.review.push(reviews);
    } else {
      restaurant.review = [reviews];
    }

    console.log(reviews);

    await this.save(restaurant);
    console.log(restaurant);
    return restaurant;
  }
}
