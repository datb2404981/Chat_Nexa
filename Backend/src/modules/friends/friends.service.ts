import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { createFriendRequestDto} from './dto/create-friendResquest.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FriendDocument, Friends } from './schema/friend.schema';
import type { SoftDeleteModel } from 'mongoose-delete';
import { IUser } from '../users/users.interface';
import { UnfriendDto } from './dto/unfriend.dto';
import { ChatGateway } from '../gateway/chat.gateway';

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel(Friends.name)
    private friendModel: SoftDeleteModel<FriendDocument>,
    private chatGateway: ChatGateway
  ){}

  async createFriendResquest(
    createFriendRequest: createFriendRequestDto,
    user: IUser) {
    
    //kiểm tra có gửi cho chính mình không
    if (user._id.toString() === createFriendRequest.receiverId.toString()) {
      throw new ConflictException("Bạn không thể gửi yêu cầu kết bạn cho chính mình");
    }
    
    //kiểm tra đã là bạn bè chưa
    const friendres = await this.findFriendRequest(createFriendRequest.receiverId,user._id);
    if (friendres?.status === "ACCEPTED") {
      throw new BadRequestException("Hai bạn đã là bạn bè");
    } else if (friendres?.status === "PENDING") {
      throw new ConflictException("Lời mời kết bạn đã được gửi đi và đang chờ chấp nhận");
    }

    //tạo gửi lời mời kết bạn
    const newFriend = await this.friendModel.create({
      senderId: user._id,
      receiverId: createFriendRequest.receiverId,
      status: 'PENDING',
      message: createFriendRequest.message,
    });

    const populatedRequest = await newFriend.populate('senderId','username avatar email');

    this.chatGateway.server
      .to(createFriendRequest.receiverId.toString())
      .emit('new_friend_request',populatedRequest);
    
    return populatedRequest;
  }

  async getAllFriendList(user :IUser) {
    const relationships = await this.friendModel.find({
      $or: [{senderId: user._id},
        { receiverId: user._id }],
      status: 'ACCEPTED',
      deleted: { $ne: true }
    }).populate("receiverId senderId", "_id username isOnline avatar").lean().exec();

    const friendList = relationships.map(relation => {
      //kiểm tra xem relation.senderId và receierId có tồn tại không(trường hợp người user bị xóa khỏi DB)
      const sender = relation.senderId as any;
      const receiver = relation.receiverId as any;

      if (!sender || !receiver) return null;

      //nếu mình là người gửi => bạn là người nhận
      if (sender._id.toString() === user._id.toString()) {
        return receiver;
      } else {
        //nếu mình là người nhận => bạn là người gửi
        return sender;
      }
    }).filter(item => item != null) // lọc bỏ các item null
    return friendList;
  }

  async getAllFriendRequests(user: IUser) {
    //sử dùng primise.all để chạy song song 2 query 
    const [sentRequests, receivedRequests] = await Promise.all([
      //lấy danh sách đã gửi đi(Sent)
      this.friendModel.find({
        senderId: user._id,
        status: 'PENDING',
        deleted: { $ne: true }
      }).populate("receiverId", "_id username isOnline avatar").lean().exec(),
      
      //lấy danh sách nhận được(received)
      this.friendModel.find({
        receiverId: user._id,
        status: 'PENDING',
        deleted: { $ne: true }
      }).populate("senderId", "_id username isOnline avatar").lean().exec()
    ])

    return {
      "sent": sentRequests,
      "received": receivedRequests
    };
  }

  async findFriendRequest(userA_id: string, userB_id: string) {
    return await this.friendModel.findOne({
      $or: [
        {senderId: userA_id, receiverId: userB_id},
        { senderId: userB_id, receiverId: userA_id }
      ]
    })
  }

  async updateStatusFriendRequest(id: string, status: string,user :IUser) {
    //tìm friend request
    const friendRes = await this.friendModel.findOne({
      _id: id,
      receiverId: user._id,
      deleted: { $ne: true }
    }).lean().exec();

    //validate
    if (!friendRes) {
      throw new NotFoundException("Không tìm thấy yêu cầu kết bạn");
    }
    if (friendRes.status !== "PENDING") {
      throw new BadRequestException(`Lời mời này đã được xử lý (${friendRes.status}) trước đó`);
    }

    if (status === "REJECTED") {
      await this.friendModel.updateOne({ _id: id, deleted: { $ne: true } }, { status: status });
      await this.friendModel.deleteById(id);
      return {
        "message": "Declined"
      };
    } else {
      const populatedRes = await this.friendModel.findOneAndUpdate(
        { _id: id, deleted: { $ne: true } }, 
        { status: status },
        { new: true }
      )
      .populate('senderId', 'username avatar email')
      .populate('receiverId', 'username avatar email');

      this.chatGateway.server
        .to(friendRes.senderId.toString())
        .emit('friend_request_accepted',populatedRes);

      return {
        "message": "Accepted"
      };
    }
  }

  async unfriendFriend(friendRequest: UnfriendDto, user: IUser) {
    //tìm mói quan hệ
    const ralationship = await this.findFriendRequest(friendRequest.friendId, user._id);

    //validate ralationship
    if (!ralationship || ralationship?.status !== "ACCEPTED") {
      throw new BadRequestException("Hai bạn chưa phải là bạn bè nên không thể hủy kết bạn");
    }

    //xóa
    await this.friendModel.deleteById(ralationship._id);
    return {
      message:"unfriend",
    }
  }
}
