import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService, TokenResponse } from './auth.service';
import { Public } from '../../shared/auth';
import { loginSchema, type LoginDto } from './dto/login.dto';
import { refreshSchema, type RefreshDto } from './dto/refresh.dto';

@ApiTags('auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login com e-mail e senha' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string' }, password: { type: 'string' } },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 200, description: 'Tokens de acesso e refresh' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() body: unknown): Promise<TokenResponse> {
    const dto = loginSchema.parse(body) as LoginDto;
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens com refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { refreshToken: { type: 'string' } },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({ status: 200, description: 'Novos tokens' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refresh(@Body() body: unknown): Promise<TokenResponse> {
    const dto = refreshSchema.parse(body) as RefreshDto;
    return this.authService.refresh(dto.refreshToken);
  }
}
