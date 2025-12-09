import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/users.entity';
import { Role } from '../common/enums/role.enum';
import { log } from 'console';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) throw new UnauthorizedException('Credenciales inválidas');
        console.log('User found:', user);
        const match = await bcrypt.compare(password, user.password);
        console.log('Password match result:', match);
        if (!match) throw new UnauthorizedException('Credenciales inválidas');

        return user;
    }

    getAccessToken(user: User) {
        const payload = {
            sub: user.id.toString(),
            email: user.email,
            role: user.role as Role,
        };

        return this.jwtService.sign(payload);
    }

    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);
        const accessToken = this.getAccessToken(user);
        return {
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
}
