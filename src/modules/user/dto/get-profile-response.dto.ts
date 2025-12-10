import { ApiProperty } from '@nestjs/swagger';
import { GenericResponse } from 'src/infrastructure';

export class ProfileDto {
  @ApiProperty({ description: 'The id of the user' })
  id: string;

  @ApiProperty({ description: 'The email of the user', required: false })
  email?: string;

  @ApiProperty({ description: 'The username of the user', required: false })
  username?: string;

  @ApiProperty({
    description: 'The profile picture URL of the user',
    required: false,
  })
  profilePictureUrl?: string;

  @ApiProperty({
    description: 'The wallet address of the user',
    required: false,
  })
  walletAddress?: string;

  @ApiProperty({ description: 'Whether the user is restricted' })
  isRestricted: boolean;
}

export class GetProfileResponseDto extends GenericResponse<ProfileDto> {
  @ApiProperty({ description: 'The user profile', type: ProfileDto })
  declare data: ProfileDto;
}
