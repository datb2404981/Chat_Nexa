import { FriendDocument, Friends } from './../friends/schema/friend.schema';
import { ConversationDocument, Conversations } from './../conversation/schema/conversation.schema';
import { ConflictException, Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, Users } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import type { SoftDeleteModel } from 'mongoose-delete';
import { ConversationService } from '../conversation/conversation.service';
import { IUser } from './users.interface';
import { FriendsService } from '../friends/friends.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name)
    private userModel: SoftDeleteModel<UserDocument>,
    @Inject(forwardRef(() => ConversationService))
    private conversationsService: ConversationService,
    @InjectModel(Conversations.name)
    private conversationModel: SoftDeleteModel<ConversationDocument>,
    @InjectModel(Friends.name)
    private friendsModel: SoftDeleteModel<FriendDocument>,

  ) { }
  
  async hashpassword(password : string ) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  isValidPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async create(createUserDto: CreateUserDto) {
    const [existringEmail, existringUser] = await Promise.all([
      this.findUserByEmail(createUserDto.email),
      this.findUserByUsername(createUserDto.username)]);

    if (existringEmail) throw new ConflictException("Email đã tồn tại!");
    if (existringUser) throw new ConflictException("Username đã tồn tại!");

    const password = await this.hashpassword(createUserDto.password);
    const created = await this.userModel.create({ ...createUserDto, password });
    
    return created;
  }

  findUserByEmail(email: string, withPassword = false) {
    const query = this.userModel.findOne({ email, deleted: { $ne: true } });
    if (!withPassword) {
      query.select('-password');
    }
    return query.lean().exec();
  }
  
  findUserByUsername(username: string) {
    return this.userModel.findOne({ username,deleted :{$ne : true} }).lean().exec();
  }

  async findByRefreshToken(refreshToken:string) {
    return this.userModel.findOne({ refreshToken,deleted :{$ne : true} }).lean().exec();
  }

  async search(keyword: string, user: IUser) {
    const [friends, Groups] = await Promise.all([
      this.friendsModel.find({
        $or: [
          { senderId: user._id },
          { receiverId: user._id }
        ],
        status: "ACCEPTED",
        deleted: { $ne: true }
      }).populate("receiverId senderId", "_id username isOnline avatar")
        .lean().exec(),
      
      this.conversationModel.find({
        name: { $regex: keyword, $options: 'i' },
        isGroup: true,
        members: { $in: [user._id] },
        "deletedBy._id": { $ne: user._id },
      }).populate("members", "_id username isOnline avatar")
        .lean().exec()
    ]);

    const formattedUsers = friends.map((friend: any) => {
      const friendInfo = friend.senderId._id.toString() === user._id.toString() ? friend.receiverId : friend.senderId;
      return {
        ...friendInfo,
        type: "user",
      };
    });

    const formattedGroups = Groups.map(group => ({
      ...group,
      type: "group",
    }));  
    return [...formattedUsers, ...formattedGroups];
  }

  async searchNewFriend(keyword: string, user: IUser) {
    // 1. Lấy danh sách quan hệ (Nhớ select thêm field 'status')
    const existingRelationships = await this.friendsModel.find({
      $or: [
        { senderId: user._id },
        { receiverId: user._id }
      ],
      deleted: { $ne: true }
    }).select('senderId receiverId status').lean(); // 🔥 Thêm 'status' vào đây

    const relationShipAccent: string[] = [user._id.toString()]; // Chặn chính mình
    const relationShipPending: string[] = [];
 
    // 2. Phân loại ID
    existingRelationships.forEach((c) => {
      // Tìm ID người kia
      const partnerId = c.senderId.toString() === user._id.toString() 
          ? c.receiverId.toString() 
          : c.senderId.toString();

      if (c.status === "ACCEPTED") {
        relationShipAccent.push(partnerId);
      } else if (c.status === "PENDING") {
        relationShipPending.push(partnerId);
      }
    });

    // 3. Query User (Đã sửa lỗi $or)
    const users = await this.userModel.find({
      $or: [
        { username: { $regex: keyword, $options: "i" } }, // Tách ra object 1
        { email: { $regex: keyword, $options: "i" } }    // Tách ra object 2
      ],
      _id: { $nin: relationShipAccent }, // Loại bỏ bạn bè & chính mình
      deleted: { $ne: true }
    }).select("_id username avatar email").lean().exec();

    // 4. Map kết quả (Sửa lỗi cú pháp)
    const formatUser = users.map((u) => { 
      // Kiểm tra xem user này có đang pending không
      const isPending = relationShipPending.includes(u._id.toString());

      return {
        ...u,       // Copy các thuộc tính của user (_id, username...)
        pended: isPending // Thêm thuộc tính mới (true/false)
      };
    });
      
    return formatUser;
}

  async updateProfile(email : string, updateUserDto: any) {
    const update = await this.userModel.findOneAndUpdate(
      { email, deleted: { $ne: true } },
      { $set: updateUserDto },
      { new: true })
      .select('-password')
      .lean()
      .exec();

    if (!update) throw new ConflictException("Tài khoản không tồn tại!");
    return update;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
