import { Prisma, User } from '@prisma/client';
import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { AuthHelpers } from '../../shared/helpers/auth.helpers';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUser } from './../auth/auth.dto';
import Decimal from 'decimal.js';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async findUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    // console.log('==== findUser called with ====', userWhereUniqueInput);
    // console.log('Stack trace:', new Error().stack);

    if (!userWhereUniqueInput || (!userWhereUniqueInput.id && !userWhereUniqueInput.email)) {
      console.error('Invalid userWhereUniqueInput:', userWhereUniqueInput);
      throw new Error('findUser requires id or email in userWhereUniqueInput');
    }

    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async findFirst(): Promise<User | null> {
    return this.prisma.user.findFirst();
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  // Return users enriched with aggregated rental statistics used by the admin UI
  async usersWithStats(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<any[]> {
    const { skip, take, cursor, where, orderBy } = params;

    const users = await this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        Rental: {
          select: {
            price: true,
            created_at: true,
            end_time: true,
          },
        },
      },
    });

    return users.map((u: any) => {
      const { password, Rental, ...rest } = u as any;
      const rentals = Rental ?? [];
      const totalRentals = rentals.length;
      const totalSpent = rentals.reduce((sum: number, r: any) => sum + (r.price ?? 0), 0);
      const lastRental = rentals.reduce((latest: string | null, r: any) => {
        const candidate = r.end_time ?? r.created_at;
        if (!candidate) return latest;
        if (!latest) return candidate;
        return new Date(candidate) > new Date(latest) ? candidate : latest;
      }, null);

      return {
        ...rest,
        totalRentals,
        totalSpent,
        avgRating: 5, // default to 5 when no per-user rating exists
        lastRentalDate: lastRental,
      };
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    // Hash password before saving
    const payload: any = { ...data };
    if (payload.password) {
      payload.password = await AuthHelpers.hash(payload.password as string);
    }

    try {
      const user = await this.prisma.user.create({ data: payload });
      // don't return password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = user as any;
      return rest as User;
    } catch (error: any) {
      // Handle unique constraint violation (duplicate email)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: UpdateUser;
  }): Promise<User> {
    let { where, data } = params;
    // console.log("data recieved:", data)
    const user = await this.prisma.user.findUnique({
      where: where,
    });
    // console.log("user found:", user)
    //if request has newPassword, mean we gonna update password
    if (data.hasOwnProperty('newPassword')) {
      const isMatch = await AuthHelpers.verify(
        data.oldPassword,
        user.password,
      );
      if (!isMatch) {
        // console.log("old password doesn't match")
        throw new BadRequestException("Old password doesn't match");
      }
      // Hash the new password before saving
      data.password = await AuthHelpers.hash(data.newPassword as string);
      delete data.oldPassword;
      delete data.newPassword;
    } else {
      delete data.password;
    }
    // console.log("data updated:", data)
    const updatedUser = await this.prisma.user.update({
      data,
      where,
    });
    // console.log("user updated:", updatedUser)
    delete updatedUser.password;
    return updatedUser;
  }

  async deleteUser(
    where: Prisma.UserWhereUniqueInput,
    // password: string,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where,
    });
    // console.log("user found:", user)
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // const isMatch = await AuthHelpers.verify(password, user.password);

    // if (!isMatch) {
    //   throw new UnauthorizedException('Incorrect password');
    // }

    const deleteduser = await this.prisma.user.delete({
      where,
    });
    delete deleteduser.password;
    // console.log("user deleted:", deleteduser)
    return deleteduser;
  }

  async getCustomersWithStats() {
    // Get registered users (customers with accounts)
    const users = await this.prisma.user.findMany({
      where: { role: 'user' },
      include: {
        Rental: {
          select: {
            price: true,
            created_at: true,
          },
        },
      },
    });

    const registeredCustomers = users.map(user => {
      const totalRentals = user.Rental.length;
      const totalSpent = user.Rental.reduce((sum, rental) => sum.plus(rental.price), new Decimal(0));
      const lastRental = user.Rental.length > 0
        ? user.Rental.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        total_rentals: totalRentals,
        total_spent: totalSpent,
        average_rating: 4, // Mock data - you can add real ratings later
        last_rental_date: lastRental?.created_at || null,
        customer_type: 'registered',
      };
    });

    // Get guest customers from rentals (customers without accounts)
    const guestRentals = await this.prisma.rental.findMany({
      where: {
        user_id: null, // Guest rentals (no account)
        contact_name: { not: null },
      },
      select: {
        contact_name: true,
        contact_email: true,
        contact_phone: true,
        price: true,
        created_at: true,
      },
    });

    // Group guest rentals by email to get unique customers
    const guestCustomersMap = new Map();
    guestRentals.forEach(rental => {
      const email = rental.contact_email;
      if (!email) return;

      // Skip if email already exists in registered users
      const emailExistsInUsers = registeredCustomers.some(user => user.email === email);
      if (emailExistsInUsers) return;

      if (guestCustomersMap.has(email)) {
        const existing = guestCustomersMap.get(email);
        existing.total_rentals += 1;
        existing.total_spent += rental.price;
        if (new Date(rental.created_at) > new Date(existing.last_rental_date)) {
          existing.last_rental_date = rental.created_at;
        }
      } else {
        guestCustomersMap.set(email, {
          id: `guest_${email}`,
          name: rental.contact_name,
          email: rental.contact_email,
          phone: rental.contact_phone,
          image: null,
          total_rentals: 1,
          total_spent: rental.price,
          average_rating: 4,
          last_rental_date: rental.created_at,
          customer_type: 'guest',
        });
      }
    });

    const guestCustomers = Array.from(guestCustomersMap.values());

    // Get customers from booking requests (not yet converted to rentals)
    const bookingRequests = await this.prisma.bookingRequest.findMany({
      where: {
        user_id: null, // Guest booking requests
      },
      select: {
        name: true,
        email: true,
        contact_details: true,
        created_at: true,
      },
    });

    // Filter out booking requests with empty names
    const validBookingRequests = bookingRequests.filter(
      booking => booking.name && booking.name.trim() !== ''
    );

    // Group booking requests by email
    const bookingCustomersMap = new Map();
    validBookingRequests.forEach(booking => {
      const email = booking.email;
      if (!email) return; // Skip if no email

      // Skip if email already exists in registered users
      const emailExistsInUsers = registeredCustomers.some(user => user.email === email);
      if (emailExistsInUsers) return;

      // Skip if email already exists in guest rentals
      if (guestCustomersMap.has(email)) return;

      if (bookingCustomersMap.has(email)) {
        const existing = bookingCustomersMap.get(email);
        if (new Date(booking.created_at) > new Date(existing.last_rental_date)) {
          existing.last_rental_date = booking.created_at;
        }
      } else {
        bookingCustomersMap.set(email, {
          id: `booking_${email}`,
          name: booking.name,
          email: booking.email,
          phone: booking.contact_details,
          image: null,
          total_rentals: 0,
          total_spent: 0,
          average_rating: 4,
          last_rental_date: booking.created_at,
          customer_type: 'prospect',
        });
      }
    });

    const bookingCustomers = Array.from(bookingCustomersMap.values());

    // Combine all customer types
    return [...registeredCustomers, ...guestCustomers, ...bookingCustomers];
  }

}
