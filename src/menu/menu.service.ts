import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuRepository } from './menu.repository';
import { UserRepository } from 'src/auth/user.repository';
import { RestaurantRepository } from 'src/restaurant/restaurant.repository';
import { AddMenuDto, AddDishes, UpdateDish } from './dto';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { User } from 'src/auth/entities/User.entity';
import { Menu } from './entities/Menu.entity';
import { DeleteDish } from './dto/deletedishdto.dto';
import { AddMoreDish } from './dto/addmoredishesdto.dto';
import { editMenuName } from './dto/EditMenuName.dto';
//import { deleteDish } from './dto/deletedishdto.dto';
const ObjectId = require('mongodb').ObjectID;
import { ObjectID } from 'mongodb';
import { stat } from 'fs';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuRepository)
    @InjectRepository(UserRepository)
    @InjectRepository(RestaurantRepository)
    private readonly menuRepository: MenuRepository,
    private readonly userRepository: UserRepository,
    private readonly restaurantRepository: RestaurantRepository,

    private readonly restaurantService: RestaurantService,
  ) {}

  async getMenuById(id): Promise<any> {
    const restaurant = await this.restaurantRepository.findOne(ObjectId(id));
    console.log(restaurant);
    if (restaurant) {
      const menuList = await this.menuRepository.find({
        restaurantId: id,
        status: 'ACTIVE',
      });
      console.log(menuList);
      if (menuList.length > 0) {
        return {
          success: true,
          message: 'Menu Retrieved',
          data: menuList,
        };
      } else {
        throw new NotFoundException({
          message: 'Menu For this Restaurant Not Found',
        });
      }
    } else {
      throw new NotFoundException({ message: 'Restaurant Not Found' });
    }
  }

  async AddMenu(id, menu: AddMenuDto, user: User): Promise<any> {
    try {
      console.log('hi');
      console.log(user);
      console.log(id);
      if (await this.restaurantService.findHotel(user, id)) {
        return this.menuRepository.addMenu(id, menu, this.restaurantRepository);
      }
    } catch (e) {
      throw new HttpException({ message: e }, HttpStatus.BAD_REQUEST);
    }
  }

  async editMenuName(body: editMenuName, user: User): Promise<any> {
    try {
      const id = body.menuId;
      const newName = body.name;
      const menu = await this.menuRepository.findOne(ObjectId(id));
      var Result;
      if (menu && menu.status == 'ACTIVE') {
        if (
          await this.restaurantService.findHotel(
            user,
            ObjectId(menu.restaurantId),
          )
        ) {
          menu.name = newName;
          await this.menuRepository.save(menu);
          Result = {
            success: true,
            message: 'Menu name updates',
          };
        } else {
          Result = {
            success: false,
            message: 'Error',
          };
        }
      } else {
        Result = {
          success: false,
          message: 'Error',
        };
      }
      return Result;
    } catch (e) {
      throw new HttpException({ message: e }, HttpStatus.BAD_REQUEST);
    }
  }

  async getDishesByMenu(id): Promise<any> {
    try {
      const menu = await this.menuRepository.findOne(ObjectId(id));
      console.log(menu);
      if (menu.status == 'ACTIVE') {
        return {
          success: true,
          message: 'Dishes Retrieved',
          data: menu.dishes,
        };
      } else {
        throw new NotFoundException({ message: 'Menu Not Found' });
      }
    } catch (e) {
      throw new HttpException({ message: e }, HttpStatus.BAD_REQUEST);
    }
  }

  async getDishesByRestaurant(id): Promise<any> {
    const menu = await this.menuRepository.find({ restaurantId: id });
    var result = [];

    if (menu.length > 0) {
      for (var i = 0; i < menu.length; i++) {
        result.push(menu[i]);
      }
      return {
        success: true,
        message: 'dishes retrieved',
        data: result,
      };
    } else {
      throw new NotFoundException({ message: 'Dishes not Found' });
    }
  }
  async UpdateDish(dish: UpdateDish, user: User): Promise<any> {
    try {
      console.log('hi');
      console.log(user);
      if (await this.restaurantService.findHotel(user, ObjectId(dish.resId))) {
        const menu = await this.menuRepository.findOne(ObjectId(dish.menuId));
        //console.log(menu);
        if (menu) {
          for (var i = 0; i < menu.dishes.length; i++) {
            if (menu.dishes[i].dishId == dish.dishId) {
              console.log('here');
              break;
            }
          }
          if (dish.name) {
            menu.dishes[i].name = dish.name;
          }
          if (dish.price) {
            menu.dishes[i].price = dish.price;
          }
          if (dish.discount) {
            menu.dishes[i].discount = dish.discount;
          }
          if (dish.photos) {
            menu.dishes[i].photos = dish.photos;
          }
          if (dish.status) {
            menu.dishes[i].status = dish.status;
          }
          if (dish.category) {
            menu.dishes[i].category = dish.category;
          }
          await this.menuRepository.save(menu);
        }
      }
    } catch {}
  }

  async AddMoreDish(adddish: AddMoreDish, user: User): Promise<any> {
    try {
      if (
        await this.restaurantService.findHotel(user, ObjectId(adddish.resId))
      ) {
        const menu = await this.menuRepository.findOne(
          ObjectId(adddish.menuId),
        );
        if (menu) {
          return this.menuRepository.addDish(
            adddish,
            user.id,
            menu,
            this.restaurantRepository,
          );
        }
      }
    } catch (e) {
      throw new HttpException({ message: e }, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteMenu(user: User, id): Promise<any> {
    const menu = await this.menuRepository.findOne(ObjectId(id));
    if (await this.restaurantService.findHotel(user, menu.restaurantId)) {
      const restaurant = await this.restaurantRepository.findOne(
        ObjectId(menu.restaurantId),
      );
      if (menu) {
        menu.status = 'NOT_AVAILABLE';
        restaurant.noofdishes -= menu.dishes.length;
        await this.restaurantRepository.save(restaurant);
        await this.menuRepository.save(menu);
        return {
          sucess: true,
          message: 'Deleted Successfully',
        };
      } else {
        return {
          sucess: false,
          message: 'Deletion Failed',
        };
      }
    }
  }

  async deleteDish(user: User, dish: DeleteDish): Promise<any> {
    const menu = await this.menuRepository.findOne(ObjectId(dish.menuId));
    const restaurant = await this.restaurantRepository.findOne(
      ObjectId(dish.resId),
    );
    if (await this.restaurantService.findHotel(user, ObjectId(dish.resId))) {
      //const restaurant = await this.restaurantRepository.findOne(ObjectId(id))
      if (menu) {
        console.log(menu);
        console.log(menu.dishes.length);

        for (var i = 0; i < menu.dishes.length; i++) {
          if (menu.dishes[i].dishId == dish.dishId) {
            break;
          }
        }
        // await this.menuRepository.delete(menu.dishes[i]);
        menu.dishes.splice(i, 1);
        //delete menu.dishes[i];
        await this.menuRepository.save(menu);

        restaurant.noofdishes -= 1;
        //const afterdeletemenu = await this.menuRepository.findOne(ObjectId(dish.menuId))
        //console.log(afterdeletemenu)
        return {
          sucess: true,
          message: 'Deleted Successfully',
        };
      } else {
        return {
          sucess: false,
          message: 'Deletion Failed',
        };
      }
    }
  }
}
