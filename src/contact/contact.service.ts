import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from './contact.schema';
import { InjectModel as InjectUserModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../auth/user.schema';
import { EmailService } from '../email/email.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectUserModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
  ) {}

  async addContact(userId: string, email: string) {
    // Check if user exists with the given email
    const userToAdd = await this.userModel.findOne({ email });
    if (!userToAdd) {
      return { success: false, message: 'User not found in our system' };
    }

    // Check if already a contact
    const existingContact = await this.contactModel.findOne({
      userId,
      contactId: userToAdd._id,
    });
    if (existingContact) {
      return { success: false, message: 'User already in your contacts' };
    }

    // Cannot add yourself
    if (userToAdd._id.toString() === userId) {
      return { success: false, message: 'Cannot add yourself as a contact' };
    }

    // Get the current user who is adding the contact
    const currentUser = await this.userModel.findById(userId);

    // Add contact
    await this.contactModel.create({
      userId,
      contactId: userToAdd._id,
    });

    // Send email notification to the added user
    await this.emailService.sendContactNotificationEmail(
      userToAdd.email,
      currentUser?.name || '',
      currentUser?.email || '',
    );

    return { success: true, message: 'Contact added successfully', user: userToAdd };
  }

  async getContacts(userId: string) {
    const contacts = await this.contactModel
      .find({ userId })
      .populate('contactId')
      .exec();

    return contacts.map((contact) => ({
      _id: (contact.contactId as any)._id,
      name: (contact.contactId as any).name,
      email: (contact.contactId as any).email,
      avatar: (contact.contactId as any).avatar,
      isOnline: (contact.contactId as any).isOnline,
      socketId: (contact.contactId as any).socketId,
    }));
  }
}
