"use strict";

export function success(res, data) {
  return res.status(200).json({...data});
}


export function badRequest(res, message = null) {
  return res.status(400).json({
    message: message ?? 'Bad Request',
    error: true
  });
}

export function unauthorized(res) {
  return res.status(401).json({
    message: 'Unauthoried request, Please login',
    error: true
  });
}

export function internal(res, message = null) {
  console.log(message);
  return res.status(500).json({
    message: message ?? "Internal Server Error",
  });
}

export function notFound(res, msg = null) {
  return res.status(404).json({
    message: msg??"Resources not Found",
  });
}
