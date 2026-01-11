export interface IResponseResult<ResponseModel> {
  statusCode: number;
  message: string;
  data: ResponseModel;
}
