import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Result } from './result';

export class GenericResponse<T> {
  @ApiProperty({ description: 'Response data' })
  data: T;
}

export function parseResult<T>(result: Awaited<Result<T>>): GenericResponse<T> {
  if (result.isErr()) {
    const error = result.error;

    if (error instanceof BadRequestException) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof NotFoundException) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException(error.message);
    }
    if (error instanceof UnprocessableEntityException) {
      throw new UnprocessableEntityException(error.message);
    }

    throw new InternalServerErrorException('Something went wrong.');
  }

  return { data: result.value };
}
