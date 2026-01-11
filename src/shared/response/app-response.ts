import { IResponseResult } from './interface/response-result.interface';

export class AppResponse<ResponseModel> {
  public statusCode: number;
  public message: string;
  public data: ResponseModel;
  public timeStamp: Date;

  constructor(responseResult: IResponseResult<ResponseModel>) {
    this.statusCode = responseResult.statusCode;
    this.message = responseResult.message;
    this.data = responseResult.data;
    this.timeStamp = new Date();
  }
}
