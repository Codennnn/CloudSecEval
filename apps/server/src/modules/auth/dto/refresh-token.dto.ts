import { IsNotEmpty, IsString } from 'class-validator'

export class RefreshTokenDto {
  /** 刷新令牌 */
  @IsString({ message: '刷新令牌必须是字符串' })
  @IsNotEmpty({ message: '刷新令牌不能为空' })
  readonly refreshToken!: string
}
