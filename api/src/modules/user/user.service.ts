import { Prisma, User } from '@prisma/client';
import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { AuthHelpers } from '../../shared/helpers/auth.helpers';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUser } from './../auth/auth.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async findUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
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
    console.log("data recieved:", data)
    const user = await this.prisma.user.findUnique({
      where: where,
    });
    console.log("user found:", user)
    //if request has newPassword, mean we gonna update password
    if (data.hasOwnProperty('newPassword')) {
      const isMatch = await AuthHelpers.verify(
        data.oldPassword,
        user.password,
      );
      if (!isMatch) {
        console.log("old password doesn't match")
        throw new BadRequestException("Old password doesn't match");
      }
      // Hash the new password before saving
      data.password = await AuthHelpers.hash(data.newPassword as string);
      delete data.oldPassword;
      delete data.newPassword;
    } else {
      delete data.password;
    }
    console.log("data updated:", data)
    const updatedUser = await this.prisma.user.update({
      data,
      where,
    });
    console.log("user updated:", updatedUser)
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
    console.log("user found:", user)
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
    console.log("user deleted:", deleteduser)
    return deleteduser;
  }

  async getCustomersWithStats() {
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

    return users.map(user => {
      const totalRentals = user.Rental.length;
      const totalSpent = user.Rental.reduce((sum, rental) => sum + rental.price, 0);
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
      };
    });
  }

}
