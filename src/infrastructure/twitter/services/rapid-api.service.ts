import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class RapidApiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly logger = new Logger(RapidApiService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.getOrThrow<string>('RAPIDAPI_KEY');
    this.baseUrl = this.configService.getOrThrow<string>('RAPIDAPI_BASE_URL');
  }

  public async get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response = this.httpService
        .get<T>(`${this.baseUrl}${endpoint}`, {
          headers: this._createHeaders(),
          params,
        })
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            this.logger.error(
              `GET request failed for ${endpoint}: ${error.message}`,
            );
            return throwError(() => error);
          }),
        );

      return await firstValueFrom(response);
    } catch (error) {
      this.logger.error(`GET request error for ${endpoint}`);
      throw error;
    }
  }

  public async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = this.httpService
        .post<T>(`${this.baseUrl}${endpoint}`, data, {
          ...config,
          headers: {
            ...config?.headers,
            ...this._createHeaders(),
          },
        })
        .pipe(
          map((response) => response.data),
          catchError((error: AxiosError) => {
            this.logger.error(
              `POST request failed for ${endpoint}: ${error.message}`,
            );
            return throwError(() => error);
          }),
        );

      return await firstValueFrom(response);
    } catch (error) {
      this.logger.error(`POST request error for ${endpoint}`);
      throw error;
    }
  }

  private _createHeaders(): Record<string, string> {
    return {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': 'twitter154.p.rapidapi.com',
    };
  }
}
