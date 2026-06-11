import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

const buildHost = (
  response: Record<string, jest.Mock>,
  url: string,
): ArgumentsHost => {
  const request = { url };
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue(response),
      getRequest: jest.fn().mockReturnValue(request),
    }),
  } as unknown as ArgumentsHost;
};

const buildResponse = () => {
  const res: Record<string, jest.Mock> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
  });

  it('sends a structured JSON response with status, path, error, and timestamp', () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    const response = buildResponse();
    const host = buildHost(response, '/missing');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not Found',
        error: exception.name,
        path: '/missing',
      }),
    );
  });

  it('extracts message array when the exception response is an object', () => {
    const exception = new HttpException(
      {
        message: ['field is required', 'email must be valid'],
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
    const response = buildResponse();
    const host = buildHost(response, '/form');

    filter.catch(exception, host);

    const [payload] = response.json.mock.calls[0] as [Record<string, unknown>];
    expect(payload.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(payload.message).toEqual([
      'field is required',
      'email must be valid',
    ]);
  });

  it('falls back to exception.message when response is a plain string', () => {
    const exception = new HttpException(
      'Something went wrong',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    const response = buildResponse();
    const host = buildHost(response, '/crash');

    filter.catch(exception, host);

    const [payload] = response.json.mock.calls[0] as [Record<string, unknown>];
    expect(payload.message).toBe('Something went wrong');
  });
});
