import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from '../../common/decorator/decorators';
import type { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage("Created a new User")
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get("search")
  @ResponseMessage("Search User")
  async search(@Query("username") username: string,
  @User() user: IUser) {
    
    //kiểm tra nếu gửi giá trị trống lên
    if (!username || username === "") {
      return [];
    }
    return await this.usersService.search(username,user);
  }

  @Get("search-new-friends")
  @ResponseMessage("Search New Friend")
  async searchNewfriend(
  @Query("keyword") keyword: string,
  @User() user: IUser) {
    //kiểm tra nếu gửi giá trị trống lên
    if (!keyword || keyword  === "") {
      return [];
    }
    return await this.usersService.searchNewFriend(keyword,user);
  }


  @Get("me")
  @ResponseMessage("Get Me")
  async findOne(@User() user: IUser) {
    const userData = await this.usersService.findUserByEmail(user.email);
    return userData;
  }

  @Patch('profile')
  @ResponseMessage("Update Profile")
  updateProfile(@User() user: IUser, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(user.email, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
