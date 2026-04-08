import { IResponseResult } from './response-result.interface';

export class AppResponse<ResponseModel> {
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: ResponseModel;
  public readonly timeStamp: Date;

  constructor(responseResult: IResponseResult<ResponseModel>) {
    this.statusCode = responseResult.statusCode;
    this.message = responseResult.message;
    this.data = responseResult.data;
    this.timeStamp = new Date();
  }
}
