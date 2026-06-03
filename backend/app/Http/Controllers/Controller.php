<?php

namespace App\Http\Controllers;

abstract class Controller
{
    /**
     * Send a success response.
     */
    protected function successResponse($data = null, $message = 'Success', $code = 200)
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], $code);
    }

    /**
     * Send an error response.
     */
    protected function errorResponse($message = 'Error', $code = 400, $data = null)
    {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'data' => $data
        ], $code);
    }
}
