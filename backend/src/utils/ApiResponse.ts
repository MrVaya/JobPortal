import { Response } from "express";

type SuccessOptions = {
  res: Response;
  message?: string;
  data?: any;
  statusCode?: number;
};

type ErrorOptions = {
  res: Response;
  message?: string;
  errors?: any;
  statusCode?: number;
};

export const sendSuccess = ({
  res,
  message = "Success",
  data = null,
  statusCode = 200,
}: SuccessOptions) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = ({
  res,
  message = "Something went wrong",
  errors = null,
  statusCode = 500,
}: ErrorOptions) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};