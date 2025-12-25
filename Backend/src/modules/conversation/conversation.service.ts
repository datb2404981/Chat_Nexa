import { ArrayMinSize } from 'class-validator';
import { FriendsService } from './../friends/friends.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConversationDocument, Conversations } from './schema/conversation.schema';
import type { SoftDeleteModel } from 'mongoose-delete';
import { CreateDirectConversationDto, CreateGroupConversationDto } from './dto/create-conversation.dto';
import { IUser } from '../users/users.interface';
import { Types } from 'mongoose';

@Injectable()
export class ConversationService {
  constructor(
      @InjectModel(Conversations.name)
    private conversationModel: SoftDeleteModel<ConversationDocument>,
    private friendSeveice: FriendsService,
    ){ }

  async createDirectConversation(
    createConversationDto: CreateDirectConversationDto, user: IUser) {
    //kiểm tra có phải là bạn không 
    const relationship = await this.friendSeveice.findFriendRequest(createConversationDto.receiverId, user._id);
    if (!relationship || relationship.status !== "ACCEPTED") {
      throw new BadRequestException("Bạn bà và người này chưa là bạn bè!");
    }

    //validate đã tạo cuộc trò chuyện
    const conversation = await this.findDirectConversation(user._id, createConversationDto.receiverId);
    if (conversation) {
      await this.conversationModel.updateOne(
          { _id: conversation._id },
          { $pull: { deletedBy: { userId: user._id } } }
      );

      return {
        "conversation": conversation,
      }
    } else {
      //tạo cuộc trò chuyện
      const newConversation = await this.conversationModel.create({
        isGroup: false,
        members: [
          new Types.ObjectId(user._id), 
          new Types.ObjectId(createConversationDto.receiverId)
        ],
        lastMessage:null
      });
      
      //populate để lấy thêm info
      const populatedConversation = await newConversation.populate(
        "members", "_id username isOnline avatar");
      return {
        "conversation": populatedConversation,
      }
    }
  }
  
  async createGroupConversation(
    createGroupConversationDto: CreateGroupConversationDto, user: IUser) {
    //lọc danh sách Id của bản thân
    const uniqueMemberIds = new Set(createGroupConversationDto.memberIds);
    uniqueMemberIds.delete(user._id.toString());
    const arrayMemberIDs = Array.from(uniqueMemberIds);

    // chạy song song tất cả các query kiểm tra bạn bè
    await Promise.all(arrayMemberIDs.map(async (memberId) => {
      const relationship = await this.friendSeveice.findFriendRequest(memberId, user._id);

      // check tồn tại và là "ACCEPTED"
      if (!relationship || relationship.status !== "ACCEPTED") {
        throw new BadRequestException(`Bạn và user có Id ${memberId} chưa là bạn bè!`);
      }
    }));

    //chuẩn bị dữ liệu thành viên
    const membersObjectIds = [
      new Types.ObjectId(user._id),
      ...arrayMemberIDs.map(memberId => new Types.ObjectId(memberId))];
    
      //tạo cuộc trò chuyện mới
    const newConversation = await this.conversationModel.create({
        isGroup: true,
        name: createGroupConversationDto.name||"New Group",
        members: membersObjectIds,
        lastMessage: null,
    });
    
    //populate để lấy thêm info
    const populatedConversation = await newConversation.populate(
      "members", "_id username isOnline avatar");
    return {
      "conversation": populatedConversation,
    }
  }

  async findAllConversations(currentPage: number, limit: number, user: IUser) {
    const defaultLimit = limit ? limit : 10;
    const page = currentPage ? currentPage : 1;
    const skip = (page - 1) * defaultLimit;
    const [total, conversations] = await Promise.all([

      //total conversation
      this.conversationModel.countDocuments({
        members: { $in: [user._id] },
        deleted: { $ne: true },
        "deletedBy.userId":{$ne:user._id},
      }),

      //query conversation have conditional
      this.conversationModel.find({
        members: { $in: [user._id] },
        deleted: { $ne: true },
        "deletedBy.userId":{$ne:user._id},
      }).sort({ updatedAt: -1 })
        .skip(skip).limit(defaultLimit)
        .populate("members", "_id username isOnline avatar")
        .lean().exec()
    ])

    const cleanData = conversations.map(conv => {
        const partner = (conv.members as any[]).find(
            m => m._id.toString() !== user._id.toString()
        );
        
        return {
            ...conv,
            // Thêm field tiện ích cho Frontend đỡ phải if/else
            receiver: partner ? {
                _id: partner._id,
                username: partner.username,
                avatar: partner.avatar,
                isOnline: partner.isOnline
            } : null
        }
    });

    return {
      "data": cleanData,
      "meta": {
        "current": page,
        "pageSize": defaultLimit,
        "pages": Math.ceil(total / defaultLimit),
        "total": total,
      }
    }
  }

  async findDirectConversation(user_A: string, user_B: string) {
    return await this.conversationModel.findOne({
      isGroup: false,
      members:{$all:[user_A,user_B]}
    }).populate("members", "_id username isOnline avatar").lean().exec();
  }

  async findGroupConversation(members : string[]) {
    return await this.conversationModel.findOne({
      isGroup: true,
      members: {
        $all: members,
        $size: members.length //lấy đúng số lượng nhóm
      }
    }).populate("members", "_id username isOnline avatar").lean().exec();
  }

  async findConversation(id: string) {
    const conversation = await this.conversationModel.findById(id)
      .populate("members", "_id username isOnline avatar")
      .lean().exec();
    if (!conversation) {
      throw new NotFoundException("Không tìm thấy cuộc trò chuyện");
    }
    return {
      conversation:conversation,
    };
  }

  async deleteConversation(id: string, user: IUser) {
    await this.conversationModel.updateOne(
      { _id: id },
      {
        $addToSet: {
          deletedBy: { _id: user._id },
          deletedAt: new Date()
        }
      }
    );
    return {
      "delete":1,
  };
  }

  async markAsRead(id: string,user: IUser) {
    //xóa những cái cũ đi rồi thêm cái mới vào (Pull & Push)

    //Xóa entry cũ của user này(nếu có)
    await this.conversationModel.updateOne({ _id: id }, {
      $pull: {
        readBy: {userId : user._id}
      }
    })

    ///thêm entry mới với thời gian hiện tại 
    const updatedConversation = await this.conversationModel.findByIdAndUpdate(
      id,
      {
        $push: {
          readBy: {
            userId: user._id,
            lastSeenAt: new Date()
          }
        }
      },
      { new: true }
    ).populate("members", "_id username avatar isOnline");

    if (!updatedConversation) throw new NotFoundException();

    //Gắn thông báo Socket
    //báo cho những người khác trong nhóm là "Tui đọc rồi nhe"
    // if (this.chatGateway) {
    //     // Emit tới "Phòng" socket của conversation này
    //     this.chatGateway.server
    //         .to(conversationId)
    //         .emit('on_conversation_seen', {
    //             conversationId: conversationId,
    //             userId: user._id,
    //             lastSeenAt: new Date() // Thời điểm vừa đọc
    //         });
    // }
    
    return {
      success: true,
    }
  }
}
